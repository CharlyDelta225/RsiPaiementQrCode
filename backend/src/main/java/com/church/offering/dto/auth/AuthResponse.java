package com.church.offering.dto.auth;

public record AuthResponse(String token, UserView user) {
}