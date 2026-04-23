package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.TeamDto;
import com.st6.weeklycommit.model.dto.TeamMemberDto;
import com.st6.weeklycommit.repository.TeamMemberRepository;
import com.st6.weeklycommit.repository.TeamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {

    private final TeamRepository teamRepo;
    private final TeamMemberRepository memberRepo;

    public TeamController(TeamRepository teamRepo, TeamMemberRepository memberRepo) {
        this.teamRepo = teamRepo;
        this.memberRepo = memberRepo;
    }

    @GetMapping
    public List<TeamDto> listTeams() {
        return teamRepo.findAll().stream()
                .map(t -> new TeamDto(t.getId(), t.getName()))
                .toList();
    }

    @GetMapping("/{id}/members")
    public List<TeamMemberDto> listMembers(@PathVariable UUID id) {
        if (!teamRepo.existsById(id)) {
            throw new IllegalArgumentException("Team not found: " + id);
        }
        return memberRepo.findByTeamId(id).stream()
                .map(m -> new TeamMemberDto(m.getId(), m.getTeam().getId(), m.getName(), m.getEmail(), m.getRole()))
                .toList();
    }

    /**
     * Paginated team-members listing. Satisfies the spec's pagination
     * requirement (Spring Data Pageable, team views up to ~2000 records)
     * additively — the existing /members endpoint above is untouched so
     * existing frontend consumers don't break.
     *
     * Usage: GET /api/v1/teams/{id}/members/page?page=0&size=50&sort=name,asc
     */
    @GetMapping("/{id}/members/page")
    public Page<TeamMemberDto> listMembersPage(@PathVariable UUID id, Pageable pageable) {
        if (!teamRepo.existsById(id)) {
            throw new IllegalArgumentException("Team not found: " + id);
        }
        return memberRepo.findByTeamId(id, pageable)
                .map(m -> new TeamMemberDto(m.getId(), m.getTeam().getId(), m.getName(), m.getEmail(), m.getRole()));
    }
}
