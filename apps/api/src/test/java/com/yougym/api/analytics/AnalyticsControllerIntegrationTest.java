package com.yougym.api.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "yougym.admin.bootstrap-enabled=true",
        "yougym.admin.bootstrap-username=owner",
        "yougym.admin.bootstrap-password=local-admin-pass",
        "yougym.admin.bootstrap-display-name=Local Owner",
        "yougym.admin.registration-enabled=true",
        "yougym.admin.registration-invite-code=local-invite-code"
})
@AutoConfigureMockMvc
class AnalyticsControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void acceptsEventsAndDeduplicatesByEventId() throws Exception {
        String body = """
                {
                  "events": [{
                    "eventId": "evt-test-001",
                    "eventName": "community_tab_clicked",
                    "eventVersion": 1,
                    "occurredAt": "2026-08-18T03:00:00Z",
                    "sessionId": "session-test",
                    "analyticsUserId": "anonymous-test",
                    "platform": "web",
                    "appVersion": "0.1.0",
                    "properties": {"source": "main_tab"}
                  }]
                }
                """;

        mockMvc.perform(post("/api/v1/analytics/events:batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted", is(1)))
                .andExpect(jsonPath("$.duplicates", is(0)))
                .andExpect(jsonPath("$.total", is(1)));

        mockMvc.perform(post("/api/v1/analytics/events:batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted", is(0)))
                .andExpect(jsonPath("$.duplicates", is(1)));
    }

    @Test
    void exposesVersionedAnatomyTreeAndProtectsAdminNodeList() throws Exception {
        mockMvc.perform(get("/api/v1/anatomy/tree")
                        .param("gender", "female")
                        .param("view", "front"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version", is(1)))
                .andExpect(jsonPath("$.items[?(@.id == 'region.shoulders')]").exists())
                .andExpect(jsonPath("$..children[?(@.id == 'muscle.deltoid.anterior')]").exists());

        mockMvc.perform(get("/api/admin/v1/anatomy/nodes"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/v1/anatomy/nodes")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[?(@.id == 'muscle.erector-spinae')]").exists());
    }

    @Test
    void protectsAdminEndpointsAndExportsCsv() throws Exception {
        mockMvc.perform(get("/api/admin/v1/analytics/summary"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/v1/analytics/events.csv")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("analytics-events.csv")))
                .andExpect(content().string(containsString("eventId,eventName,eventVersion")));
    }

    @Test
    void aggregatesDashboardMetricsAndChartsFromRawEvents() throws Exception {
        String body = """
                {"events":[
                  {"eventId":"dashboard-region-001","eventName":"body_region_selected","occurredAt":"2026-08-18T03:00:00Z","sessionId":"dashboard-session","analyticsUserId":"dashboard-device","platform":"ios","properties":{"region":"手臂"}},
                  {"eventId":"dashboard-muscle-001","eventName":"muscle_selected","occurredAt":"2026-08-18T03:01:00Z","sessionId":"dashboard-session","analyticsUserId":"dashboard-device","platform":"ios","properties":{"muscle":"肱二头肌"}},
                  {"eventId":"dashboard-filter-001","eventName":"exercise_filter_opened","occurredAt":"2026-08-18T03:02:00Z","sessionId":"dashboard-session","analyticsUserId":"dashboard-device","platform":"ios"}]
                }
                """;
        mockMvc.perform(post("/api/v1/analytics/events:batch")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted", is(3)));

        mockMvc.perform(get("/api/admin/v1/analytics/dashboard")
                        .header("X-Admin-Test-Token", "local-admin")
                        .param("from", "2026-08-18T00:00:00Z")
                        .param("to", "2026-08-19T00:00:00Z")
                        .param("timezone", "Asia/Shanghai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpis.eventCount", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.kpis.uniqueDevices", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.kpis.sessionCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.trend[0].eventCount", greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.anatomyRanking.length()", is(2)))
                .andExpect(jsonPath("$.funnel[4].eventCount", is(0)))
                .andExpect(jsonPath("$.platformDistribution[0].eventCount", greaterThanOrEqualTo(3)))
                .andExpect(content().string(containsString("\"name\":\"muscle_selected\"")));

        mockMvc.perform(get("/api/admin/v1/analytics/dashboard")
                        .header("X-Admin-Test-Token", "local-admin")
                        .param("timezone", "Not/AZone"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void managesContentDraftsPublishesThemAndRestrictsEmployeeWrites() throws Exception {
        String body = """
                {"title":"手臂训练基础","contentType":"ARTICLE","summary":"肱二头肌与肱三头肌的基础训练说明","body":"先完成热身，再进行动作练习。","mediaUrl":"https://example.test/arm.md","anatomyNodeId":"muscle.biceps-brachii"}
                """;
        MvcResult created = mockMvc.perform(post("/api/admin/v1/content")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.contentType", is("ARTICLE")))
                .andReturn();
        String id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/admin/v1/content")
                        .header("X-Admin-Test-Token", "local-employee")
                        .param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id", is(id)));

        mockMvc.perform(post("/api/admin/v1/content/" + id + "/status")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PUBLISHED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PUBLISHED")))
                .andExpect(jsonPath("$.publishedAt").isNotEmpty());

        mockMvc.perform(patch("/api/admin/v1/content/" + id)
                        .header("X-Admin-Test-Token", "local-employee")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void exposesRolePermissionsAndRestrictsEmployeeExports() throws Exception {
        mockMvc.perform(get("/api/admin/v1/session")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("SUPER_ADMIN")))
                .andExpect(jsonPath("$.permissions[?(@ == 'ANALYTICS_EXPORT')]").exists());

        mockMvc.perform(get("/api/admin/v1/session")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("EMPLOYEE")))
                .andExpect(jsonPath("$.permissions[?(@ == 'ANALYTICS_READ')]").exists());

        mockMvc.perform(get("/api/admin/v1/analytics/summary")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/v1/analytics/events.csv")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/v1/audit/logs")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[?(@.action == 'ADMIN_SESSION_VIEWED')]").exists());

        mockMvc.perform(get("/api/admin/v1/audit/logs")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isForbidden());
    }

    @Test
    void logsInWithBootstrapAccountAndSupportsBearerSessions() throws Exception {
        mockMvc.perform(post("/api/admin/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"owner\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized());

        MvcResult login = mockMvc.perform(post("/api/admin/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"owner\",\"password\":\"local-admin-pass\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.role", is("SUPER_ADMIN")))
                .andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/admin/v1/session")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject", is("owner")));

        mockMvc.perform(get("/api/admin/v1/analytics/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/v1/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/admin/v1/session")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inviteRegistrationCreatesEmployeeAccountThatCanLogin() throws Exception {
        mockMvc.perform(post("/api/admin/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-employee\",\"displayName\":\"New Employee\",\"password\":\"employee-password\",\"inviteCode\":\"wrong-code\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/admin/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-employee\",\"displayName\":\"New Employee\",\"password\":\"employee-password\",\"inviteCode\":\"local-invite-code\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("EMPLOYEE")));

        mockMvc.perform(post("/api/admin/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-employee\",\"password\":\"employee-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("EMPLOYEE")));
    }

    @Test
    void superAdminCanManageAccountsAndLockedAccountsCannotLogin() throws Exception {
        mockMvc.perform(get("/api/admin/v1/accounts")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].username", is("owner")));

        mockMvc.perform(post("/api/admin/v1/accounts")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"ops-admin\",\"displayName\":\"Operations Admin\",\"password\":\"ops-admin-password\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role", is("ADMIN")));

        mockMvc.perform(get("/api/admin/v1/accounts")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/admin/v1/accounts/ops-admin")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\",\"status\":\"LOCKED\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"ops-admin\",\"password\":\"ops-admin-password\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/admin/v1/accounts")
                        .header("X-Admin-Test-Token", "local-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"locked-admin\",\"displayName\":\"Locked Admin\",\"password\":\"locked-admin-password\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isCreated());
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/api/admin/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"username\":\"locked-admin\",\"password\":\"wrong-password\"}"))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/admin/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"locked-admin\",\"password\":\"locked-admin-password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void superAdminCanListAndRevokeAdminSessions() throws Exception {
        mockMvc.perform(get("/api/admin/v1/sessions")
                        .header("X-Admin-Test-Token", "local-employee"))
                .andExpect(status().isForbidden());

        MvcResult login = mockMvc.perform(post("/api/admin/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"owner\",\"password\":\"local-admin-pass\"}"))
                .andExpect(status().isOk()).andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        MvcResult sessions = mockMvc.perform(get("/api/admin/v1/sessions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].username", is("owner")))
                .andExpect(jsonPath("$.items[0].active", is(true)))
                .andReturn();
        String sessionId = objectMapper.readTree(sessions.getResponse().getContentAsString())
                .get("items").get(0).get("id").asText();

        mockMvc.perform(post("/api/admin/v1/sessions/" + sessionId + "/revoke")
                        .header("X-Admin-Test-Token", "local-admin"))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/v1/session")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
