import requests
import time
import random

# Pastikan URL ini sesuai dengan alamat Laravel serve kamu
API_URL = "http://127.0.0.1:8000/api/ingest"

# --- 1. TAMBAHKAN KUNCI RAHASIA DI SINI ---
HEADERS = {
    "x-api-key": "apa-hayo-kuncinya-99"
}

# ID device sesuai dengan yang kita buat di database tadi
device_ids = [1, 2, 3]

print("🚀 Memulai Python Simulator Smart Safety System (Secured)...")
print("Mengirim data untuk 3 device setiap 5 detik. Tekan Ctrl+C untuk berhenti.\n")

while True:
    for dev_id in device_ids:
        # Membuat data dummy sensor acak
        # (Gas normal: < 300, Asap normal: < 200, Suhu normal: < 45)
        payload = {
            "device_id": dev_id,
            "gas_value": round(random.uniform(50.0, 350.0), 2),
            "smoke_value": round(random.uniform(20.0, 220.0), 2),
            "temperature": round(random.uniform(25.0, 50.0), 2)
        }

        try:
            # --- 2. SISIPKAN HEADERS KE DALAM REQUEST POST ---
            response = requests.post(API_URL, json=payload, headers=HEADERS)
            
            # Kalau API Key salah, Laravel akan merespons 401. Kita tangkap errornya.
            if response.status_code == 401:
                print(f"⛔ Akses Ditolak untuk Device {dev_id}! Cek API Key kamu.")
                continue # Lanjut ke device berikutnya

            # Membaca response JSON dari Laravel
            data_response = response.json()
            status_indikasi = data_response.get('data', {}).get('status_indikasi', 'UNKNOWN')
            
            # Print hasil ke terminal
            if status_indikasi == 'BAHAYA':
                print(f"⚠️  [BAHAYA] Device {dev_id} terkirim! Status HTTP: {response.status_code}")
            else:
                print(f"✅  [AMAN] Device {dev_id} terkirim! Status HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Gagal mengirim data dari device {dev_id}: {e}")

    print("-" * 50)
    # Jeda 5 detik sebelum mengirim data lagi
    time.sleep(5)