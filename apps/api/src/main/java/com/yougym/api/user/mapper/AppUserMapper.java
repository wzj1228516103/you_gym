package com.yougym.api.user.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yougym.api.user.dto.CreateNutritionRecordRequest;
import com.yougym.api.user.dto.CreateWorkoutRecordRequest;
import com.yougym.api.user.dto.UpdateProfileRequest;
import com.yougym.api.user.entity.AppUser;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Repository
public class AppUserMapper {
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    public AppUserMapper(JdbcTemplate jdbc, ObjectMapper objectMapper) { this.jdbc = jdbc; this.objectMapper = objectMapper; }

    public AppUser findByPhone(String phone) { return one("SELECT * FROM app_user WHERE phone = ?", phone); }
    public AppUser findById(String id) { return one("SELECT * FROM app_user WHERE id = ?", id); }
    public void insertUser(AppUser user) {
        jdbc.update("INSERT INTO app_user (id,phone,nickname,gender,birth_year,height_cm,weight_kg,body_fat_pct,goal,experience_level,weekly_frequency,venue,equipment_json,status,created_at,updated_at,last_login_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                user.id(), user.phone(), user.nickname(), user.gender(), user.birthYear(), user.heightCm(), user.weightKg(), user.bodyFatPct(), user.goal(), user.experienceLevel(), user.weeklyFrequency(), user.venue(), json(user.equipment()), user.status(), ts(user.createdAt()), ts(user.updatedAt()), ts(user.lastLoginAt()));
    }
    public void updateProfile(String id, UpdateProfileRequest p, Instant now) {
        jdbc.update("UPDATE app_user SET nickname=?,gender=?,birth_year=?,height_cm=?,weight_kg=?,body_fat_pct=?,goal=?,experience_level=?,weekly_frequency=?,venue=?,equipment_json=?,updated_at=? WHERE id=?",
                p.nickname(), p.gender(), p.birthYear(), p.heightCm(), p.weightKg(), p.bodyFatPct(), p.goal(), p.experienceLevel(), p.weeklyFrequency(), p.venue(), json(p.equipment()), ts(now), id);
    }
    public void touchLogin(String id, Instant now) { jdbc.update("UPDATE app_user SET last_login_at=?,updated_at=? WHERE id=?", ts(now), ts(now), id); }
    public void saveCode(String id, String phone, String purpose, String hash, Instant expires, Instant now) { jdbc.update("INSERT INTO app_verification_code (id,phone,purpose,code_hash,expires_at,created_at) VALUES (?,?,?,?,?,?)", id, phone, purpose, hash, ts(expires), ts(now)); }
    public String latestCodeHash(String phone, String purpose) { List<String> rows = jdbc.query("SELECT code_hash FROM app_verification_code WHERE phone=? AND purpose=? AND used_at IS NULL AND expires_at>? ORDER BY created_at DESC LIMIT 1", (rs,n)->rs.getString(1), phone, purpose, Timestamp.from(Instant.now())); return rows.isEmpty()?null:rows.get(0); }
    public void markCodesUsed(String phone, String purpose, Instant now) { jdbc.update("UPDATE app_verification_code SET used_at=? WHERE phone=? AND purpose=? AND used_at IS NULL", ts(now), phone, purpose); }
    public void saveSession(String hash, String userId, Instant expires, Instant now) { jdbc.update("INSERT INTO app_user_session (token_hash,user_id,expires_at,created_at,last_used_at) VALUES (?,?,?,?,?)", hash,userId,ts(expires),ts(now),ts(now)); }
    public AppUser findBySessionHash(String hash) { List<AppUser> rows=jdbc.query("SELECT u.* FROM app_user u JOIN app_user_session s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>? AND u.status='ACTIVE'", (rs,n)->map(rs), hash, Timestamp.from(Instant.now())); return rows.isEmpty()?null:rows.get(0); }
    public void touchSession(String hash, Instant now) { jdbc.update("UPDATE app_user_session SET last_used_at=? WHERE token_hash=?",ts(now),hash); }
    public boolean deleteSession(String hash) { return jdbc.update("DELETE FROM app_user_session WHERE token_hash=?", hash) > 0; }
    public void saveWorkout(String userId, CreateWorkoutRecordRequest r, Instant now, String planId) { jdbc.update("INSERT INTO workout_record (id,user_id,title,duration_seconds,total_sets,total_volume,calories,metadata_json,plan_id,completed_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", UUID.randomUUID().toString(),userId,r.title(),r.durationSeconds(),r.totalSets(),r.totalVolume(),r.calories(),json(r.metadata()),planId,ts(r.completedAt()==null?now:r.completedAt()),ts(now)); }
    public void saveNutrition(String userId, CreateNutritionRecordRequest r, Instant now) { jdbc.update("INSERT INTO nutrition_record (id,user_id,meal_name,calories,protein_g,carbohydrates_g,fat_g,food_count,metadata_json,recorded_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", UUID.randomUUID().toString(),userId,r.mealName(),r.calories(),r.proteinG(),r.carbohydratesG(),r.fatG(),r.foodCount(),json(r.metadata()),ts(r.recordedAt()==null?now:r.recordedAt()),ts(now)); }
    public List<Map<String,Object>> workouts(String userId, int limit) { return jdbc.queryForList("SELECT id,title,duration_seconds AS durationSeconds,total_sets AS totalSets,total_volume AS totalVolume,calories,completed_at AS completedAt FROM workout_record WHERE user_id=? ORDER BY completed_at DESC LIMIT ?",userId,limit); }
    public List<Map<String,Object>> nutrition(String userId, int limit) { return jdbc.queryForList("SELECT id,meal_name AS mealName,calories,protein_g AS proteinG,carbohydrates_g AS carbohydratesG,fat_g AS fatG,food_count AS foodCount,recorded_at AS recordedAt FROM nutrition_record WHERE user_id=? ORDER BY recorded_at DESC LIMIT ?",userId,limit); }
    public Map<String,Object> saveBodyMeasurement(String userId, com.yougym.api.user.dto.CreateBodyMeasurementRequest r, Instant now) {
        String id = UUID.randomUUID().toString();
        Instant measuredAt = r.measuredAt() == null ? now : r.measuredAt();
        jdbc.update("INSERT INTO body_measurement (id,user_id,height_cm,weight_kg,body_fat_pct,waist_cm,chest_cm,hip_cm,arm_cm,note,measured_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", id, userId, r.heightCm(), r.weightKg(), r.bodyFatPct(), r.waistCm(), r.chestCm(), r.hipCm(), r.armCm(), r.note(), ts(measuredAt), ts(now));
        jdbc.update("UPDATE app_user SET height_cm=COALESCE(?,height_cm),weight_kg=COALESCE(?,weight_kg),body_fat_pct=COALESCE(?,body_fat_pct),updated_at=? WHERE id=?", r.heightCm(), r.weightKg(), r.bodyFatPct(), ts(now), userId);
        return jdbc.queryForObject("SELECT id,height_cm,weight_kg,body_fat_pct,waist_cm,chest_cm,hip_cm,arm_cm,note,measured_at FROM body_measurement WHERE id=?", (rs, rowNum) -> bodyMeasurement(rs), id);
    }
    public List<Map<String,Object>> bodyMeasurements(String userId, int limit) { return jdbc.query("SELECT id,height_cm,weight_kg,body_fat_pct,waist_cm,chest_cm,hip_cm,arm_cm,note,measured_at FROM body_measurement WHERE user_id=? ORDER BY measured_at DESC LIMIT ?", (rs, rowNum) -> bodyMeasurement(rs), userId, limit); }
    public Map<String,Object> reminderSettings(String userId) {
        List<Map<String,Object>> rows = jdbc.query("SELECT training_enabled,nutrition_enabled,rest_sound_enabled,training_time,nutrition_time,timezone,quiet_hours_start,quiet_hours_end,updated_at FROM user_reminder_setting WHERE user_id=?", (rs, rowNum) -> {
            Map<String,Object> value = new LinkedHashMap<>();
            value.put("trainingEnabled", rs.getBoolean("training_enabled"));
            value.put("nutritionEnabled", rs.getBoolean("nutrition_enabled"));
            value.put("restSoundEnabled", rs.getBoolean("rest_sound_enabled"));
            value.put("trainingTime", rs.getString("training_time") == null ? "08:00" : rs.getString("training_time"));
            value.put("nutritionTime", rs.getString("nutrition_time") == null ? "12:00" : rs.getString("nutrition_time"));
            value.put("timezone", rs.getString("timezone"));
            value.put("quietHoursStart", rs.getString("quiet_hours_start"));
            value.put("quietHoursEnd", rs.getString("quiet_hours_end"));
            value.put("updatedAt", rs.getTimestamp("updated_at"));
            return value;
        }, userId);
        if (!rows.isEmpty()) return rows.get(0);
        Map<String,Object> defaults = new LinkedHashMap<>();
        defaults.put("trainingEnabled", false); defaults.put("nutritionEnabled", false); defaults.put("restSoundEnabled", false);
        defaults.put("trainingTime", "08:00"); defaults.put("nutritionTime", "12:00"); defaults.put("timezone", "Asia/Shanghai"); defaults.put("quietHoursStart", null); defaults.put("quietHoursEnd", null); defaults.put("updatedAt", null);
        return defaults;
    }
    public Map<String,Object> updateReminderSettings(String userId, com.yougym.api.user.dto.UpdateReminderSettingsRequest request, Instant now) {
        String timezone = request.timezone() == null || request.timezone().isBlank() ? "Asia/Shanghai" : request.timezone().trim();
        String trainingTime = request.trainingTime() == null || request.trainingTime().isBlank() ? "08:00" : request.trainingTime().trim();
        String nutritionTime = request.nutritionTime() == null || request.nutritionTime().isBlank() ? "12:00" : request.nutritionTime().trim();
        int updated = jdbc.update("UPDATE user_reminder_setting SET training_enabled=?,nutrition_enabled=?,rest_sound_enabled=?,training_time=?,nutrition_time=?,timezone=?,quiet_hours_start=?,quiet_hours_end=?,updated_at=? WHERE user_id=?", request.trainingEnabled(), request.nutritionEnabled(), request.restSoundEnabled(), trainingTime, nutritionTime, timezone, request.quietHoursStart(), request.quietHoursEnd(), ts(now), userId);
        if (updated == 0) jdbc.update("INSERT INTO user_reminder_setting (user_id,training_enabled,nutrition_enabled,rest_sound_enabled,training_time,nutrition_time,timezone,quiet_hours_start,quiet_hours_end,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)", userId, request.trainingEnabled(), request.nutritionEnabled(), request.restSoundEnabled(), trainingTime, nutritionTime, timezone, request.quietHoursStart(), request.quietHoursEnd(), ts(now));
        return reminderSettings(userId);
    }
    public Map<String,Object> nutritionGoal(String userId) {
        List<Map<String,Object>> rows = jdbc.query("SELECT calories,protein_g,carbohydrates_g,fat_g,updated_at FROM user_nutrition_goal WHERE user_id=?", (rs, rowNum) -> {
            Map<String,Object> value = new LinkedHashMap<>();
            value.put("calories", rs.getDouble("calories"));
            value.put("proteinG", rs.getDouble("protein_g"));
            value.put("carbohydratesG", rs.getDouble("carbohydrates_g"));
            value.put("fatG", rs.getDouble("fat_g"));
            value.put("updatedAt", rs.getTimestamp("updated_at"));
            return value;
        }, userId);
        return rows.isEmpty() ? null : rows.get(0);
    }
    public Map<String,Object> updateNutritionGoal(String userId, com.yougym.api.user.dto.UpdateNutritionGoalRequest request, Instant now) {
        int updated = jdbc.update("UPDATE user_nutrition_goal SET calories=?,protein_g=?,carbohydrates_g=?,fat_g=?,updated_at=? WHERE user_id=?", request.calories(), request.proteinG(), request.carbohydratesG(), request.fatG(), ts(now), userId);
        if (updated == 0) jdbc.update("INSERT INTO user_nutrition_goal (user_id,calories,protein_g,carbohydrates_g,fat_g,updated_at) VALUES (?,?,?,?,?,?)", userId, request.calories(), request.proteinG(), request.carbohydratesG(), request.fatG(), ts(now));
        return nutritionGoal(userId);
    }
    public void clearNutritionGoal(String userId) { jdbc.update("DELETE FROM user_nutrition_goal WHERE user_id=?", userId); }
    public List<Map<String,Object>> notifications(String userId, boolean unreadOnly, int limit) {
        String sql = "SELECT id,notification_type,title,summary,deep_link,important,read_at,expires_at,created_at FROM user_notification WHERE user_id=? AND (expires_at IS NULL OR expires_at> CURRENT_TIMESTAMP)";
        if (unreadOnly) sql += " AND read_at IS NULL";
        sql += " ORDER BY important DESC, created_at DESC LIMIT ?";
        return jdbc.query(sql, (rs, rowNum) -> notification(rs), userId, limit);
    }
    public long unreadNotificationCount(String userId) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM user_notification WHERE user_id=? AND read_at IS NULL AND (expires_at IS NULL OR expires_at> CURRENT_TIMESTAMP)", Long.class, userId);
        return count == null ? 0 : count;
    }
    public Map<String,Object> findNotification(String userId, String notificationId) {
        List<Map<String,Object>> rows = jdbc.query("SELECT id,notification_type,title,summary,deep_link,important,read_at,expires_at,created_at FROM user_notification WHERE user_id=? AND id=? AND (expires_at IS NULL OR expires_at> CURRENT_TIMESTAMP)", (rs, rowNum) -> notification(rs), userId, notificationId);
        return rows.isEmpty() ? null : rows.get(0);
    }
    public boolean markNotificationRead(String userId, String notificationId, Instant now) {
        return jdbc.update("UPDATE user_notification SET read_at=? WHERE user_id=? AND id=? AND read_at IS NULL AND (expires_at IS NULL OR expires_at> CURRENT_TIMESTAMP)", ts(now), userId, notificationId) > 0;
    }
    public int markAllNotificationsRead(String userId, Instant now) {
        return jdbc.update("UPDATE user_notification SET read_at=? WHERE user_id=? AND read_at IS NULL AND (expires_at IS NULL OR expires_at> CURRENT_TIMESTAMP)", ts(now), userId);
    }
    private Map<String,Object> notification(java.sql.ResultSet rs) throws java.sql.SQLException {
        Map<String,Object> value = new LinkedHashMap<>();
        value.put("id", rs.getString("id"));
        value.put("type", rs.getString("notification_type"));
        value.put("title", rs.getString("title"));
        value.put("summary", rs.getString("summary"));
        value.put("deepLink", rs.getString("deep_link"));
        value.put("important", rs.getBoolean("important"));
        value.put("readAt", rs.getTimestamp("read_at"));
        value.put("expiresAt", rs.getTimestamp("expires_at"));
        value.put("createdAt", rs.getTimestamp("created_at"));
        return value;
    }
    private Map<String,Object> bodyMeasurement(java.sql.ResultSet rs) throws java.sql.SQLException {
        Map<String,Object> value = new LinkedHashMap<>();
        value.put("id", rs.getString("id"));
        value.put("heightCm", rs.getObject("height_cm"));
        value.put("weightKg", rs.getObject("weight_kg"));
        value.put("bodyFatPct", rs.getObject("body_fat_pct"));
        value.put("waistCm", rs.getObject("waist_cm"));
        value.put("chestCm", rs.getObject("chest_cm"));
        value.put("hipCm", rs.getObject("hip_cm"));
        value.put("armCm", rs.getObject("arm_cm"));
        value.put("note", rs.getString("note"));
        value.put("measuredAt", rs.getTimestamp("measured_at"));
        return value;
    }
    public boolean planExists(String planId) { Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM training_plan WHERE id=? AND status='ACTIVE'", Integer.class, planId); return count != null && count > 0; }
    public Map<String,Object> startPlan(String userId, String planId, Instant now) {
        int updated = jdbc.update("UPDATE user_training_plan SET status='ACTIVE',updated_at=? WHERE user_id=? AND plan_id=?", ts(now), userId, planId);
        if (updated == 0) jdbc.update("INSERT INTO user_training_plan (user_id,plan_id,status,completed_sessions,started_at,created_at,updated_at) VALUES (?,?, 'ACTIVE',0,?,?,?)", userId, planId, ts(now), ts(now), ts(now));
        return planProgress(userId, planId);
    }
    public Map<String,Object> planProgress(String userId, String planId) {
        List<Map<String,Object>> rows = jdbc.query("SELECT plan_id,status,completed_sessions,started_at,last_completed_at,updated_at FROM user_training_plan WHERE user_id=? AND plan_id=?", (rs, rowNum) -> {
            Map<String,Object> value = new LinkedHashMap<>();
            value.put("planId", rs.getString("plan_id"));
            value.put("status", rs.getString("status"));
            value.put("completedSessions", rs.getInt("completed_sessions"));
            value.put("startedAt", rs.getTimestamp("started_at"));
            value.put("lastCompletedAt", rs.getTimestamp("last_completed_at"));
            value.put("updatedAt", rs.getTimestamp("updated_at"));
            addWeekProgress(value, userId, planId);
            return value;
        }, userId, planId);
        if (!rows.isEmpty()) return rows.get(0);
        Map<String,Object> empty = new LinkedHashMap<>();
        empty.put("planId", planId); empty.put("status", "NOT_STARTED"); empty.put("completedSessions", 0);
        empty.put("startedAt", null); empty.put("lastCompletedAt", null); empty.put("updatedAt", null);
        addWeekProgress(empty, userId, planId);
        return empty;
    }
    public boolean updatePlanStatus(String userId, String planId, String status, Instant now) {
        return jdbc.update("UPDATE user_training_plan SET status=?,updated_at=? WHERE user_id=? AND plan_id=?", status, ts(now), userId, planId) > 0;
    }
    public void completePlanSession(String userId, String planId, Instant now) {
        jdbc.update("UPDATE user_training_plan SET completed_sessions=completed_sessions+1,last_completed_at=?,updated_at=? WHERE user_id=? AND plan_id=?", ts(now), ts(now), userId, planId);
    }
    private void addWeekProgress(Map<String,Object> value, String userId, String planId) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate weekStart = LocalDate.now(zone).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Instant start = weekStart.atStartOfDay(zone).toInstant();
        Instant end = weekStart.plusDays(7).atStartOfDay(zone).toInstant();
        Integer completed = jdbc.queryForObject("SELECT COUNT(*) FROM workout_record WHERE user_id=? AND plan_id=? AND completed_at>=? AND completed_at<?", Integer.class, userId, planId, ts(start), ts(end));
        String durationLabel = jdbc.queryForObject("SELECT duration_label FROM training_plan WHERE id=?", String.class, planId);
        int target = weeklyTarget(durationLabel);
        int count = completed == null ? 0 : completed;
        value.put("weekStartDate", weekStart);
        value.put("weekCompletedSessions", count);
        value.put("weeklyTarget", target);
        value.put("weeklyCompletionRate", target == 0 ? 0.0 : Math.min(1.0, count / (double) target));
    }
    private static int weeklyTarget(String durationLabel) {
        if (durationLabel == null) return 0;
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d+)\\s*天/周").matcher(durationLabel);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }
    public List<String> favoriteIds(String userId, String targetType) {
        return jdbc.query("SELECT target_id FROM user_favorite WHERE user_id=? AND target_type=? ORDER BY created_at DESC, target_id DESC", (rs, rowNum) -> rs.getString("target_id"), userId, targetType);
    }
    public boolean addFavorite(String userId, String targetType, String targetId, Instant now) {
        if (favoriteExists(userId, targetType, targetId)) return false;
        jdbc.update("INSERT INTO user_favorite (user_id,target_type,target_id,created_at,updated_at) VALUES (?,?,?,?,?)", userId, targetType, targetId, ts(now), ts(now));
        return true;
    }
    public boolean removeFavorite(String userId, String targetType, String targetId) {
        return jdbc.update("DELETE FROM user_favorite WHERE user_id=? AND target_type=? AND target_id=?", userId, targetType, targetId) > 0;
    }
    public List<String> mergeFavorites(String userId, String targetType, List<String> targetIds, Instant now) {
        for (String targetId : targetIds) {
            if (!favoriteExists(userId, targetType, targetId)) {
                jdbc.update("INSERT INTO user_favorite (user_id,target_type,target_id,created_at,updated_at) VALUES (?,?,?,?,?)", userId, targetType, targetId, ts(now), ts(now));
            }
        }
        return favoriteIds(userId, targetType);
    }
    private boolean favoriteExists(String userId, String targetType, String targetId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM user_favorite WHERE user_id=? AND target_type=? AND target_id=?", Integer.class, userId, targetType, targetId);
        return count != null && count > 0;
    }
    public List<Map<String,Object>> adminUsers(String search, int limit, int offset) { String term = search == null ? null : search.trim().toLowerCase(); if (term == null || term.isBlank()) return jdbc.queryForList("SELECT id,phone,nickname,gender,goal,experience_level AS experienceLevel,status,created_at AS createdAt,last_login_at AS lastLoginAt FROM app_user ORDER BY created_at DESC LIMIT ? OFFSET ?", limit, offset); return jdbc.queryForList("SELECT id,phone,nickname,gender,goal,experience_level AS experienceLevel,status,created_at AS createdAt,last_login_at AS lastLoginAt FROM app_user WHERE LOWER(phone) LIKE ? OR LOWER(nickname) LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?", "%"+term+"%", "%"+term+"%", limit, offset); }
    public long countAdminUsers(String search) { String term = search == null ? null : search.trim().toLowerCase(); Long count = term == null || term.isBlank() ? jdbc.queryForObject("SELECT COUNT(*) FROM app_user", Long.class) : jdbc.queryForObject("SELECT COUNT(*) FROM app_user WHERE LOWER(phone) LIKE ? OR LOWER(nickname) LIKE ?", Long.class, "%"+term+"%", "%"+term+"%"); return count == null ? 0 : count; }
    public List<Map<String,Object>> adminWorkouts(String userId, int limit, int offset) { return userId == null || userId.isBlank() ? jdbc.queryForList("SELECT id,user_id AS userId,title,duration_seconds AS durationSeconds,total_sets AS totalSets,total_volume AS totalVolume,calories,completed_at AS completedAt FROM workout_record ORDER BY completed_at DESC LIMIT ? OFFSET ?", limit, offset) : jdbc.queryForList("SELECT id,user_id AS userId,title,duration_seconds AS durationSeconds,total_sets AS totalSets,total_volume AS totalVolume,calories,completed_at AS completedAt FROM workout_record WHERE user_id=? ORDER BY completed_at DESC LIMIT ? OFFSET ?", userId, limit, offset); }
    public long countAdminWorkouts(String userId) { Long count = userId == null || userId.isBlank() ? jdbc.queryForObject("SELECT COUNT(*) FROM workout_record", Long.class) : jdbc.queryForObject("SELECT COUNT(*) FROM workout_record WHERE user_id=?", Long.class, userId); return count == null ? 0 : count; }
    public List<Map<String,Object>> adminNutrition(String userId, int limit, int offset) { return userId == null || userId.isBlank() ? jdbc.queryForList("SELECT id,user_id AS userId,meal_name AS mealName,calories,protein_g AS proteinG,carbohydrates_g AS carbohydratesG,fat_g AS fatG,food_count AS foodCount,recorded_at AS recordedAt FROM nutrition_record ORDER BY recorded_at DESC LIMIT ? OFFSET ?", limit, offset) : jdbc.queryForList("SELECT id,user_id AS userId,meal_name AS mealName,calories,protein_g AS proteinG,carbohydrates_g AS carbohydratesG,fat_g AS fatG,food_count AS foodCount,recorded_at AS recordedAt FROM nutrition_record WHERE user_id=? ORDER BY recorded_at DESC LIMIT ? OFFSET ?", userId, limit, offset); }
    public long countAdminNutrition(String userId) { Long count = userId == null || userId.isBlank() ? jdbc.queryForObject("SELECT COUNT(*) FROM nutrition_record", Long.class) : jdbc.queryForObject("SELECT COUNT(*) FROM nutrition_record WHERE user_id=?", Long.class, userId); return count == null ? 0 : count; }
    private AppUser one(String sql,Object arg){List<AppUser> rows=jdbc.query(sql,(rs,n)->map(rs),arg);return rows.isEmpty()?null:rows.get(0);}
    private AppUser map(java.sql.ResultSet rs)throws java.sql.SQLException{return new AppUser(rs.getString("id"),rs.getString("phone"),rs.getString("nickname"),rs.getString("gender"),(Integer)rs.getObject("birth_year"),number(rs.getObject("height_cm")),number(rs.getObject("weight_kg")),number(rs.getObject("body_fat_pct")),rs.getString("goal"),rs.getString("experience_level"),rs.getString("weekly_frequency"),rs.getString("venue"),parseList(rs.getString("equipment_json")),rs.getString("status"),rs.getTimestamp("created_at").toInstant(),rs.getTimestamp("updated_at").toInstant(),rs.getTimestamp("last_login_at")==null?null:rs.getTimestamp("last_login_at").toInstant());}
    private Double number(Object v){return v==null?null:((Number)v).doubleValue();}
    private List<String> parseList(String value){try{return value==null?List.of():objectMapper.readValue(value,objectMapper.getTypeFactory().constructCollectionType(List.class,String.class));}catch(Exception e){return List.of();}}
    private String json(Object value){try{return value==null?"[]":objectMapper.writeValueAsString(value);}catch(JsonProcessingException e){throw new IllegalArgumentException("invalid JSON",e);}}
    private static Timestamp ts(Instant v){return v==null?null:Timestamp.from(v);}
}
