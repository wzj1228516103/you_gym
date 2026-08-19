package com.yougym.api.exercise;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExerciseCatalogControllerIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void listsExtractedExercisesAndResources() throws Exception {
        mockMvc.perform(get("/api/v1/exercises").param("limit", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source", is("reference-images-v1")))
                .andExpect(jsonPath("$.items", hasSize(17)));
        mockMvc.perform(get("/api/v1/exercises/ex-009-squat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameZh", is("深蹲")))
                .andExpect(jsonPath("$.stepLabels", hasSize(5)))
                .andExpect(jsonPath("$.resources[0].resourceUrl", is("/exercise-assets/cards/09-squat.png")));
        mockMvc.perform(get("/exercise-assets/cards/01-barbell-bench-press.png"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));
    }
}
