package com.yougym.api.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CatalogControllerIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void exposesDatabaseBackedPlansAndFoods() throws Exception {
        mockMvc.perform(get("/api/v1/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(greaterThanOrEqualTo(4))));

        mockMvc.perform(get("/api/v1/plans/ppl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("推拉腿三分化")))
                .andExpect(jsonPath("$.exercises", hasSize(4)))
                .andExpect(jsonPath("$.exercises[0].nameZh", is("杠铃卧推")));

        mockMvc.perform(get("/api/v1/foods").param("search", "鸡胸"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(greaterThanOrEqualTo(4))));

        mockMvc.perform(get("/api/v1/foods/chicken-cooked"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("鸡胸肉（熟）")))
                .andExpect(jsonPath("$.protein", is(31.0)));
    }
}
