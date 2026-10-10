package com.church.offering.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(

        @NotBlank(message = "Le prénom est requis")
        @Size(max = 80, message = "Prénom trop long")
        String firstName,

        @NotBlank(message = "Le nom est requis")
        @Size(max = 80, message = "Nom trop long")
        String lastName,

        @NotBlank(message = "Le téléphone est requis")
        @Pattern(regexp = "^[+0-9 ]{8,20}$", message = "Numéro de téléphone invalide")
        String phone) {
}
