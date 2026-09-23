package com.church.offering.dto.contribution;

import com.church.offering.model.Contribution;
import com.church.offering.model.enums.PaymentMethod;
import com.church.offering.model.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContributionView(
        Long id,
        String reference,
        BigDecimal amount,
        String currencyCode,
        PaymentMethod paymentMethod,
        PaymentStatus status,
        Long templeId,
        String templeName,
        Long offeringTypeId,
        String offeringTypeCode,
        String offeringTypeLabel,
        Long memberId,
        String memberFullName,
        String donorName,
        String donorPhone,
        String note,
        LocalDateTime paidAt,
        LocalDateTime createdAt) {

    public static ContributionView from(Contribution contribution) {
        return new ContributionView(
                contribution.getId(),
                contribution.getReference(),
                contribution.getAmount(),
                contribution.getCurrencyCode(),
                contribution.getPaymentMethod(),
                contribution.getStatus(),
                contribution.getTemple().getId(),
                contribution.getTemple().getName(),
                contribution.getOfferingType().getId(),
                contribution.getOfferingType().getCode(),
                contribution.getOfferingType().getLabel(),
                contribution.getMember() != null ? contribution.getMember().getId() : null,
                contribution.getMember() != null ? contribution.getMember().getFullName() : null,
                contribution.getDonorName(),
                contribution.getDonorPhone(),
                contribution.getNote(),
                contribution.getPaidAt(),
                contribution.getCreatedAt());
    }
}
