package com.church.offering.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, Duration expiration) {

    public long expirationMillis() {
        return expiration == null ? 0 : expiration.toMillis();
    }
}