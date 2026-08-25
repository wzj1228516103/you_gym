CREATE TABLE analytics_event (
    event_id VARCHAR(100) NOT NULL PRIMARY KEY,
    event_name VARCHAR(120) NOT NULL,
    event_version INT NOT NULL DEFAULT 1,
    occurred_at TIMESTAMP NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    analytics_user_id VARCHAR(100),
    platform VARCHAR(32),
    app_version VARCHAR(64),
    build_number VARCHAR(64),
    locale VARCHAR(32),
    timezone VARCHAR(64),
    network_type VARCHAR(32),
    screen_id VARCHAR(120),
    properties_json CLOB NOT NULL,
    CONSTRAINT ck_analytics_event_name CHECK (CHAR_LENGTH(event_name) > 0)
);

CREATE INDEX idx_analytics_event_name_time ON analytics_event (event_name, occurred_at);
CREATE INDEX idx_analytics_event_user_time ON analytics_event (analytics_user_id, occurred_at);
