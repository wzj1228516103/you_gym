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
import java.time.Instant;
import java.util.List;
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
    public void saveWorkout(String userId, CreateWorkoutRecordRequest r, Instant now) { jdbc.update("INSERT INTO workout_record (id,user_id,title,duration_seconds,total_sets,total_volume,calories,metadata_json,completed_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)", UUID.randomUUID().toString(),userId,r.title(),r.durationSeconds(),r.totalSets(),r.totalVolume(),r.calories(),json(r.metadata()),ts(r.completedAt()==null?now:r.completedAt()),ts(now)); }
    public void saveNutrition(String userId, CreateNutritionRecordRequest r, Instant now) { jdbc.update("INSERT INTO nutrition_record (id,user_id,meal_name,calories,protein_g,carbohydrates_g,fat_g,food_count,metadata_json,recorded_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", UUID.randomUUID().toString(),userId,r.mealName(),r.calories(),r.proteinG(),r.carbohydratesG(),r.fatG(),r.foodCount(),json(r.metadata()),ts(r.recordedAt()==null?now:r.recordedAt()),ts(now)); }
    public List<Map<String,Object>> workouts(String userId, int limit) { return jdbc.queryForList("SELECT id,title,duration_seconds AS durationSeconds,total_sets AS totalSets,total_volume AS totalVolume,calories,completed_at AS completedAt FROM workout_record WHERE user_id=? ORDER BY completed_at DESC LIMIT ?",userId,limit); }
    public List<Map<String,Object>> nutrition(String userId, int limit) { return jdbc.queryForList("SELECT id,meal_name AS mealName,calories,protein_g AS proteinG,carbohydrates_g AS carbohydratesG,fat_g AS fatG,food_count AS foodCount,recorded_at AS recordedAt FROM nutrition_record WHERE user_id=? ORDER BY recorded_at DESC LIMIT ?",userId,limit); }
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
