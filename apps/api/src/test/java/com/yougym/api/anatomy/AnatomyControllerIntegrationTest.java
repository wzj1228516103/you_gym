package com.yougym.api.anatomy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AnatomyControllerIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    void exposesNestedAnatomyTreeForMobile() throws Exception {
        mockMvc.perform(get("/api/v1/anatomy/tree").param("gender", "all").param("view", "all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version", is(1)))
                .andExpect(jsonPath("$.items", hasSize(9)))
                .andExpect(jsonPath("$.items[*].nameZh", hasItem("背部与腰部")))
                .andExpect(jsonPath("$.items[1].children[0].children", hasSize(3)));
    }
}
