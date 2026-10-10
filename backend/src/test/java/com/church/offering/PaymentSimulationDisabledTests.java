package com.church.offering;

import com.church.offering.repository.ContributionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Simulation coupée (production sans agrégateur) : aucun don ne peut être marqué payé. */
@SpringBootTest(properties = "app.payment.simulation-enabled=false")
@AutoConfigureMockMvc
class PaymentSimulationDisabledTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContributionRepository contributionRepository;

    @Test
    void donPublicRefuseSansLaisserDeContributionOrpheline() throws Exception {
        long before = contributionRepository.count();

        mockMvc.perform(post("/api/public/contributions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"offeringTypeId\":1,\"amount\":1000,\"paymentProvider\":\"WAVE\"}"))
                .andExpect(status().isServiceUnavailable());

        assertThat(contributionRepository.count()).isEqualTo(before);
    }

    @Test
    void donMembreRefuse() throws Exception {
        String token = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"membre@rsi.local\",\"password\":\"Membre@12345\"}"))
                .andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(post("/api/my/donations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"offeringTypeId\":1,\"amount\":1000,\"paymentProvider\":\"WAVE\"}"))
                .andExpect(status().isServiceUnavailable());
    }
}
