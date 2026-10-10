package com.church.offering.dto.device;

import jakarta.validation.constraints.NotBlank;

public record DeviceRevokeRequest(@NotBlank String deviceToken) {
}
