package com.church.offering.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PinLoginRequest(

        @NotBlank(message = "Appareil inconnu")
        String deviceToken,

        @NotBlank(message = "Le code est requis")
        @Pattern(regexp = "^[0-9]{4}$", message = "Le code doit contenir exactement 4 chiffres")
        String pin) {
}
