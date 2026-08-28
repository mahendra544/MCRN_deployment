package com.mcrn.auth.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="police_profiles", uniqueConstraints =
        @UniqueConstraint(name="uk_police_official_id", columnNames="official_id"))
@Getter @Setter @NoArgsConstructor
public class PoliceProfile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;

    @Column(name="official_id", nullable=false, length=80)
    private String officialId;
}
