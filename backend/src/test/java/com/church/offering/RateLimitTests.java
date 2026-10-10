package com.church.offering;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.rate-limit.enabled=true",
        "app.rate-limit.login-per-minute=3",
        "app.rate-limit.public-per-minute=2"
})
@AutoConfigureMockMvc
class RateLimitTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void connexionBloqueeAuDelaDuSeuilParIp() throws Exception {
        String body = "{\"email\":\"inconnu@rsi.local\",\"password\":\"mauvais-mdp\"}";
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login").with(ip("10.0.0.1"))
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/auth/login").with(ip("10.0.0.1"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429));

        // Une autre IP n'est pas pénalisée.
        mockMvc.perform(post("/api/auth/login").with(ip("10.0.0.2"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void donPublicLimiteMaisLecturesLibres() throws Exception {
        String body = "{\"offeringTypeId\":1,\"amount\":1000,\"paymentProvider\":\"WAVE\"}";
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/public/contributions").with(ip("10.0.0.3"))
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated());
        }
        mockMvc.perform(post("/api/public/contributions").with(ip("10.0.0.3"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests());

        // Les GET (types d'offrande, QR) ne sont jamais limités.
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/api/public/offering-types").with(ip("10.0.0.3")))
                    .andExpect(status().isOk());
        }
    }

    private static org.springframework.test.web.servlet.request.RequestPostProcessor ip(String address) {
        return request -> {
            request.setRemoteAddr(address);
            return request;
        };
    }
}
