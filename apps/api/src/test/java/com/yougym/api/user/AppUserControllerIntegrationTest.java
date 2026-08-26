package com.yougym.api.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AppUserControllerIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JdbcTemplate jdbc;

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
        mockMvc.perform(post("/api/v1/me/measurements").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"weightKg\":72.1,\"bodyFatPct\":18.5,\"waistCm\":82.0}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.saved", is(true))).andExpect(jsonPath("$.measurement.weightKg", is(72.1)));
        mockMvc.perform(get("/api/v1/me/measurements").header("Authorization", authorization).param("limit", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1))).andExpect(jsonPath("$.items[0].waistCm", is(82.0)));
        mockMvc.perform(get("/api/v1/me/reminders").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.settings.trainingEnabled", is(false)))
                .andExpect(jsonPath("$.settings.trainingTime", is("08:00"))).andExpect(jsonPath("$.settings.nutritionTime", is("12:00")))
                .andExpect(jsonPath("$.settings.timezone", is("Asia/Shanghai")));
        mockMvc.perform(put("/api/v1/me/reminders").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"trainingEnabled\":true,\"nutritionEnabled\":true,\"restSoundEnabled\":false,\"trainingTime\":\"07:30\",\"nutritionTime\":\"12:00\",\"timezone\":\"Asia/Shanghai\",\"quietHoursStart\":\"22:00\",\"quietHoursEnd\":\"07:00\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.settings.trainingEnabled", is(true))).andExpect(jsonPath("$.settings.nutritionEnabled", is(true)))
                .andExpect(jsonPath("$.settings.trainingTime", is("07:30"))).andExpect(jsonPath("$.settings.timezone", is("Asia/Shanghai")))
                .andExpect(jsonPath("$.settings.quietHoursEnd", is("07:00")));
        mockMvc.perform(put("/api/v1/me/reminders").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"trainingEnabled\":true,\"nutritionEnabled\":true,\"restSoundEnabled\":false,\"timezone\":\"Mars/Olympus\"}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/me/nutrition-goal").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.goal", nullValue()));
        mockMvc.perform(put("/api/v1/me/nutrition-goal").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"calories\":2200,\"proteinG\":160,\"carbohydratesG\":240,\"fatG\":70}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.goal.calories", is(2200.0)))
                .andExpect(jsonPath("$.goal.proteinG", is(160.0))).andExpect(jsonPath("$.goal.carbohydratesG", is(240.0)))
                .andExpect(jsonPath("$.goal.fatG", is(70.0)));
        mockMvc.perform(get("/api/v1/me/nutrition-goal").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.goal.calories", is(2200.0)));
        mockMvc.perform(put("/api/v1/me/nutrition-goal").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"calories\":200,\"proteinG\":0,\"carbohydratesG\":240,\"fatG\":70}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(delete("/api/v1/me/nutrition-goal").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.cleared", is(true)));
        String notificationId = java.util.UUID.randomUUID().toString();
        jdbc.update("INSERT INTO user_notification (id,user_id,notification_type,title,summary,deep_link,important,created_at) SELECT ?,id,'PLAN','计划已准备好','你的训练计划可以开始了。','yougym://plan/full-body-beginner',false,CURRENT_TIMESTAMP FROM app_user WHERE phone=?", notificationId, phone);
        mockMvc.perform(get("/api/v1/me/notifications").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1))).andExpect(jsonPath("$.items[0].type", is("PLAN"))).andExpect(jsonPath("$.unreadCount", is(1)));
        mockMvc.perform(post("/api/v1/me/notifications/" + notificationId + "/read").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.notification.readAt").isNotEmpty()).andExpect(jsonPath("$.unreadCount", is(0)));
        mockMvc.perform(get("/api/v1/me/notifications").header("Authorization", authorization).param("unreadOnly", "true"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(0))).andExpect(jsonPath("$.unreadCount", is(0)));
        mockMvc.perform(post("/api/v1/me/plans/full-body-beginner/start").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.progress.status", is("ACTIVE"))).andExpect(jsonPath("$.progress.completedSessions", is(0)));
        mockMvc.perform(post("/api/v1/me/workouts").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"计划训练\",\"durationSeconds\":600,\"totalSets\":4,\"totalVolume\":1200,\"calories\":100,\"metadata\":{\"planId\":\"full-body-beginner\"}}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/v1/me/plans/full-body-beginner/progress").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.progress.completedSessions", is(1)))
                .andExpect(jsonPath("$.progress.weekCompletedSessions", is(1)))
                .andExpect(jsonPath("$.progress.weeklyTarget", is(3)));
        mockMvc.perform(patch("/api/v1/me/plans/full-body-beginner").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PAUSED\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.progress.status", is("PAUSED")));
        mockMvc.perform(patch("/api/v1/me/plans/full-body-beginner").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.progress.status", is("ACTIVE")));
        mockMvc.perform(post("/api/v1/me/favorites/sync").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetType\":\"EXERCISE\",\"ids\":[\"ex-009-squat\",\"ex-001-barbell-bench-press\"]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ids", hasSize(2)));
        mockMvc.perform(get("/api/v1/me/favorites").header("Authorization", authorization).param("targetType", "EXERCISE"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ids", hasSize(2)));
        mockMvc.perform(put("/api/v1/me/favorites/EXERCISE/ex-014-lateral-raise").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.saved", is(true)));
        mockMvc.perform(delete("/api/v1/me/favorites/EXERCISE/ex-014-lateral-raise").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.removed", is(true)));
        mockMvc.perform(get("/api/admin/v1/app-users").header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.total", is(1))).andExpect(jsonPath("$.page", is(1))).andExpect(jsonPath("$.pageSize", is(50)));
        mockMvc.perform(get("/api/admin/v1/app-users/workouts").header("X-Admin-Test-Token", "local-admin").param("pageSize", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.total", is(2))).andExpect(jsonPath("$.page", is(1))).andExpect(jsonPath("$.pageSize", is(1)));
        mockMvc.perform(get("/api/admin/v1/app-users/nutrition").header("X-Admin-Test-Token", "local-admin").param("pageSize", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.total", is(1))).andExpect(jsonPath("$.page", is(1))).andExpect(jsonPath("$.pageSize", is(1)));
        mockMvc.perform(post("/api/v1/auth/logout").header("Authorization", authorization))
                .andExpect(status().isOk()).andExpect(jsonPath("$.loggedOut", is(true)));
        mockMvc.perform(get("/api/v1/me").header("Authorization", authorization))
                .andExpect(status().isUnauthorized());
    }
}
