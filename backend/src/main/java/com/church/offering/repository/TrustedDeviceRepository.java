package com.church.offering.repository;

import com.church.offering.model.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Long> {

    Optional<TrustedDevice> findByTokenHash(String tokenHash);
}
