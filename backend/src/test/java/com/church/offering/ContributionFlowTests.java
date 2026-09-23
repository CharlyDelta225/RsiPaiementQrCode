package com.church.offering;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContributionFlowTests {

    @Autowired
    private MockMvc mockMvc;

    private String adminToken;
    private String memberToken;

    @BeforeEach
    void setup() throws Exception {
        adminToken = login("admin@rsi.local", "Admin@12345");
        memberToken = login("membre@rsi.local", "Membre@12345");
    }

    @Test
    void anonymousVisitorCanCreateContribution() throws Exception {
        String body = """
                {"templeId":1,"offeringTypeId":1,"amount":10000,
                 "paymentMethod":"MOBILE_MONEY","donorName":"Visiteur Anonyme","donorPhone":"+2250700000111",
                 "note":"Offrande du dimanche"}
                """;
        mockMvc.perform(post("/api/contributions")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference").value(org.hamcrest.Matchers.startsWith("CONT-")))
                .andExpect(jsonPath("$.amount").value(10000))
                .andExpect(jsonPath("$.currencyCode").value("XOF"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.donorName").value("Visiteur Anonyme"))
                .andExpect(jsonPath("$.memberId").doesNotExist());
    }

    @Test
    void connectedMemberCreatesContributionLinkedToTheirMember() throws Exception {
        String body = """
                {"templeId":1,"offeringTypeId":2,"amount":5000,
                 "paymentMethod":"CASH","donorName":null,"donorPhone":null}
                """;
        mockMvc.perform(post("/api/contributions")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.memberId").value(1))
                .andExpect(jsonPath("$.memberFullName").exists())
                .andExpect(jsonPath("$.paymentMethod").value("CASH"));
    }

    @Test
    void adminAndTreasurerCanListFilteredByTemple() throws Exception {
        String body = """
                {"templeId":2,"offeringTypeId":3,"amount":2500,"paymentMethod":"BANK_TRANSFER"}
                """;
        mockMvc.perform(post("/api/contributions")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/contributions").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/admin/contributions?templeId=2")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].templeId").value(2));

        mockMvc.perform(get("/api/admin/contributions?templeId=2&offeringTypeId=3")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void previouslyCreatedContributionIsReadable() throws Exception {
        String body = """
                {"templeId":1,"offeringTypeId":4,"amount":1500,
                 "paymentMethod":"MOBILE_MONEY","donorName":"Donateur Fidèle"}
                """;
        MvcResult created = mockMvc.perform(post("/api/contributions")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn();
        long id = extractId(created);

        mockMvc.perform(get("/api/admin/contributions/" + id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(1500))
                .andExpect(jsonPath("$.donorName").value("Donateur Fidèle"));
    }

    @Test
    void memberHistoryContainsOnlyOwnContributions() throws Exception {
        String body = """
                {"templeId":1,"offeringTypeId":4,"amount":800,"paymentMethod":"MOBILE_MONEY",
                 "donorName":"Moi meme"}
                """;
        mockMvc.perform(post("/api/contributions")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/my/contributions")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].memberId").value(1));
    }

    @Test
    void adminRoutesRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/contributions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void memberCannotAccessAdminList() throws Exception {
        mockMvc.perform(get("/api/admin/contributions")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andReturn();
        return result.getResponse().getContentAsString()
                .replaceAll(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*", "$1");
    }

    private long extractId(MvcResult result) throws Exception {
        return Long.parseLong(result.getResponse().getContentAsString()
                .replaceAll(".*\\\"id\\\":(\\d+).*", "$1"));
    }
}