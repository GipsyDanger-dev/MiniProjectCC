# Implementasi Fuzzy Sugeno pada Smart Safety System

## 1. Tujuan Implementasi Fuzzy
Penerapan metode **Fuzzy Sugeno** dalam sistem ini bertujuan untuk meningkatkan akurasi pengambilan keputusan dibandingkan metode threshold biasa. Fuzzy digunakan untuk:

- Mengatur **kecepatan exhaust fan (low → high)**
- Memberikan respon yang **lebih halus (tidak kaku)**
- Menghindari kondisi ON/OFF yang terlalu abrupt

---

## 2. Variabel Fuzzy

### Input
1. Gas (ppm)
2. Asap (ppm)
3. Suhu (°C)

### Output (Sugeno Orde 0)
Output berupa nilai numerik yang akan digunakan untuk menentukan **kecepatan exhaust fan**

| Kondisi | Nilai Output |
|--------|-------------|
| Aman | 0 |
| Rendah | 30 |
| Sedang | 60 |
| Tinggi | 100 |

---

## 3. Membership Function

### Gas (ppm)
- Rendah: 0 – 200
- Sedang: 150 – 400
- Tinggi: 350 – 600

### Asap (ppm)
- Rendah: 0 – 100
- Sedang: 80 – 250
- Tinggi: 200 – 400

### Suhu (°C)
- Normal: 20 – 35
- Hangat: 30 – 50
- Panas: 45 – 70

Menggunakan fungsi **segitiga (triangular)** agar ringan secara komputasi.

---

## 4. Base Rule (Rule Fuzzy Sugeno)

### 🟢 Kondisi Aman
- IF Gas Rendah AND Asap Rendah AND Suhu Normal → Output = 0

---

### 🟡 Kondisi Rendah (Exhaust pelan)
- IF Gas Rendah AND Asap Sedang → 30
- IF Gas Sedang AND Asap Rendah → 30
- IF Suhu Hangat AND Gas Rendah → 30

---

### 🟠 Kondisi Sedang (Exhaust sedang)
- IF Gas Sedang AND Asap Sedang → 60
- IF Gas Sedang AND Suhu Hangat → 60
- IF Asap Sedang AND Suhu Hangat → 60

---

### 🔴 Kondisi Tinggi (Exhaust cepat)
- IF Gas Tinggi → 100
- IF Asap Tinggi → 100
- IF Suhu Panas → 100
- IF Gas Sedang AND Suhu Panas → 100
- IF Asap Tinggi AND Suhu Hangat → 100

---

## 5. Perhitungan Fuzzy Sugeno

Menggunakan metode weighted average:

z = (Σ (wi * zi)) / Σ wi

Keterangan:
- wi = nilai firing strength (min dari membership)
- zi = output rule

---

## 6. Mapping Output ke Kecepatan Exhaust

| Nilai Fuzzy | Kecepatan Fan |
|------------|--------------|
| 0 – 30 | OFF / sangat pelan |
| 31 – 60 | Kecepatan sedang |
| 61 – 100 | Kecepatan tinggi |

---

## 7. Integrasi ke Sistem

Fuzzy diletakkan pada bagian:
**API Controller (Decision Engine)**

Alur:
1. Data sensor masuk (/api/ingest)
2. API menghitung fuzzy
3. Output menentukan command:
   - LOW → fan pelan
   - MEDIUM → fan sedang
   - HIGH → fan cepat

---

## 8. Pseudocode

```python
fuzzy_value = fuzzy_sugeno(gas, asap, suhu)

if fuzzy_value > 70:
    set_fan_speed("HIGH")
    buzzer_on()

elif fuzzy_value > 40:
    set_fan_speed("MEDIUM")
    buzzer_on()

elif fuzzy_value > 20:
    set_fan_speed("LOW")

else:
    fan_off()