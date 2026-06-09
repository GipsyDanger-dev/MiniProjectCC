-- ============================================================
-- SentinelIoT — Full Database Schema for Local MySQL
-- Jalankan: mysql -u root -p < database_schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS sentinel
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sentinel;

-- ------------------------------------------------------------
-- 1. devices
-- ------------------------------------------------------------
CREATE TABLE devices (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_name     VARCHAR(255) NOT NULL,
    location        VARCHAR(255) NULL,
    api_key         VARCHAR(255) NULL UNIQUE,
    status          VARCHAR(255) NOT NULL DEFAULT 'offline',
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed default device
INSERT INTO devices (id, device_name, location, api_key, status)
VALUES (1, 'Sensor Node 1', 'Ruang Utama', 'apa-hayo-kuncinya-99', 'online');

-- ------------------------------------------------------------
-- 2. sensor_data
-- ------------------------------------------------------------
CREATE TABLE sensor_data (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_id         BIGINT UNSIGNED NOT NULL,
    gas_value         FLOAT NOT NULL,
    smoke_value       FLOAT NOT NULL,
    temperature       FLOAT NOT NULL,
    humidity          FLOAT NOT NULL DEFAULT 0,
    flame_value       FLOAT NOT NULL DEFAULT 0,
    fuzzy_score       FLOAT NULL,
    status_indikasi   VARCHAR(255) NOT NULL,
    fan_status        VARCHAR(255) NULL,
    fan_speed         INT NULL,
    decision_profile  VARCHAR(255) NULL,
    created_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_sensor_data_device_created ON sensor_data (device_id, created_at);

-- ------------------------------------------------------------
-- 3. system_settings
-- ------------------------------------------------------------
CREATE TABLE system_settings (
    id                       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    gas_threshold            FLOAT NOT NULL DEFAULT 2500,
    smoke_threshold          FLOAT NOT NULL DEFAULT 2000,
    humidity_threshold       FLOAT NOT NULL DEFAULT 70,
    temperature_threshold    FLOAT NOT NULL DEFAULT 45,
    flame_threshold          FLOAT NOT NULL DEFAULT 500,
    mode                     VARCHAR(255) NOT NULL DEFAULT 'auto',
    emergency_active         TINYINT(1) NOT NULL DEFAULT 0,
    created_at               TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO system_settings (id) VALUES (1);

-- ------------------------------------------------------------
-- 4. activity_logs
-- ------------------------------------------------------------
CREATE TABLE activity_logs (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_id     BIGINT UNSIGNED NULL,
    action_type   VARCHAR(255) NULL,
    status        ENUM('BAHAYA', 'AMAN') NULL,
    description   TEXT NULL,
    message       VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_activity_logs_created_at ON activity_logs (created_at);
CREATE INDEX idx_activity_logs_device_id ON activity_logs (device_id);

-- ------------------------------------------------------------
-- 5. commands
-- ------------------------------------------------------------
CREATE TABLE commands (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_id     BIGINT UNSIGNED NULL,
    target_device VARCHAR(255) NOT NULL,
    action        VARCHAR(255) NOT NULL,
    status        VARCHAR(255) NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_commands_device_updated ON commands (device_id, updated_at);

-- ------------------------------------------------------------
-- 6. device_actuators
-- ------------------------------------------------------------
CREATE TABLE device_actuators (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_id     BIGINT UNSIGNED NOT NULL,
    fan_status    VARCHAR(255) NOT NULL DEFAULT 'OFF',
    alarm_status  VARCHAR(255) NOT NULL DEFAULT 'OFF',
    fan_speed     INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO device_actuators (device_id) VALUES (1);

-- ------------------------------------------------------------
-- 7. worker_status
-- ------------------------------------------------------------
CREATE TABLE worker_status (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    component_name   VARCHAR(255) NOT NULL UNIQUE,
    current_state    VARCHAR(255) NOT NULL,
    last_heartbeat   TIMESTAMP NULL,
    created_at       TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
