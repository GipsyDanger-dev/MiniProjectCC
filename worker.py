import requests
import time

# URL API Laravel Anda
GET_COMMAND_URL = "http://127.0.0.1:8000/api/command/get"
UPDATE_STATUS_URL = "http://127.0.0.1:8000/api/status/update"
HEARTBEAT_URL = "http://127.0.0.1:8000/api/worker/heartbeat" # URL Baru

print("⚙️  Memulai Python Worker (Sistem Asynchronous)...")
print("Menunggu antrean perintah dari server...\n")

while True:
    try:
        # --- 0. MENGIRIM HEARTBEAT ---
        # Melaporkan ke server bahwa worker ini masih hidup dan aktif
        requests.post(HEARTBEAT_URL, json={
            "component_name": "Main Python Worker",
            "current_state": "Active / Polling"
        })

        # 1. Bertanya ke server apakah ada perintah (Polling)
        response = requests.get(GET_COMMAND_URL)
        data = response.json()

        # 2. Jika ada perintah yang masuk
        if data.get('status') == 'success':
            command = data['data']
            cmd_id = command['id']
            target = command['target_device']
            action = command['action']

            print(f"📥 [PESANAN MASUK] Harus melakukan: [{action}] pada [{target}]")
            
            # --- UPDATE STATUS HEARTBEAT SAAT BEKERJA ---
            requests.post(HEARTBEAT_URL, json={
                "component_name": "Main Python Worker",
                "current_state": f"Executing {action} on {target}"
            })
            
            # 3. Simulasi menyalakan perangkat keras 
            print(f"🔄 Sedang mengeksekusi hardware {target}...")
            if target == "buzzer":
                print("   -> Mengirim sinyal HIGH ke pin D26 (Buzzer)...")
            else:
                print(f"   -> Mengirim sinyal ke {target}...")
                
            time.sleep(2) # Waktu tunggu eksekusi
            
            # 4. Lapor kembali ke server kalau tugas selesai
            payload = {
                "command_id": cmd_id,
                "status": "completed"
            }
            update_resp = requests.post(UPDATE_STATUS_URL, json=payload)
            
            if update_resp.status_code == 200:
                print(f"✅ [SELESAI] Perintah id-{cmd_id} beres dan sudah dilog ke database!\n")
        
    except Exception as e:
        # Jika server mati/terputus
        pass

    # Jeda 3 detik
    time.sleep(3)