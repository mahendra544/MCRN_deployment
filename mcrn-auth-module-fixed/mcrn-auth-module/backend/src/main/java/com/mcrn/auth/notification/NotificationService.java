package com.mcrn.auth.notification;

import com.mcrn.auth.model.User;
import com.mcrn.auth.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository repository,
            UserRepository userRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // VIEW NOTIFICATIONS
    // =========================================================

    public List<NotificationResponse> getNotifications(
            Long userId) {

        return repository
                .findByUserIdOrderBySentAtDesc(userId)
                .stream()
                .map(notification -> {

                    String senderName = null;
                    String senderRole = "SYSTEM";

                    if (notification.getSenderUserId() != null) {

                        User sender = userRepository
                                .findById(
                                        notification.getSenderUserId()
                                )
                                .orElse(null);

                        if (sender != null) {
                            senderName = sender.getName();
                            senderRole =
                                    sender.getRole().name();
                        }
                    }

                    return NotificationResponse.from(
                            notification,
                            senderName,
                            senderRole
                    );
                })
                .toList();
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    public long getUnreadCount(Long userId) {

        return repository
                .countByUserIdAndReadFalse(userId);
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Transactional
    public void markAsRead(
            Long notificationId,
            Long userId) {

        Notification notification =
                repository.findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                ));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You cannot access this notification"
            );
        }

        notification.setRead(true);
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Transactional
    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                repository
                        .findByUserIdOrderBySentAtDesc(userId);

        notifications.forEach(
                notification ->
                        notification.setRead(true)
        );
    }

    // =========================================================
    // SYSTEM-GENERATED NOTIFICATION
    // =========================================================

    @Transactional
    public Notification createNotification(
            Long userId,
            Long caseId,
            String notificationType,
            String message) {

        Notification notification =
                new Notification();

        notification.setUserId(userId);

        // NULL means system generated.
        notification.setSenderUserId(null);

        notification.setCaseId(caseId);

        notification.setNotificationType(
                notificationType
        );

        notification.setMessage(message);

        notification.setRead(false);

        notification.setSentAt(Instant.now());

        return repository.save(notification);
    }

    // =========================================================
    // POLICE / ADMIN SEND NOTIFICATION
    // =========================================================

    @Transactional
    public Notification sendNotification(
            Long senderUserId,
            Long recipientUserId,
            Long caseId,
            String notificationType,
            String message) {

        User sender = userRepository
                .findById(senderUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Sender not found"
                        ));

        User recipient = userRepository
                .findById(recipientUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Recipient not found"
                        ));

        // Only POLICE and ADMIN can manually
        // send notifications.
        if (sender.getRole().name().equals("USER")) {
            throw new IllegalArgumentException(
                    "Users cannot send notifications"
            );
        }

        // For your current requirement, manual
        // notifications are sent to USER accounts.
        if (!recipient.getRole().name().equals("USER")) {
            throw new IllegalArgumentException(
                    "Notifications can currently be sent only to users"
            );
        }

        if (message == null ||
                message.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Notification message is required"
            );
        }

        Notification notification =
                new Notification();

        notification.setUserId(recipientUserId);

        notification.setSenderUserId(senderUserId);

        notification.setCaseId(caseId);

        notification.setNotificationType(
                notificationType
        );

        notification.setMessage(
                message.trim()
        );

        notification.setRead(false);

        notification.setSentAt(Instant.now());

        return repository.save(notification);
    }

    // =========================================================
    // USERS AVAILABLE AS RECIPIENTS
    // =========================================================

    public List<User> getUserRecipients() {

        return userRepository
                .findAll()
                .stream()
                .filter(User::isActive)
                .filter(user ->
                        user.getRole().name().equals("USER"))
                .toList();
    }
}