package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.TestcontainersConfig;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CommitControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @Order(1)
    void listTeams() throws Exception {
        mockMvc.perform(get("/api/v1/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Platform Squad"));
    }

    @Test
    @Order(2)
    void listTeamMembers() throws Exception {
        mockMvc.perform(get("/api/v1/teams/d0000000-0000-0000-0000-000000000001/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    @Order(3)
    void getExistingCommit() throws Exception {
        mockMvc.perform(get("/api/v1/commits/f0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.hasBlockedItems").value(false))
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].carryForwardCount").value(0))
                .andExpect(jsonPath("$.items[0].flaggedStale").value(false));
    }

    @Test
    @Order(4)
    void addItemToCommit() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Integration test item", "sortOrder": 4, "chessCategory": "TACTICAL", "effortEstimate": 2, "impactEstimate": 4}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration test item"));
    }

    @Test
    @Order(5)
    void lockCommit() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/lock")
                        .header("X-Triggered-By", "TEST_USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LOCKED"));
    }

    @Test
    @Order(6)
    void addItemToLockedCommitFails() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Should fail", "sortOrder": 5}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(7)
    void getAuditLogAfterLock() throws Exception {
        mockMvc.perform(get("/api/v1/commits/f0000000-0000-0000-0000-000000000001/audit-log"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].previousState").value("DRAFT"))
                .andExpect(jsonPath("$[0].newState").value("LOCKED"))
                .andExpect(jsonPath("$[0].triggeredBy").value("TEST_USER"))
                .andExpect(jsonPath("$[0].isManualOverride").value(false));
    }

    @Test
    @Order(8)
    void flagItemAsBlocked() throws Exception {
        mockMvc.perform(put("/api/v1/commits/f0000000-0000-0000-0000-000000000001/items/10000000-0000-0000-0000-000000000001/risk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"riskFlag": "BLOCKED", "riskNote": "Waiting on API team"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskFlag").value("BLOCKED"))
                .andExpect(jsonPath("$.riskNote").value("Waiting on API team"))
                .andExpect(jsonPath("$.riskFlaggedAt").isNotEmpty());
    }

    @Test
    @Order(9)
    void commitNowHasBlockedItems() throws Exception {
        mockMvc.perform(get("/api/v1/commits/f0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasBlockedItems").value(true));
    }

    @Test
    @Order(10)
    void getBlockedItems() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/team/d0000000-0000-0000-0000-000000000001/blocked-items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].riskFlag").value("BLOCKED"))
                .andExpect(jsonPath("$[0].riskNote").value("Waiting on API team"));
    }

    @Test
    @Order(11)
    void startReconciliation() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/reconcile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECONCILING"));
    }

    @Test
    @Order(12)
    void invalidTransitionReturnsConflict() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/lock"))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(13)
    void overrideStatusBackToLocked() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/override")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Triggered-By", "MANAGER")
                        .content("""
                                {"targetStatus": "LOCKED", "notes": "Reopening for risk review"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LOCKED"));
    }

    @Test
    @Order(14)
    void auditLogShowsOverride() throws Exception {
        mockMvc.perform(get("/api/v1/commits/f0000000-0000-0000-0000-000000000001/audit-log"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isManualOverride").value(true))
                .andExpect(jsonPath("$[0].triggeredBy").value("MANAGER"))
                .andExpect(jsonPath("$[0].notes").value("Reopening for risk review"));
    }

    @Test
    @Order(15)
    void getCommitNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/commits/00000000-0000-0000-0000-000000000099"))
                .andExpect(status().isNotFound());
    }
}
