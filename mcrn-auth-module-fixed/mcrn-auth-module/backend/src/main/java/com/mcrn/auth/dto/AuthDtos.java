package com.mcrn.auth.dto;

import com.mcrn.auth.model.Role;
import jakarta.validation.constraints.*;

public final class AuthDtos {
    private AuthDtos() {}

    public record UserRegisterRequest(
            @NotBlank @Size(min=3,max=50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min=8,max=72)
            @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$")
            String password) {}

    public record PoliceRegisterRequest(
            @NotBlank @Size(min=2,max=100) String name,
            @NotBlank @Size(min=3,max=50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min=8,max=72)
            @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$")
            String password,
            @NotBlank @Size(min=3,max=80) String officialId) {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record VerifyOtpRequest(@NotBlank @Email String email, @NotBlank @Size(min=6,max=6) String otp) {}
    public record ForgotPasswordRequest(@NotBlank @Email String email) {}
    public record ResetPasswordRequest(@NotBlank @Email String email, @NotBlank @Size(min=6,max=6) String otp,
                                       @NotBlank @Size(min=8,max=72)
                                       @Pattern(regexp="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$")
                                       String newPassword) {}
    public record UpdateProfileRequest(@NotBlank @Size(min=2,max=100) String name,
                                       @Size(max=20) String phone,
                                       @Size(max=500) String profilePhotoUrl) {}
    public record ChangePasswordRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min=8,max=72) String newPassword) {}
    public record AuthResponse(String token, Long id, String username, String name, String email, Role role) {}
    public record ProfileResponse(Long id, String username, String name, String email, String phone,
                                  String profilePhotoUrl, Role role, boolean verified) {}
}
