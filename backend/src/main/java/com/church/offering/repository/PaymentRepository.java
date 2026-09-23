package com.church.offering.repository;

import com.church.offering.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByContributionId(Long contributionId);

    Optional<Payment> findByProviderTransactionId(String providerTransactionId);
}