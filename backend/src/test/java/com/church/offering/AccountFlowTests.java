package com.church.offering;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AccountFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void memberDonationIsPaidWithReceiptAndAppearsFirstInHistory() throws Exception {
        String token = login("membre@rsi.local", "Membre@12345");

        MvcResult created = mockMvc.perform(post("/api/my/donations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"offeringTypeId\":1,\"amount\":7500,\"paymentProvider\":\"WAVE\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paymentProvider").value("WAVE"))
                .andExpect(jsonPath("$.paymentSimulated").value(true))
                .andExpect(jsonPath("$.receipt.receiptNumber").value(startsWith("REC-")))
                .andReturn();
        long id = Long.parseLong(created.getResponse().getContentAsString()
                .replaceAll(".*\"contributionId\":(\\d+).*", "$1"));

        mockMvc.perform(get("/api/my/contributions").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].status").value("PAID"));

        mockMvc.perform(get("/api/my/contributions/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.receipt.receiptNumber").value(startsWith("REC-")));
    }

    @Test
    void memberCannotReadAnotherMembersContribution() throws Exception {
        String member = login("membre@rsi.local", "Membre@12345");
        MvcResult created = mockMvc.perform(post("/api/my/donations")
                        .header("Authorization", "Bearer " + member)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"offeringTypeId\":2,\"amount\":1000,\"paymentProvider\":\"ORANGE_MONEY\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        long id = Long.parseLong(created.getResponse().getContentAsString()
                .replaceAll(".*\"contributionId\":(\\d+).*", "$1"));

        String other = registerMember();
        mockMvc.perform(get("/api/my/contributions/" + id).header("Authorization", "Bearer " + other))
                .andExpect(status().isNotFound());
    }

    @Test
    void anonymousCannotDonateAsMember() throws Exception {
        mockMvc.perform(post("/api/my/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"offeringTypeId\":1,\"amount\":1000,\"paymentProvider\":\"WAVE\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void memberUpdatesProfileAndChangesPassword() throws Exception {
        String suffix = uniqueSuffix();
        String email = "profil" + suffix + "@rsi.local";
        String token = register(email, suffix);

        mockMvc.perform(put("/api/my/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Paul\",\"lastName\":\"Kouassi\",\"phone\":\"+22507" + suffix + "9\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Paul"))
                .andExpect(jsonPath("$.lastName").value("Kouassi"));

        mockMvc.perform(put("/api/my/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"mauvais\",\"newPassword\":\"Nouveau@123\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/my/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Secret@123\",\"newPassword\":\"Nouveau@123\"}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Nouveau@123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void profileUpdateRejectsPhoneUsedByAnotherMember() throws Exception {
        String suffix = uniqueSuffix();
        String token = register("doublon" + suffix + "@rsi.local", suffix);
        String takenPhone = phoneOf(login("membre@rsi.local", "Membre@12345"));

        mockMvc.perform(put("/api/my/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"A\",\"lastName\":\"B\",\"phone\":\"" + takenPhone + "\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void unknownApiPathReturns404InsteadOf500() throws Exception {
        String token = login("membre@rsi.local", "Membre@12345");
        mockMvc.perform(get("/api/my/inexistant").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    private String registerMember() throws Exception {
        String suffix = uniqueSuffix();
        return register("autre" + suffix + "@rsi.local", suffix);
    }

    private String register(String email, String suffix) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Secret@123\",\"firstName\":\"Test\","
                                + "\"lastName\":\"Membre\",\"phone\":\"+22501" + suffix + "\",\"templeId\":1}"))
                .andExpect(status().isOk())
                .andReturn();
        return token(result);
    }

    private String phoneOf(String token) throws Exception {
        String body = mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getContentAsString();
        return body.replaceAll(".*\"phone\":\"([^\"]+)\".*", "$1");
    }

    private String login(String email, String password) throws Exception {
        return token(mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andReturn());
    }

    private String token(MvcResult result) throws Exception {
        return result.getResponse().getContentAsString()
                .replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
    }

    private String uniqueSuffix() {
        return String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 100_000_000L));
    }
}
