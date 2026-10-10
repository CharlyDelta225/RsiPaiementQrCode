package com.church.offering.service;

import com.church.offering.dto.auth.AuthResponse;
import com.church.offering.dto.auth.UserView;
import com.church.offering.dto.device.DevicePinRequest;
import com.church.offering.dto.device.DeviceTokenView;
import com.church.offering.dto.device.PinLoginRequest;
import com.church.offering.model.TrustedDevice;
import com.church.offering.model.User;
import com.church.offering.repository.TrustedDeviceRepository;
import com.church.offering.repository.UserRepository;
import com.church.offering.security.JwtService;
import com.church.offering.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Code secret à 4 chiffres de l'application installée : remplace email + mot de passe
 * sur un téléphone de confiance. Après 5 codes faux, l'appareil est révoqué.
 */
@Service
public class DevicePinService {

    static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final TrustedDeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public DevicePinService(TrustedDeviceRepository deviceRepository,
                            UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService) {
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /** Enregistre ce téléphone avec son code (et révoque l'ancienne clé en cas de changement). */
    @Transactional
    public DeviceTokenView register(UserPrincipal principal, DevicePinRequest request) {
        if (isTooSimple(request.pin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Code trop simple : évitez les chiffres identiques ou qui se suivent");
        }
        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session invalide"));

        if (request.replaceDeviceToken() != null && !request.replaceDeviceToken().isBlank()) {
            deviceRepository.findByTokenHash(hash(request.replaceDeviceToken()))
                    .filter(device -> device.getUser().getId().equals(user.getId()))
                    .ifPresent(device -> device.setRevoked(true));
        }

        String token = newToken();
        TrustedDevice device = new TrustedDevice();
        device.setUser(user);
        device.setTokenHash(hash(token));
        device.setPinHash(passwordEncoder.encode(request.pin()));
        deviceRepository.save(device);
        return new DeviceTokenView(token);
    }

    /**
     * Déverrouillage par code. Les erreurs ne doivent pas annuler le compteur d'essais :
     * la transaction est conservée malgré l'exception renvoyée au client.
     */
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthResponse pinLogin(PinLoginRequest request) {
        TrustedDevice device = deviceRepository.findByTokenHash(hash(request.deviceToken()))
                .filter(d -> !d.isRevoked() && d.getUser().isActive())
                .orElseThrow(DevicePinService::deviceLocked);

        if (!passwordEncoder.matches(request.pin(), device.getPinHash())) {
            device.setFailedAttempts(device.getFailedAttempts() + 1);
            if (device.getFailedAttempts() >= MAX_ATTEMPTS) {
                device.setRevoked(true);
                throw new ResponseStatusException(HttpStatus.LOCKED,
                        "Trop de codes incorrects. Reconnectez-vous avec votre email et votre mot de passe.");
            }
            int remaining = MAX_ATTEMPTS - device.getFailedAttempts();
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Code incorrect. Il vous reste " + remaining + (remaining > 1 ? " essais." : " essai."));
        }

        device.setFailedAttempts(0);
        device.setLastUsedAt(LocalDateTime.now());
        User user = device.getUser();
        return new AuthResponse(jwtService.generateToken(new UserPrincipal(user)), UserView.from(user));
    }

    /** « Code oublié » ou déconnexion : la clé de ce téléphone n'ouvre plus rien. */
    @Transactional
    public void revoke(String deviceToken) {
        deviceRepository.findByTokenHash(hash(deviceToken)).ifPresent(device -> device.setRevoked(true));
    }

    static boolean isTooSimple(String pin) {
        boolean allSame = pin.chars().distinct().count() == 1;
        boolean ascending = true;
        boolean descending = true;
        for (int i = 1; i < pin.length(); i++) {
            int diff = pin.charAt(i) - pin.charAt(i - 1);
            ascending &= diff == 1;
            descending &= diff == -1;
        }
        return allSame || ascending || descending;
    }

    private static ResponseStatusException deviceLocked() {
        return new ResponseStatusException(HttpStatus.LOCKED,
                "Le code secret n'est plus actif sur ce téléphone. Reconnectez-vous avec votre email.");
    }

    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponible", ex);
        }
    }
}
