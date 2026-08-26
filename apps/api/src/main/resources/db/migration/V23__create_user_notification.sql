CREATE TABLE user_notification (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_type VARCHAR(32) NOT NULL,
    title VARCHAR(160) NOT NULL,
    summary VARCHAR(500),
    deep_link VARCHAR(300),
    important BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_notification_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
CREATE INDEX idx_user_notification_feed ON user_notification (user_id, created_at);
CREATE INDEX idx_user_notification_unread ON user_notification (user_id, read_at, created_at);
