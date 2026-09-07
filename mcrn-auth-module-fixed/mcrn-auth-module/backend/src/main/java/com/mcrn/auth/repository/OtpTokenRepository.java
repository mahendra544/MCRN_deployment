package com.mcrn.auth.repository;

import com.mcrn.auth.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailIgnoreCaseAndPurposeAndConsumedFalseOrderByCreatedAtDesc(String email, OtpPurpose purpose);
}
