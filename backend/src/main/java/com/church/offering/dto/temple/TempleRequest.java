package com.church.offering.dto.temple;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TempleRequest(
        @NotBlank(message = "Le nom du temple est requis")
        @Size(max = 120)
        String name,

        @Size(max = 120)
        String city,

        @Size(max = 255)
        String address,

        boolean active) {
}