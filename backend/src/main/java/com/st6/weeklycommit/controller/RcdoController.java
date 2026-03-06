package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.service.RcdoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rcdo")
public class RcdoController {

    private final RcdoService rcdoService;

    public RcdoController(RcdoService rcdoService) {
        this.rcdoService = rcdoService;
    }

    @GetMapping("/rally-cries")
    public List<RallyCryDto> listRallyCries() { return rcdoService.getAllRallyCries(); }

    @GetMapping("/rally-cries/{id}")
    public RallyCryDto getRallyCry(@PathVariable UUID id) { return rcdoService.getRallyCry(id); }

    @PostMapping("/rally-cries")
    @ResponseStatus(HttpStatus.CREATED)
    public RallyCryDto createRallyCry(@Valid @RequestBody CreateRallyCryRequest req) { return rcdoService.createRallyCry(req); }

    @GetMapping("/objectives")
    public List<DefiningObjectiveDto> listObjectives(@RequestParam UUID rallyCryId) { return rcdoService.getObjectives(rallyCryId); }

    @PostMapping("/objectives")
    @ResponseStatus(HttpStatus.CREATED)
    public DefiningObjectiveDto createObjective(@Valid @RequestBody CreateDefiningObjectiveRequest req) { return rcdoService.createObjective(req); }

    @GetMapping("/outcomes")
    public List<OutcomeDto> listOutcomes(@RequestParam UUID definingObjectiveId) { return rcdoService.getOutcomes(definingObjectiveId); }

    @PostMapping("/outcomes")
    @ResponseStatus(HttpStatus.CREATED)
    public OutcomeDto createOutcome(@Valid @RequestBody CreateOutcomeRequest req) { return rcdoService.createOutcome(req); }

    @PutMapping("/rally-cries/{id}")
    public RallyCryDto updateRallyCry(@PathVariable UUID id, @Valid @RequestBody UpdateRallyCryRequest req) { return rcdoService.updateRallyCry(id, req); }

    @DeleteMapping("/rally-cries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRallyCry(@PathVariable UUID id) { rcdoService.deleteRallyCry(id); }

    @PutMapping("/objectives/{id}")
    public DefiningObjectiveDto updateObjective(@PathVariable UUID id, @Valid @RequestBody UpdateDefiningObjectiveRequest req) { return rcdoService.updateObjective(id, req); }

    @DeleteMapping("/objectives/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteObjective(@PathVariable UUID id) { rcdoService.deleteObjective(id); }

    @PutMapping("/outcomes/{id}")
    public OutcomeDto updateOutcome(@PathVariable UUID id, @Valid @RequestBody UpdateOutcomeRequest req) { return rcdoService.updateOutcome(id, req); }

    @DeleteMapping("/outcomes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOutcome(@PathVariable UUID id) { rcdoService.deleteOutcome(id); }
}
