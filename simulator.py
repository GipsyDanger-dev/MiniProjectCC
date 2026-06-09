import time
import random
import threading
import mysql.connector

# ============================================================
# Konfigurasi MySQL
# ============================================================
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "sentinel",
}

INTERVAL = 3  # detik

# Threshold — dibaca dari DB, fallback ke default
_thresholds = {
    "gas": 300.0,
    "smoke": 200.0,
    "temp": 45.0,
    "flame": 500.0,
}
_threshold_lock = threading.Lock()
_last_threshold_fetch = 0
THRESHOLD_REFRESH = 30  # detik


def refresh_thresholds(pool):
    """Baca threshold dari tabel system_settings."""
    global _last_threshold_fetch
    now = time.time()
    if now - _last_threshold_fetch < THRESHOLD_REFRESH:
        return
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT gas_threshold, smoke_threshold, humidity_threshold, temperature_threshold, flame_threshold FROM system_settings WHERE id=1")
        row = cursor.fetchone()
        if row:
            with _threshold_lock:
                _thresholds["gas"] = float(row["gas_threshold"])
                _thresholds["smoke"] = float(row["smoke_threshold"])
                _thresholds["humidity"] = float(row["humidity_threshold"])
                _thresholds["temp"] = float(row["temperature_threshold"])
                _thresholds["flame"] = float(row["flame_threshold"])
            _last_threshold_fetch = now
    except Exception as e:
        print(f"  [!] Gagal baca threshold: {e}")
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


def get_thresholds():
    with _threshold_lock:
        return dict(_thresholds)

# Device 1 (Main Hall) = ESP32 real, jangan simulasikan
# Device 2, 3, 4 masih disimulasikan
DEVICES = [
    {
        "device_id": 2,
        "name": "Kitchen",
        "gas_base": 280, "gas_var": 200,
        "smoke_base": 100, "smoke_var": 120,
        "temp_base": 34, "temp_var": 12,
        "humidity_base": 55, "humidity_var": 20,
        "fire_chance": 0.20,
    },
    {
        "device_id": 3,
        "name": "Warehouse",
        "gas_base": 220, "gas_var": 180,
        "smoke_base": 70, "smoke_var": 100,
        "temp_base": 30, "temp_var": 10,
        "humidity_base": 60, "humidity_var": 15,
        "fire_chance": 0.15,
    },
    {
        "device_id": 4,
        "name": "Server Room",
        "gas_base": 100, "gas_var": 80,
        "smoke_base": 40, "smoke_var": 60,
        "temp_base": 22, "temp_var": 6,
        "humidity_base": 45, "humidity_var": 10,
        "fire_chance": 0.08,
    },
]


# ============================================================
# Fuzzy Logic (replikasi dari ApiController.php)
# ============================================================
def triangular_membership(value, left, peak, right):
    if value < left or value > right:
        return 0.0
    if value == right and right != peak:
        return 0.0
    if value < peak:
        denom = peak - left
        return (value - left) / denom if denom > 0 else 1.0
    if value > peak:
        denom = right - peak
        return (right - value) / denom if denom > 0 else 1.0
    return 1.0


def build_fuzzy_decision(gas, smoke, temperature, flame):
    th = get_thresholds()
    gt, st, tt, ft = th["gas"], th["smoke"], th["temp"], th["flame"]

    if flame < ft:
        return {
            "score": 100.0, "fan_status": "HIGH", "fan_speed": 100,
            "profile": "FLAME_OVERRIDE",
            "rules": [("Flame override", 1.0, 100)],
        }

    gas_low = triangular_membership(gas, 0, 0, gt * 0.8)
    gas_med = triangular_membership(gas, gt * 0.6, gt, gt * 1.6)
    gas_high = triangular_membership(gas, gt * 1.4, gt * 2.4, gt * 2.4)

    smoke_low = triangular_membership(smoke, 0, 0, st * 0.8)
    smoke_med = triangular_membership(smoke, st * 0.6, st, st * 2.0)
    smoke_high = triangular_membership(smoke, st * 1.6, st * 3.2, st * 3.2)

    temp_normal = triangular_membership(temperature, tt * 0.5, tt * 0.75, tt)
    temp_warm = triangular_membership(temperature, tt * 0.875, tt, tt * 1.25)
    temp_hot = triangular_membership(temperature, tt * 1.25, tt * 1.75, tt * 1.75)

    rules = [
        ("SAFE",   min(gas_low, smoke_low,  temp_normal),  0),
        ("LOW",    min(gas_low, smoke_low,  temp_warm),   30),
        ("HIGH",   min(gas_low, smoke_low,  temp_hot),   100),
        ("LOW",    min(gas_low, smoke_med,  temp_normal), 30),
        ("MEDIUM", min(gas_low, smoke_med,  temp_warm),   60),
        ("HIGH",   min(gas_low, smoke_med,  temp_hot),   100),
        ("HIGH",   min(gas_low, smoke_high, temp_normal),100),
        ("HIGH",   min(gas_low, smoke_high, temp_warm),  100),
        ("HIGH",   min(gas_low, smoke_high, temp_hot),   100),
        ("LOW",    min(gas_med, smoke_low,  temp_normal), 30),
        ("MEDIUM", min(gas_med, smoke_low,  temp_warm),   60),
        ("HIGH",   min(gas_med, smoke_low,  temp_hot),   100),
        ("MEDIUM", min(gas_med, smoke_med,  temp_normal), 60),
        ("MEDIUM", min(gas_med, smoke_med,  temp_warm),   60),
        ("HIGH",   min(gas_med, smoke_med,  temp_hot),   100),
        ("HIGH",   min(gas_med, smoke_high, temp_normal),100),
        ("HIGH",   min(gas_med, smoke_high, temp_warm),  100),
        ("HIGH",   min(gas_med, smoke_high, temp_hot),   100),
        ("HIGH",   min(gas_high, smoke_low,  temp_normal), 100),
        ("HIGH",   min(gas_high, smoke_low,  temp_warm),   100),
        ("HIGH",   min(gas_high, smoke_low,  temp_hot),    100),
        ("HIGH",   min(gas_high, smoke_med,  temp_normal), 100),
        ("HIGH",   min(gas_high, smoke_med,  temp_warm),   100),
        ("HIGH",   min(gas_high, smoke_med,  temp_hot),    100),
        ("HIGH",   min(gas_high, smoke_high, temp_normal), 100),
        ("HIGH",   min(gas_high, smoke_high, temp_warm),   100),
        ("HIGH",   min(gas_high, smoke_high, temp_hot),    100),
    ]

    weighted_sum = 0.0
    weight_total = 0.0
    active_rules = []

    for label, strength, output in rules:
        strength = float(strength)
        if strength <= 0:
            continue
        weighted_sum += strength * output
        weight_total += strength
        active_rules.append((label, round(strength, 4), output))

    score = weighted_sum / weight_total if weight_total > 0 else 0.0

    if score > 70:
        fan_status, fan_speed, profile = "HIGH", 100, "HIGH"
    elif score > 40:
        fan_status, fan_speed, profile = "MEDIUM", 60, "MEDIUM"
    elif score > 20:
        fan_status, fan_speed, profile = "LOW", 30, "LOW"
    else:
        fan_status, fan_speed, profile = "OFF", 0, "SAFE"

    return {
        "score": round(score, 2), "fan_status": fan_status,
        "fan_speed": fan_speed, "profile": profile, "rules": active_rules,
    }


def build_activity(decision, gas, smoke, temperature, flame):
    th = get_thresholds()
    flame_th = th["flame"]
    gas_th = th["gas"]
    smoke_th = th["smoke"]
    temp_th = th["temp"]

    # Deteksi sensor mana yang melanggar atau mendekati threshold
    alerts = []
    warnings = []

    # Flame: active-low, makin kecil = makin bahaya
    if flame < flame_th:
        alerts.append(f"Flame {flame:.0f}/{flame_th:.0f}")
    elif flame < flame_th * 1.2:
        warnings.append(f"Flame {flame:.0f}/{flame_th:.0f}")

    # Gas: higher = worse
    if gas > gas_th:
        alerts.append(f"Gas {gas:.0f}/{gas_th:.0f}")
    elif gas > gas_th * 0.8:
        warnings.append(f"Gas {gas:.0f}/{gas_th:.0f}")

    # Smoke: higher = worse
    if smoke > smoke_th:
        alerts.append(f"Smoke {smoke:.0f}/{smoke_th:.0f}")
    elif smoke > smoke_th * 0.8:
        warnings.append(f"Smoke {smoke:.0f}/{smoke_th:.0f}")

    # Temperature: higher = worse
    if temperature > temp_th:
        alerts.append(f"Temp {temperature:.1f}C/{temp_th:.1f}C")
    elif temperature > temp_th * 0.85:
        warnings.append(f"Temp {temperature:.1f}C/{temp_th:.1f}C")

    alert_str = ", ".join(alerts)
    warning_str = ", ".join(warnings)
    sensor_vals = f"Gas: {gas:.0f}/{gas_th:.0f}, Smoke: {smoke:.0f}/{smoke_th:.0f}, Temp: {temperature:.1f}C/{temp_th:.1f}C, Flame: {flame:.0f}/{flame_th:.0f}"

    # Flame override
    if decision["profile"] == "FLAME_OVERRIDE":
        return {
            "status": "BAHAYA", "action_type": "SENSOR_DATA",
            "message": "Flame detected — emergency fan activated",
            "description": f"Triggered: {alert_str} | {sensor_vals}",
        }

    status = "AMAN" if decision["fan_status"] == "OFF" else "BAHAYA"

    if status == "BAHAYA":
        desc = f"Triggered: {alert_str}"
        if warning_str:
            desc += f" | Near limit: {warning_str}"
        desc += f" | {sensor_vals}"
        return {
            "status": status, "action_type": "SENSOR_DATA",
            "message": f"Threshold exceeded — fan {decision['fan_status']}",
            "description": desc,
        }

    if warning_str:
        return {
            "status": "AMAN", "action_type": "SENSOR_DATA",
            "message": "All sensors normal — approaching limit",
            "description": f"Near limit: {warning_str} | {sensor_vals}",
        }

    return {
        "status": "AMAN", "action_type": "SENSOR_DATA",
        "message": "All sensors normal — fan off",
        "description": sensor_vals,
    }


# ============================================================
# Thread per device
# ============================================================
def simulate_device(device, db_pool):
    did = device["device_id"]
    name = device["name"]

    conn = None
    cursor = None

    def ensure_connection():
        nonlocal conn, cursor
        try:
            if conn is None or not conn.is_connected():
                conn = db_pool.get_connection()
                cursor = conn.cursor()
        except Exception as e:
            print(f"  [{name}] Reconnect: {e}")
            conn = db_pool.get_connection()
            cursor = conn.cursor()

    try:
        while True:
            try:
                ensure_connection()
                refresh_thresholds(db_pool)
                is_fire = random.random() < device["fire_chance"]
                flame = (
                    round(random.uniform(80.0, 480.0), 2) if is_fire
                    else round(random.uniform(800.0, 4095.0), 2)
                )
                gas = round(random.uniform(
                    max(0, device["gas_base"] - device["gas_var"]),
                    device["gas_base"] + device["gas_var"]
                ), 2)
                smoke = round(random.uniform(
                    max(0, device["smoke_base"] - device["smoke_var"]),
                    device["smoke_base"] + device["smoke_var"]
                ), 2)
                temp = round(random.uniform(
                    device["temp_base"] - device["temp_var"],
                    device["temp_base"] + device["temp_var"]
                ), 2)
                humidity = round(random.uniform(
                    max(0, device["humidity_base"] - device["humidity_var"]),
                    min(100, device["humidity_base"] + device["humidity_var"])
                ), 2)

                # Fuzzy decision
                decision = build_fuzzy_decision(gas, smoke, temp, flame)
                status_indikasi = "AMAN" if decision["fan_status"] == "OFF" else "BAHAYA"

                # Insert sensor_data
                cursor.execute(
                    """INSERT INTO sensor_data
                       (device_id, gas_value, smoke_value, temperature, humidity,
                        flame_value, fuzzy_score, status_indikasi, fan_status, fan_speed, decision_profile)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (did, gas, smoke, temp, humidity, flame,
                     decision["score"], status_indikasi,
                     decision["fan_status"], decision["fan_speed"], decision["profile"]),
                )

                # Insert activity_log
                activity = build_activity(decision, gas, smoke, temp, flame)
                cursor.execute(
                    """INSERT INTO activity_logs (device_id, action_type, status, description, message)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (did, activity["action_type"], activity["status"],
                     activity["description"], activity["message"]),
                )

                # Update device_actuators (fan + buzzer)
                alarm_status = "ON" if status_indikasi == "BAHAYA" else "OFF"
                cursor.execute(
                    """UPDATE device_actuators
                       SET fan_status = %s, fan_speed = %s, alarm_status = %s, updated_at = NOW()
                       WHERE device_id = %s""",
                    (decision["fan_status"], decision["fan_speed"], alarm_status, did),
                )

                conn.commit()

                icon = "FIRE" if is_fire else "OK"
                print(
                    f"  [{name}] {icon} {status_indikasi} | "
                    f"Gas={gas:>6} | Asap={smoke:>5} | "
                    f"Suhu={temp:>5}C | Lembap={humidity:>4}% | "
                    f"Flame={flame:>6} | "
                    f"Score={decision['score']:>5} | Fan={decision['fan_status']}"
                )
            except Exception as e:
                print(f"  [{name}] Loop error: {e}, reconnecting...")
                try:
                    if cursor: cursor.close()
                    if conn: conn.close()
                except:
                    pass
                conn, cursor = None, None
                time.sleep(2)
                continue

            time.sleep(INTERVAL)
    except Exception as e:
        print(f"  [{name}] Thread error: {e}")
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


# ============================================================
# Worker Heartbeat (updates worker_status table)
# ============================================================
def heartbeat_worker(db_pool):
    conn = None
    cursor = None
    try:
        while True:
            try:
                if conn is None or not conn.is_connected():
                    if cursor:
                        try: cursor.close()
                        except: pass
                    if conn:
                        try: conn.close()
                        except: pass
                    conn = db_pool.get_connection()
                    cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO worker_status (component_name, current_state, last_heartbeat)
                       VALUES (%s, %s, NOW())
                       ON DUPLICATE KEY UPDATE current_state = VALUES(current_state), last_heartbeat = NOW()""",
                    ("Main Python Worker", "Active / Polling"),
                )
                conn.commit()
            except Exception as e:
                print(f"  [Heartbeat] Error: {e}, reconnecting...")
                conn, cursor = None, None
            time.sleep(10)
    finally:
        try:
            if cursor: cursor.close()
            if conn: conn.close()
        except:
            pass


# ============================================================
# Main
# ============================================================
def main():
    print("=" * 70)
    print("  SentinelIoT — Multi-Device Simulator (MySQL Direct)")
    print("=" * 70)
    print(f"  Database : {DB_CONFIG['database']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"  Interval : {INTERVAL}s per device")
    print(f"  Devices  : {len(DEVICES)}")
    print("-" * 70)
    for d in DEVICES:
        print(f"  [{d['device_id']}] {d['name']:15} | fire_chance={d['fire_chance']*100:.0f}%")
    print("-" * 70)
    print("  Tekan Ctrl+C untuk berhenti.\n")

    # Connection pool
    pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="sentinel_pool",
        pool_size=len(DEVICES) + 2,  # +2 for heartbeat + threshold refresh
        **DB_CONFIG,
    )

    # Jalankan heartbeat worker
    hb_thread = threading.Thread(target=heartbeat_worker, args=(pool,), daemon=True)
    hb_thread.start()

    # Jalankan satu thread per device
    threads = []
    for device in DEVICES:
        t = threading.Thread(target=simulate_device, args=(device, pool), daemon=True)
        t.start()
        threads.append(t)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nSimulator dihentikan.")


if __name__ == "__main__":
    main()
