package com.church.offering.dto.user;

import com.church.offering.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StaffRequest(
        @NotBlank(message = "L'email est requis")
        @Email(message = "Email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est requis")
        @Size(min = 8, max = 72, message = "Le mot de passe doit contenir entre 8 et 72 caractères")
        String password,

        @NotBlank(message = "Le prénom est requis")
        @Size(max = 80)
        String firstName,

        @NotBlank(message = "Le nom est requis")
        @Size(max = 80)
        String lastName,

        @NotBlank(message = "Le téléphone est requis")
        @Pattern(regexp = "^[+0-9 ]{8,20}$", message = "Numéro de téléphone invalide")
        String phone,

        @NotNull(message = "Le rôle est requis")
        Role role,

        Long templeId) {
}