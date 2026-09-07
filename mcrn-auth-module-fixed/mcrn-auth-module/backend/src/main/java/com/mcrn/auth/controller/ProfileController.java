package com.mcrn.auth.controller;

import com.mcrn.auth.dto.AuthDtos.*;
import com.mcrn.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class ProfileController {
    private final AuthService service;
    public ProfileController(AuthService service){this.service=service;}

    @GetMapping("/profile") ProfileResponse profile(Authentication a){return service.profile(a.getName());}
    @PutMapping("/profile") ProfileResponse update(Authentication a,@Valid @RequestBody UpdateProfileRequest r){return service.updateProfile(a.getName(),r);}
    @PutMapping("/change-password") Map<String,String> change(Authentication a,@Valid @RequestBody ChangePasswordRequest r){return Map.of("message", service.changePassword(a.getName(),r));}
}
