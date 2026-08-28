package com.mcrn.auth.notification;

public record SendNotificationRequest(
        Long recipientUserId,
        Long caseId,
        String notificationType,
        String message
) {
}