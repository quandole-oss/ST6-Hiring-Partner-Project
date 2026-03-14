package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.model.entity.DefiningObjective;
import com.st6.weeklycommit.model.entity.Outcome;
import com.st6.weeklycommit.model.entity.RallyCry;
import com.st6.weeklycommit.repository.CommitItemRepository;
import com.st6.weeklycommit.repository.DefiningObjectiveRepository;
import com.st6.weeklycommit.repository.OutcomeRepository;
import com.st6.weeklycommit.repository.RallyCryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RcdoService {

    private final RallyCryRepository rallyCryRepo;
    private final DefiningObjectiveRepository objectiveRepo;
    private final OutcomeRepository outcomeRepo;
    private final CommitItemRepository commitItemRepo;

    public RcdoService(RallyCryRepository rallyCryRepo, DefiningObjectiveRepository objectiveRepo, OutcomeRepository outcomeRepo, CommitItemRepository commitItemRepo) {
        this.rallyCryRepo = rallyCryRepo;
        this.objectiveRepo = objectiveRepo;
        this.outcomeRepo = outcomeRepo;
        this.commitItemRepo = commitItemRepo;
    }

    public List<RallyCryDto> getAllRallyCries() {
        return rallyCryRepo.findAll().stream().map(this::toDto).toList();
    }

    public RallyCryDto getRallyCry(UUID id) {
        return toDto(rallyCryRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Rally cry not found: " + id)));
    }

    @Transactional
    public RallyCryDto createRallyCry(CreateRallyCryRequest req) {
        var rc = new RallyCry();
        rc.setTitle(req.title());
        rc.setDescription(req.description());
        return toDto(rallyCryRepo.save(rc));
    }

    public List<DefiningObjectiveDto> getObjectives(UUID rallyCryId) {
        return objectiveRepo.findByRallyCryId(rallyCryId).stream().map(this::toDto).toList();
    }

    @Transactional
    public DefiningObjectiveDto createObjective(CreateDefiningObjectiveRequest req) {
        var rc = rallyCryRepo.findById(req.rallyCryId()).orElseThrow(() -> new IllegalArgumentException("Rally cry not found: " + req.rallyCryId()));
        var obj = new DefiningObjective();
        obj.setRallyCry(rc);
        obj.setTitle(req.title());
        obj.setDescription(req.description());
        return toDto(objectiveRepo.save(obj));
    }

    public List<OutcomeDto> getOutcomes(UUID objectiveId) {
        return outcomeRepo.findByDefiningObjectiveId(objectiveId).stream().map(this::toDto).toList();
    }

    @Transactional
    public OutcomeDto createOutcome(CreateOutcomeRequest req) {
        var obj = objectiveRepo.findById(req.definingObjectiveId()).orElseThrow(() -> new IllegalArgumentException("Objective not found: " + req.definingObjectiveId()));
        var outcome = new Outcome();
        outcome.setDefiningObjective(obj);
        outcome.setTitle(req.title());
        outcome.setDescription(req.description());
        return toDto(outcomeRepo.save(outcome));
    }

    @Transactional
    public RallyCryDto updateRallyCry(UUID id, UpdateRallyCryRequest req) {
        var rc = rallyCryRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Rally cry not found: " + id));
        rc.setTitle(req.title());
        rc.setDescription(req.description());
        return toDto(rallyCryRepo.save(rc));
    }

    @Transactional
    public void deleteRallyCry(UUID id) {
        var rc = rallyCryRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Rally cry not found: " + id));
        var outcomeIds = rc.getDefiningObjectives().stream()
                .flatMap(obj -> obj.getOutcomes().stream())
                .map(Outcome::getId)
                .toList();
        if (!outcomeIds.isEmpty() && commitItemRepo.existsByOutcomeIdIn(outcomeIds)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete Rally Cry because it has outcomes with linked commit items");
        }
        rallyCryRepo.deleteById(id);
    }

    @Transactional
    public DefiningObjectiveDto updateObjective(UUID id, UpdateDefiningObjectiveRequest req) {
        var obj = objectiveRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Objective not found: " + id));
        obj.setTitle(req.title());
        obj.setDescription(req.description());
        return toDto(objectiveRepo.save(obj));
    }

    @Transactional
    public void deleteObjective(UUID id) {
        var obj = objectiveRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Objective not found: " + id));
        var outcomeIds = obj.getOutcomes().stream().map(Outcome::getId).toList();
        if (!outcomeIds.isEmpty() && commitItemRepo.existsByOutcomeIdIn(outcomeIds)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete Objective because it has outcomes with linked commit items");
        }
        objectiveRepo.deleteById(id);
    }

    @Transactional
    public OutcomeDto updateOutcome(UUID id, UpdateOutcomeRequest req) {
        var outcome = outcomeRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Outcome not found: " + id));
        outcome.setTitle(req.title());
        outcome.setDescription(req.description());
        return toDto(outcomeRepo.save(outcome));
    }

    @Transactional
    public void deleteOutcome(UUID id) {
        if (!outcomeRepo.existsById(id)) throw new IllegalArgumentException("Outcome not found: " + id);
        if (commitItemRepo.existsByOutcomeId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete Outcome because it has linked commit items");
        }
        outcomeRepo.deleteById(id);
    }

    private RallyCryDto toDto(RallyCry rc) {
        return new RallyCryDto(rc.getId(), rc.getTitle(), rc.getDescription(), rc.getCreatedAt(), rc.getDefiningObjectives().stream().map(this::toDto).toList());
    }

    private DefiningObjectiveDto toDto(DefiningObjective obj) {
        return new DefiningObjectiveDto(obj.getId(), obj.getRallyCry().getId(), obj.getTitle(), obj.getDescription(), obj.getOutcomes().stream().map(this::toDto).toList());
    }

    private OutcomeDto toDto(Outcome o) {
        return new OutcomeDto(o.getId(), o.getDefiningObjective().getId(), o.getTitle(), o.getDescription());
    }
}
