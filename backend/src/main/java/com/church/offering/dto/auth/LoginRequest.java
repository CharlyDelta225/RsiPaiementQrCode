package com.church.offering.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "L'email est requis")
        @Email(message = "Email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est requis")
        String password) {
}