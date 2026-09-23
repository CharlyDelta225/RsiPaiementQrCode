package com.church.offering.dto.contribution;

import com.church.offering.model.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ContributionRequest(

        @NotNull(message = "Le temple est requis")
        Long templeId,

        @NotNull(message = "Le type d'offrande est requis")
        Long offeringTypeId,

        @NotNull(message = "Le montant est requis")
        @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
        BigDecimal amount,

        @Size(max = 3, message = "Code devise invalide")
        String currencyCode,

        PaymentMethod paymentMethod,

        Long memberId,

        @Size(max = 120, message = "Nom du donateur trop long")
        String donorName,

        @Pattern(regexp = "^[+0-9 ]{8,20}$", message = "Numéro de téléphone invalide")
        @Size(max = 20)
        String donorPhone,

        @Size(max = 1000, message = "Note trop longue")
        String note) {
}
