package com.church.offering.web;

import com.church.offering.dto.auth.AuthResponse;
import com.church.offering.dto.device.DevicePinRequest;
import com.church.offering.dto.device.DeviceRevokeRequest;
import com.church.offering.dto.device.DeviceTokenView;
import com.church.offering.dto.device.PinLoginRequest;
import com.church.offering.security.UserPrincipal;
import com.church.offering.service.DevicePinService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Code secret de l'application installée (téléphone de confiance). */
@RestController
public class DevicePinController {

    private final DevicePinService devicePinService;

    public DevicePinController(DevicePinService devicePinService) {
        this.devicePinService = devicePinService;
    }

    @PostMapping("/api/my/device-pin")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DeviceTokenView> register(@Valid @RequestBody DevicePinRequest request,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(devicePinService.register(principal, request));
    }

    @PostMapping("/api/auth/pin-login")
    public AuthResponse pinLogin(@Valid @RequestBody PinLoginRequest request) {
        return devicePinService.pinLogin(request);
    }

    @PostMapping("/api/auth/device/revoke")
    public ResponseEntity<Void> revoke(@Valid @RequestBody DeviceRevokeRequest request) {
        devicePinService.revoke(request.deviceToken());
        return ResponseEntity.noContent().build();
    }
}
