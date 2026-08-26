package com.yougym.api.user.service.impl;

import com.yougym.api.integration.IntegrationService;
import com.yougym.api.config.IntegrationProperties;
import com.yougym.api.user.dto.*;
import com.yougym.api.user.entity.AppUser;
import com.yougym.api.user.mapper.AppUserMapper;
import com.yougym.api.user.service.AppUserService;
import com.yougym.api.user.vo.AppUserVO;
import com.yougym.api.user.vo.SessionVO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AppUserServiceImpl implements AppUserService {
    private static final long SESSION_SECONDS = 30L * 24 * 60 * 60;
    private final AppUserMapper mapper;
    private final IntegrationService integrationService;
    private final IntegrationProperties integrationProperties;
    private final SecureRandom random = new SecureRandom();
    private final ConcurrentHashMap<String, Instant> codeRequestTimes = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, VerificationWindow> verificationFailures = new ConcurrentHashMap<>();

    public AppUserServiceImpl(AppUserMapper mapper, IntegrationService integrationService,
                              IntegrationProperties integrationProperties) {
        this.mapper = mapper;
        this.integrationService = integrationService;
        this.integrationProperties = integrationProperties;
    }

    @Override public Map<String,Object> sendCode(SendCodeRequest request) {
        String phone=normalizePhone(request.phone()); String purpose=purpose(request.purpose());
        Instant now = Instant.now();
        enforceSendInterval(phone, now);
        String code=integrationService.isMock()?"123456":String.format("%06d",random.nextInt(1_000_000));
        var sent=integrationService.sendSms(phone,purpose,code);
        if (sent.accepted()) codeRequestTimes.put(phone, now);
        int ttlSeconds = Math.max(1, integrationProperties.getSms().getCodeTtlMinutes()) * 60;
        mapper.saveCode(UUID.randomUUID().toString(),phone,purpose,hash(code),now.plusSeconds(ttlSeconds),now);
        return Map.of("accepted",sent.accepted(),"provider",sent.provider(),"expiresInSeconds",ttlSeconds,"mockMode",integrationService.isMock());
    }
    @Override public SessionVO verifyCode(VerifyCodeRequest request) {
        String phone=normalizePhone(request.phone()); String purpose=purpose(request.purpose());
        enforceVerificationAttempts(phone, purpose, Instant.now());
        String expected=mapper.latestCodeHash(phone,purpose);
        if(expected==null||!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),hash(request.code()).getBytes(StandardCharsets.UTF_8))) {
            registerVerificationFailure(phone, purpose, Instant.now());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"invalid or expired verification code");
        }
        Instant now=Instant.now(); mapper.markCodesUsed(phone,purpose,now); AppUser user=mapper.findByPhone(phone); boolean needsOnboarding = user == null;
        verificationFailures.remove(phone + ":" + purpose);
        if(user==null){user=new AppUser(UUID.randomUUID().toString(),phone,"健身爱好者",null,null,null,null,null,null,null,null,null,List.of(),"ACTIVE",now,now,now);mapper.insertUser(user);} else {mapper.touchLogin(user.id(),now);user=mapper.findById(user.id());}
        String token="yg_app_"+UUID.randomUUID().toString().replace("-","")+UUID.randomUUID().toString().replace("-","");
        mapper.saveSession(hash(token),user.id(),now.plusSeconds(SESSION_SECONDS),now);
        return new SessionVO(token,"Bearer",SESSION_SECONDS,AppUserVO.from(user),needsOnboarding);
    }
    @Override public void logout(String token) {
        if (token == null || token.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "missing app bearer token");
        if (!mapper.deleteSession(hash(token))) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid or expired app session");
    }
    @Override public AppUserVO me(String token){return AppUserVO.from(requireUser(token));}
    @Override public AppUserVO updateProfile(String token,UpdateProfileRequest request){
        AppUser u=requireUser(token);
        UpdateProfileRequest merged = new UpdateProfileRequest(
                request.nickname() == null ? u.nickname() : request.nickname(),
                request.gender() == null ? u.gender() : request.gender(),
                request.birthYear() == null ? u.birthYear() : request.birthYear(),
                request.heightCm() == null ? u.heightCm() : request.heightCm(),
                request.weightKg() == null ? u.weightKg() : request.weightKg(),
                request.bodyFatPct() == null ? u.bodyFatPct() : request.bodyFatPct(),
                request.goal() == null ? u.goal() : request.goal(),
                request.experienceLevel() == null ? u.experienceLevel() : request.experienceLevel(),
                request.weeklyFrequency() == null ? u.weeklyFrequency() : request.weeklyFrequency(),
                request.venue() == null ? u.venue() : request.venue(),
                request.equipment() == null ? u.equipment() : request.equipment());
        mapper.updateProfile(u.id(),merged,Instant.now());
        return AppUserVO.from(mapper.findById(u.id()));
    }
    @Override public void recordWorkout(String token,CreateWorkoutRecordRequest request){
        AppUser user = requireUser(token);
        Instant now = Instant.now();
        Object planIdValue = request.metadata() == null ? null : request.metadata().get("planId");
        String planId = planIdValue instanceof String value && !value.isBlank() && mapper.planExists(value.trim()) ? value.trim() : null;
        mapper.saveWorkout(user.id(), request, now, planId);
        if (planId != null) mapper.completePlanSession(user.id(), planId, now);
    }
    @Override public void recordNutrition(String token,CreateNutritionRecordRequest request){mapper.saveNutrition(requireUser(token).id(),request,Instant.now());}
    @Override public List<Map<String,Object>> workouts(String token,int limit){return mapper.workouts(requireUser(token).id(),clamp(limit));}
    @Override public List<Map<String,Object>> nutrition(String token,int limit){return mapper.nutrition(requireUser(token).id(),clamp(limit));}
    @Override public Map<String,Object> recordBodyMeasurement(String token, CreateBodyMeasurementRequest request) {
        if (request.heightCm() == null && request.weightKg() == null && request.bodyFatPct() == null && request.waistCm() == null && request.chestCm() == null && request.hipCm() == null && request.armCm() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "至少填写一项身体数据");
        }
        return mapper.saveBodyMeasurement(requireUser(token).id(), request, Instant.now());
    }
    @Override public List<Map<String,Object>> bodyMeasurements(String token,int limit){return mapper.bodyMeasurements(requireUser(token).id(),clamp(limit));}
    @Override public Map<String,Object> reminderSettings(String token){return mapper.reminderSettings(requireUser(token).id());}
    @Override public Map<String,Object> updateReminderSettings(String token, UpdateReminderSettingsRequest request){return mapper.updateReminderSettings(requireUser(token).id(), request, Instant.now());}
    @Override public List<Map<String,Object>> notifications(String token, boolean unreadOnly, int limit){return mapper.notifications(requireUser(token).id(), unreadOnly, clamp(limit));}
    @Override public long unreadNotificationCount(String token){return mapper.unreadNotificationCount(requireUser(token).id());}
    @Override public Map<String,Object> markNotificationRead(String token, String notificationId){
        if (notificationId == null || notificationId.isBlank() || notificationId.length() > 128) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "notification id is required");
        AppUser user = requireUser(token);
        String normalizedId = notificationId.trim();
        Map<String,Object> notification = mapper.findNotification(user.id(), normalizedId);
        if (notification == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "notification not found");
        mapper.markNotificationRead(user.id(), normalizedId, Instant.now());
        Map<String,Object> updated = mapper.findNotification(user.id(), normalizedId);
        return updated == null ? notification : updated;
    }
    @Override public int markAllNotificationsRead(String token){return mapper.markAllNotificationsRead(requireUser(token).id(), Instant.now());}
    @Override public Map<String,Object> startPlan(String token, String planId) {
        AppUser user = requireUser(token);
        if (planId == null || planId.isBlank() || !mapper.planExists(planId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "plan not found");
        return mapper.startPlan(user.id(), planId, Instant.now());
    }
    @Override public Map<String,Object> planProgress(String token, String planId) {
        AppUser user = requireUser(token);
        if (planId == null || planId.isBlank() || !mapper.planExists(planId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "plan not found");
        return mapper.planProgress(user.id(), planId);
    }
    @Override public Map<String,Object> updatePlanProgress(String token, String planId, String status) {
        AppUser user = requireUser(token);
        if (planId == null || planId.isBlank() || !mapper.planExists(planId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "plan not found");
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!normalized.equals("ACTIVE") && !normalized.equals("PAUSED")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported plan status");
        if (!mapper.updatePlanStatus(user.id(), planId, normalized, Instant.now())) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "plan has not been started");
        return mapper.planProgress(user.id(), planId);
    }
    @Override public List<String> favoriteIds(String token, String targetType) {
        return mapper.favoriteIds(requireUser(token).id(), normalizeFavoriteType(targetType));
    }
    @Override public boolean addFavorite(String token, String targetType, String targetId) {
        if (targetId == null || targetId.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "favorite target id is required");
        return mapper.addFavorite(requireUser(token).id(), normalizeFavoriteType(targetType), targetId.trim(), Instant.now());
    }
    @Override public boolean removeFavorite(String token, String targetType, String targetId) {
        if (targetId == null || targetId.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "favorite target id is required");
        return mapper.removeFavorite(requireUser(token).id(), normalizeFavoriteType(targetType), targetId.trim());
    }
    @Override public List<String> syncFavorites(String token, String targetType, List<String> targetIds) {
        if (targetIds == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "favorite ids are required");
        Set<String> unique = new java.util.LinkedHashSet<>();
        for (String targetId : targetIds) if (targetId != null && !targetId.isBlank()) unique.add(targetId.trim());
        if (unique.size() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "too many favorite ids");
        return mapper.mergeFavorites(requireUser(token).id(), normalizeFavoriteType(targetType), List.copyOf(unique), Instant.now());
    }
    private static String normalizeFavoriteType(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase();
        if (!normalized.equals("EXERCISE") && !normalized.equals("PLAN")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported favorite target type");
        return normalized;
    }
    private AppUser requireUser(String token){if(token==null||token.isBlank())throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"missing app bearer token");AppUser u=mapper.findBySessionHash(hash(token));if(u==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"invalid or expired app session");mapper.touchSession(hash(token),Instant.now());return u;}
    private static int clamp(int limit){return Math.max(1,Math.min(limit,200));}
    private static String purpose(String value){String p=value.trim().toUpperCase();if(!p.equals("LOGIN")&&!p.equals("REGISTER"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"unsupported verification purpose");return p;}
    private static String normalizePhone(String value){return value.replaceAll("[^+0-9]","");}
    private static String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}

    private void enforceSendInterval(String phone, Instant now) {
        Instant previous = codeRequestTimes.get(phone);
        long interval = Math.max(1, integrationProperties.getSms().getSendIntervalSeconds());
        if (previous != null && previous.plusSeconds(interval).isAfter(now)) {
            long retryAfter = Math.max(1, previous.plusSeconds(interval).getEpochSecond() - now.getEpochSecond());
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "验证码发送过于频繁，请稍后再试（" + retryAfter + " 秒）");
        }
        if (codeRequestTimes.size() > 10_000) {
            codeRequestTimes.entrySet().removeIf(entry -> entry.getValue().plusSeconds(3600).isBefore(now));
        }
    }

    private void enforceVerificationAttempts(String phone, String purpose, Instant now) {
        VerificationWindow window = verificationFailures.get(phone + ":" + purpose);
        if (window != null && window.lockedUntil().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "验证码错误次数过多，请稍后再试");
        }
    }

    private void registerVerificationFailure(String phone, String purpose, Instant now) {
        String key = phone + ":" + purpose;
        verificationFailures.compute(key, (ignored, current) -> {
            if (current == null || current.windowStarted().plusSeconds(300).isBefore(now)) {
                return new VerificationWindow(1, now, Instant.EPOCH);
            }
            int failures = current.failures() + 1;
            return new VerificationWindow(failures, current.windowStarted(), failures >= 5 ? now.plusSeconds(900) : current.lockedUntil());
        });
    }

    private record VerificationWindow(int failures, Instant windowStarted, Instant lockedUntil) {}
}
