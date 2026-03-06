package com.st6.weeklycommit.service;

import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.model.entity.DefiningObjective;
import com.st6.weeklycommit.model.entity.Outcome;
import com.st6.weeklycommit.model.entity.RallyCry;
import com.st6.weeklycommit.repository.DefiningObjectiveRepository;
import com.st6.weeklycommit.repository.OutcomeRepository;
import com.st6.weeklycommit.repository.RallyCryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RcdoServiceTest {

    @Mock private RallyCryRepository rallyCryRepo;
    @Mock private DefiningObjectiveRepository objectiveRepo;
    @Mock private OutcomeRepository outcomeRepo;

    @InjectMocks
    private RcdoService rcdoService;

    @Test
    void createRallyCry() {
        when(rallyCryRepo.save(any())).thenAnswer(inv -> {
            RallyCry rc = inv.getArgument(0);
            rc.setId(UUID.randomUUID());
            rc.setDefiningObjectives(new ArrayList<>());
            return rc;
        });
        var result = rcdoService.createRallyCry(new CreateRallyCryRequest("Test RC", "desc"));
        assertEquals("Test RC", result.title());
    }

    @Test
    void getRallyCryNotFound() {
        when(rallyCryRepo.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> rcdoService.getRallyCry(UUID.randomUUID()));
    }

    @Test
    void updateRallyCry() {
        var rc = makeRallyCry();
        when(rallyCryRepo.findById(rc.getId())).thenReturn(Optional.of(rc));
        when(rallyCryRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = rcdoService.updateRallyCry(rc.getId(), new UpdateRallyCryRequest("Updated", "new desc"));
        assertEquals("Updated", result.title());
    }

    @Test
    void updateRallyCryNotFound() {
        when(rallyCryRepo.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> rcdoService.updateRallyCry(UUID.randomUUID(), new UpdateRallyCryRequest("t", "d")));
    }

    @Test
    void deleteRallyCry() {
        var id = UUID.randomUUID();
        when(rallyCryRepo.existsById(id)).thenReturn(true);
        assertDoesNotThrow(() -> rcdoService.deleteRallyCry(id));
        verify(rallyCryRepo).deleteById(id);
    }

    @Test
    void deleteRallyCryNotFound() {
        when(rallyCryRepo.existsById(any())).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> rcdoService.deleteRallyCry(UUID.randomUUID()));
    }

    @Test
    void createObjective() {
        var rc = makeRallyCry();
        when(rallyCryRepo.findById(rc.getId())).thenReturn(Optional.of(rc));
        when(objectiveRepo.save(any())).thenAnswer(inv -> {
            DefiningObjective obj = inv.getArgument(0);
            obj.setId(UUID.randomUUID());
            obj.setOutcomes(new ArrayList<>());
            return obj;
        });
        var result = rcdoService.createObjective(new CreateDefiningObjectiveRequest(rc.getId(), "Obj 1", "desc"));
        assertEquals("Obj 1", result.title());
    }

    @Test
    void updateObjective() {
        var rc = makeRallyCry();
        var obj = new DefiningObjective();
        obj.setId(UUID.randomUUID());
        obj.setRallyCry(rc);
        obj.setTitle("Old");
        obj.setOutcomes(new ArrayList<>());

        when(objectiveRepo.findById(obj.getId())).thenReturn(Optional.of(obj));
        when(objectiveRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = rcdoService.updateObjective(obj.getId(), new UpdateDefiningObjectiveRequest("New", "new desc"));
        assertEquals("New", result.title());
    }

    @Test
    void deleteObjective() {
        var id = UUID.randomUUID();
        when(objectiveRepo.existsById(id)).thenReturn(true);
        assertDoesNotThrow(() -> rcdoService.deleteObjective(id));
        verify(objectiveRepo).deleteById(id);
    }

    @Test
    void createOutcome() {
        var rc = makeRallyCry();
        var obj = new DefiningObjective();
        obj.setId(UUID.randomUUID());
        obj.setRallyCry(rc);
        obj.setOutcomes(new ArrayList<>());

        when(objectiveRepo.findById(obj.getId())).thenReturn(Optional.of(obj));
        when(outcomeRepo.save(any())).thenAnswer(inv -> {
            Outcome o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        var result = rcdoService.createOutcome(new CreateOutcomeRequest(obj.getId(), "Outcome 1", null));
        assertEquals("Outcome 1", result.title());
    }

    @Test
    void updateOutcome() {
        var rc = makeRallyCry();
        var obj = new DefiningObjective();
        obj.setId(UUID.randomUUID());
        obj.setRallyCry(rc);

        var outcome = new Outcome();
        outcome.setId(UUID.randomUUID());
        outcome.setDefiningObjective(obj);
        outcome.setTitle("Old");

        when(outcomeRepo.findById(outcome.getId())).thenReturn(Optional.of(outcome));
        when(outcomeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = rcdoService.updateOutcome(outcome.getId(), new UpdateOutcomeRequest("New Outcome", "desc"));
        assertEquals("New Outcome", result.title());
    }

    @Test
    void deleteOutcome() {
        var id = UUID.randomUUID();
        when(outcomeRepo.existsById(id)).thenReturn(true);
        assertDoesNotThrow(() -> rcdoService.deleteOutcome(id));
        verify(outcomeRepo).deleteById(id);
    }

    private RallyCry makeRallyCry() {
        var rc = new RallyCry();
        rc.setId(UUID.randomUUID());
        rc.setTitle("RC");
        rc.setDefiningObjectives(new ArrayList<>());
        return rc;
    }
}
