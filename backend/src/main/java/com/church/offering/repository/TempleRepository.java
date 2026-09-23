package com.church.offering.repository;

import com.church.offering.model.Temple;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TempleRepository extends JpaRepository<Temple, Long> {

    List<Temple> findByChurchIdAndActiveTrue(Long churchId);

    boolean existsByChurchIdAndName(Long churchId, String name);

    boolean existsByChurchIdAndNameAndIdNot(Long churchId, String name, Long id);
}