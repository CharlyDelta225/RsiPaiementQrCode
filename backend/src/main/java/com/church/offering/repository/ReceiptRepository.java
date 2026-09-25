package com.church.offering.repository;

import com.church.offering.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByReceiptNumber(String receiptNumber);

    boolean existsByReceiptNumber(String receiptNumber);

    Optional<Receipt> findByContributionId(Long contributionId);

    Optional<Receipt> findByVerificationToken(String verificationToken);
}