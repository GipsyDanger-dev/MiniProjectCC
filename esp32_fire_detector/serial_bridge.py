"""
ESP32 Serial Bridge — kirim data sensor ke Laravel API via USB Serial.

Usage:
    python serial_bridge.py COM3          # Windows
    python serial_bridge.py /dev/ttyUSB0  # Linux

Install dulu:
    pip install pyserial requests
"""

import sys
import json
import time
import serial
import requests

SERIAL_PORT = sys.argv[1] if len(sys.argv) > 1 else "COM7"
BAUD_RATE = 115200
SERVER_URL = "https://sentinel.socrapper.my.id/api"
API_KEY = "apa-hayo-kuncinya-99"
DEVICE_ID = 1

def connect_serial():
    while True:
        try:
            ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
            ser.dtr = False
            ser.rts = False
            time.sleep(0.5)
            ser.reset_input_buffer()
            print(f"[BRIDGE] Terhubung ke {SERIAL_PORT}")
            return ser
        except serial.SerialException:
            print(f"[BRIDGE] Gagal buka {SERIAL_PORT}, retry dalam 3 detik...")
            time.sleep(3)

def kirim_ke_api(data):
    try:
        payload = {
            "device_id": DEVICE_ID,
            "gas_value": data.get("gas_value", 0),
            "smoke_value": data.get("smoke_value", 0),
            "temperature": data.get("temperature", 0),
            "humidity": data.get("humidity", 0),
            "flame_value": data.get("flame_value", 0),
        }
        resp = requests.post(
            f"{SERVER_URL}/ingest",
            json=payload,
            headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
            timeout=10,
        )
        if resp.status_code == 201:
            result = resp.json()
            decision = result.get("decision", {})
            print(f"[API] OK — fan={decision.get('fan_status')}, score={decision.get('score')}")
            return result
        else:
            print(f"[API] GAGAL — HTTP {resp.status_code}")
    except requests.RequestException as e:
        print(f"[API] Error — {e}")
    return None

def poll_command(ser):
    try:
        resp = requests.get(
            f"{SERVER_URL}/command/get",
            params={"device_id": DEVICE_ID},
            headers={"x-api-key": API_KEY},
            timeout=5,
        )
        if resp.status_code == 200:
            result = resp.json()
            if result.get("status") == "success":
                cmd = result["data"]
                print(f"[COMMAND] id={cmd['id']} | {cmd['target_device']} → {cmd['action']}")

                if not ser.is_open:
                    print("[SERIAL] Port tertutup, skip kirim command")
                    return

                cmd_json = json.dumps({
                    "target": cmd["target_device"],
                    "action": cmd["action"],
                    "id": cmd["id"],
                })
                ser.write((cmd_json + "\n").encode())
                ser.flush()
                print(f"[SERIAL] TX → {cmd_json.strip()}")
    except requests.RequestException as e:
        print(f"[COMMAND] Poll error: {e}")

def lapor_status(command_id, status):
    try:
        requests.post(
            f"{SERVER_URL}/status/update",
            json={"command_id": command_id, "status": status},
            headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
            timeout=5,
        )
    except requests.RequestException as e:
        print(f"[STATUS] Update error: {e}")

def kirim_heartbeat(state="online"):
    try:
        requests.post(
            f"{SERVER_URL}/worker/heartbeat",
            json={"component_name": "ESP32-FireDetector", "current_state": state},
            headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
            timeout=5,
        )
    except requests.RequestException as e:
        print(f"[HEARTBEAT] Error: {e}")

def main():
    print("=" * 50)
    print("  ESP32 Serial Bridge — Smart Safety")
    print("=" * 50)
    print(f"  Port  : {SERIAL_PORT}")
    print(f"  Server: {SERVER_URL}")
    print(f"  Device: {DEVICE_ID}")
    print("=" * 50)

    ser = connect_serial()

    last_poll = 0
    last_heartbeat = 0
    POLL_INTERVAL = 2
    HEARTBEAT_INTERVAL = 30

    try:
        while True:
            now = time.time()

            try:
                if ser.in_waiting > 0:
                    line = ser.readline().decode("utf-8", errors="ignore").strip()
                    if not line:
                        pass
                    else:
                        try:
                            data = json.loads(line)
                        except json.JSONDecodeError:
                            print(f"[ESP32] {line}")
                            data = None

                        if data:
                            msg_type = data.get("type", "")

                            if msg_type == "ready":
                                print("[ESP32] Sensor siap!")
                            elif msg_type == "ack":
                                print(f"[ESP32] ACK: id={data.get('id')} status={data.get('status')}")
                                lapor_status(data.get("id", 0), data.get("status", "completed"))
                            elif msg_type == "sensor":
                                print(f"[SENSOR] Gas={data['gas_value']} Flame={data['flame_value']} "
                                      f"Suhu={data['temperature']}C Hum={data['humidity']}%")
                                kirim_ke_api(data)
            except (serial.SerialException, OSError) as e:
                print(f"[SERIAL] Koneksi terputus: {e}, reconnecting...")
                try:
                    ser.close()
                except:
                    pass
                ser = connect_serial()
                continue

            if now - last_poll >= POLL_INTERVAL:
                last_poll = now
                poll_command(ser)

            if now - last_heartbeat >= HEARTBEAT_INTERVAL:
                last_heartbeat = now
                kirim_heartbeat()

            time.sleep(0.1)

    except KeyboardInterrupt:
        print("\n[BRIDGE] Dihentikan")
    finally:
        ser.close()

if __name__ == "__main__":
    main()
