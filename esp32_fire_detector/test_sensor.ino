#include <DHT.h>

// =============================================
// PIN SENSOR
// =============================================
#define MQ2_AO     34   // Analog gas
#define DHT_PIN    27   // DHT22 data pin
#define DHT_TYPE   DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("================================");
  Serial.println("  TEST SENSOR - DHT22 & MQ-2");
  Serial.println("================================");

  // Test DHT22
  Serial.println("\n[1] Inisialisasi DHT22...");
  dht.begin();
  delay(2000);

  // Test MQ-2
  Serial.println("[2] Inisialisasi MQ-2...");
  pinMode(MQ2_AO, INPUT);
  Serial.println("[2] MQ-2 perlu warm-up 20 detik...");
  delay(20000);
  Serial.println("[2] MQ-2 siap!\n");
}

void loop() {
  Serial.println("========== Pembacaan Sensor ==========");

  // === MQ-2 ===
  int mq2_raw = analogRead(MQ2_AO);
  float mq2_volt = mq2_raw * (3.3 / 4095.0);
  Serial.printf("[MQ-2]  Raw ADC : %d\n", mq2_raw);
  Serial.printf("[MQ-2]  Voltage : %.3f V\n", mq2_volt);

  if (mq2_raw == 0) {
    Serial.println("[MQ-2]  ⚠️  PERINGATAN: Pembacaan 0! Cek:");
    Serial.println("         - Pin 34 terhubung ke A0 sensor?");
    Serial.println("         - VCC sensor ke 5V?");
    Serial.println("         - GND sensor ke GND?");
  } else if (mq2_raw < 100) {
    Serial.println("[MQ-2]  Nilai sangat rendah - udara bersih atau sensor belum warm-up");
  } else if (mq2_raw < 500) {
    Serial.println("[MQ-2]  Nilai sedang - gas/asap terdeteksi ringan");
  } else {
    Serial.println("[MQ-2]  Nilai tinggi - gas/asap tinggi!");
  }

  // === DHT22 ===
  float suhu = dht.readTemperature();
  float kelembaban = dht.readHumidity();

  Serial.printf("[DHT22] Suhu       : %.1f C\n", suhu);
  Serial.printf("[DHT22] Kelembaban : %.1f %%\n", kelembaban);

  if (isnan(suhu) || isnan(kelembaban)) {
    Serial.println("[DHT22] ⚠️  PERINGATAN: Gagal baca! Cek:");
    Serial.println("         - Pin 27 terhubung ke DATA sensor?");
    Serial.println("         - VCC ke 3.3V?");
    Serial.println("         - GND ke GND?");
    Serial.println("         - Pull-up resistor 10kΩ antara VCC dan DATA?");
    Serial.println("         - Coba ganti library: DHT sensor library by Adafruit");
  } else {
    if (suhu < 10 || suhu > 60) {
      Serial.println("[DHT22] ⚠️  Suhu tidak wajar, kemungkinan error");
    }
  }

  Serial.println("=====================================\n");
  delay(3000);
}
