package com.yougym.api.user.vo;

import com.yougym.api.user.entity.AppUser;

import java.time.Instant;
import java.util.List;

public record AppUserVO(String id, String phone, String nickname, String gender, Integer birthYear,
                        Double heightCm, Double weightKg, Double bodyFatPct, String goal,
                        String experienceLevel, String weeklyFrequency, String venue,
                        List<String> equipment, String status, Instant createdAt, Instant updatedAt,
                        Instant lastLoginAt) {
    public static AppUserVO from(AppUser user) {
        return new AppUserVO(user.id(), maskPhone(user.phone()), user.nickname(), user.gender(), user.birthYear(),
                user.heightCm(), user.weightKg(), user.bodyFatPct(), user.goal(), user.experienceLevel(),
                user.weeklyFrequency(), user.venue(), user.equipment(), user.status(), user.createdAt(),
                user.updatedAt(), user.lastLoginAt());
    }
    private static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}
