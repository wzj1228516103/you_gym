package com.yougym.api.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CatalogAdminControllerIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Test
    void exposesExerciseCatalogAndManagesFoodCatalog() throws Exception {
        mockMvc.perform(get("/api/admin/v1/exercise-catalog")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", org.hamcrest.Matchers.hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(17))))
                .andExpect(jsonPath("$.items[0].resources").isArray());

        mockMvc.perform(get("/api/admin/v1/exercise-catalog")
                        .header("X-Admin-Test-Token", "local-admin")
                        .param("page", "2")
                        .param("pageSize", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(2)))
                .andExpect(jsonPath("$.pageSize", is(5)))
                .andExpect(jsonPath("$.items", org.hamcrest.Matchers.hasSize(5)))
                .andExpect(jsonPath("$.total", org.hamcrest.Matchers.greaterThanOrEqualTo(10)));

        String body = """
                {"id":"admin-test-food","name":"测试燕麦","serving":"50g","calories":190,"protein":6.5,"carbs":32,"fat":4.2,"source":"YOU GYM","status":"ACTIVE"}
                """;
        mockMvc.perform(post("/api/admin/v1/food-catalog")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("admin-test-food")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        mockMvc.perform(get("/api/admin/v1/food-catalog")
                        .header("X-Admin-Test-Token", "local-employee")
                        .param("search", "燕麦")
                        .param("page", "1")
                        .param("pageSize", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(1)))
                .andExpect(jsonPath("$.pageSize", is(1)))
                .andExpect(jsonPath("$.total", org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.items", org.hamcrest.Matchers.hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.items[?(@.id == 'admin-test-food')]").isNotEmpty());

        mockMvc.perform(patch("/api/admin/v1/food-catalog/admin-test-food")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("测试燕麦", "测试燕麦片")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("测试燕麦片")));

        mockMvc.perform(post("/api/admin/v1/food-catalog/admin-test-food/status")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));

        mockMvc.perform(post("/api/admin/v1/food-catalog")
                        .header("X-Admin-Test-Token", "local-employee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/admin/v1/food-catalog/admin-test-food")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted", is(true)));
    }
}
