package com.yougym.api.user.controller;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import com.yougym.api.user.mapper.AppUserMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/app-users")
public class AppUserAdminController {
    private final AppUserMapper mapper; private final AdminAccessService access; private final AuditLogService audit;
    public AppUserAdminController(AppUserMapper mapper, AdminAccessService access, AuditLogService audit){this.mapper=mapper;this.access=access;this.audit=audit;}
    @GetMapping public Map<String,Object> users(@RequestParam(required=false) String search,@RequestParam(defaultValue="200") int limit,HttpServletRequest request){var p=access.authorize(request, AdminPermission.ANALYTICS_READ);var items=mapper.adminUsers(search,Math.max(1,Math.min(limit,1000)));audit.record(p,"APP_USERS_VIEWED","app_user",null,request,Map.of("count",items.size()));return Map.of("items",items);}
    @GetMapping("/workouts") public Map<String,Object> workouts(@RequestParam(required=false) String userId,@RequestParam(defaultValue="200") int limit,HttpServletRequest request){access.authorize(request,AdminPermission.ANALYTICS_READ);return Map.of("items",mapper.adminWorkouts(userId,Math.max(1,Math.min(limit,1000))));}
    @GetMapping("/nutrition") public Map<String,Object> nutrition(@RequestParam(required=false) String userId,@RequestParam(defaultValue="200") int limit,HttpServletRequest request){access.authorize(request,AdminPermission.ANALYTICS_READ);return Map.of("items",mapper.adminNutrition(userId,Math.max(1,Math.min(limit,1000))));}
}
