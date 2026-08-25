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
    @GetMapping public Map<String,Object> users(@RequestParam(required=false) String search,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="50") int pageSize,@RequestParam(required=false) Integer limit,HttpServletRequest request){var p=access.authorize(request, AdminPermission.ANALYTICS_READ);var paging=paging(page,pageSize,limit);var items=mapper.adminUsers(search,paging.pageSize(),paging.offset());var total=mapper.countAdminUsers(search);audit.record(p,"APP_USERS_VIEWED","app_user",null,request,Map.of("count",items.size(),"page",paging.page()));return Map.of("items",items,"total",total,"page",paging.page(),"pageSize",paging.pageSize());}
    @GetMapping("/workouts") public Map<String,Object> workouts(@RequestParam(required=false) String userId,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="50") int pageSize,@RequestParam(required=false) Integer limit,HttpServletRequest request){access.authorize(request,AdminPermission.ANALYTICS_READ);var paging=paging(page,pageSize,limit);return Map.of("items",mapper.adminWorkouts(userId,paging.pageSize(),paging.offset()),"total",mapper.countAdminWorkouts(userId),"page",paging.page(),"pageSize",paging.pageSize());}
    @GetMapping("/nutrition") public Map<String,Object> nutrition(@RequestParam(required=false) String userId,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="50") int pageSize,@RequestParam(required=false) Integer limit,HttpServletRequest request){access.authorize(request,AdminPermission.ANALYTICS_READ);var paging=paging(page,pageSize,limit);return Map.of("items",mapper.adminNutrition(userId,paging.pageSize(),paging.offset()),"total",mapper.countAdminNutrition(userId),"page",paging.page(),"pageSize",paging.pageSize());}
    private static Paging paging(int page,int pageSize,Integer limit){int safeSize=limit==null?Math.max(1,Math.min(pageSize,100)):Math.max(1,Math.min(limit,100));int safePage=Math.max(1,Math.min(page,100000));return new Paging(safePage,safeSize,(safePage-1)*safeSize);}
    private record Paging(int page,int pageSize,int offset) {}
}
