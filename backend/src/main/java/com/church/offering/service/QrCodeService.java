package com.church.offering.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.EnumMap;
import java.util.Map;

@Service
public class QrCodeService {

    private static final Logger log = LoggerFactory.getLogger(QrCodeService.class);
    private static final String LOGO_RESOURCE = "assets/rsi-logo.png";
    private static final double LOGO_RATIO = 0.22;
    private static final double BADGE_PADDING = 0.2;

    private final String donationUrl;
    private final int size;

    private volatile byte[] cachedPng;

    public QrCodeService(@Value("${app.qr.donation-url}") String donationUrl,
                         @Value("${app.qr.size:600}") int size) {
        this.donationUrl = donationUrl;
        this.size = size;
    }

    @EventListener(ApplicationReadyEvent.class)
    void warmUp() {
        try {
            churchQrPng();
            log.info("QR code d'offande prêt ({} px, encoded URL : {})", size, donationUrl);
        } catch (RuntimeException ex) {
            log.warn("QR code d'offande non pré-généré : {}", ex.getMessage());
        }
    }

    public String donationUrl() {
        return donationUrl;
    }

    public byte[] churchQrPng() {
        byte[] png = cachedPng;
        if (png == null) {
            synchronized (this) {
                png = cachedPng;
                if (png == null) {
                    png = render();
                    cachedPng = png;
                    log.info("QR code d'offande généré ({} octets)", png.length);
                }
            }
        }
        return png.clone();
    }

    private byte[] render() {
        BufferedImage badge = logoBadge();
        try {
            BufferedImage matrixImage = MatrixToImageWriter.toBufferedImage(encodeMatrix());
            // MatrixToImageWriter renvoie une image 1 bit (noir et blanc) : composer le blason
            // directement dessus le desature, donc on passe par un canevas RVB.
            BufferedImage qr = new BufferedImage(matrixImage.getWidth(), matrixImage.getHeight(),
                    BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = qr.createGraphics();
            try {
                graphics.setColor(Color.WHITE);
                graphics.fillRect(0, 0, qr.getWidth(), qr.getHeight());
                graphics.drawImage(matrixImage, 0, 0, null);
                graphics.drawImage(badge, (size - badge.getWidth()) / 2, (size - badge.getHeight()) / 2, null);
            } finally {
                graphics.dispose();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(qr, "png", out);
            return out.toByteArray();
        } catch (WriterException ex) {
            throw new IllegalStateException("Encodage du QR code impossible", ex);
        } catch (IOException ex) {
            throw new UncheckedIOException("Écriture du QR code impossible", ex);
        }
    }

    private BitMatrix encodeMatrix() throws WriterException {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        return new QRCodeWriter().encode(donationUrl, BarcodeFormat.QR_CODE, size, size, hints);
    }

    private BufferedImage logoBadge() {
        BufferedImage logo = readLogo();
        int maxLogo = (int) Math.round(size * LOGO_RATIO);
        double scale = Math.min(1d, (double) maxLogo / Math.max(logo.getWidth(), logo.getHeight()));
        int logoWidth = Math.max(1, (int) Math.round(logo.getWidth() * scale));
        int logoHeight = Math.max(1, (int) Math.round(logo.getHeight() * scale));
        int padding = Math.max(4, (int) Math.round(maxLogo * BADGE_PADDING));
        int badgeSize = Math.max(logoWidth, logoHeight) + padding;

        BufferedImage badge = new BufferedImage(badgeSize, badgeSize, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = badge.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setColor(Color.WHITE);
            graphics.fillOval(0, 0, badgeSize, badgeSize);
            graphics.drawImage(logo, (badgeSize - logoWidth) / 2, (badgeSize - logoHeight) / 2,
                    logoWidth, logoHeight, null);
        } finally {
            graphics.dispose();
        }
        return badge;
    }

    private BufferedImage readLogo() {
        try (InputStream input = new ClassPathResource(LOGO_RESOURCE).getInputStream()) {
            BufferedImage logo = ImageIO.read(input);
            if (logo == null) {
                throw new IllegalStateException("Logo RSI illisible : " + LOGO_RESOURCE);
            }
            return logo;
        } catch (IOException ex) {
            throw new UncheckedIOException("Logo RSI introuvable : " + LOGO_RESOURCE, ex);
        }
    }
}
