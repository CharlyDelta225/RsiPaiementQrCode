package com.church.offering;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DevicePinTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void setPinThenUnlockWithPinOnly() throws Exception {
        String jwt = registerMember();
        String device = setPin(jwt, "4826", null);

        String body = mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pinBody(device, "4826")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(not(emptyOrNullString())))
                .andExpect(jsonPath("$.user.role").value("MEMBER"))
                .andReturn().getResponse().getContentAsString();
        String freshJwt = body.replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + freshJwt))
                .andExpect(status().isOk());
    }

    @Test
    void wrongPinCountsDownThenRevokesDeviceAfterFiveAttempts() throws Exception {
        String device = setPin(registerMember(), "5917", null);

        for (int remaining = 4; remaining >= 1; remaining--) {
            mockMvc.perform(post("/api/auth/pin-login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(pinBody(device, "0000")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value(containsString("Il vous reste " + remaining)));
        }
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pinBody(device, "0000")))
                .andExpect(status().isLocked());

        // Même le bon code ne fonctionne plus : retour obligatoire au mot de passe.
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pinBody(device, "5917")))
                .andExpect(status().isLocked());
    }

    @Test
    void successfulUnlockResetsAttempts() throws Exception {
        String device = setPin(registerMember(), "3071", null);
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/pin-login")
                    .contentType(MediaType.APPLICATION_JSON).content(pinBody(device, "9999")));
        }
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody(device, "3071")))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody(device, "9999")))
                .andExpect(jsonPath("$.error").value(containsString("Il vous reste 4")));
    }

    @Test
    void tooSimplePinsAreRejected() throws Exception {
        String jwt = registerMember();
        for (String pin : new String[]{"0000", "1234", "9876", "5555"}) {
            mockMvc.perform(post("/api/my/device-pin")
                            .header("Authorization", "Bearer " + jwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"pin\":\"" + pin + "\"}"))
                    .andExpect(status().isBadRequest());
        }
        mockMvc.perform(post("/api/my/device-pin")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pin\":\"12a4\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void changingPinRevokesPreviousDeviceKey() throws Exception {
        String jwt = registerMember();
        String oldDevice = setPin(jwt, "2580", null);
        String newDevice = setPin(jwt, "7413", oldDevice);

        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody(oldDevice, "2580")))
                .andExpect(status().isLocked());
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody(newDevice, "7413")))
                .andExpect(status().isOk());
    }

    @Test
    void revokeAndUnknownDeviceAreLocked() throws Exception {
        String device = setPin(registerMember(), "6142", null);
        mockMvc.perform(post("/api/auth/device/revoke")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"deviceToken\":\"" + device + "\"}"))
                .andExpect(status().isNoContent());
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody(device, "6142")))
                .andExpect(status().isLocked());
        mockMvc.perform(post("/api/auth/pin-login")
                        .contentType(MediaType.APPLICATION_JSON).content(pinBody("inconnu", "6142")))
                .andExpect(status().isLocked());
    }

    @Test
    void settingPinRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/my/device-pin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pin\":\"4826\"}"))
                .andExpect(status().isUnauthorized());
    }

    private String setPin(String jwt, String pin, String replace) throws Exception {
        String replaceJson = replace == null ? "" : ",\"replaceDeviceToken\":\"" + replace + "\"";
        return mockMvc.perform(post("/api/my/device-pin")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pin\":\"" + pin + "\"" + replaceJson + "}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"deviceToken\":\"([^\"]+)\".*", "$1");
    }

    private static String pinBody(String device, String pin) {
        return "{\"deviceToken\":\"" + device + "\",\"pin\":\"" + pin + "\"}";
    }

    private String registerMember() throws Exception {
        String suffix = String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 100_000_000L));
        return mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"pin" + suffix + "@rsi.local\",\"password\":\"Secret@123\","
                                + "\"firstName\":\"Pin\",\"lastName\":\"Test\",\"phone\":\"+22505" + suffix
                                + "\",\"templeId\":1}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"token\":\"([^\"]+)\".*", "$1");
    }
}
