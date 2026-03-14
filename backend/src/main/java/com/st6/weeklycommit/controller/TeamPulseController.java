package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.repository.TeamMemberRepository;
import com.st6.weeklycommit.service.TeamPulseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pulse")
public class TeamPulseController {

    private final TeamPulseService pulseService;
    private final TeamMemberRepository memberRepo;

    public TeamPulseController(TeamPulseService pulseService, TeamMemberRepository memberRepo) {
        this.pulseService = pulseService;
        this.memberRepo = memberRepo;
    }

    @PostMapping("/high-fives")
    @ResponseStatus(HttpStatus.CREATED)
    public HighFiveDto createHighFive(@Valid @RequestBody CreateHighFiveRequest req) {
        var member = currentMember();
        return pulseService.createHighFive(member.getId(), req);
    }

    @GetMapping("/high-fives")
    public List<HighFiveDto> getHighFives(@RequestParam LocalDate weekStart) {
        var member = currentMember();
        return pulseService.getHighFives(weekStart, member.getId(), member.getTeam().getId());
    }

    @DeleteMapping("/high-fives/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteHighFive(@PathVariable UUID id) {
        var member = currentMember();
        pulseService.deleteHighFive(id, member.getId());
    }

    @PostMapping("/retrospectives")
    @ResponseStatus(HttpStatus.CREATED)
    public RetrospectiveEntryDto upsertRetrospective(@Valid @RequestBody UpsertRetrospectiveRequest req) {
        var member = currentMember();
        return pulseService.upsertRetrospective(member.getId(), req);
    }

    @GetMapping("/retrospectives")
    public List<RetrospectiveEntryDto> getRetrospectives(@RequestParam LocalDate weekStart) {
        var member = currentMember();
        return pulseService.getRetrospectives(member.getId(), weekStart);
    }

    private com.st6.weeklycommit.model.entity.TeamMember currentMember() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var email = auth != null ? auth.getName() : null;
        if (email == null) throw new IllegalStateException("Not authenticated");
        return memberRepo.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("Member not found for email: " + email));
    }
}
