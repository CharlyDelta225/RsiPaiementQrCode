package com.church.offering.dto.publicdonation;

import com.church.offering.model.OfferingType;

public record PublicOfferingTypeView(
        Long id,
        String code,
        String label,
        String description,
        String blessingText,
        String blessingRef) {

    public static PublicOfferingTypeView from(OfferingType offeringType) {
        return new PublicOfferingTypeView(
                offeringType.getId(),
                offeringType.getCode(),
                offeringType.getLabel(),
                offeringType.getDescription(),
                offeringType.getBlessingText(),
                offeringType.getBlessingRef());
    }
}
