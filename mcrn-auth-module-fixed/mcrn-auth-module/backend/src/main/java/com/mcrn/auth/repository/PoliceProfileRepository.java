package com.mcrn.auth.repository;
import com.mcrn.auth.model.PoliceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PoliceProfileRepository extends JpaRepository<PoliceProfile, Long> {
    boolean existsByOfficialIdIgnoreCase(String officialId);
    Optional<PoliceProfile> findByUserId(Long userId);
}
