-- Structured nutrition resources extracted from the 18:03 reference image.

INSERT INTO food_catalog
    (id, name_zh, serving_label, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, status, media_url, media_assets_json, created_at, updated_at)
VALUES
    ('food-ref-noodles', '面条', '100g', 110, 3.5, 22.0, 0.7, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-corn', '玉米', '100g', 112, 4.0, 22.0, 1.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-chicken', '鸡胸肉（参考）', '100g', 133, 19.4, 0.0, 4.6, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-beef', '牛肉（参考）', '100g', 125, 20.2, 0.0, 4.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-white-fish', '鱼肉', '100g', 100, 20.0, 0.0, 2.0, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-spinach', '菠菜', '100g', 23, 2.9, 3.6, 0.4, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-carrot', '胡萝卜', '100g', 41, 0.9, 9.6, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-cucumber', '黄瓜', '100g', 16, 0.7, 3.6, 0.1, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-lettuce', '生菜', '100g', 15, 1.4, 2.9, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-green-pepper', '青椒', '100g', 22, 1.0, 4.6, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-cabbage', '白菜', '100g', 17, 1.5, 3.2, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-mushroom', '香菇', '100g', 26, 2.2, 5.0, 0.3, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-onion', '洋葱', '100g', 40, 1.1, 9.3, 0.1, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-eggplant', '茄子', '100g', 23, 1.1, 5.0, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-pumpkin', '南瓜', '100g', 23, 1.1, 5.3, 0.1, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-blueberry', '蓝莓', '100g', 57, 0.7, 14.5, 0.3, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-strawberry', '草莓', '100g', 32, 0.7, 7.7, 0.3, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-grape', '葡萄（参考）', '100g', 43, 0.7, 10.0, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-dragon-fruit', '火龙果', '100g', 51, 1.1, 13.3, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-pomelo', '柚子', '100g', 42, 0.8, 9.5, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-watermelon', '西瓜', '100g', 31, 0.6, 7.6, 0.2, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-pear', '梨', '100g', 51, 0.4, 13.1, 0.1, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-mango', '芒果', '100g', 60, 0.8, 15.0, 0.4, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-plain-yogurt', '无糖酸奶', '150g', 60, 4.0, 5.0, 2.5, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('food-ref-dark-chocolate', '黑巧克力', '100g', 598, 7.8, 45.9, 42.6, 'YOU GYM nutrition infographic', 'ACTIVE', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO content_item
    (id, title, content_type, status, summary, body, media_url, anatomy_node_id, created_by, updated_by, created_at, updated_at, published_at, media_assets_json)
VALUES
    ('ref-nutrition-180313-foods', '主食、蛋白质、蔬菜与水果清单', 'ARTICLE', 'PUBLISHED', '从参考图提取的日常食物分类和每100g热量参考。', '主食可选择米饭、全麦面包、面条、燕麦、玉米和红薯；蛋白质可选择鸡胸肉、牛肉、鱼肉、虾、鸡蛋和豆腐；蔬菜建议每天摄入多种颜色，包括西兰花、菠菜、胡萝卜、番茄、黄瓜、生菜、青椒、白菜、香菇、洋葱、茄子和南瓜；水果可选择苹果、香蕉、橙子、蓝莓、草莓、猕猴桃、葡萄、火龙果、柚子、西瓜、梨和芒果。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-nutrition-180313-meals', '健康一日三餐与低卡便当模板', 'ARTICLE', 'PUBLISHED', '提供早餐、午餐、晚餐、加餐和低卡便当组合参考。', '早餐可搭配燕麦、鸡蛋、蓝莓和牛奶；午餐可搭配糙米饭、番茄鸡胸肉、西兰花和紫菜汤；晚餐可搭配杂粮饭、清蒸鱼、炒西兰花和番茄蛋花汤；加餐可选择坚果、无糖酸奶、水果或全麦面包。低卡便当可采用鸡胸肉沙拉、虾仁炒西兰花、蔬菜鸡蛋饼和番茄豆腐汤等组合，并根据个人能量需求调整份量。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'),
    ('ref-nutrition-180313-cooking', '烹饪方式、零食与饮水建议', 'ARTICLE', 'PUBLISHED', '补充蒸煮烤焖等烹饪方式、高热量零食控制和饮水建议。', '鸡胸肉等食物优先选择水煮、清蒸、煎或烤，减少油炸、重油和高盐酱汁。奶油蛋糕、薯条、炸鸡、可乐、汉堡和奶茶等高热量食物建议少量、低频食用。日常饮水可参考1500-2000ml，运动或高温环境适当增加，少量多次饮水并减少含糖饮料。', '/exercise-assets/reference/nutrition-reference-2026-08-20-180313.png', NULL, 'system-import', 'system-import', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]');
