package com.church.offering.dto.account;

import com.church.offering.model.enums.PaymentProvider;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record MemberDonationRequest(

        @NotNull(message = "Le type d'offrande est requis")
        Long offeringTypeId,

        @NotNull(message = "Le montant est requis")
        @DecimalMin(value = "1.00", message = "Le montant doit être supérieur à 0")
        BigDecimal amount,

        @NotNull(message = "Le moyen de paiement est requis")
        PaymentProvider paymentProvider) {
}
