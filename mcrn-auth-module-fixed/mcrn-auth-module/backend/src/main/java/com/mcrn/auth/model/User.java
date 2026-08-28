package com.mcrn.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name="users", uniqueConstraints = {
        @UniqueConstraint(name="uk_users_username", columnNames="username"),
        @UniqueConstraint(name="uk_users_email", columnNames="email")
})
@Getter @Setter @NoArgsConstructor
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=50)
    private String username;

    @Column(nullable=false, length=100)
    private String name;

    @Column(nullable=false, length=160)
    private String email;

    @Column(nullable=false, length=100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=20)
    private Role role;

    @Column(nullable=false)
    private boolean verified = false;

    @Column(nullable=false)
    private boolean active = true;

    @Column(nullable=false)
    private int failedLoginAttempts = 0;

    private Instant lockedUntil;
    private String phone;
    private String profilePhotoUrl;
    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist void prePersist() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void preUpdate() { updatedAt = Instant.now(); }
}
