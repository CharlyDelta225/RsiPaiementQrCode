package com.church.offering.repository;

import com.church.offering.model.Church;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChurchRepository extends JpaRepository<Church, Long> {
}