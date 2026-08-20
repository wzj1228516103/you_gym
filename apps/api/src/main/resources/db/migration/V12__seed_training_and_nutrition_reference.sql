-- Structured resources extracted from the training and nutrition reference infographic.
-- The original composite image is kept under static/exercise-assets/reference for traceability.

INSERT INTO exercise_catalog
    (id, name_zh, name_en, target_muscles_json, equipment, location, difficulty_level, recommended_reps, recommended_sets, rest_seconds_min, rest_seconds_max, angle_views_json, step_labels_json, source_image, source_panel, source_note)
VALUES
    ('ex-018-treadmill-running', '跑步机跑步', 'Treadmill Running', '["cardio"]', '跑步机', '健身房', 'BEGINNER', '20-60分钟', '1', 0, 0, '[]', '[]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见有氧运动示例', '信息图中的有氧训练示例：跑步。'),
    ('ex-019-elliptical', '椭圆机', 'Elliptical Trainer', '["cardio","muscle.quadriceps"]', '椭圆机', '健身房', 'BEGINNER', '20-40分钟', '1', 0, 0, '[]', '[]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见有氧运动示例', '信息图中的有氧训练示例：椭圆机。'),
    ('ex-020-stationary-bike', '动感单车', 'Stationary Bike', '["cardio","muscle.quadriceps"]', '动感单车', '健身房', 'BEGINNER', '20-60分钟', '1', 0, 0, '[]', '[]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见有氧运动示例', '信息图中的有氧训练示例：动感单车。'),
    ('ex-021-rowing-machine', '划船机', 'Rowing Machine', '["cardio","muscle.latissimus-dorsi","muscle.quadriceps"]', '划船机', '健身房', 'BEGINNER', '15-30分钟', '1', 0, 0, '[]', '[]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见有氧运动示例', '信息图中的有氧训练示例：划船机。'),
    ('ex-022-swimming', '游泳', 'Swimming', '["cardio","muscle.latissimus-dorsi"]', '泳池', '户外/场馆', 'BEGINNER', '20-45分钟', '1', 0, 0, '[]', '[]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见有氧运动示例', '信息图中的有氧训练示例：游泳。'),
    ('ex-023-jump-rope', '跳绳', 'Jump Rope', '["cardio","muscle.calf"]', '跳绳', '健身房/户外', 'BEGINNER', '5-20分钟', '3', 30, 60, '[]', '[]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见有氧运动示例', '信息图中的有氧训练示例：跳绳。'),
    ('ex-024-barbell-row', '杠铃划船', 'Barbell Row', '["muscle.latissimus-dorsi","muscle.trapezius.middle","muscle.biceps-brachii"]', '杠铃', '健身房', 'INTERMEDIATE', '6-12', '3-4', 90, 120, '["side","45"]', '["准备姿势","向腹部拉","控制下放"]', '/exercise-assets/reference/training-reference-2026-08-20.png', '阻力训练动作模式分类', '归入拉类动作，主要刺激背部和二头肌。'),
    ('ex-025-kettlebell-swing', '壶铃摆动', 'Kettlebell Swing', '["muscle.gluteus-maximus","muscle.hamstrings","muscle.erector-spinae"]', '壶铃', '健身房/户外', 'INTERMEDIATE', '10-20', '3-5', 60, 90, '["side","45"]', '["髋部后移","爆发伸髋","控制回摆"]', '/exercise-assets/reference/training-reference-2026-08-20.png', '阻力训练动作模式分类', '归入髋铰链类动作，强调髋部发力。'),
    ('ex-026-cable-chest-fly', '绳索夹胸', 'Cable Chest Fly', '["muscle.pectoralis-major"]', '绳索器械', '健身房', 'INTERMEDIATE', '10-15', '3-4', 60, 90, '["front","45"]', '["打开胸廓","双手相合","缓慢还原"]', '/exercise-assets/reference/training-reference-2026-08-20.png', '阻力训练动作模式分类', '归入孤立类动作，主要刺激胸大肌。'),
    ('ex-027-face-pull', '面拉', 'Face Pull', '["muscle.deltoid.rear","muscle.trapezius.middle"]', '绳索器械', '健身房', 'BEGINNER', '12-20', '3-4', 45, 75, '["front","side"]', '["拉向面部","外旋肩部","控制回放"]', '/exercise-assets/reference/training-reference-2026-08-20.png', '阻力训练动作模式分类', '归入拉类和孤立类动作，强调后三角与上背部。'),
    ('ex-028-plank', '平板支撑', 'Plank', '["muscle.rectus-abdominis","muscle.transversus-abdominis"]', '自重', '健身房/家庭', 'BEGINNER', '30-60秒', '3-4', 30, 60, '["side","front"]', '["肘部支撑","收紧核心","保持呼吸"]', '/exercise-assets/reference/training-reference-2026-08-20.png', '阻力训练动作模式分类', '归入核心类动作。'),
    ('ex-029-hip-flexor-stretch', '髋屈肌拉伸', 'Hip Flexor Stretch', '["mobility","muscle.hip-flexor"]', '自重', '健身房/家庭', 'BEGINNER', '每侧15-30秒', '2-3', 15, 30, '["side"]', '["弓步站姿","骨盆后倾","保持拉伸"]', '/exercise-assets/reference/training-reference-2026-08-20.png', '常见拉伸动作示例', '用于训练前后活动度恢复。')
;

INSERT INTO exercise_resource (id, exercise_id, resource_type, view_label, resource_url, sort_order, source_image)
VALUES
    ('res-ex-018-reference', 'ex-018-treadmill-running', 'REFERENCE_IMAGE', '有氧训练参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-019-reference', 'ex-019-elliptical', 'REFERENCE_IMAGE', '有氧训练参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-020-reference', 'ex-020-stationary-bike', 'REFERENCE_IMAGE', '有氧训练参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-021-reference', 'ex-021-rowing-machine', 'REFERENCE_IMAGE', '有氧训练参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-022-reference', 'ex-022-swimming', 'REFERENCE_IMAGE', '有氧训练参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-023-reference', 'ex-023-jump-rope', 'REFERENCE_IMAGE', '有氧训练参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-024-reference', 'ex-024-barbell-row', 'REFERENCE_IMAGE', '拉类动作参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-025-reference', 'ex-025-kettlebell-swing', 'REFERENCE_IMAGE', '髋铰链动作参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-026-reference', 'ex-026-cable-chest-fly', 'REFERENCE_IMAGE', '孤立动作参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-027-reference', 'ex-027-face-pull', 'REFERENCE_IMAGE', '拉类动作参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-028-reference', 'ex-028-plank', 'REFERENCE_IMAGE', '核心动作参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png'),
    ('res-ex-029-reference', 'ex-029-hip-flexor-stretch', 'REFERENCE_IMAGE', '拉伸动作参考图', '/exercise-assets/reference/training-reference-2026-08-20.png', 30, '/exercise-assets/reference/training-reference-2026-08-20.png');

INSERT INTO food_catalog
    (id, name_zh, serving_label, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, status, media_url, media_assets_json, created_at, updated_at)
VALUES
    ('food-oatmeal', '燕麦', '100g', 389, 16.9, 66.3, 6.9, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-rice-cooked', '米饭', '100g', 116, 2.6, 25.9, 0.3, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-sweet-potato', '红薯', '100g', 86, 1.6, 20.1, 0.1, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-chicken-grilled', '鸡胸肉', '100g', 165, 31.0, 0.0, 3.6, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-salmon', '三文鱼', '100g', 208, 20.4, 0.0, 13.4, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-lean-beef', '瘦牛肉', '100g', 172, 26.1, 0.0, 7.0, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-egg', '鸡蛋', '100g', 143, 12.6, 0.7, 9.5, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-avocado', '牛油果', '100g', 160, 2.0, 8.5, 14.7, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-mixed-salad', '混合蔬菜沙拉', '100g', 35, 1.5, 6.0, 0.3, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-nuts', '坚果', '100g', 607, 20.0, 21.0, 53.0, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO content_item
    (id, title, content_type, status, summary, body, media_url, anatomy_node_id, created_by, updated_by, created_at, updated_at, published_at, media_assets_json)
VALUES
    ('ref-training-2026-08-20-01', '训练动作、器械与强度参考', 'EXERCISE', 'PUBLISHED', '从信息图提取的器械、推拉蹲髋铰链、核心、有氧和拉伸动作参考。', '来源：YOU GYM 训练参考信息图。阻力训练按推、拉、蹲、髋铰链、核心、孤立分类；训练强度可结合 1RM 与 RPE 表进行调整。', '/exercise-assets/reference/training-reference-2026-08-20.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-nutrition-2026-08-20-01', '增肌、减脂与维持期营养建议', 'ARTICLE', 'PUBLISHED', '从信息图提取的热量区间、蛋白质、碳水和脂肪建议，以及示例食物。', '增肌期：在维持热量基础上增加约 10%-20%；减脂期：在维持热量基础上减少约 10%-20%；维持期：热量控制在约 ±5%。蛋白质、碳水和脂肪应结合体重、训练量和恢复状态调整，图中食物示例包括燕麦、米饭、红薯、鸡胸肉、三文鱼、瘦牛肉、鸡蛋、牛油果、蔬菜沙拉和坚果。', '/exercise-assets/reference/training-reference-2026-08-20.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]');
