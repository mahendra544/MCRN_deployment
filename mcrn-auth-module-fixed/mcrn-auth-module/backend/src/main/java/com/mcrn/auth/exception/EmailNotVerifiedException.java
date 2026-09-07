package com.mcrn.auth.exception;

/**
 * Thrown when a user with valid credentials tries to log in before verifying
 * their email. Carries the account's email so the frontend can send the user
 * straight to the OTP verification screen with the correct address prefilled
 * — the username alone is not guaranteed to be a valid email address.
 */
public class EmailNotVerifiedException extends RuntimeException {
    private final String email;

    public EmailNotVerifiedException(String email) {
        super("EMAIL_NOT_VERIFIED");
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
