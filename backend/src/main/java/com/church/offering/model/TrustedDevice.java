package com.church.offering.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Téléphone (application installée) sur lequel l'utilisateur a défini un code secret.
 * Le téléphone garde une clé d'appareil aléatoire ; on n'en stocke que l'empreinte SHA-256.
 * Le code secret est haché (BCrypt) : il n'est valable qu'avec la clé de cet appareil.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "trusted_devices")
public class TrustedDevice extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false, length = 100)
    private String pinHash;

    @Column(nullable = false)
    private int failedAttempts;

    @Column(nullable = false)
    private boolean revoked;

    private LocalDateTime lastUsedAt;
}
