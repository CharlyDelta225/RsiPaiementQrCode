package com.church.offering.repository;

import com.church.offering.model.OfferingType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OfferingTypeRepository extends JpaRepository<OfferingType, Long> {

    Optional<OfferingType> findByCode(String code);

    List<OfferingType> findByActiveTrueOrderBySortOrderAsc();
}