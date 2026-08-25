-- Structured nutrition resources extracted from the 18:01 reference images.

INSERT INTO food_catalog
    (id, name_zh, serving_label, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, status, media_url, media_assets_json, created_at, updated_at)
VALUES
    ('food-white-rice', '白米饭', '100g', 116, 2.6, 25.9, 0.3, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-brown-rice', '糙米饭', '100g', 123, 2.7, 25.6, 1.0, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-whole-wheat-bread', '全麦面包', '100g', 247, 13.0, 41.0, 4.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-shrimp', '虾', '100g', 99, 24.0, 0.2, 0.3, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-low-fat-milk', '低脂牛奶', '100ml', 43, 3.3, 4.8, 1.5, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-tofu', '豆腐', '100g', 81, 8.0, 2.0, 4.8, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-greek-yogurt', '希腊酸奶', '100g', 59, 10.0, 3.6, 0.4, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-chickpea', '鹰嘴豆', '100g', 164, 8.9, 27.4, 2.6, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-broccoli', '西兰花', '100g', 34, 2.8, 6.6, 0.4, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-tomato', '番茄', '100g', 18, 0.9, 3.9, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-potato', '土豆', '100g', 81, 2.0, 18.0, 0.1, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-apple', '苹果', '100g', 52, 0.3, 13.8, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-banana', '香蕉', '100g', 89, 1.1, 22.8, 0.3, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-orange', '橙子', '100g', 47, 0.9, 11.8, 0.1, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-kiwi', '猕猴桃', '100g', 61, 1.1, 14.7, 0.5, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-grapes', '葡萄', '100g', 69, 0.7, 18.1, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-almonds', '杏仁', '100g', 579, 21.2, 21.6, 49.9, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-peanut', '花生', '100g', 567, 25.8, 16.1, 49.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-rice-cake', '米饼', '100g', 387, 8.0, 81.0, 2.8, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-rice-noodle', '米粉', '100g', 109, 0.9, 24.9, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO content_item
    (id, title, content_type, status, summary, body, media_url, anatomy_node_id, created_by, updated_by, created_at, updated_at, published_at, media_assets_json)
VALUES
    ('ref-nutrition-2026-08-20-180137', '均衡饮食金字塔与三大营养素', 'ARTICLE', 'PUBLISHED', '包含碳水、蛋白质、脂肪的作用、推荐摄入比例和常见食物来源。', '碳水化合物是主要能量来源，建议约占总能量50%-60%；蛋白质用于组织修复和肌肉生长，建议约占15%-20%；脂肪帮助供能和激素合成，建议约占20%-30%。优先选择复合碳水、优质蛋白和健康脂肪，并结合个人目标和训练量调整。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-nutrition-2026-08-20-meals', '每日三餐与训练前后饮食模板', 'ARTICLE', 'PUBLISHED', '提供约2000 kcal的一日三餐、加餐和训练前后搭配参考。', '早餐示例：燕麦、鸡蛋、低脂牛奶和蓝莓；午餐示例：糙米饭、鸡胸肉、西兰花和橄榄油；晚餐示例：三文鱼、红薯、蔬菜和番茄；加餐可选择希腊酸奶、坚果和水果。训练前1-2小时补充适量碳水和少量蛋白质，训练后30-60分钟补充蛋白质、碳水和水分。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180137.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-nutrition-2026-08-20-guidance', '饮食原则、人群建议与烹饪方式', 'ARTICLE', 'PUBLISHED', '包含减脂、增肌、耐力运动和老年人群的饮食建议，以及健康烹饪方式。', '日常饮食建议保证蔬菜、水果、优质蛋白和全谷物摄入，控制盐、添加糖和油脂。增肌人群可提高蛋白质和总能量，减脂人群控制总能量并保持蛋白质，耐力运动人群注意碳水和饮水，老年人群选择易消化的优质蛋白。优先采用蒸、煮、炖、烤和凉拌，减少油炸和高盐调味。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180148.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-nutrition-2026-08-20-hydration', '饮水、加餐与食品标签参考', 'ARTICLE', 'PUBLISHED', '补充饮水量、加餐选择、高热量食物提醒和食品标签阅读建议。', '日常饮水可参考1500-2000ml，训练或高温环境下适当增加；加餐优先选择无糖酸奶、坚果、水果、鸡蛋、全麦面包和低脂牛奶；奶油蛋糕、炸鸡、奶茶和薯片等高热量食物应控制频率和份量。查看食品标签时关注每100g热量、蛋白质、脂肪、碳水和钠含量。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180148.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]');
