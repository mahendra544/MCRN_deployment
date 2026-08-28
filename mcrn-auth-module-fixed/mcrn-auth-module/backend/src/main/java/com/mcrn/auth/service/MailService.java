package com.mcrn.auth.service;

import org.springframework.beans.factory.annotation.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    private final JavaMailSender sender;
    private final String username;

    public MailService(JavaMailSender sender, @Value("${spring.mail.username:}") String username) {
        this.sender=sender; this.username=username;
    }

    public void sendOtp(String to, String otp, String purpose) {
        if (username == null || username.isBlank()) {
            System.out.println("[MCRN DEV] OTP for " + to + " (" + purpose + "): " + otp);
            return;
        }
        SimpleMailMessage m = new SimpleMailMessage();
        m.setTo(to);
        m.setSubject("MCRN - " + (purpose.equals("PASSWORD_RESET") ? "Password Reset OTP" : "Email Verification"));
        m.setText("Your MCRN OTP is " + otp + ". It expires in 10 minutes. Do not share this code.");
        sender.send(m);
    }

    public void sendSecurityAlert(String to) {
        if (username == null || username.isBlank()) return;
        SimpleMailMessage m = new SimpleMailMessage();
        m.setTo(to); m.setSubject("MCRN Security Alert");
        m.setText("There were multiple failed login attempts on your MCRN account. If this was not you, reset your password.");
        sender.send(m);
    }
}
