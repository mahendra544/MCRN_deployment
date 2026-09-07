package com.mcrn.auth.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
    findByUserIdOrderBySentAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);
}