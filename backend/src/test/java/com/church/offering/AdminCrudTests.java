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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminCrudTests {

    @Autowired
    private MockMvc mockMvc;

    private String adminToken;
    private String memberToken;
    private String treasurerToken;

    @BeforeEach
    void setup() throws Exception {
        adminToken = login("admin@rsi.local", "Admin@12345");
        memberToken = login("membre@rsi.local", "Membre@12345");
        treasurerToken = login("tresorier@rsi.local", "Tresorier@12345");
    }

    @Test
    void templesArePubliclyReadable() throws Exception {
        mockMvc.perform(get("/api/temples"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    void onlyAdminCanCreateTemples() throws Exception {
        String body = """
                {"name":"Temple de la Paix","city":"Bouaké","address":"Quartier Commerce","active":true}
                """;

        mockMvc.perform(post("/api/temples")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/temples")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Temple de la Paix"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void adminAndTreasurerCanReadMembersButOnlyAdminWrites() throws Exception {
        mockMvc.perform(get("/api/admin/members").header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/members").header("Authorization", "Bearer " + treasurerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").exists());

        mockMvc.perform(get("/api/admin/members").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").exists());

        String mBody = """
                {"fullName":"Sarah Ngoo","phone":"+2250700000102","email":"sarah@rsi.local","templeId":1,"active":true}
                """;
        mockMvc.perform(post("/api/admin/members")
                        .header("Authorization", "Bearer " + treasurerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(mBody))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/admin/members")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(mBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Sarah Ngoo"));
    }

    @Test
    void adminCreatesStaffAndCanDeactivateThem() throws Exception {
        String sBody = """
                {"email":"pasteur2@rsi.local","password":"Pasteur@12345","firstName":"Marc","lastName":"Yao",
                 "phone":"+2250700000103","role":"PASTEUR","templeId":1}
                """;
        MvcResult created = mockMvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(sBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("PASTEUR"))
                .andReturn();

        long userId = extractId(created);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"pasteur2@rsi.local\",\"password\":\"Pasteur@12345\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("PASTEUR"));

        mockMvc.perform(patch("/api/admin/users/" + userId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"pasteur2@rsi.local\",\"password\":\"Pasteur@12345\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanUpdateTemple() throws Exception {
        mockMvc.perform(get("/api/temples"))
                .andExpect(status().isOk());

        String body = """
                {"name":"Temple de la Victoire","city":"Abidjan","address":"Cocody Riviera 3","active":true}
                """;
        mockMvc.perform(put("/api/temples/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("Cocody Riviera 3"));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andReturn();
        return extractToken(result);
    }

    private String extractToken(MvcResult result) throws Exception {
        return result.getResponse().getContentAsString()
                .replaceAll(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*", "$1");
    }

    private long extractId(MvcResult result) throws Exception {
        return Long.parseLong(result.getResponse().getContentAsString()
                .replaceAll(".*\\\"id\\\":(\\d+).*", "$1"));
    }
}