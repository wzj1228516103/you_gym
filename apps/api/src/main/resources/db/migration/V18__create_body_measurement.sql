CREATE TABLE body_measurement (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    height_cm DECIMAL(6,2),
    weight_kg DECIMAL(6,2),
    body_fat_pct DECIMAL(5,2),
    waist_cm DECIMAL(6,2),
    chest_cm DECIMAL(6,2),
    hip_cm DECIMAL(6,2),
    arm_cm DECIMAL(6,2),
    note VARCHAR(240),
    measured_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_body_measurement_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT ck_body_measurement_value CHECK (height_cm IS NOT NULL OR weight_kg IS NOT NULL OR body_fat_pct IS NOT NULL OR waist_cm IS NOT NULL OR chest_cm IS NOT NULL OR hip_cm IS NOT NULL OR arm_cm IS NOT NULL)
);
CREATE INDEX idx_body_measurement_user_time ON body_measurement (user_id, measured_at);
