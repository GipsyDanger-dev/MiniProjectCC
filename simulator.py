import requests
import time
import random

API_URL = "http://127.0.0.1:8000/api/ingest"

DEVICE_CREDENTIALS = {
    1: "key-servernih-121",
    2: "key-dapurnih-212",
    3: "key-arsipnih-311",
    4: "key-koridornih-441"
}

print("Memulai Python Simulator dengan Per-Device Security...")
print("Mengirim data untuk 4 device setiap 5 detik. Tekan Ctrl+C untuk berhenti.\n")

while True:

    for dev_id, secret_key in DEVICE_CREDENTIALS.items():

        HEADERS = {
            "x-api-key": secret_key
        }

        is_fire = random.choice([True, False, False, False]) 
        simulated_flame = random.uniform(100.0, 499.0) if is_fire else random.uniform(800.0, 1024.0)

        payload = {
            "device_id": dev_id,
            "gas_value": round(random.uniform(50.0, 350.0), 2),
            "smoke_value": round(random.uniform(20.0, 220.0), 2),
            "temperature": round(random.uniform(25.0, 50.0), 2),
            "flame_value": round(simulated_flame, 2) 
        }

        try:
            response = requests.post(API_URL, json=payload, headers=HEADERS)

            if response.status_code == 401:
                print(f"⛔ Akses Ditolak untuk Device {dev_id}! Cek API Key kamu.")
                continue 

            data_response = response.json()
            status_indikasi = data_response.get('data', {}).get('status_indikasi', 'UNKNOWN')

            g_val = payload['gas_value']
            s_val = payload['smoke_value']
            t_val = payload['temperature']
            f_val = payload['flame_value']

            fire_alert = "🔥 (API!)" if f_val < 500 else "(Aman)"

            log_text = f"Gas: {g_val} | Asap: {s_val} | Suhu: {t_val}°C | Api: {f_val} {fire_alert}"

            if status_indikasi == 'BAHAYA':
                print(f"⚠️  [BAHAYA] Dev {dev_id} -> {log_text}")
            else:
                print(f"✅  [AMAN]   Dev {dev_id} -> {log_text}")
                
        except Exception as e:
            print(f"❌ Gagal mengirim data dari device {dev_id}: {e}")

    print("-" * 80)

    time.sleep(5)