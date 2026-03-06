package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.TestcontainersConfig;
import org.junit.jupiter.api.Test;
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
class RcdoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listRallyCries() throws Exception {
        mockMvc.perform(get("/api/v1/rcdo/rally-cries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getRallyCryById() throws Exception {
        mockMvc.perform(get("/api/v1/rcdo/rally-cries/a0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Accelerate Product-Led Growth"));
    }

    @Test
    void getRallyCryNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/rcdo/rally-cries/00000000-0000-0000-0000-000000000099"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createRallyCry() throws Exception {
        mockMvc.perform(post("/api/v1/rcdo/rally-cries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "New Rally Cry", "description": "test"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Rally Cry"));
    }

    @Test
    void createRallyCryValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/rcdo/rally-cries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "", "description": "test"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateRallyCry() throws Exception {
        mockMvc.perform(put("/api/v1/rcdo/rally-cries/a0000000-0000-0000-0000-000000000002")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Updated Title", "description": "updated"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    @Test
    void listObjectives() throws Exception {
        mockMvc.perform(get("/api/v1/rcdo/objectives?rallyCryId=a0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void createObjective() throws Exception {
        mockMvc.perform(post("/api/v1/rcdo/objectives")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rallyCryId": "a0000000-0000-0000-0000-000000000001", "title": "New Obj", "description": null}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Obj"));
    }

    @Test
    void listOutcomes() throws Exception {
        mockMvc.perform(get("/api/v1/rcdo/outcomes?definingObjectiveId=b0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void createOutcome() throws Exception {
        mockMvc.perform(post("/api/v1/rcdo/outcomes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"definingObjectiveId": "b0000000-0000-0000-0000-000000000001", "title": "New Outcome"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Outcome"));
    }

    @Test
    void updateObjective() throws Exception {
        mockMvc.perform(put("/api/v1/rcdo/objectives/b0000000-0000-0000-0000-000000000003")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Updated Objective", "description": "new desc"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Objective"));
    }

    @Test
    void updateOutcome() throws Exception {
        mockMvc.perform(put("/api/v1/rcdo/outcomes/c0000000-0000-0000-0000-000000000006")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Updated Outcome", "description": null}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Outcome"));
    }
}
