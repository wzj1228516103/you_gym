package com.yougym.api.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AppUserControllerIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void registersPersistsRecordsAndExposesThemToAdmin() throws Exception {
        String phone = "+8613812345678";
        mockMvc.perform(post("/api/v1/auth/sms/code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"" + phone + "\",\"purpose\":\"LOGIN\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.accepted", is(true)));
        String response = mockMvc.perform(post("/api/v1/auth/sms/verify").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"" + phone + "\",\"purpose\":\"LOGIN\",\"code\":\"123456\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty()).andExpect(jsonPath("$.needsOnboarding", is(true))).andReturn().getResponse().getContentAsString();
        JsonNode session = objectMapper.readTree(response);
        String authorization = "Bearer " + session.get("accessToken").asText();
        mockMvc.perform(patch("/api/v1/me").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"goal\":\"增肌\",\"weightKg\":72.5}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.goal", is("增肌"))).andExpect(jsonPath("$.nickname", is("健身爱好者")));
        mockMvc.perform(post("/api/v1/me/workouts").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"测试训练\",\"durationSeconds\":600,\"totalSets\":4,\"totalVolume\":1200,\"calories\":100}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.saved", is(true)));
        mockMvc.perform(post("/api/v1/me/nutrition").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealName\":\"早餐\",\"calories\":400,\"proteinG\":25,\"carbohydratesG\":40,\"fatG\":10,\"foodCount\":2}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/admin/v1/app-users").header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)));
        mockMvc.perform(get("/api/admin/v1/app-users/workouts").header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)));
        mockMvc.perform(get("/api/admin/v1/app-users/nutrition").header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)));
        mockMvc.perform(post("/api/v1/auth/logout").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.loggedOut", is(true)));
        mockMvc.perform(get("/api/v1/me").header("Authorization", authorization))
                .andExpect(status().isUnauthorized());
    }
}
