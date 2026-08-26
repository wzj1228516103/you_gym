CREATE TABLE user_nutrition_goal (
    user_id VARCHAR(36) NOT NULL PRIMARY KEY,
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) NOT NULL,
    carbohydrates_g DECIMAL(8,2) NOT NULL,
    fat_g DECIMAL(8,2) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_nutrition_goal_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT ck_user_nutrition_goal_calories CHECK (calories > 0),
    CONSTRAINT ck_user_nutrition_goal_protein CHECK (protein_g > 0),
    CONSTRAINT ck_user_nutrition_goal_carbohydrates CHECK (carbohydrates_g > 0),
    CONSTRAINT ck_user_nutrition_goal_fat CHECK (fat_g > 0)
);
