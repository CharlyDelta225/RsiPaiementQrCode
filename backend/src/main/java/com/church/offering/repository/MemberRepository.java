package com.church.offering.repository;

import com.church.offering.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByPhone(String phone);

    Optional<Member> findByUser_Id(Long userId);

    boolean existsByPhone(String phone);

    List<Member> findByFullNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrderByFullNameAsc(
            String fullName, String phone);

    List<Member> findByTempleIdOrderByFullNameAsc(Long templeId);

    List<Member> findAllByOrderByFullNameAsc();

    List<Member> findByActiveTrueOrderByFullNameAsc();
}