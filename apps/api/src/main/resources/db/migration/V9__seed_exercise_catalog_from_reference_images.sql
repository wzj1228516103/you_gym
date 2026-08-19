CREATE TABLE exercise_catalog (
    id VARCHAR(80) NOT NULL PRIMARY KEY,
    name_zh VARCHAR(120) NOT NULL,
    name_en VARCHAR(160),
    target_muscles_json VARCHAR(2000) NOT NULL,
    equipment VARCHAR(80),
    location VARCHAR(40) NOT NULL DEFAULT '健身房',
    difficulty_level VARCHAR(24) NOT NULL DEFAULT 'UNSPECIFIED',
    recommended_reps VARCHAR(40),
    recommended_sets VARCHAR(40),
    rest_seconds_min INT,
    rest_seconds_max INT,
    angle_views_json VARCHAR(1000) NOT NULL DEFAULT '[]',
    step_labels_json VARCHAR(1000) NOT NULL DEFAULT '[]',
    source_image VARCHAR(255) NOT NULL,
    source_panel VARCHAR(80) NOT NULL,
    source_note VARCHAR(500),
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_catalog_status ON exercise_catalog (status, name_zh);
CREATE INDEX idx_exercise_catalog_equipment ON exercise_catalog (equipment);

CREATE TABLE exercise_resource (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    exercise_id VARCHAR(80) NOT NULL,
    resource_type VARCHAR(24) NOT NULL,
    view_label VARCHAR(80),
    resource_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    source_image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercise_resource_catalog FOREIGN KEY (exercise_id) REFERENCES exercise_catalog(id)
);

CREATE INDEX idx_exercise_resource_exercise ON exercise_resource (exercise_id, sort_order);

INSERT INTO exercise_catalog
    (id, name_zh, name_en, target_muscles_json, equipment, location, angle_views_json, step_labels_json, source_image, source_panel, source_note)
VALUES
    ('ex-001-barbell-bench-press', '杠铃卧推', 'Barbell Bench Press', '["muscle.pectoralis-major"]', '杠铃', '健身房', '["front","side","45","overhead"]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·01', '图片标注目标肌肉为胸大肌；右侧提供正面、侧面、45度和俯视角度参考。'),
    ('ex-002-dumbbell-bench-press', '哑铃卧推', 'Dumbbell Bench Press', '["muscle.pectoralis-major"]', '哑铃', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·02', '图片标注目标肌肉为胸大肌。'),
    ('ex-003-incline-dumbbell-bench-press', '上斜哑铃卧推', 'Incline Dumbbell Bench Press', '["muscle.pectoralis-major.upper"]', '哑铃', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·03', '图片标注目标肌肉为上胸部。'),
    ('ex-004-parallel-bar-dip', '双杠臂屈伸', 'Parallel Bar Dip', '["muscle.pectoralis-major.lower","muscle.triceps-brachii"]', '双杠', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·04', '图片标注目标肌肉为胸大肌。'),
    ('ex-005-pull-up', '引体向上', 'Pull-up', '["muscle.latissimus-dorsi","muscle.biceps-brachii"]', '单杠', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·05', '图片标注目标肌肉为背阔肌。'),
    ('ex-006-lat-pulldown', '高位下拉', 'Lat Pulldown', '["muscle.latissimus-dorsi"]', '高位下拉机', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·06', '图片标注目标肌肉为背阔肌。'),
    ('ex-007-seated-cable-row', '坐姿划船', 'Seated Cable Row', '["muscle.latissimus-dorsi","muscle.trapezius.middle"]', '坐姿划船机', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·07', '图片标注目标肌肉为背阔肌。'),
    ('ex-008-deadlift', '硬拉', 'Deadlift', '["muscle.erector-spinae","muscle.gluteus-maximus","muscle.hamstrings"]', '杠铃', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·08', '图片标注目标肌肉为竖脊肌和臀大肌。'),
    ('ex-009-squat', '深蹲', 'Squat', '["muscle.quadriceps","muscle.gluteus-maximus"]', '杠铃', '健身房', '["front","side","45","overhead"]', '["准备姿势","下蹲","到达最低点","起身","完成"]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·09·步骤分解', '图片提供五步动作分解；动作目标标注为股四头肌和臀大肌。'),
    ('ex-010-forward-lunge', '前弓步蹲', 'Forward Lunge', '["muscle.quadriceps","muscle.gluteus-maximus"]', '哑铃/自重', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·10', '图片标注目标肌肉为股四头肌和臀大肌。'),
    ('ex-011-leg-press', '腿举', 'Leg Press', '["muscle.quadriceps","muscle.gluteus-maximus"]', '腿举机', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·11', '图片标注目标肌肉为股四头肌和臀大肌。'),
    ('ex-012-leg-curl', '腿弯举', 'Leg Curl', '["muscle.hamstrings"]', '腿弯举机', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·12', '图片标注目标肌肉为腘绳肌/腘二头肌；中文标注按动作语义归一为腿弯举。'),
    ('ex-013-standing-shoulder-press', '站姿推举', 'Standing Shoulder Press', '["muscle.deltoid"]', '哑铃', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·13', '图片标注目标肌肉为三角肌。'),
    ('ex-014-lateral-raise', '侧平举', 'Lateral Raise', '["muscle.deltoid.middle"]', '哑铃', '健身房', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·14', '图片标注目标肌肉为三角肌中束。'),
    ('ex-015-biceps-curl', '二头弯举', 'Biceps Curl', '["muscle.biceps-brachii"]', '哑铃', '健身房', '["front","side","back","45"]', '[]', 'ChatGPT Image 2026年8月19日 14_02_45.png', '多角度动作演示图·示例', '第二张图片提供二头弯举的正面、侧面、背面和45度角度参考。'),
    ('ex-016-supine-crunch', '仰卧卷腹', 'Supine Crunch', '["muscle.rectus-abdominis"]', '自重', '家庭', '[]', '[]', 'ChatGPT Image 2026年8月19日 14_02_28.png', '动作示例图·16', '图片标注目标肌肉为腹直肌。'),
    ('ex-017-push-up', '俯卧撑', 'Push-up', '["muscle.pectoralis-major","muscle.triceps-brachii","muscle.deltoid.anterior"]', '自重', '家庭', '[]', '["高位支撑","身体下降","胸部接近地面","推起身体","回到起始位置"]', 'ChatGPT Image 2026年8月19日 14_02_45.png', '动作GIF序列图·13', '第二张图片提供五阶段俯卧撑动作序列。');

INSERT INTO exercise_resource (id, exercise_id, resource_type, view_label, resource_url, sort_order, source_image) VALUES
    ('res-ex-001-card', 'ex-001-barbell-bench-press', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/01-barbell-bench-press.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-002-card', 'ex-002-dumbbell-bench-press', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/02-dumbbell-bench-press.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-003-card', 'ex-003-incline-dumbbell-bench-press', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/03-incline-dumbbell-bench-press.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-004-card', 'ex-004-parallel-bar-dip', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/04-parallel-bar-dip.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-005-card', 'ex-005-pull-up', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/05-pull-up.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-006-card', 'ex-006-lat-pulldown', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/06-lat-pulldown.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-007-card', 'ex-007-seated-cable-row', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/07-seated-cable-row.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-008-card', 'ex-008-deadlift', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/08-deadlift.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-009-card', 'ex-009-squat', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/09-squat.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-010-card', 'ex-010-forward-lunge', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/10-forward-lunge.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-011-card', 'ex-011-leg-press', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/11-leg-press.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-012-card', 'ex-012-leg-curl', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/12-leg-curl.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-013-card', 'ex-013-standing-shoulder-press', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/13-standing-shoulder-press.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-014-card', 'ex-014-lateral-raise', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/14-lateral-raise.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-015-card', 'ex-015-biceps-curl', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/15-biceps-curl.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-016-card', 'ex-016-supine-crunch', 'CARD_IMAGE', '动作卡片', '/exercise-assets/cards/16-supine-crunch.png', 10, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-001-angles', 'ex-001-barbell-bench-press', 'ANGLE_SHEET', '正面/侧面/45度/俯视', '/exercise-assets/sheets/barbell-bench-press-angles.png', 20, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-009-steps', 'ex-009-squat', 'STEP_SHEET', '准备/下蹲/最低点/起身/完成', '/exercise-assets/sheets/squat-steps.png', 20, 'ChatGPT Image 2026年8月19日 14_02_28.png'),
    ('res-ex-015-angles', 'ex-015-biceps-curl', 'ANGLE_SHEET', '正面/侧面/背面/45度', '/exercise-assets/sheets/biceps-curl-angles.png', 20, 'ChatGPT Image 2026年8月19日 14_02_45.png'),
    ('res-ex-017-pushup-sequence', 'ex-017-push-up', 'STEP_SHEET', '高位支撑/下降/接近地面/推起/复位', '/exercise-assets/sheets/push-up-sequence-reference.png', 20, 'ChatGPT Image 2026年8月19日 14_02_45.png');
