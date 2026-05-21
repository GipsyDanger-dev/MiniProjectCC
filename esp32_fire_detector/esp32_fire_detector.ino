#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// =============================================
// KONFIGURASI WiFi & SERVER
// =============================================
const char* WIFI_SSID     = "Kolcer";
const char* WIFI_PASSWORD = "Kontrakankalcer";
const char* SERVER_URL    = "http://192.168.1.57:8000/api";
const char* API_KEY       = "apa-hayo-kuncinya-99";
const int   DEVICE_ID     = 1;

// =============================================
// PIN SENSOR & AKTUATOR
// =============================================
#define MQ2_AO     34   // Analog gas
#define KY026_AO   32   // Analog flame (makin kecil = makin banyak api)
#define DHT_PIN    27   // DHT22 data pin
#define DHT_TYPE   DHT22
#define IN1        18   // Motor driver IN1 (exhaust fan)
#define IN2        19   // Motor driver IN2
#define ENA        21   // Motor driver ENA (PWM)
#define BUZZER_PIN 26   // Buzzer aktif

// =============================================
// INTERVAL (milidetik)
// =============================================
#define INTERVAL_INGEST     5000   // kirim data sensor tiap 5 detik
#define INTERVAL_POLL       2000   // polling command tiap 2 detik
#define INTERVAL_HEARTBEAT  30000  // heartbeat tiap 30 detik
#define PREHEAT_MS          5000   // warm-up MQ-2 (dikurangi biar gak kepanasan)

// =============================================
// PWM SPEED LEVELS
// =============================================
#define FAN_OFF     0
#define FAN_LOW     76    // 30%
#define FAN_MEDIUM  153   // 60%
#define FAN_HIGH    255   // 100%

// =============================================
// STATE AKTUATOR
// =============================================
bool exhaustAktif = false;
bool buzzerAktif  = false;
int  fanSpeed     = FAN_OFF;

// =============================================
// TIMER
// =============================================
unsigned long lastIngest    = 0;
unsigned long lastPoll      = 0;
unsigned long lastHeartbeat = 0;

// =============================================
// SENSOR
// =============================================
DHT dht(DHT_PIN, DHT_TYPE);

// =============================================
// FUNGSI AKTUATOR
// =============================================
void setExhaust(String action) {
  action.toUpperCase();

  // Map START/STOP ke HIGH/OFF
  if (action == "START") action = "HIGH";
  if (action == "STOP")  action = "OFF";

  int pwm = FAN_OFF;
  if (action == "LOW")    pwm = FAN_LOW;
  else if (action == "MEDIUM") pwm = FAN_MEDIUM;
  else if (action == "HIGH")   pwm = FAN_HIGH;

  exhaustAktif = (pwm > 0);
  fanSpeed = pwm;

  digitalWrite(IN1, exhaustAktif ? HIGH : LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, pwm);

  if (exhaustAktif) {
    Serial.printf("[EXHAUST] ON - %s (%d/255)\n", action.c_str(), pwm);
  } else {
    Serial.println("[EXHAUST] OFF");
  }
}

void setBuzzer(bool aktif) {
  buzzerAktif = aktif;
  digitalWrite(BUZZER_PIN, aktif ? HIGH : LOW);
  Serial.printf("[BUZZER] %s\n", aktif ? "ON" : "OFF");
}

// =============================================
// KIRIM DATA SENSOR → POST /api/ingest
// =============================================
void kirimDataSensor() {
  int nilaiMQ2   = analogRead(MQ2_AO);   // Gas + Asap (satu sensor)
  int nilaiApi   = analogRead(KY026_AO);  // Api

  // Baca DHT22
  float suhu       = dht.readTemperature();
  float kelembaban = dht.readHumidity();

  // Fallback jika DHT22 gagal baca
  if (isnan(suhu)) {
    Serial.println("[DHT22] Gagal baca suhu, pakai default 30.0");
    suhu = 30.0;
  }
  if (isnan(kelembaban)) {
    Serial.println("[DHT22] Gagal baca kelembaban, pakai default 0.0");
    kelembaban = 0.0;
  }

  Serial.println("========== INGEST ==========");
  Serial.printf("Gas/Asap : %d\n", nilaiMQ2);
  Serial.printf("Suhu     : %.1f C\n", suhu);
  Serial.printf("Kelembaban: %.1f %%\n", kelembaban);
  Serial.printf("Flame    : %d\n", nilaiApi);

  HTTPClient http;
  http.begin(String(SERVER_URL) + "/ingest");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  StaticJsonDocument<256> doc;
  doc["device_id"]   = DEVICE_ID;
  doc["gas_value"]   = nilaiMQ2;
  doc["smoke_value"] = nilaiMQ2;  // sama-sama dari MQ-2
  doc["temperature"] = suhu;
  doc["humidity"]    = kelembaban;
  doc["flame_value"] = nilaiApi;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  if (httpCode == 201) {
    Serial.println("[INGEST] OK - data terkirim ke server");
  } else {
    Serial.printf("[INGEST] GAGAL - HTTP %d\n", httpCode);
  }
  http.end();
}

// =============================================
// POLLING COMMAND → GET /api/command/get
// =============================================
void pollingCommand() {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/command/get?device_id=" + String(DEVICE_ID));
  http.addHeader("x-api-key", API_KEY);

  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<512> doc;
    DeserializationError err = deserializeJson(doc, payload);

    if (!err && doc["status"] == "success") {
      int    commandId   = doc["data"]["id"];
      String target      = doc["data"]["target_device"].as<String>();
      String action      = doc["data"]["action"].as<String>();

      Serial.printf("[COMMAND] id=%d | target=%s | action=%s\n",
                    commandId, target.c_str(), action.c_str());

      bool berhasil = true;
      if (target == "exhaust_fan") {
        setExhaust(action);  // Kirim action langsung (LOW/MEDIUM/HIGH/OFF)
      } else if (target == "buzzer") {
        setBuzzer(action == "START");
      } else {
        berhasil = false;
        Serial.println("[COMMAND] target tidak dikenal");
      }

      laporStatusCommand(commandId, berhasil ? "completed" : "failed");
    }
  } else {
    Serial.printf("[POLL] GAGAL - HTTP %d\n", httpCode);
  }
  http.end();
}

// =============================================
// LAPOR HASIL EKSEKUSI → POST /api/status/update
// =============================================
void laporStatusCommand(int commandId, String status) {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/status/update");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  StaticJsonDocument<128> doc;
  doc["command_id"] = commandId;
  doc["status"]     = status;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  Serial.printf("[STATUS UPDATE] command_id=%d status=%s HTTP=%d\n",
                commandId, status.c_str(), httpCode);
  http.end();
}

// =============================================
// HEARTBEAT → POST /api/worker/heartbeat
// =============================================
void kirimHeartbeat() {
  String state = "online";
  if (exhaustAktif && buzzerAktif) state = "BAHAYA-aktif";
  else if (exhaustAktif || buzzerAktif) state = "WASPADA-aktif";

  HTTPClient http;
  http.begin(String(SERVER_URL) + "/worker/heartbeat");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  StaticJsonDocument<128> doc;
  doc["component_name"] = "ESP32-FireDetector";
  doc["current_state"]  = state;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  Serial.printf("[HEARTBEAT] state=%s HTTP=%d\n", state.c_str(), httpCode);
  http.end();
}

// =============================================
// SETUP
// =============================================
void setup() {
  Serial.begin(115200);
  delay(500);

  // Setup aktuator
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  setExhaust("OFF");
  setBuzzer(false);

  // Setup DHT22
  dht.begin();
  Serial.println("[DHT22] Initialized");

  // Koneksi WiFi
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWiFi OK - IP: %s\n", WiFi.localIP().toString().c_str());

  // Preheat MQ-2
  Serial.println("Memanaskan MQ-2... tunggu 5 detik");
  delay(PREHEAT_MS);
  Serial.println("Sensor siap!");
}

// =============================================
// LOOP
// =============================================
void loop() {
  unsigned long now = millis();

  // 1. Kirim data sensor ke server
  if (now - lastIngest >= INTERVAL_INGEST) {
    lastIngest = now;
    if (WiFi.status() == WL_CONNECTED) {
      kirimDataSensor();
    } else {
      Serial.println("[WiFi] Terputus, mencoba reconnect...");
      WiFi.reconnect();
    }
  }

  // 2. Polling command dari server
  if (now - lastPoll >= INTERVAL_POLL) {
    lastPoll = now;
    if (WiFi.status() == WL_CONNECTED) {
      pollingCommand();
    }
  }

  // 3. Heartbeat
  if (now - lastHeartbeat >= INTERVAL_HEARTBEAT) {
    lastHeartbeat = now;
    if (WiFi.status() == WL_CONNECTED) {
      kirimHeartbeat();
    }
  }
}
