package com.church.offering;

import com.church.offering.model.Payment;
import com.church.offering.model.enums.PaymentProvider;
import com.church.offering.model.enums.PaymentStatus;
import com.church.offering.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicDonationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void typesOffrandeActifsSontPublicsAvecBenediction() throws Exception {
        mockMvc.perform(get("/api/public/offering-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].code").value("DIME"))
                .andExpect(jsonPath("$[0].blessingRef").value("Malachie 3:10"))
                .andExpect(jsonPath("$[0].blessingText", not(emptyOrNullString())))
                .andExpect(jsonPath("$[3].code").value("DON"))
                .andExpect(jsonPath("$[3].blessingRef").value("2 Corinthiens 9:7"));
    }

    @Test
    void donAnonymeEstCreePuisPayeAvecRecu() throws Exception {
        long id = create("""
                {"offeringTypeId":1,"amount":5000,"paymentProvider":"MOOV_MONEY"}
                """);

        mockMvc.perform(post("/api/public/contributions/" + id + "/simulate-payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contributionId").value((int) id))
                .andExpect(jsonPath("$.reference", startsWith("CONT-")))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.amount").value(5000))
                .andExpect(jsonPath("$.currencyCode").value("XOF"))
                .andExpect(jsonPath("$.paymentMethod").value("MOBILE_MONEY"))
                .andExpect(jsonPath("$.paymentProvider").value("MOOV_MONEY"))
                .andExpect(jsonPath("$.paymentSimulated").value(true))
                .andExpect(jsonPath("$.blessingRef").value("Malachie 3:10"))
                .andExpect(jsonPath("$.blessingText", not(emptyOrNullString())))
                .andExpect(jsonPath("$.receipt.receiptNumber", startsWith("REC-")))
                .andExpect(jsonPath("$.receipt.verificationToken").value(not(emptyOrNullString())))
                .andExpect(jsonPath("$.donorName").doesNotExist())
                .andExpect(jsonPath("$.donorPhone").doesNotExist())
                .andExpect(jsonPath("$.memberId").doesNotExist())
                .andExpect(jsonPath("$.templeId").doesNotExist());
    }

    @Test
    void donAvecNomEtTelephoneEstAccepteMaisJamaisExpose() throws Exception {
        long id = create("""
                {"offeringTypeId":4,"amount":2500,"paymentProvider":"CARD",
                 "donorName":"Marie Kouame","donorPhone":"+2250700000123"}
                """);

        mockMvc.perform(post("/api/public/contributions/" + id + "/simulate-payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentMethod").value("CARD"))
                .andExpect(jsonPath("$.paymentProvider").value("CARD"))
                .andExpect(jsonPath("$.paymentSimulated").value(true))
                .andExpect(jsonPath("$.offeringTypeCode").value("DON"))
                .andExpect(jsonPath("$.donorName").doesNotExist())
                .andExpect(jsonPath("$.donorPhone").doesNotExist());
    }

    @Test
    void providerChoisiEstPersisteEnAttenteDePaiement() throws Exception {
        long id = create("""
                {"offeringTypeId":1,"amount":7500,"paymentProvider":"WAVE"}
                """);

        List<Payment> payments = paymentRepository.findByContributionId(id);
        assertThat(payments).hasSize(1);
        Payment payment = payments.get(0);
        assertThat(payment.getProvider()).isEqualTo(PaymentProvider.WAVE);
        assertThat(payment.isSimulated()).isTrue();
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payment.getAmount()).isEqualByComparingTo("7500.00");
        assertThat(payment.getProviderTransactionId()).isNull();
    }

    @Test
    void providerSimulatedEstRefuseCommeChoixClient() throws Exception {
        mockMvc.perform(post("/api/public/contributions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"offeringTypeId":1,"amount":1000,"paymentProvider":"SIMULATED"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Moyen de paiement non disponible pour le don public"));
    }

    @Test
    void simulatePaymentEstIdempotent() throws Exception {
        long id = create("""
                {"offeringTypeId":2,"amount":1500,"paymentProvider":"ORANGE_MONEY"}
                """);

        String first = mockMvc.perform(post("/api/public/contributions/" + id + "/simulate-payment"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String receiptNumber = first.replaceAll(".*\"receiptNumber\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(post("/api/public/contributions/" + id + "/simulate-payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.receipt.receiptNumber").value(receiptNumber));

        List<Payment> payments = paymentRepository.findByContributionId(id);
        assertThat(payments).hasSize(1);
        assertThat(payments.get(0).getProvider()).isEqualTo(PaymentProvider.ORANGE_MONEY);
        assertThat(payments.get(0).isSimulated()).isTrue();
        assertThat(payments.get(0).getStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void contributionMembreNePeutPasEtreSimuleeParLeDonPublic() throws Exception {
        String memberToken = login("membre@rsi.local", "Membre@12345");
        MvcResult result = mockMvc.perform(post("/api/contributions")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"templeId":1,"offeringTypeId":2,"amount":5000,"paymentMethod":"CASH"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.memberId").value(1))
                .andReturn();
        long id = Long.parseLong(result.getResponse().getContentAsString()
                .replaceAll(".*\"id\":(\\d+).*", "$1"));

        mockMvc.perform(post("/api/public/contributions/" + id + "/simulate-payment"))
                .andExpect(status().isConflict());
    }

    @Test
    void contributionAnnuleeNePeutPasEtrePayee() throws Exception {
        long id = create("""
                {"offeringTypeId":3,"amount":3000,"paymentProvider":"MTN_MOBILE_MONEY"}
                """);
        String adminToken = login("admin@rsi.local", "Admin@12345");

        mockMvc.perform(post("/api/admin/contributions/" + id + "/cancel")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        mockMvc.perform(post("/api/public/contributions/" + id + "/simulate-payment"))
                .andExpect(status().isConflict());
    }

    @Test
    void typeInconnuEstRejete() throws Exception {
        mockMvc.perform(post("/api/public/contributions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"offeringTypeId":9999,"amount":1000,"paymentProvider":"MOOV_MONEY"}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void montantEtProviderInvalidesSontRejetes() throws Exception {
        mockMvc.perform(post("/api/public/contributions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"offeringTypeId":1,"amount":0,"paymentProvider":"MOOV_MONEY"}
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/public/contributions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"offeringTypeId":1,"amount":1000,"paymentProvider":"BITCOIN"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void contributionInconnueEstRejetee() throws Exception {
        mockMvc.perform(post("/api/public/contributions/999999/simulate-payment"))
                .andExpect(status().isNotFound());
    }

    @Test
    void aucuneListePubliqueDeContributions() throws Exception {
        mockMvc.perform(get("/api/public/contributions"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/public/contributions/1"))
                .andExpect(status().isUnauthorized());
    }

    private long create(String body) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/public/contributions")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference", startsWith("CONT-")))
                .andReturn();
        return Long.parseLong(result.getResponse().getContentAsString()
                .replaceAll(".*\"contributionId\":(\\d+).*", "$1"));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andReturn();
        return result.getResponse().getContentAsString()
                .replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
    }
}
