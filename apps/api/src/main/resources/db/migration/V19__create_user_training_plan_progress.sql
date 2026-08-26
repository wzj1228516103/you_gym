CREATE TABLE user_training_plan (
    user_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    completed_sessions INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    last_completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, plan_id),
    CONSTRAINT fk_user_training_plan_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT fk_user_training_plan_plan FOREIGN KEY (plan_id) REFERENCES training_plan(id)
);
CREATE INDEX idx_user_training_plan_status ON user_training_plan (user_id, status, updated_at);
