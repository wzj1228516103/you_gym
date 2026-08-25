-- Structured resources extracted from the 17:14 and 17:17 training reference images.

INSERT INTO exercise_catalog
    (id, name_zh, name_en, target_muscles_json, equipment, location, difficulty_level, recommended_reps, recommended_sets, rest_seconds_min, rest_seconds_max, angle_views_json, step_labels_json, source_image, source_panel, source_note)
VALUES
    ('ex-030-standing-relaxed-pose', '站立放松', 'Standing Relaxed Pose', '["mobility"]', '自重', '健身房/家庭', 'BEGINNER', '20-30秒', '1-2', 15, 30, '["front"]', '["站立","放松肩颈"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '动作姿势参考', '用于训练前身体扫描与姿势准备。'),
    ('ex-031-overhead-reach', '双臂上举', 'Overhead Reach', '["mobility","muscle.deltoid"]', '自重', '健身房/家庭', 'BEGINNER', '20-30秒', '1-2', 15, 30, '["front","side"]', '["双臂上举","保持肋骨下沉"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '动作姿势参考', '用于肩部活动度热身。'),
    ('ex-032-hands-behind-head', '双手抱头', 'Hands Behind Head', '["mobility","muscle.pectoralis-major"]', '自重', '健身房/家庭', 'BEGINNER', '20-30秒', '1-2', 15, 30, '["front","side"]', '["双手置于头后","打开胸廓"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '动作姿势参考', '用于胸椎与肩带活动。'),
    ('ex-033-side-bend-stretch', '侧屈拉伸', 'Side Bend Stretch', '["mobility","muscle.latissimus-dorsi"]', '自重', '健身房/家庭', 'BEGINNER', '每侧20-30秒', '1-2', 15, 30, '["front","side"]', '["身体侧屈","保持骨盆稳定"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '动作姿势参考', '用于躯干侧链和背阔肌活动。'),
    ('ex-034-standing-forward-fold', '体前屈', 'Standing Forward Fold', '["mobility","muscle.hamstrings"]', '自重', '健身房/家庭', 'BEGINNER', '20-30秒', '1-2', 15, 30, '["side"]', '["髋部折叠","膝盖微屈"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '动作姿势参考', '用于腘绳肌和后侧链活动。'),
    ('ex-035-worlds-greatest-stretch', '弓步拉伸', 'Worlds Greatest Stretch', '["mobility","muscle.hip-flexor","muscle.hamstrings"]', '自重', '健身房/家庭', 'BEGINNER', '每侧20-30秒', '1-2', 15, 30, '["side","45"]', '["弓步","胸椎旋转","髋部下沉"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '动作姿势参考', '综合髋部、腿后侧和胸椎活动度。'),
    ('ex-036-bird-dog', '鸟狗式', 'Bird Dog', '["muscle.transversus-abdominis","muscle.gluteus-maximus"]', '自重', '健身房/家庭', 'BEGINNER', '每侧8-12', '2-3', 30, 60, '["side","front"]', '["四点支撑","对侧伸展","控制回收"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '核心训练动作示例', '核心稳定和髋部控制练习。'),
    ('ex-037-hollow-body-hold', '死虫式', 'Dead Bug', '["muscle.rectus-abdominis","muscle.transversus-abdominis"]', '自重', '健身房/家庭', 'BEGINNER', '每侧8-12', '2-3', 30, 60, '["side","front"]', '["仰卧","对侧伸展","腰背贴地"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '核心训练动作示例', '核心抗伸展训练。'),
    ('ex-038-russian-twist', '俄罗斯转体', 'Russian Twist', '["muscle.obliques","muscle.rectus-abdominis"]', '自重/哑铃', '健身房/家庭', 'INTERMEDIATE', '12-20', '3', 45, 60, '["front","side"]', '["躯干后倾","左右旋转","控制回中"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '核心训练动作示例', '核心旋转训练。'),
    ('ex-039-hanging-knee-raise', '悬垂举腿', 'Hanging Knee Raise', '["muscle.rectus-abdominis","muscle.hip-flexor"]', '单杠', '健身房', 'INTERMEDIATE', '8-15', '3', 60, 90, '["front","side"]', '["悬垂","骨盆后倾","抬膝"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '核心训练动作示例', '核心和髋屈肌训练。'),
    ('ex-040-reverse-hyperextension', '俄罗斯转体变式', 'Russian Twist Variation', '["muscle.obliques","muscle.rectus-abdominis"]', '自重', '健身房/家庭', 'INTERMEDIATE', '12-20', '3', 45, 60, '["front","side"]', '["保持胸廓","旋转触地","控制回收"]', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', '核心训练动作示例', '图中核心动作示例的转体变式，作为独立动作条目保存。'),
    ('ex-041-foam-roll-back', '背部泡沫轴放松', 'Foam Roll Back', '["recovery","muscle.erector-spinae"]', '泡沫轴', '健身房/家庭', 'BEGINNER', '30-60秒', '1-2', 0, 15, '["side"]', '["定位背部","缓慢滚动"]', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '泡沫轴放松示例', '训练后背部放松，建议每个部位30-60秒。'),
    ('ex-042-foam-roll-lat', '背部外侧泡沫轴放松', 'Foam Roll Lat', '["recovery","muscle.latissimus-dorsi"]', '泡沫轴', '健身房/家庭', 'BEGINNER', '30-60秒', '1-2', 0, 15, '["side"]', '["侧卧","缓慢滚动"]', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '泡沫轴放松示例', '训练后背阔肌和腋后侧放松。'),
    ('ex-043-foam-roll-quadriceps', '大腿前侧泡沫轴放松', 'Foam Roll Quadriceps', '["recovery","muscle.quadriceps"]', '泡沫轴', '健身房/家庭', 'BEGINNER', '30-60秒', '1-2', 0, 15, '["side"]', '["俯卧","缓慢滚动"]', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '泡沫轴放松示例', '训练后股四头肌放松。'),
    ('ex-044-foam-roll-hamstrings', '大腿后侧泡沫轴放松', 'Foam Roll Hamstrings', '["recovery","muscle.hamstrings"]', '泡沫轴', '健身房/家庭', 'BEGINNER', '30-60秒', '1-2', 0, 15, '["side"]', '["坐姿","缓慢滚动"]', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '泡沫轴放松示例', '训练后腘绳肌放松。'),
    ('ex-045-foam-roll-calf', '小腿泡沫轴放松', 'Foam Roll Calf', '["recovery","muscle.calf"]', '泡沫轴', '健身房/家庭', 'BEGINNER', '30-60秒', '1-2', 0, 15, '["side"]', '["坐姿","缓慢滚动"]', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '泡沫轴放松示例', '训练后小腿放松。')
;

INSERT INTO exercise_resource (id, exercise_id, resource_type, view_label, resource_url, sort_order, source_image)
VALUES
    ('res-ex-030-reference', 'ex-030-standing-relaxed-pose', 'REFERENCE_IMAGE', '姿势参考', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-031-reference', 'ex-031-overhead-reach', 'REFERENCE_IMAGE', '姿势参考', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-032-reference', 'ex-032-hands-behind-head', 'REFERENCE_IMAGE', '姿势参考', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-033-reference', 'ex-033-side-bend-stretch', 'REFERENCE_IMAGE', '姿势参考', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-034-reference', 'ex-034-standing-forward-fold', 'REFERENCE_IMAGE', '姿势参考', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-035-reference', 'ex-035-worlds-greatest-stretch', 'REFERENCE_IMAGE', '拉伸姿势参考', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-036-reference', 'ex-036-bird-dog', 'REFERENCE_IMAGE', '核心动作参考图', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-037-reference', 'ex-037-hollow-body-hold', 'REFERENCE_IMAGE', '核心动作参考图', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-038-reference', 'ex-038-russian-twist', 'REFERENCE_IMAGE', '核心动作参考图', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-039-reference', 'ex-039-hanging-knee-raise', 'REFERENCE_IMAGE', '核心动作参考图', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-040-reference', 'ex-040-reverse-hyperextension', 'REFERENCE_IMAGE', '核心动作参考图', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171419.png'),
    ('res-ex-041-reference', 'ex-041-foam-roll-back', 'REFERENCE_IMAGE', '泡沫轴参考图', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171740.png'),
    ('res-ex-042-reference', 'ex-042-foam-roll-lat', 'REFERENCE_IMAGE', '泡沫轴参考图', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171740.png'),
    ('res-ex-043-reference', 'ex-043-foam-roll-quadriceps', 'REFERENCE_IMAGE', '泡沫轴参考图', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171740.png'),
    ('res-ex-044-reference', 'ex-044-foam-roll-hamstrings', 'REFERENCE_IMAGE', '泡沫轴参考图', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171740.png'),
    ('res-ex-045-reference', 'ex-045-foam-roll-calf', 'REFERENCE_IMAGE', '泡沫轴参考图', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', 30, '/exercise-assets/reference/training-reference-2026-08-20-171740.png');

INSERT INTO food_catalog
    (id, name_zh, serving_label, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, status, media_url, media_assets_json, created_at, updated_at)
VALUES
    ('food-whey-protein', '乳清蛋白粉', '100g', 400, 80.0, 8.0, 6.0, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-whole-grain', '全谷物', '100g', 340, 10.0, 72.0, 3.0, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-olive-oil', '橄榄油', '100g', 884, 0.0, 0.0, 100.0, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-water', '饮水', '100ml', 0, 0.0, 0.0, 0.0, 'YOU GYM infographic', 'ACTIVE', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO content_item
    (id, title, content_type, status, summary, body, media_url, anatomy_node_id, created_by, updated_by, created_at, updated_at, published_at, media_assets_json)
VALUES
    ('ref-training-2026-08-20-171419', '热身、核心、动作纠错与训练流程', 'EXERCISE', 'PUBLISHED', '从第二批动作参考图提取的热身、核心、动作轨迹、呼吸、RPE 和训练进阶建议。', '建议流程：热身激活5-10分钟，力量训练30-60分钟，辅助训练15-20分钟，有氧训练20-40分钟，最后进行拉伸放松5-10分钟。训练中优先保证动作质量，逐步增加负荷，并结合 RPE 自我感受量表调整强度。', '/exercise-assets/reference/training-reference-2026-08-20-171419.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-training-2026-08-20-171740', '训练后的营养、恢复与记录建议', 'ARTICLE', 'PUBLISHED', '从第二张参考图提取训练间歇、营养摄入、恢复、装备和记录建议。', '力量提升组间休息约2-5分钟，肌肉增长组间休息约60-90秒，肌肉耐力组间休息约30-60秒。训练后注意补充蛋白质、碳水、脂肪和水分，记录体重、围度、动作、组数、次数、重量和 RPE，持续复盘进步。', '/exercise-assets/reference/training-reference-2026-08-20-171740.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]');
