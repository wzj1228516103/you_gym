CREATE TABLE exercise_dataset_detail (
    exercise_id VARCHAR(80) NOT NULL PRIMARY KEY,
    dataset_id VARCHAR(20) NOT NULL,
    category VARCHAR(80),
    body_part VARCHAR(80),
    muscle_group VARCHAR(120),
    secondary_muscles_json TEXT NOT NULL,
    instructions_json TEXT NOT NULL,
    instruction_steps_json TEXT NOT NULL,
    media_id VARCHAR(80),
    media_attribution VARCHAR(255),
    dataset_created_at VARCHAR(48),
    source_url VARCHAR(500) NOT NULL,
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercise_dataset_detail_catalog FOREIGN KEY (exercise_id) REFERENCES exercise_catalog(id)
);

CREATE INDEX idx_exercise_dataset_detail_dataset_id ON exercise_dataset_detail (dataset_id);
CREATE INDEX idx_exercise_dataset_detail_category ON exercise_dataset_detail (category, body_part);

CREATE TABLE exercise_dataset_import (
    dataset_key VARCHAR(80) NOT NULL PRIMARY KEY,
    source_url VARCHAR(500) NOT NULL,
    record_count INT NOT NULL,
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
