package com.church.offering.repository;

import com.church.offering.model.Contribution;
import com.church.offering.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {

    Optional<Contribution> findByReference(String reference);

    boolean existsByReference(String reference);

    List<Contribution> findByStatus(PaymentStatus status);

    List<Contribution> findByMemberId(Long memberId);

    List<Contribution> findByMemberIdOrderByPaidAtDesc(Long memberId);

    List<Contribution> findByTempleId(Long templeId);

    @Query("select c from Contribution c " +
            "where (:templeId is null or c.temple.id = :templeId) " +
            "and (:offeringTypeId is null or c.offeringType.id = :offeringTypeId) " +
            "and (:status is null or c.status = :status) " +
            "and (:from is null or c.paidAt >= :from) " +
            "and (:to is null or c.paidAt <= :to) " +
            "and (:search is null or :search = '' " +
            "or lower(c.reference) like lower(concat('%', :search, '%')) " +
            "or lower(c.donorName) like lower(concat('%', :search, '%')) " +
            "or lower(c.donorPhone) like lower(concat('%', :search, '%'))) " +
            "order by c.paidAt desc")
    List<Contribution> search(@Param("search") String search,
                              @Param("templeId") Long templeId,
                              @Param("offeringTypeId") Long offeringTypeId,
                              @Param("status") PaymentStatus status,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to);

    @Query("select coalesce(sum(c.amount), 0) from Contribution c where c.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("select coalesce(sum(c.amount), 0) from Contribution c " +
            "where c.temple.id = :templeId and c.status = :status")
    BigDecimal sumAmountByTempleAndStatus(@Param("templeId") Long templeId,
                                          @Param("status") PaymentStatus status);
}