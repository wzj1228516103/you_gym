package com.yougym.api.user.entity;

import java.time.Instant;
import java.util.List;

public record AppUser(String id, String phone, String nickname, String gender, Integer birthYear,
                      Double heightCm, Double weightKg, Double bodyFatPct, String goal,
                      String experienceLevel, String weeklyFrequency, String venue,
                      List<String> equipment, String status, Instant createdAt, Instant updatedAt,
                      Instant lastLoginAt) {}
