CREATE TABLE app_user (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    phone VARCHAR(32) NOT NULL UNIQUE,
    nickname VARCHAR(80) NOT NULL,
    gender VARCHAR(16),
    birth_year INT,
    height_cm DECIMAL(6,2),
    weight_kg DECIMAL(6,2),
    body_fat_pct DECIMAL(5,2),
    goal VARCHAR(32),
    experience_level VARCHAR(32),
    weekly_frequency VARCHAR(16),
    venue VARCHAR(32),
    equipment_json VARCHAR(2000),
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP
);
CREATE INDEX idx_app_user_status_created ON app_user (status, created_at);

CREATE TABLE app_user_session (
    token_hash VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_app_session_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
CREATE INDEX idx_app_session_user ON app_user_session (user_id, expires_at);

CREATE TABLE app_verification_code (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    phone VARCHAR(32) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_app_verification_phone ON app_verification_code (phone, purpose, created_at);

CREATE TABLE workout_record (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(180) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    total_sets INT NOT NULL DEFAULT 0,
    total_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
    calories INT NOT NULL DEFAULT 0,
    metadata_json VARCHAR(8000),
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_workout_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
CREATE INDEX idx_workout_user_time ON workout_record (user_id, completed_at);

CREATE TABLE nutrition_record (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    meal_name VARCHAR(40) NOT NULL,
    calories DECIMAL(8,2) NOT NULL DEFAULT 0,
    protein_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbohydrates_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat_g DECIMAL(8,2) NOT NULL DEFAULT 0,
    food_count INT NOT NULL DEFAULT 0,
    metadata_json VARCHAR(8000),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_nutrition_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
CREATE INDEX idx_nutrition_user_time ON nutrition_record (user_id, recorded_at);
