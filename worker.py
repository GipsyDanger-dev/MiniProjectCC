import requests
import time

# URL API Laravel Anda
GET_COMMAND_URL = "http://127.0.0.1:8000/api/command/get"
UPDATE_STATUS_URL = "http://127.0.0.1:8000/api/status/update"
HEARTBEAT_URL = "http://127.0.0.1:8000/api/worker/heartbeat"

# --- 1. TAMBAHKAN KUNCI RAHASIA DI SINI ---
HEADERS = {
    "x-api-key": "apa-hayo-kuncinya-99"
}

print("⚙️  Memulai Python Worker (Secured Asynchronous System)...")
print("Menunggu antrean perintah dari server...\n")

while True:
    try:
        # --- 0. MENGIRIM HEARTBEAT (Dengan API Key) ---
        requests.post(HEARTBEAT_URL, json={
            "component_name": "Main Python Worker",
            "current_state": "Active / Polling"
        }, headers=HEADERS)

        # 1. Bertanya ke server apakah ada perintah (Dengan API Key)
        response = requests.get(GET_COMMAND_URL, headers=HEADERS)
        
        # Cek jika kunci salah/ditolak
        if response.status_code == 401:
            print("⛔ [ERROR] Akses Ditolak! Cek API Key di Worker kamu.")
            time.sleep(3)
            continue # Ulangi loop tanpa mengeksekusi sisa kode di bawahnya

        data = response.json()

        # 2. Jika ada perintah yang masuk
        if data.get('status') == 'success':
            command = data['data']
            cmd_id = command['id']
            target = command['target_device']
            action = command['action']

            print(f"📥 [PESANAN MASUK] Harus melakukan: [{action}] pada [{target}]")
            
            # --- UPDATE STATUS HEARTBEAT SAAT BEKERJA (Dengan API Key) ---
            requests.post(HEARTBEAT_URL, json={
                "component_name": "Main Python Worker",
                "current_state": f"Executing {action} on {target}"
            }, headers=HEADERS)
            
            # 3. Simulasi menyalakan perangkat keras 
            print(f"🔄 Sedang mengeksekusi hardware {target}...")
            if target == "buzzer":
                print("   -> Mengirim sinyal HIGH ke pin D26 (Buzzer)...")
            else:
                print(f"   -> Mengirim sinyal ke {target}...")
                
            time.sleep(2) # Waktu tunggu eksekusi
            
            # 4. Lapor kembali ke server kalau tugas selesai (Dengan API Key)
            payload = {
                "command_id": cmd_id,
                "status": "completed"
            }
            update_resp = requests.post(UPDATE_STATUS_URL, json=payload, headers=HEADERS)
            
            if update_resp.status_code == 200:
                print(f"✅ [SELESAI] Perintah id-{cmd_id} beres dan sudah dilog ke database!\n")
        
    except Exception as e:
        # Jika server mati/terputus
        pass

    # Jeda 3 detik
    time.sleep(3)