package com.yougym.api.user.service.impl;

import com.yougym.api.integration.IntegrationService;
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
import java.util.UUID;

@Service
public class AppUserServiceImpl implements AppUserService {
    private static final long SESSION_SECONDS = 30L * 24 * 60 * 60;
    private final AppUserMapper mapper;
    private final IntegrationService integrationService;
    private final SecureRandom random = new SecureRandom();
    public AppUserServiceImpl(AppUserMapper mapper, IntegrationService integrationService) { this.mapper=mapper; this.integrationService=integrationService; }

    @Override public Map<String,Object> sendCode(SendCodeRequest request) {
        String phone=normalizePhone(request.phone()); String purpose=purpose(request.purpose());
        String code=integrationService.isMock()?"123456":String.format("%06d",random.nextInt(1_000_000));
        var sent=integrationService.sendSms(phone,purpose,code); Instant now=Instant.now();
        mapper.saveCode(UUID.randomUUID().toString(),phone,purpose,hash(code),now.plus(5,ChronoUnit.MINUTES),now);
        return Map.of("accepted",sent.accepted(),"provider",sent.provider(),"expiresInSeconds",300,"mockMode",integrationService.isMock());
    }
    @Override public SessionVO verifyCode(VerifyCodeRequest request) {
        String phone=normalizePhone(request.phone()); String purpose=purpose(request.purpose());
        String expected=mapper.latestCodeHash(phone,purpose);
        if(expected==null||!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),hash(request.code()).getBytes(StandardCharsets.UTF_8))) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"invalid or expired verification code");
        Instant now=Instant.now(); mapper.markCodesUsed(phone,purpose,now); AppUser user=mapper.findByPhone(phone); boolean needsOnboarding = user == null;
        if(user==null){user=new AppUser(UUID.randomUUID().toString(),phone,"健身爱好者",null,null,null,null,null,null,null,null,null,List.of(),"ACTIVE",now,now,now);mapper.insertUser(user);} else {mapper.touchLogin(user.id(),now);user=mapper.findById(user.id());}
        String token="yg_app_"+UUID.randomUUID().toString().replace("-","")+UUID.randomUUID().toString().replace("-","");
        mapper.saveSession(hash(token),user.id(),now.plusSeconds(SESSION_SECONDS),now);
        return new SessionVO(token,"Bearer",SESSION_SECONDS,AppUserVO.from(user),needsOnboarding);
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
    @Override public void recordWorkout(String token,CreateWorkoutRecordRequest request){mapper.saveWorkout(requireUser(token).id(),request,Instant.now());}
    @Override public void recordNutrition(String token,CreateNutritionRecordRequest request){mapper.saveNutrition(requireUser(token).id(),request,Instant.now());}
    @Override public List<Map<String,Object>> workouts(String token,int limit){return mapper.workouts(requireUser(token).id(),clamp(limit));}
    @Override public List<Map<String,Object>> nutrition(String token,int limit){return mapper.nutrition(requireUser(token).id(),clamp(limit));}
    private AppUser requireUser(String token){if(token==null||token.isBlank())throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"missing app bearer token");AppUser u=mapper.findBySessionHash(hash(token));if(u==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"invalid or expired app session");mapper.touchSession(hash(token),Instant.now());return u;}
    private static int clamp(int limit){return Math.max(1,Math.min(limit,200));}
    private static String purpose(String value){String p=value.trim().toUpperCase();if(!p.equals("LOGIN")&&!p.equals("REGISTER"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"unsupported verification purpose");return p;}
    private static String normalizePhone(String value){return value.replaceAll("[^+0-9]","");}
    private static String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
}
