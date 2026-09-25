package com.church.offering.dto.publicdonation;

import com.church.offering.model.Contribution;
import com.church.offering.model.Payment;
import com.church.offering.model.Receipt;
import com.church.offering.model.enums.PaymentMethod;
import com.church.offering.model.enums.PaymentProvider;
import com.church.offering.model.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PublicContributionView(
        Long contributionId,
        String reference,
        BigDecimal amount,
        String currencyCode,
        PaymentMethod paymentMethod,
        PaymentProvider paymentProvider,
        boolean paymentSimulated,
        PaymentStatus status,
        Long offeringTypeId,
        String offeringTypeCode,
        String offeringTypeLabel,
        String blessingText,
        String blessingRef,
        LocalDateTime paidAt,
        ReceiptView receipt) {

    public record ReceiptView(String receiptNumber, String verificationToken, LocalDateTime issuedAt) {
    }

    public static PublicContributionView from(Contribution contribution, Payment payment, Receipt receipt) {
        return new PublicContributionView(
                contribution.getId(),
                contribution.getReference(),
                contribution.getAmount(),
                contribution.getCurrencyCode(),
                contribution.getPaymentMethod(),
                payment.getProvider(),
                payment.isSimulated(),
                contribution.getStatus(),
                contribution.getOfferingType().getId(),
                contribution.getOfferingType().getCode(),
                contribution.getOfferingType().getLabel(),
                contribution.getOfferingType().getBlessingText(),
                contribution.getOfferingType().getBlessingRef(),
                contribution.getPaidAt(),
                receipt == null ? null : new ReceiptView(
                        receipt.getReceiptNumber(),
                        receipt.getVerificationToken(),
                        receipt.getCreatedAt()));
    }
}
