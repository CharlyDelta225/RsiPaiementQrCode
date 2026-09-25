package com.church.offering.dto.publicdonation;

import com.church.offering.model.enums.PaymentProvider;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PublicContributionRequest(

        @NotNull(message = "Le type d'offrande est requis")
        Long offeringTypeId,

        @NotNull(message = "Le montant est requis")
        @DecimalMin(value = "1.00", message = "Le montant doit être supérieur à 0")
        BigDecimal amount,

        @NotNull(message = "Le moyen de paiement est requis")
        PaymentProvider paymentProvider,

        @Size(max = 120, message = "Nom du donateur trop long")
        String donorName,

        @Pattern(regexp = "^[+0-9 ]{8,20}$", message = "Numéro de téléphone invalide")
        @Size(max = 20, message = "Numéro de téléphone trop long")
        String donorPhone) {
}
