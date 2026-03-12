package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.EmailExportRequest;
import com.st6.weeklycommit.model.dto.ExportResultDto;
import com.st6.weeklycommit.model.dto.ExportSettingsDto;
import com.st6.weeklycommit.model.entity.TeamExportSettings;
import com.st6.weeklycommit.repository.TeamExportSettingsRepository;
import com.st6.weeklycommit.repository.TeamRepository;
import com.st6.weeklycommit.service.EmailExportService;
import com.st6.weeklycommit.service.PdfExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/export/team/{teamId}")
public class ExportController {

    private final PdfExportService pdfExportService;
    private final EmailExportService emailExportService;
    private final TeamExportSettingsRepository settingsRepo;
    private final TeamRepository teamRepo;

    public ExportController(PdfExportService pdfExportService, EmailExportService emailExportService, TeamExportSettingsRepository settingsRepo, TeamRepository teamRepo) {
        this.pdfExportService = pdfExportService;
        this.emailExportService = emailExportService;
        this.settingsRepo = settingsRepo;
        this.teamRepo = teamRepo;
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID teamId) {
        byte[] pdf = pdfExportService.generateTeamReport(teamId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=weekly-commit-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/email")
    public ExportResultDto sendEmail(@PathVariable UUID teamId, @RequestBody EmailExportRequest request) {
        emailExportService.sendTeamReport(teamId, request.recipients(), request.attachPdf());
        return new ExportResultDto(true, "Email sent to " + request.recipients().size() + " recipients");
    }

    @GetMapping("/settings")
    public ExportSettingsDto getSettings(@PathVariable UUID teamId) {
        return settingsRepo.findByTeamId(teamId)
                .map(s -> new ExportSettingsDto(s.getId(), teamId, s.getSlackWebhookUrl(), s.getDefaultEmailRecipients()))
                .orElse(new ExportSettingsDto(null, teamId, null, null));
    }

    @PutMapping("/settings")
    public ExportSettingsDto updateSettings(@PathVariable UUID teamId, @RequestBody ExportSettingsDto dto) {
        TeamExportSettings settings = settingsRepo.findByTeamId(teamId).orElseGet(() -> {
            var s = new TeamExportSettings();
            s.setTeam(teamRepo.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Team not found")));
            return s;
        });
        settings.setDefaultEmailRecipients(dto.defaultEmailRecipients());
        settings.setSlackWebhookUrl(dto.slackWebhookUrl());
        var saved = settingsRepo.save(settings);
        return new ExportSettingsDto(saved.getId(), teamId, saved.getSlackWebhookUrl(), saved.getDefaultEmailRecipients());
    }
}
