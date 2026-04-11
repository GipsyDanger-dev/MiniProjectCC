import requests
import time


GET_COMMAND_URL = "http://127.0.0.1:8000/api/command/get"
UPDATE_STATUS_URL = "http://127.0.0.1:8000/api/status/update"
HEARTBEAT_URL = "http://127.0.0.1:8000/api/worker/heartbeat"

# Device ID - Worker ini untuk Device 1
DEVICE_ID = 1

HEADERS = {
    "x-api-key": "apa-hayo-kuncinya-99"
}

print("⚙️  Memulai Python Worker (Secured Asynchronous System)...")
print(f"🏢 Worker untuk Device {DEVICE_ID}...")
print("Menunggu antrean perintah dari server...\n")

while True:
    try:

        requests.post(HEARTBEAT_URL, json={
            "component_name": "Main Python Worker",
            "current_state": "Active / Polling"
        }, headers=HEADERS)


        # ← Tambah device_id parameter
        response = requests.get(GET_COMMAND_URL, params={"device_id": DEVICE_ID}, headers=HEADERS)
        

        if response.status_code == 401:
            print("⛔ [ERROR] Akses Ditolak! Cek API Key di Worker kamu.")
            time.sleep(3)

        data = response.json()

        if data.get('status') == 'success':
            command = data['data']
            cmd_id = command['id']
            target = command['target_device']
            action = command['action']

            print(f"📥 [PESANAN MASUK] Harus melakukan: [{action}] pada [{target}]")

            requests.post(HEARTBEAT_URL, json={
                "component_name": "Main Python Worker",
                "current_state": f"Executing {action} on {target}"
            }, headers=HEADERS)

            print(f"🔄 Sedang mengeksekusi hardware {target}...")
            if target == "buzzer":
                print("   -> Mengirim sinyal HIGH ke pin D26 (Buzzer)...")
            else:
                print(f"   -> Mengirim sinyal ke {target}...")
                
            time.sleep(2) 

            payload = {
                "command_id": cmd_id,
                "status": "completed"
            }
            update_resp = requests.post(UPDATE_STATUS_URL, json=payload, headers=HEADERS)
            
            if update_resp.status_code == 200:
                print(f"✅ [SELESAI] Perintah id-{cmd_id} beres dan sudah dilog ke database!\n")
        
    except Exception as e:
        print(f"❌ Gagal memproses perintah: {e}")
        pass

    # Jeda 3 detik
    time.sleep(3)