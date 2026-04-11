import requests
import time
import random

API_URL = "http://127.0.0.1:8000/api/ingest"

HEADERS = {
    "x-api-key": "apa-hayo-kuncinya-99"
}

device_ids = [1, 2, 3]

print("🚀 Memulai Python Simulator Smart Safety System (Secured)...")
print("Mengirim data untuk 3 device setiap 5 detik. Tekan Ctrl+C untuk berhenti.\n")

while True:
    for dev_id in device_ids:

        payload = {
            "device_id": dev_id,
            "gas_value": round(random.uniform(50.0, 350.0), 2),
            "smoke_value": round(random.uniform(20.0, 220.0), 2),
            "temperature": round(random.uniform(25.0, 50.0), 2)
        }

        try:
            response = requests.post(API_URL, json=payload, headers=HEADERS)

            if response.status_code == 401:
                print(f"⛔ Akses Ditolak untuk Device {dev_id}! Cek API Key kamu.")
                continue 

            data_response = response.json()
            status_indikasi = data_response.get('data', {}).get('status_indikasi', 'UNKNOWN')

            if status_indikasi == 'BAHAYA':
                print(f"⚠️  [BAHAYA] Device {dev_id} terkirim! Status HTTP: {response.status_code}")
            else:
                print(f"✅  [AMAN] Device {dev_id} terkirim! Status HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Gagal mengirim data dari device {dev_id}: {e}")

    print("-" * 50)
    # Jeda 5 detik sebelum mengirim data lagi
    time.sleep(5)