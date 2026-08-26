package com.yougym.api.user.controller;

import com.yougym.api.user.dto.*;
import com.yougym.api.user.service.AppUserService;
import com.yougym.api.user.vo.AppUserVO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/me")
public class AppUserController {
    private final AppUserService service;
    public AppUserController(AppUserService service){this.service=service;}
    @GetMapping public AppUserVO me(@RequestHeader("Authorization") String authorization){return service.me(token(authorization));}
    @PatchMapping public AppUserVO update(@RequestHeader("Authorization") String authorization,@Valid @RequestBody UpdateProfileRequest request){return service.updateProfile(token(authorization),request);}
    @PostMapping("/workouts") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> workout(@RequestHeader("Authorization") String authorization,@Valid @RequestBody CreateWorkoutRecordRequest request){service.recordWorkout(token(authorization),request);return Map.of("saved",true);}
    @GetMapping("/workouts") public Map<String,Object> workouts(@RequestHeader("Authorization") String authorization,@RequestParam(defaultValue="50") int limit){return Map.of("items",service.workouts(token(authorization),limit));}
    @PostMapping("/nutrition") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> nutrition(@RequestHeader("Authorization") String authorization,@Valid @RequestBody CreateNutritionRecordRequest request){service.recordNutrition(token(authorization),request);return Map.of("saved",true);}
    @GetMapping("/nutrition") public Map<String,Object> nutritionList(@RequestHeader("Authorization") String authorization,@RequestParam(defaultValue="50") int limit){return Map.of("items",service.nutrition(token(authorization),limit));}
    @PostMapping("/measurements") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> measurement(@RequestHeader("Authorization") String authorization,@Valid @RequestBody CreateBodyMeasurementRequest request){return Map.of("saved",true,"measurement",service.recordBodyMeasurement(token(authorization),request));}
    @GetMapping("/measurements") public Map<String,Object> measurements(@RequestHeader("Authorization") String authorization,@RequestParam(defaultValue="50") int limit){return Map.of("items",service.bodyMeasurements(token(authorization),limit));}
    @PostMapping("/plans/{planId}/start") public Map<String,Object> startPlan(@RequestHeader("Authorization") String authorization,@PathVariable String planId){return Map.of("progress",service.startPlan(token(authorization),planId));}
    @GetMapping("/plans/{planId}/progress") public Map<String,Object> planProgress(@RequestHeader("Authorization") String authorization,@PathVariable String planId){return Map.of("progress",service.planProgress(token(authorization),planId));}
    @GetMapping("/favorites") public Map<String,Object> favorites(@RequestHeader("Authorization") String authorization,@RequestParam(defaultValue="EXERCISE") String targetType){return Map.of("targetType",targetType,"ids",service.favoriteIds(token(authorization),targetType));}
    @PutMapping("/favorites/{targetType}/{targetId}") public Map<String,Object> addFavorite(@RequestHeader("Authorization") String authorization,@PathVariable String targetType,@PathVariable String targetId){return Map.of("saved",service.addFavorite(token(authorization),targetType,targetId),"targetType",targetType,"targetId",targetId);}
    @DeleteMapping("/favorites/{targetType}/{targetId}") public Map<String,Object> removeFavorite(@RequestHeader("Authorization") String authorization,@PathVariable String targetType,@PathVariable String targetId){return Map.of("removed",service.removeFavorite(token(authorization),targetType,targetId),"targetType",targetType,"targetId",targetId);}
    @PostMapping("/favorites/sync") public Map<String,Object> syncFavorites(@RequestHeader("Authorization") String authorization,@Valid @RequestBody SyncFavoritesRequest request){return Map.of("targetType",request.targetType(),"ids",service.syncFavorites(token(authorization),request.targetType(),request.ids()));}
    private static String token(String header){return header!=null&&header.startsWith("Bearer ")?header.substring(7).trim():null;}
}
