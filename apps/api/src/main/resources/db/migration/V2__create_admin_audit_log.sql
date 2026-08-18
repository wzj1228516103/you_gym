CREATE TABLE admin_audit_log (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    occurred_at TIMESTAMP NOT NULL,
    actor_subject VARCHAR(100) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(120) NOT NULL,
    resource_type VARCHAR(80) NOT NULL,
    resource_id VARCHAR(120),
    ip_address VARCHAR(64),
    metadata_json CLOB NOT NULL
);

CREATE INDEX idx_admin_audit_time ON admin_audit_log (occurred_at);
CREATE INDEX idx_admin_audit_actor_time ON admin_audit_log (actor_subject, occurred_at);
