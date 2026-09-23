package com.church.offering.dto.temple;

import com.church.offering.model.Temple;

public record TempleView(
        Long id,
        String name,
        String city,
        String address,
        Long churchId,
        String churchName,
        boolean active) {

    public static TempleView from(Temple temple) {
        return new TempleView(
                temple.getId(),
                temple.getName(),
                temple.getCity(),
                temple.getAddress(),
                temple.getChurch().getId(),
                temple.getChurch().getName(),
                temple.isActive());
    }
}