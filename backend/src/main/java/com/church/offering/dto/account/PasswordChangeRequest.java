package com.church.offering.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(

        @NotBlank(message = "Le mot de passe actuel est requis")
        String currentPassword,

        @NotBlank(message = "Le nouveau mot de passe est requis")
        @Size(min = 8, max = 72, message = "Le mot de passe doit contenir entre 8 et 72 caractères")
        String newPassword) {
}
