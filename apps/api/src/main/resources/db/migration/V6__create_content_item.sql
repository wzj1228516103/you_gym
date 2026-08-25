CREATE TABLE content_item (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    content_type VARCHAR(24) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    summary VARCHAR(500),
    body TEXT,
    media_url VARCHAR(1000),
    anatomy_node_id VARCHAR(100),
    created_by VARCHAR(120) NOT NULL,
    updated_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    CONSTRAINT fk_content_anatomy FOREIGN KEY (anatomy_node_id) REFERENCES anatomy_node(id)
);

CREATE INDEX idx_content_status_updated ON content_item (status, updated_at);
CREATE INDEX idx_content_type ON content_item (content_type);
