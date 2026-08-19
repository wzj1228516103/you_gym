CREATE TABLE training_plan (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description VARCHAR(2000),
    duration_label VARCHAR(80) NOT NULL,
    level VARCHAR(32) NOT NULL,
    target VARCHAR(120) NOT NULL,
    category VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE training_plan_item (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL,
    exercise_id VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL,
    sets INT NOT NULL DEFAULT 3,
    reps VARCHAR(32) NOT NULL DEFAULT '8-12',
    rest_seconds INT NOT NULL DEFAULT 60,
    CONSTRAINT fk_plan_item_plan FOREIGN KEY (plan_id) REFERENCES training_plan(id),
    CONSTRAINT fk_plan_item_exercise FOREIGN KEY (exercise_id) REFERENCES exercise_catalog(id)
);
CREATE INDEX idx_plan_status_category ON training_plan(status, category, updated_at);
CREATE INDEX idx_plan_item_plan_order ON training_plan_item(plan_id, sort_order);

CREATE TABLE food_catalog (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    name_zh VARCHAR(120) NOT NULL,
    serving_label VARCHAR(32) NOT NULL,
    calories_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
    source VARCHAR(80) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_food_status_name ON food_catalog(status, name_zh);

INSERT INTO training_plan (id, title, description, duration_label, level, target, category, created_at, updated_at) VALUES
    ('full-body-beginner', '新手全身训练', '用基础动作建立训练习惯，覆盖主要动作模式。', '3天/周 · 6周', '入门', '增肌 · 健康', '新手', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ppl', '推拉腿三分化', '按推、拉、腿拆分训练，适合已有训练经验的用户。', '6天/周 · 8周', '中级', '增肌 · 力量', '增肌', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('home-fat-loss', '家庭自重减脂', '不依赖大型器械的家庭训练组合。', '4天/周 · 6周', '入门', '减脂 · 心肺', '家庭', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('glute-foundation', '臀腿基础计划', '逐步建立臀腿力量和髋部稳定性。', '3天/周 · 8周', '入门', '臀腿 · 塑形', '功能', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO training_plan_item (id, plan_id, exercise_id, sort_order, sets, reps, rest_seconds) VALUES
    ('fbb-01', 'full-body-beginner', 'ex-009-squat', 10, 3, '8-12', 90),
    ('fbb-02', 'full-body-beginner', 'ex-001-barbell-bench-press', 20, 3, '8-12', 90),
    ('fbb-03', 'full-body-beginner', 'ex-006-lat-pulldown', 30, 3, '10-12', 75),
    ('fbb-04', 'full-body-beginner', 'ex-014-lateral-raise', 40, 3, '12-15', 60),
    ('ppl-01', 'ppl', 'ex-001-barbell-bench-press', 10, 4, '6-10', 120),
    ('ppl-02', 'ppl', 'ex-004-parallel-bar-dip', 20, 3, '8-12', 90),
    ('ppl-03', 'ppl', 'ex-006-lat-pulldown', 30, 4, '8-12', 90),
    ('ppl-04', 'ppl', 'ex-008-deadlift', 40, 3, '5-8', 150),
    ('home-01', 'home-fat-loss', 'ex-017-push-up', 10, 4, '接近力竭', 60),
    ('home-02', 'home-fat-loss', 'ex-016-supine-crunch', 20, 3, '12-20', 45),
    ('glute-01', 'glute-foundation', 'ex-009-squat', 10, 4, '8-12', 90),
    ('glute-02', 'glute-foundation', 'ex-008-deadlift', 20, 3, '8-10', 120),
    ('glute-03', 'glute-foundation', 'ex-012-leg-curl', 30, 3, '10-15', 75);

INSERT INTO food_catalog (id, name_zh, serving_label, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, created_at, updated_at) VALUES
    ('chicken-cooked', '鸡胸肉（熟）', '100g', 165, 31, 0, 3.6, 'FatSecret', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('chicken-raw', '鸡胸肉（生）', '100g', 110, 23, 0, 1.2, 'FatSecret', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('chicken-breast', '鸡胸肉（煎）', '100g', 175, 30, 1, 5, 'FatSecret', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('chicken-corn', '玉米鸡胸肉', '100g', 180, 22, 10, 4, 'YOU GYM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
