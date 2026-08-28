package com.mcrn.auth.notification;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        Long userId,
        Long senderUserId,
        String senderName,
        String senderRole,
        Long caseId,
        String notificationType,
        String message,
        boolean read,
        Instant sentAt
) {

    public static NotificationResponse from(
            Notification notification,
            String senderName,
            String senderRole) {

        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getSenderUserId(),
                senderName,
                senderRole,
                notification.getCaseId(),
                notification.getNotificationType(),
                notification.getMessage(),
                notification.isRead(),
                notification.getSentAt()
        );
    }
}