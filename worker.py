import requests
import time

# URL API Laravel kamu
GET_COMMAND_URL = "http://127.0.0.1:8000/api/command/get"
UPDATE_STATUS_URL = "http://127.0.0.1:8000/api/status/update"

print("Memulai Python Worker (Sistem Asynchronous)...")
print("Menunggu antrean perintah dari server...\n")

while True:
    try:
        # 1. Bertanya ke server apakah ada perintah (Polling)
        response = requests.get(GET_COMMAND_URL)
        data = response.json()

        # 2. Jika ada perintah yang masuk
        if data.get('status') == 'success':
            command = data['data']
            cmd_id = command['id']
            target = command['target_device']
            action = command['action']

            print(f"[PESANAN MASUK] Harus melakukan: [{action}] pada [{target}]")
            
            # 3. Simulasi menyalakan perangkat keras 
            print(f"Sedang mengeksekusi hardware {target}...")
            if target == "buzzer":
                print("   -> Mengirim sinyal HIGH ke pin D26 (Buzzer)...")
            else:
                print(f"   -> Mengirim sinyal ke {target}...")
                
            time.sleep(2) # Pura-puranya butuh waktu 2 detik untuk nyala
            
            # 4. Lapor kembali ke server kalau tugas selesai
            payload = {
                "command_id": cmd_id,
                "status": "completed"
            }
            update_resp = requests.post(UPDATE_STATUS_URL, json=payload)
            
            if update_resp.status_code == 200:
                print(f"[SELESAI] Perintah id-{cmd_id} beres dan sudah dilog ke database!\n")
        
    except Exception as e:
        # Kalau server mati, worker ngga akan crash, cuma ngeluh aja
        pass

    # Beri jeda 3 detik sebelum ngecek database lagi biar server nggak meledak
    time.sleep(3)