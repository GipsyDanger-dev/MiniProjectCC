import requests
import time
import random

API_URL = "http://127.0.0.1:8000/api/ingest"
API_KEY = "apa-hayo-kuncinya-99"
DEVICE_ID = 1

HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

print("=== SentinelIoT Simulator ===")
print(f"Device ID : {DEVICE_ID}")
print(f"API URL   : {API_URL}")
print(f"Interval  : 5 detik")
print("Tekan Ctrl+C untuk berhenti.\n")

while True:
    is_fire = random.choice([True, False, False, False])
    simulated_flame = round(random.uniform(100.0, 499.0), 2) if is_fire else round(random.uniform(800.0, 4095.0), 2)

    payload = {
        "device_id": DEVICE_ID,
        "gas_value": round(random.uniform(0.0, 500.0), 2),
        "smoke_value": round(random.uniform(0.0, 300.0), 2),
        "temperature": round(random.uniform(25.0, 55.0), 2),
        "humidity": round(random.uniform(30.0, 80.0), 2),
        "flame_value": simulated_flame
    }

    try:
        response = requests.post(API_URL, json=payload, headers=HEADERS)

        if response.status_code == 401:
            print("⛔ Akses Ditolak! Cek API Key.")
        elif response.status_code != 201:
            print(f"❌ Error {response.status_code}: {response.text[:200]}")
        else:
            data = response.json()
            status = data.get('data', {}).get('status_indikasi', 'UNKNOWN')
            score = data.get('data', {}).get('fuzzy_score', 0)
            fan = data.get('data', {}).get('fan_status', '?')

            fire_icon = "🔥" if is_fire else "✅"
            print(f"{fire_icon} [{status}] Gas={payload['gas_value']} | Asap={payload['smoke_value']} | Suhu={payload['temperature']}°C | Flame={simulated_flame} | Score={score} | Fan={fan}")

    except Exception as e:
        print(f"❌ Gagal kirim: {e}")

    print("-" * 60)
    time.sleep(5)