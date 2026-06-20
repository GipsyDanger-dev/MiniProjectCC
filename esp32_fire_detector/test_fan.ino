// Test Sketch — Fan langsung HIGH tanpa fuzzy logic
// Upload ke ESP32 untuk test hardware

#define IN1        18
#define IN2        19
#define ENA        21
#define BUZZER_PIN 26

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Setup PWM (10-bit resolution)
  ledcAttach(ENA, 5000, 10);

  // Matikan semua dulu
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  ledcWrite(ENA, 0);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("=== FAN TEST MODE ===");
  Serial.println("Ketik '1' = Fan ON (HIGH)");
  Serial.println("Ketik '2' = Fan ON (MEDIUM)");
  Serial.println("Ketik '3' = Fan ON (LOW)");
  Serial.println("Ketik '0' = Fan OFF");
  Serial.println("Ketik 'b' = Buzzer ON/OFF");
  Serial.println("=====================");
}

bool buzzerOn = false;

void loop() {
  if (Serial.available()) {
    char c = Serial.read();

    switch (c) {
      case '1':
        Serial.println("[TEST] Fan HIGH (1023)");
        digitalWrite(IN1, HIGH);
        digitalWrite(IN2, LOW);
        ledcWrite(ENA, 1023);
        break;

      case '2':
        Serial.println("[TEST] Fan MEDIUM (800)");
        digitalWrite(IN1, HIGH);
        digitalWrite(IN2, LOW);
        ledcWrite(ENA, 800);
        break;

      case '3':
        Serial.println("[TEST] Fan LOW (650)");
        digitalWrite(IN1, HIGH);
        digitalWrite(IN2, LOW);
        ledcWrite(ENA, 650);
        break;

      case '0':
        Serial.println("[TEST] Fan OFF");
        digitalWrite(IN1, LOW);
        digitalWrite(IN2, LOW);
        ledcWrite(ENA, 0);
        break;

      case 'b':
        buzzerOn = !buzzerOn;
        digitalWrite(BUZZER_PIN, buzzerOn ? HIGH : LOW);
        Serial.printf("[TEST] Buzzer %s\n", buzzerOn ? "ON" : "OFF");
        break;
    }
  }
}
