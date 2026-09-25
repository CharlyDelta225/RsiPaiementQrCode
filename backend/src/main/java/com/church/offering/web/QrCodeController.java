package com.church.offering.web;

import com.church.offering.service.QrCodeService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/qr")
public class QrCodeController {

    public static final String PAYLOAD_HEADER = "X-Qr-Payload";

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping(value = "/church", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> church() {
        byte[] png = qrCodeService.churchQrPng();
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .contentLength(png.length)
                .header(PAYLOAD_HEADER, qrCodeService.donationUrl())
                .cacheControl(CacheControl.maxAge(Duration.ofHours(24)).cachePublic().immutable())
                .body(png);
    }
}
