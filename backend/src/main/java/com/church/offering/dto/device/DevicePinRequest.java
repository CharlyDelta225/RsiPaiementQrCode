package com.church.offering.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Création ou changement du code secret de l'appareil (utilisateur déjà connecté). */
public record DevicePinRequest(

        @NotBlank(message = "Le code est requis")
        @Pattern(regexp = "^[0-9]{4}$", message = "Le code doit contenir exactement 4 chiffres")
        String pin,

        /** Clé de l'appareil actuel à remplacer (changement de code), facultative. */
        String replaceDeviceToken) {
}
