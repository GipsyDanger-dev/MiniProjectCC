#include <ArduinoJson.h>
#include <DHT.h>

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
#define INTERVAL_SEND     3000   // kirim data tiap 3 detik
#define PREHEAT_MS        2000   // warm-up MQ-2

// =============================================
// PWM SPEED LEVELS
// =============================================
#define FAN_OFF     0
#define FAN_LOW     650   // 63% (10-bit: 1023 * 0.63)
#define FAN_MEDIUM  800   // 78% (10-bit: 1023 * 0.78)
#define FAN_HIGH    1023  // 100%

// =============================================
// STATE AKTUATOR
// =============================================
bool exhaustAktif = false;
bool buzzerAktif  = false;
int  fanSpeed     = FAN_OFF;

// =============================================
// TIMER
// =============================================
unsigned long lastSend = 0;

// =============================================
// SENSOR
// =============================================
DHT dht(DHT_PIN, DHT_TYPE);

// =============================================
// FUNGSI AKTUATOR
// =============================================
void setExhaust(String action) {
  action.toUpperCase();
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
  ledcWrite(ENA, pwm);  // PWM ke pin ENA
}

void setBuzzer(bool aktif) {
  buzzerAktif = aktif;
  digitalWrite(BUZZER_PIN, aktif ? HIGH : LOW);
}

// =============================================
// KIRIM DATA SENSOR → Serial (JSON)
// =============================================
void kirimDataSensor() {
  int nilaiMQ2   = analogRead(MQ2_AO);
  int nilaiApi   = analogRead(KY026_AO);

  float suhu       = dht.readTemperature();
  float kelembaban = dht.readHumidity();

  if (isnan(suhu))       { suhu = 0.0; Serial.println("[WARN] DHT read failed"); }
  if (isnan(kelembaban)) { kelembaban = 0.0; }

  // Kirim sebagai JSON ke Serial
  StaticJsonDocument<256> doc;
  doc["type"]        = "sensor";
  doc["gas_value"]   = nilaiMQ2;
  doc["smoke_value"] = nilaiMQ2;
  doc["temperature"] = suhu;
  doc["humidity"]    = kelembaban;
  doc["flame_value"] = nilaiApi;

  String output;
  serializeJson(doc, output);
  Serial.println(output);
}

// =============================================
// TERIMA COMMAND ← Serial (JSON)
// =============================================
static String serialBuffer = "";
#define SERIAL_BUFFER_MAX 512

void terimaCommand() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      serialBuffer.trim();
      if (serialBuffer.length() > 0) {
        prosesPesan(serialBuffer);
      }
      serialBuffer = "";
    } else if (c != '\r') {
      if (serialBuffer.length() < SERIAL_BUFFER_MAX) {
        serialBuffer += c;
      } else {
        serialBuffer = "";  // overflow protection: discard
      }
    }
  }
}

void prosesPesan(String input) {
  // Debug: print pesan yang diterima
  Serial.print("[RECV] ");
  Serial.println(input);

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, input);
  if (err) {
    Serial.print("[ERR] JSON parse failed: ");
    Serial.println(err.c_str());
    return;
  }

  // Command aktuator: {"target":"exhaust_fan","action":"HIGH","id":1}
  String target = doc["target"] | "";
  String action = doc["action"] | "";
  int cmdId     = doc["id"] | 0;

  if (target == "exhaust_fan") {
    setExhaust(action);
    Serial.print("[FAN] → ");
    Serial.println(action);
  } else if (target == "buzzer") {
    setBuzzer(action == "START");
  }

  // Kirim konfirmasi balik
  StaticJsonDocument<128> ack;
  ack["type"]    = "ack";
  ack["id"]      = cmdId;
  ack["status"]  = "completed";
  String ackOut;
  serializeJson(ack, ackOut);
  Serial.println(ackOut);
}

// =============================================
// SETUP
// =============================================
void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Setup LEDC PWM untuk ESP32 (pin, freq, resolution)
  ledcAttach(ENA, 5000, 10);  // ENA pin, 5000Hz, 10-bit resolution

  setExhaust("OFF");
  setBuzzer(false);

  dht.begin();

  // Preheat MQ-2
  delay(PREHEAT_MS);

  // Signal siap
  StaticJsonDocument<64> ready;
  ready["type"] = "ready";
  String readyOut;
  serializeJson(ready, readyOut);
  Serial.println(readyOut);
}

// =============================================
// LOOP
// =============================================
void loop() {
  unsigned long now = millis();

  // Kirim data sensor tiap 3 detik
  if (now - lastSend >= INTERVAL_SEND) {
    lastSend = now;
    kirimDataSensor();
  }

  // Cek command dari Python
  terimaCommand();
}
