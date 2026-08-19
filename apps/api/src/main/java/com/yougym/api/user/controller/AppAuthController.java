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
}
