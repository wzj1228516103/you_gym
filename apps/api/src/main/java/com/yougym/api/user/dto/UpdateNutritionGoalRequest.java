package com.yougym.api.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UpdateNutritionGoalRequest(
        @NotNull @DecimalMin(value = "500", message = "每日热量目标不能低于 500 kcal") @DecimalMax(value = "10000", message = "每日热量目标不能超过 10000 kcal") Double calories,
        @NotNull @DecimalMin(value = "1", message = "蛋白质目标必须大于 0") @DecimalMax(value = "1000", message = "蛋白质目标不能超过 1000 g") Double proteinG,
        @NotNull @DecimalMin(value = "1", message = "碳水目标必须大于 0") @DecimalMax(value = "2000", message = "碳水目标不能超过 2000 g") Double carbohydratesG,
        @NotNull @DecimalMin(value = "1", message = "脂肪目标必须大于 0") @DecimalMax(value = "500", message = "脂肪目标不能超过 500 g") Double fatG
) {}
