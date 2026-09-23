package com.church.offering.dto.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MemberRequest(
        @NotBlank(message = "Le nom complet est requis")
        @Size(max = 120)
        String fullName,

        @NotBlank(message = "Le téléphone est requis")
        @Pattern(regexp = "^[+0-9 ]{8,20}$", message = "Numéro de téléphone invalide")
        String phone,

        @Email(message = "Email invalide")
        @Size(max = 150)
        String email,

        @NotNull(message = "Le temple est requis")
        Long templeId,

        boolean active) {
}