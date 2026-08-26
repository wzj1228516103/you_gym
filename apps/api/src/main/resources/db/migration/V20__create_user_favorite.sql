CREATE TABLE user_favorite (
    user_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    target_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, target_type, target_id),
    CONSTRAINT fk_user_favorite_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
CREATE INDEX idx_user_favorite_user_type ON user_favorite (user_id, target_type, created_at);
