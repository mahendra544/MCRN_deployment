package com.mcrn.auth.notification;

import com.mcrn.auth.model.User;
import com.mcrn.auth.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository) {

        this.notificationService =
                notificationService;

        this.userRepository =
                userRepository;
    }

    // =========================================================
    // CURRENT LOGGED-IN USER
    // =========================================================

    private User currentUser(
            Authentication authentication) {

        return userRepository
                .findByUsernameIgnoreCase(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        ));
    }

    // =========================================================
    // VIEW MY NOTIFICATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<NotificationResponse>>
    getMyNotifications(
            Authentication authentication) {

        User user = currentUser(authentication);

        return ResponseEntity.ok(
                notificationService.getNotifications(
                        user.getId()
                )
        );
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>>
    getUnreadCount(
            Authentication authentication) {

        User user = currentUser(authentication);

        long count =
                notificationService
                        .getUnreadCount(user.getId());

        return ResponseEntity.ok(
                Map.of(
                        "unreadCount",
                        count
                )
        );
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, String>>
    markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        User user = currentUser(authentication);

        notificationService.markAsRead(
                notificationId,
                user.getId()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Notification marked as read"
                )
        );
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>>
    markAllAsRead(
            Authentication authentication) {

        User user = currentUser(authentication);

        notificationService.markAllAsRead(
                user.getId()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "All notifications marked as read"
                )
        );
    }

    // =========================================================
    // GET USERS WHO CAN RECEIVE NOTIFICATIONS
    // POLICE + ADMIN ONLY
    // =========================================================

    @GetMapping("/recipients")
    @PreAuthorize("hasAnyRole('POLICE', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>>
    getRecipients() {

        List<Map<String, Object>> recipients =
                notificationService
                        .getUserRecipients()
                        .stream()
                        .map(user ->
                                Map.<String, Object>of(
                                        "id",
                                        user.getId(),

                                        "username",
                                        user.getUsername(),

                                        "name",
                                        user.getName(),

                                        "role",
                                        user.getRole().name()
                                )
                        )
                        .toList();

        return ResponseEntity.ok(recipients);
    }

    // =========================================================
    // SEND NOTIFICATION
    // POLICE + ADMIN ONLY
    // =========================================================

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('POLICE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>>
    sendNotification(
            @RequestBody SendNotificationRequest request,
            Authentication authentication) {

        User sender =
                currentUser(authentication);

        Notification notification =
                notificationService.sendNotification(
                        sender.getId(),
                        request.recipientUserId(),
                        request.caseId(),
                        request.notificationType(),
                        request.message()
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Notification sent successfully",

                        "notificationId",
                        notification.getId()
                )
        );
    }
}