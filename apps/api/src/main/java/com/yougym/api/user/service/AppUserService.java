package com.yougym.api.user.service;

import com.yougym.api.user.dto.*;
import com.yougym.api.user.vo.AppUserVO;
import com.yougym.api.user.vo.SessionVO;

import java.util.List;
import java.util.Map;

public interface AppUserService {
    Map<String, Object> sendCode(SendCodeRequest request);
    SessionVO verifyCode(VerifyCodeRequest request);
    void logout(String bearerToken);
    AppUserVO me(String bearerToken);
    AppUserVO updateProfile(String bearerToken, UpdateProfileRequest request);
    void recordWorkout(String bearerToken, CreateWorkoutRecordRequest request);
    void recordNutrition(String bearerToken, CreateNutritionRecordRequest request);
    List<Map<String, Object>> workouts(String bearerToken, int limit);
    List<Map<String, Object>> nutrition(String bearerToken, int limit);
    Map<String, Object> recordBodyMeasurement(String bearerToken, CreateBodyMeasurementRequest request);
    List<Map<String, Object>> bodyMeasurements(String bearerToken, int limit);
    Map<String, Object> reminderSettings(String bearerToken);
    Map<String, Object> updateReminderSettings(String bearerToken, UpdateReminderSettingsRequest request);
    Map<String, Object> startPlan(String bearerToken, String planId);
    Map<String, Object> planProgress(String bearerToken, String planId);
    Map<String, Object> updatePlanProgress(String bearerToken, String planId, String status);
    List<String> favoriteIds(String bearerToken, String targetType);
    boolean addFavorite(String bearerToken, String targetType, String targetId);
    boolean removeFavorite(String bearerToken, String targetType, String targetId);
    List<String> syncFavorites(String bearerToken, String targetType, List<String> targetIds);
}
