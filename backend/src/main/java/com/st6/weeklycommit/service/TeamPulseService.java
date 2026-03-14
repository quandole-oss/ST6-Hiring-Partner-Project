package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.model.entity.*;
import com.st6.weeklycommit.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TeamPulseService {

    private final HighFiveRepository highFiveRepo;
    private final RetrospectiveEntryRepository retroRepo;
    private final TeamMemberRepository memberRepo;
    private final TeamRepository teamRepo;
    private final OutcomeRepository outcomeRepo;

    public TeamPulseService(HighFiveRepository highFiveRepo, RetrospectiveEntryRepository retroRepo,
                            TeamMemberRepository memberRepo, TeamRepository teamRepo, OutcomeRepository outcomeRepo) {
        this.highFiveRepo = highFiveRepo;
        this.retroRepo = retroRepo;
        this.memberRepo = memberRepo;
        this.teamRepo = teamRepo;
        this.outcomeRepo = outcomeRepo;
    }

    @Transactional
    public HighFiveDto createHighFive(UUID currentMemberId, CreateHighFiveRequest req) {
        if (req.receiverTeamId() == null && req.receiverMemberId() == null) {
            throw new IllegalArgumentException("Either receiverTeamId or receiverMemberId must be provided");
        }

        var giver = memberRepo.findById(currentMemberId)
            .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + currentMemberId));

        TeamMember receiverMember = null;
        Team receiverTeam;

        if (req.receiverMemberId() != null) {
            // Individual high five
            receiverMember = memberRepo.findById(req.receiverMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + req.receiverMemberId()));
            receiverTeam = receiverMember.getTeam();

            var existing = highFiveRepo.findByGiverIdAndReceiverMemberIdAndWeekStart(
                currentMemberId, req.receiverMemberId(), req.weekStart());
            HighFive hf;
            if (existing.isPresent()) {
                hf = existing.get();
                hf.setMessage(req.message());
                hf.setPublic(req.isPublic());
            } else {
                hf = new HighFive();
                hf.setGiver(giver);
                hf.setReceiverTeam(receiverTeam);
                hf.setReceiverMember(receiverMember);
                hf.setWeekStart(req.weekStart());
                hf.setMessage(req.message());
                hf.setPublic(req.isPublic());
            }
            return toDto(highFiveRepo.save(hf));
        } else {
            // Team high five
            receiverTeam = teamRepo.findById(req.receiverTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + req.receiverTeamId()));

            var existing = highFiveRepo.findByGiverIdAndReceiverTeamIdAndWeekStart(
                currentMemberId, req.receiverTeamId(), req.weekStart());
            HighFive hf;
            if (existing.isPresent()) {
                hf = existing.get();
                hf.setMessage(req.message());
                hf.setPublic(req.isPublic());
            } else {
                hf = new HighFive();
                hf.setGiver(giver);
                hf.setReceiverTeam(receiverTeam);
                hf.setWeekStart(req.weekStart());
                hf.setMessage(req.message());
                hf.setPublic(req.isPublic());
            }
            return toDto(highFiveRepo.save(hf));
        }
    }

    public List<HighFiveDto> getHighFives(java.time.LocalDate weekStart, UUID currentMemberId, UUID currentTeamId) {
        return highFiveRepo.findVisibleForWeek(weekStart, currentMemberId, currentTeamId)
            .stream().map(this::toDto).toList();
    }

    @Transactional
    public void deleteHighFive(UUID id, UUID currentMemberId) {
        var hf = highFiveRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("High five not found: " + id));
        if (!hf.getGiver().getId().equals(currentMemberId)) {
            throw new IllegalStateException("Only the giver can delete a high five");
        }
        highFiveRepo.delete(hf);
    }

    @Transactional
    public RetrospectiveEntryDto upsertRetrospective(UUID currentMemberId, UpsertRetrospectiveRequest req) {
        var member = memberRepo.findById(currentMemberId)
            .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + currentMemberId));

        var existing = retroRepo.findByTeamMemberIdAndWeekStartAndPromptKey(currentMemberId, req.weekStart(), req.promptKey());
        RetrospectiveEntry entry;
        if (existing.isPresent()) {
            entry = existing.get();
            entry.setResponse(req.response());
        } else {
            entry = new RetrospectiveEntry();
            entry.setTeamMember(member);
            entry.setWeekStart(req.weekStart());
            entry.setPromptKey(req.promptKey());
            entry.setResponse(req.response());
        }

        if (req.outcomeId() != null) {
            var outcome = outcomeRepo.findById(req.outcomeId())
                .orElseThrow(() -> new IllegalArgumentException("Outcome not found: " + req.outcomeId()));
            entry.setOutcome(outcome);
        } else {
            entry.setOutcome(null);
        }

        return toRetroDto(retroRepo.save(entry));
    }

    public List<RetrospectiveEntryDto> getRetrospectives(UUID teamMemberId, java.time.LocalDate weekStart) {
        return retroRepo.findByTeamMemberIdAndWeekStart(teamMemberId, weekStart)
            .stream().map(this::toRetroDto).toList();
    }

    private HighFiveDto toDto(HighFive hf) {
        return new HighFiveDto(
            hf.getId(),
            hf.getGiver().getId(),
            hf.getGiver().getName(),
            hf.getReceiverTeam().getId(),
            hf.getReceiverTeam().getName(),
            hf.getReceiverMember() != null ? hf.getReceiverMember().getId() : null,
            hf.getReceiverMember() != null ? hf.getReceiverMember().getName() : null,
            hf.getWeekStart(),
            hf.getMessage(),
            hf.isPublic(),
            hf.getCreatedAt()
        );
    }

    private RetrospectiveEntryDto toRetroDto(RetrospectiveEntry e) {
        return new RetrospectiveEntryDto(
            e.getId(),
            e.getTeamMember().getId(),
            e.getWeekStart(),
            e.getOutcome() != null ? e.getOutcome().getId() : null,
            e.getOutcome() != null ? e.getOutcome().getTitle() : null,
            e.getPromptKey(),
            e.getResponse(),
            e.getCreatedAt()
        );
    }
}
