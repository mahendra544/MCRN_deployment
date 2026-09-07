package com.mcrn.auth.controller;

import com.mcrn.auth.exception.EmailNotVerifiedException;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e){
        Map<String,String> errors=new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(x->errors.put(x.getField(),x.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("success",false,"message","Validation failed","errors",errors));
    }
    @ExceptionHandler(EmailNotVerifiedException.class)
    ResponseEntity<?> emailNotVerified(EmailNotVerifiedException e){
        return ResponseEntity.status(403).body(Map.of(
                "success",false,"message","EMAIL_NOT_VERIFIED","email",e.getEmail()));
    }
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    ResponseEntity<?> business(RuntimeException e){
        return ResponseEntity.status(400).body(Map.of("success",false,"message",e.getMessage()));
    }
    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<?> credentials(BadCredentialsException e){
        return ResponseEntity.status(401).body(Map.of("success",false,"message",e.getMessage()));
    }
}
