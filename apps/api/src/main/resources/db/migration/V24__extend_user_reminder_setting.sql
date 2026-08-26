ALTER TABLE user_reminder_setting ADD COLUMN training_time VARCHAR(5) DEFAULT '08:00';
ALTER TABLE user_reminder_setting ADD COLUMN nutrition_time VARCHAR(5) DEFAULT '12:00';
ALTER TABLE user_reminder_setting ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Shanghai';
ALTER TABLE user_reminder_setting ADD COLUMN quiet_hours_start VARCHAR(5);
ALTER TABLE user_reminder_setting ADD COLUMN quiet_hours_end VARCHAR(5);
