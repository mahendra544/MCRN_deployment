package com.mcrn.auth.service;

import com.mcrn.auth.dto.AuthDtos.*;
import com.mcrn.auth.exception.EmailNotVerifiedException;
import com.mcrn.auth.model.*;
import com.mcrn.auth.repository.*;
import com.mcrn.auth.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.security.SecureRandom;

@Service
public class AuthService {
    private final UserRepository users;
    private final PoliceProfileRepository police;
    private final OtpTokenRepository otps;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;
    private final MailService mail;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository users, PoliceProfileRepository police, OtpTokenRepository otps,
                       PasswordEncoder encoder, AuthenticationManager authManager, JwtService jwt, MailService mail) {
        this.users=users; this.police=police; this.otps=otps; this.encoder=encoder;
        this.authManager=authManager; this.jwt=jwt; this.mail=mail;
    }

    @Transactional
    public String registerUser(UserRegisterRequest r) {
        checkNewAccount(r.username(), r.email());
        User u = new User();
        u.setUsername(r.username().trim()); u.setName(r.username().trim());
        u.setEmail(r.email().trim().toLowerCase()); u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(Role.USER); u.setVerified(false);
        users.save(u); issueOtp(u.getEmail(), OtpPurpose.REGISTRATION_VERIFICATION);
        return "Registration successful. Verify the OTP sent to your email.";
    }

    @Transactional
    public String registerPolice(PoliceRegisterRequest r) {
        checkNewAccount(r.username(), r.email());
        if (police.existsByOfficialIdIgnoreCase(r.officialId())) throw new IllegalArgumentException("Official ID already registered");
        User u = new User();
        u.setUsername(r.username().trim()); u.setName(r.name().trim());
        u.setEmail(r.email().trim().toLowerCase()); u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(Role.POLICE); u.setVerified(false);
        users.save(u);
        PoliceProfile p = new PoliceProfile(); p.setUser(u); p.setOfficialId(r.officialId().trim()); police.save(p);
        issueOtp(u.getEmail(), OtpPurpose.REGISTRATION_VERIFICATION);
        return "Police registration successful. Verify the OTP sent to your email.";
    }

    public AuthResponse login(LoginRequest r) {
        User u = users.findByUsernameIgnoreCase(r.username()).orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        if (!u.isActive()) throw new BadCredentialsException("Account inactive");
        if (u.getLockedUntil()!=null && u.getLockedUntil().isAfter(Instant.now()))
            throw new IllegalStateException("Account temporarily locked. Try again later.");
        if (!u.isVerified()) throw new EmailNotVerifiedException(u.getEmail());
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(r.username(), r.password()));
            u.setFailedLoginAttempts(0); u.setLockedUntil(null); users.save(u);
            return new AuthResponse(jwt.generate(u),u.getId(),u.getUsername(),u.getName(),u.getEmail(),u.getRole());
        } catch (AuthenticationException ex) {
            int attempts=u.getFailedLoginAttempts()+1; u.setFailedLoginAttempts(attempts);
            if (attempts>=5) {
                u.setLockedUntil(Instant.now().plus(Duration.ofMinutes(15)));
                u.setFailedLoginAttempts(0); mail.sendSecurityAlert(u.getEmail());
            }
            users.save(u);
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Transactional
    public String verify(VerifyOtpRequest r) {
        User u = users.findByEmailIgnoreCase(r.email()).orElseThrow(() -> new IllegalArgumentException("Invalid verification request"));
        OtpToken t = otps.findTopByEmailIgnoreCaseAndPurposeAndConsumedFalseOrderByCreatedAtDesc(r.email(), OtpPurpose.REGISTRATION_VERIFICATION)
                .orElseThrow(() -> new IllegalArgumentException("OTP expired or not found"));
        verifyToken(t,r.otp());
        t.setConsumed(true); otps.save(t); u.setVerified(true); users.save(u);
        return "Email verified successfully. You can now log in.";
    }

    public String forgot(ForgotPasswordRequest r) {
        users.findByEmailIgnoreCase(r.email()).ifPresent(u -> issueOtp(u.getEmail(), OtpPurpose.PASSWORD_RESET));
        return "If an account exists for that email, a password reset OTP has been sent.";
    }

    @Transactional
    public String reset(ResetPasswordRequest r) {
        User u=users.findByEmailIgnoreCase(r.email()).orElseThrow(() -> new IllegalArgumentException("Invalid reset request"));
        OtpToken t=otps.findTopByEmailIgnoreCaseAndPurposeAndConsumedFalseOrderByCreatedAtDesc(r.email(), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new IllegalArgumentException("OTP expired or not found"));
        verifyToken(t,r.otp());
        t.setConsumed(true); otps.save(t);
        u.setPasswordHash(encoder.encode(r.newPassword())); u.setFailedLoginAttempts(0); u.setLockedUntil(null); users.save(u);
        return "Password reset successfully.";
    }

    public ProfileResponse profile(String username) {
        User u=get(username);
        return new ProfileResponse(u.getId(),u.getUsername(),u.getName(),u.getEmail(),u.getPhone(),u.getProfilePhotoUrl(),u.getRole(),u.isVerified());
    }

    @Transactional
    public ProfileResponse updateProfile(String username, UpdateProfileRequest r) {
        User u=get(username); u.setName(r.name().trim()); u.setPhone(r.phone()); u.setProfilePhotoUrl(r.profilePhotoUrl()); users.save(u);
        return profile(username);
    }

    @Transactional
    public String changePassword(String username, ChangePasswordRequest r) {
        User u=get(username);
        if (!encoder.matches(r.currentPassword(),u.getPasswordHash())) throw new BadCredentialsException("Current password is incorrect");
        u.setPasswordHash(encoder.encode(r.newPassword())); users.save(u);
        return "Password changed successfully.";
    }

    private User get(String username){ return users.findByUsernameIgnoreCase(username).orElseThrow(); }

    private void checkNewAccount(String username,String email){
        if(users.existsByUsernameIgnoreCase(username)) throw new IllegalArgumentException("Username already exists");
        if(users.existsByEmailIgnoreCase(email)) throw new IllegalArgumentException("Email already registered");
    }

    private void issueOtp(String email, OtpPurpose purpose){
        otps.findTopByEmailIgnoreCaseAndPurposeAndConsumedFalseOrderByCreatedAtDesc(email,purpose).ifPresent(x->{x.setConsumed(true);otps.save(x);});
        String otp=String.format("%06d",random.nextInt(1_000_000));
        OtpToken t=new OtpToken(); t.setEmail(email); t.setCodeHash(encoder.encode(otp)); t.setPurpose(purpose);
        t.setExpiresAt(Instant.now().plus(Duration.ofMinutes(10))); t.setAttempts(0); otps.save(t);
        mail.sendOtp(email,otp,purpose.name());
    }

    private void verifyToken(OtpToken t,String raw){
        if(t.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("OTP expired");
        if(t.getAttempts()>=5) throw new IllegalArgumentException("Too many OTP attempts. Request a new OTP.");
        t.setAttempts(t.getAttempts()+1); otps.save(t);
        if(!encoder.matches(raw,t.getCodeHash())) throw new IllegalArgumentException("Invalid OTP");
    }
}
