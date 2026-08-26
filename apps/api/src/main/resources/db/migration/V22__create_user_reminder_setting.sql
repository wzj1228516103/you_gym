CREATE TABLE user_reminder_setting (
    user_id VARCHAR(36) NOT NULL PRIMARY KEY,
    training_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    nutrition_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rest_sound_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_reminder_setting_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
