package com.church.offering.dto.auth;

import com.church.offering.model.Temple;
import com.church.offering.model.User;
import com.church.offering.model.enums.Role;

public record UserView(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Role role,
        Long templeId,
        String templeName,
        boolean active) {

    public static UserView from(User user) {
        Temple temple = user.getTemple();
        return new UserView(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                temple != null ? temple.getId() : null,
                temple != null ? temple.getName() : null,
                user.isActive());
    }
}