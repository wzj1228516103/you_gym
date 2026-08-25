package com.yougym.api.catalog;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.startsWith;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FoodMediaIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void refreshesFoodMediaUrlsAndProtectsReferencedObjects() throws Exception {
        MockMultipartFile image = new MockMultipartFile("file", "food.png", "image/png", new byte[]{1, 2, 3});
        MvcResult upload = mockMvc.perform(multipart("/api/file/media-upload/batch")
                        .file(image).header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode uploaded = objectMapper.readTree(upload.getResponse().getContentAsString())
                .get("data").get("uploadedFiles").get(0);
        String objectName = uploaded.get("objectName").asText();
        String staleUrl = "https://stale.example/food.png";
        String body = """
                {"id":"media-food-test","name":"Media Test Food","serving":"100g","calories":100,"protein":10,"carbs":5,"fat":2,"source":"test","mediaUrl":"%s","mediaAssets":[{"url":"%s","objectName":"%s","fileName":"food.png","fileSize":3,"fileType":"image/png","fileETag":"test"}]}
                """.formatted(staleUrl, staleUrl, objectName);

        mockMvc.perform(post("/api/admin/v1/food-catalog")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mediaUrl", startsWith("/api/file/mock-media")));

        mockMvc.perform(get("/api/v1/foods").param("search", "Media Test Food"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].mediaUrl", startsWith("/api/file/mock-media")))
                .andExpect(jsonPath("$.items[0].mediaAssets[0].url", startsWith("/api/file/mock-media")));

        mockMvc.perform(delete("/api/file/media").param("objectName", objectName)
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/admin/v1/food-catalog/media-food-test")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted", is(true)));

        mockMvc.perform(delete("/api/file/media").param("objectName", objectName)
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isNoContent());
    }
}
