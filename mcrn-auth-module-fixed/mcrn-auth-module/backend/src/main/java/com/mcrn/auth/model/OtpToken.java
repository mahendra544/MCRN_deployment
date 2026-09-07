package com.mcrn.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name="otp_tokens", indexes = {
        @Index(name="idx_otp_lookup", columnList="email,purpose,consumed")
})
@Getter @Setter @NoArgsConstructor
public class OtpToken {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=160)
    private String email;

    @Column(nullable=false, length=100)
    private String codeHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=40)
    private OtpPurpose purpose;

    @Column(nullable=false)
    private Instant expiresAt;

    @Column(nullable=false)
    private boolean consumed = false;

    @Column(nullable=false)
    private int attempts = 0;

    private Instant createdAt;
    private Instant lastSentAt;

    @PrePersist void prePersist() {
        createdAt = Instant.now();
        if (lastSentAt == null) lastSentAt = createdAt;
    }
}
