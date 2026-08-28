package com.mcrn.auth.controller;

import com.mcrn.auth.dto.AuthDtos.*;
import com.mcrn.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service){this.service=service;}

    @PostMapping("/register/user") ResponseEntity<?> registerUser(@Valid @RequestBody UserRegisterRequest r){
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", service.registerUser(r)));
    }
    @PostMapping("/register/police") ResponseEntity<?> registerPolice(@Valid @RequestBody PoliceRegisterRequest r){
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", service.registerPolice(r)));
    }
    @PostMapping("/login") AuthResponse login(@Valid @RequestBody LoginRequest r){ return service.login(r); }
    @PostMapping("/verify-email") Map<String,String> verify(@Valid @RequestBody VerifyOtpRequest r){return Map.of("message", service.verify(r));}
    @PostMapping("/forgot-password") Map<String,String> forgot(@Valid @RequestBody ForgotPasswordRequest r){return Map.of("message", service.forgot(r));}
    @PostMapping("/reset-password") Map<String,String> reset(@Valid @RequestBody ResetPasswordRequest r){return Map.of("message", service.reset(r));}
}
