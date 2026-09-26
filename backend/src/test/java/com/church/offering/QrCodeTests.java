package com.church.offering;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class QrCodeTests {

    @Autowired
    private MockMvc mockMvc;

    @Value("${app.qr.donation-url}")
    private String donationUrl;

    @Test
    void qrCodePublicEtDecodable() throws Exception {
        byte[] png = qrPng();

        assertThat(png.length).isGreaterThan(1000);
        assertThat(png[0] & 0xFF).isEqualTo(0x89);
        assertThat(new String(png, 1, 3, StandardCharsets.US_ASCII)).isEqualTo("PNG");
        assertThat(decode(png)).isEqualTo(donationUrl);
    }

    @Test
    void blasonRsiEnCouleurEtLimiteAuRatioDuLogo() throws Exception {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(qrPng()));
        int width = image.getWidth();
        int minX = width;
        int minY = image.getHeight();
        int maxX = -1;
        int maxY = -1;
        int colored = 0;
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < width; x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                if (Math.max(r, Math.max(g, b)) - Math.min(r, Math.min(g, b)) <= 25) {
                    continue;
                }
                colored++;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }

        assertThat(colored).as("pixels colores du blason (le logo doit etre en couleur)").isGreaterThan(500);
        int logoWidth = maxX - minX + 1;
        int logoHeight = maxY - minY + 1;
        int maxLogo = Math.round(width * 0.22f);
        assertThat(Math.max(logoWidth, logoHeight))
                .as("blason %d x %d px pour un QR de %d px (plafond %d px)", logoWidth, logoHeight, width, maxLogo)
                .isLessThanOrEqualTo(maxLogo + 1);
        assertThat(Math.abs((minX + maxX) / 2 - width / 2)).as("blason centre horizontalement").isLessThanOrEqualTo(2);
        assertThat(Math.abs((minY + maxY) / 2 - image.getHeight() / 2)).as("blason centre verticalement")
                .isLessThanOrEqualTo(2);
    }

    private byte[] qrPng() throws Exception {
        return mockMvc.perform(get("/api/qr/church"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.IMAGE_PNG))
                .andExpect(header().string("X-Qr-Payload", donationUrl))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
    }

    private String decode(byte[] png) throws Exception {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(png));
        assertThat(image).as("image PNG renvoyée").isNotNull();
        Result result = new MultiFormatReader()
                .decode(new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(image))));
        return result.getText();
    }
}
