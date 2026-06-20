#include <ArduinoJson.h>
#include <DHT.h>

#define MQ2_AO     34
#define KY026_AO   32   // active-low: makin kecil = makin banyak api
#define DHT_PIN    27
#define DHT_TYPE   DHT22
#define IN1        18
#define IN2        19
#define ENA        21
#define BUZZER_PIN 26
#define LED1_PIN   25
#define LED2_PIN   14

#define INTERVAL_SEND     3000
#define PREHEAT_MS        2000

#define FAN_OFF     0
#define FAN_LOW     650   // 1023 * 0.63
#define FAN_MEDIUM  800   // 1023 * 0.78
#define FAN_HIGH    1023

bool exhaustAktif = false;
int  fanSpeed     = FAN_OFF;

enum BuzzerMode { BUZZ_OFF, BUZZ_MEDIUM, BUZZ_HIGH };
BuzzerMode buzzerMode    = BUZZ_OFF;
bool       buzzerState   = false;
unsigned long buzzerLast = 0;
#define BUZZ_MED_ON   500
#define BUZZ_MED_OFF  500
#define BUZZ_HIGH_ON  150
#define BUZZ_HIGH_OFF 100

bool       ledAlternate  = false;
unsigned long ledLast    = 0;
#define LED_BLINK_MS  150

unsigned long lastSend = 0;

DHT dht(DHT_PIN, DHT_TYPE);

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
  ledcWrite(ENA, pwm);
}

void setBuzzer(String mode) {
  mode.toUpperCase();
  if (mode == "HIGH") {
    buzzerMode = BUZZ_HIGH;
  } else if (mode == "MEDIUM") {
    buzzerMode = BUZZ_MEDIUM;
  } else {  // "OFF", "STOP", or any unknown value
    buzzerMode = BUZZ_OFF;
    buzzerState = false;
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED1_PIN, LOW);
    digitalWrite(LED2_PIN, LOW);
  }
  buzzerLast = millis();
  ledLast = millis();
  Serial.print("[BUZZ] mode=");
  Serial.println(mode);
}

void updateBuzzer() {
  if (buzzerMode == BUZZ_OFF) return;

  unsigned long now = millis();

  if (buzzerMode == BUZZ_HIGH) {
    unsigned long elapsed = now - buzzerLast;
    unsigned long period = buzzerState ? BUZZ_HIGH_ON : BUZZ_HIGH_OFF;
    if (elapsed >= period) {
      buzzerState = !buzzerState;
      digitalWrite(BUZZER_PIN, buzzerState ? HIGH : LOW);
      buzzerLast = now;
    }
    unsigned long ledElapsed = now - ledLast;
    if (ledElapsed >= LED_BLINK_MS) {
      ledAlternate = !ledAlternate;
      digitalWrite(LED1_PIN, ledAlternate ? HIGH : LOW);
      digitalWrite(LED2_PIN, ledAlternate ? LOW : HIGH);
      ledLast = now;
    }
  } else if (buzzerMode == BUZZ_MEDIUM) {
    digitalWrite(LED1_PIN, LOW);
    digitalWrite(LED2_PIN, LOW);
    unsigned long elapsed = now - buzzerLast;
    unsigned long period = buzzerState ? BUZZ_MED_ON : BUZZ_MED_OFF;
    if (elapsed >= period) {
      buzzerState = !buzzerState;
      digitalWrite(BUZZER_PIN, buzzerState ? HIGH : LOW);
      buzzerLast = now;
    }
  }
}

void kirimDataSensor() {
  int nilaiMQ2   = analogRead(MQ2_AO);   // MQ-2 detects combustible gas + smoke
  int nilaiApi   = analogRead(KY026_AO);  // KY-026 flame sensor (active-low)

  float suhu       = dht.readTemperature();
  float kelembaban = dht.readHumidity();

  if (isnan(suhu))       { suhu = 0.0; Serial.println("[WARN] DHT read failed"); }
  if (isnan(kelembaban)) { kelembaban = 0.0; }

  StaticJsonDocument<256> doc;
  doc["type"]        = "sensor";
  doc["gas_value"]   = nilaiMQ2;      // MQ-2 analog reading for gas
  doc["smoke_value"] = nilaiMQ2;      // Same sensor — MQ-2 also detects smoke particles
  doc["temperature"] = suhu;
  doc["humidity"]    = kelembaban;
  doc["flame_value"] = nilaiApi;

  String output;
  serializeJson(doc, output);
  Serial.println(output);
}

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
  Serial.print("[RECV] ");
  Serial.println(input);

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, input);
  if (err) {
    Serial.print("[ERR] JSON parse failed: ");
    Serial.println(err.c_str());
    return;
  }

  String target = doc["target"] | "";
  String action = doc["action"] | "";
  int cmdId     = doc["id"] | 0;

  if (target == "exhaust_fan") {
    setExhaust(action);
    Serial.print("[FAN] → ");
    Serial.println(action);
  } else if (target == "buzzer") {
    setBuzzer(action);
  }

  StaticJsonDocument<128> ack;
  ack["type"]    = "ack";
  ack["id"]      = cmdId;
  ack["status"]  = "completed";
  String ackOut;
  serializeJson(ack, ackOut);
  Serial.println(ackOut);
}

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);

  ledcAttach(ENA, 5000, 10);

  setExhaust("OFF");
  setBuzzer("STOP");

  dht.begin();

  delay(PREHEAT_MS);

  StaticJsonDocument<64> ready;
  ready["type"] = "ready";
  String readyOut;
  serializeJson(ready, readyOut);
  Serial.println(readyOut);
}

void loop() {
  unsigned long now = millis();

  if (now - lastSend >= INTERVAL_SEND) {
    lastSend = now;
    kirimDataSensor();
  }

  terimaCommand();

  updateBuzzer();
}
