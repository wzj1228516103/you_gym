ALTER TABLE admin_account ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE admin_account ADD COLUMN locked_until TIMESTAMP NULL;
