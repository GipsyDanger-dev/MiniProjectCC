import requests
import time
import json

GET_COMMAND_URL = "http://127.0.0.1:8000/api/command/get"
UPDATE_STATUS_URL = "http://127.0.0.1:8000/api/status/update"
HEARTBEAT_URL = "http://127.0.0.1:8000/api/worker/heartbeat"

DEVICE_ID = 1

HEADERS = {
    "x-api-key": "key-servernih-121"  # Same as device 1 in simulator
}

print("⚙️  Memulai Python Worker (Secured Asynchronous System)...")
print(f"🏢 Worker untuk Device {DEVICE_ID}...")
print("Menunggu antrean perintah dari server...\n")

while True:
    try:
        # Send heartbeat
        try:
            hb_resp = requests.post(HEARTBEAT_URL, json={
                "component_name": "Main Python Worker",
                "current_state": "Active / Polling"
            }, headers=HEADERS, timeout=5)
        except Exception as hb_error:
            print(f"⚠️  Heartbeat error: {hb_error}")

        # Get pending command
        try:
            response = requests.get(GET_COMMAND_URL, params={"device_id": DEVICE_ID}, headers=HEADERS, timeout=5)
        except requests.Timeout:
            print("⏱️  Request timeout, retrying...")
            time.sleep(3)
            continue
        except Exception as req_error:
            print(f"❌ Request error: {req_error}")
            time.sleep(3)
            continue

        # Check status code
        if response.status_code == 401:
            print("⛔ [ERROR] Akses Ditolak! Cek API Key di Worker kamu.")
            print(f"   Response: {response.text[:200]}")
            time.sleep(5)
            continue

        if response.status_code != 200:
            print(f"❌ [ERROR] Status {response.status_code}: {response.text[:200]}")
            time.sleep(3)
            continue

        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError:
            print(f"❌ JSON Decode Error. Response: {response.text[:200]}")
            time.sleep(3)
            continue

        # Handle response
        if data.get('status') == 'success':
            command = data.get('data')
            if not command:
                print("⏳ Tidak ada perintah baru, polling ulang...")
                time.sleep(3)
                continue
            
            try:
                cmd_id = command['id']
                target = command['target_device']
                action = command['action']

                print(f"📥 [PESANAN MASUK] Harus melakukan: [{action}] pada [{target}]")

                requests.post(HEARTBEAT_URL, json={
                    "component_name": "Main Python Worker",
                    "current_state": f"Executing {action} on {target}"
                }, headers=HEADERS, timeout=5)

                print(f"🔄 Sedang mengeksekusi hardware {target}...")
                if target == "exhaust_fan":
                    fan_action = action.upper()
                    if fan_action == "START":
                        fan_action = "HIGH"
                    elif fan_action == "STOP":
                        fan_action = "OFF"

                    if fan_action == "HIGH":
                        print("   -> Set exhaust fan ke KECEPATAN TINGGI (100%)")
                    elif fan_action == "MEDIUM":
                        print("   -> Set exhaust fan ke KECEPATAN SEDANG (60%)")
                    elif fan_action == "LOW":
                        print("   -> Set exhaust fan ke KECEPATAN RENDAH (30%)")
                    else:
                        print("   -> Matikan exhaust fan (OFF)")
                elif target == "buzzer":
                    print("   -> Mengirim sinyal HIGH ke pin D26 (Buzzer)...")
                else:
                    print(f"   -> Mengirim sinyal ke {target}...")
                    
                time.sleep(2)

                # Update command status
                try:
                    payload = {
                        "command_id": cmd_id,
                        "status": "completed"
                    }
                    update_resp = requests.post(UPDATE_STATUS_URL, json=payload, headers=HEADERS, timeout=5)
                    
                    if update_resp.status_code == 200:
                        print(f"✅ [SELESAI] Perintah id-{cmd_id} beres dan sudah dilog ke database!\n")
                    else:
                        print(f"⚠️  Update status error: {update_resp.status_code} - {update_resp.text[:100]}")
                except Exception as update_error:
                    print(f"❌ Update error: {update_error}")
                    
            except KeyError as key_error:
                print(f"❌ Command data missing key: {key_error}")
                time.sleep(3)
                continue

        elif data.get('status') == 'empty':
            print(f"⏳ No pending commands for Device {DEVICE_ID}")
            time.sleep(3)
        else:
            print(f"⚠️  Unexpected response: {data.get('status')} - {data.get('message', 'No message')}")
            time.sleep(3)
        
    except Exception as e:
        print(f"❌ Main loop error: {type(e).__name__}: {e}")
        time.sleep(3)

    time.sleep(3)