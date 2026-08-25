package com.yougym.api.user.controller;

import com.yougym.api.user.dto.SendCodeRequest;
import com.yougym.api.user.dto.VerifyCodeRequest;
import com.yougym.api.user.service.AppUserService;
import com.yougym.api.user.vo.SessionVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AppAuthController {
    private final AppUserService service;
    public AppAuthController(AppUserService service){this.service=service;}
    @PostMapping("/sms/code") public Map<String,Object> sendCode(@Valid @RequestBody SendCodeRequest request){return service.sendCode(request);}
    @PostMapping("/sms/verify") public SessionVO verify(@Valid @RequestBody VerifyCodeRequest request){return service.verifyCode(request);}
    @PostMapping("/logout") public Map<String,Object> logout(@RequestHeader(value = "Authorization", required = false) String authorization){service.logout(token(authorization)); return Map.of("loggedOut", true);}
    private static String token(String header){return header!=null&&header.startsWith("Bearer ")?header.substring(7).trim():null;}
}
