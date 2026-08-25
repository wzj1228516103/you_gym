CREATE TABLE admin_account (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP
);

CREATE TABLE admin_session (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    account_id VARCHAR(100) NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    CONSTRAINT fk_admin_session_account FOREIGN KEY (account_id) REFERENCES admin_account(id)
);

CREATE INDEX idx_admin_session_account ON admin_session (account_id, created_at);
CREATE INDEX idx_admin_session_expiry ON admin_session (expires_at, revoked_at);
