package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.PersonalAnalyticsDto;
import com.st6.weeklycommit.service.PersonalAnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
public class PersonalAnalyticsController {

    private final PersonalAnalyticsService analyticsService;

    public PersonalAnalyticsController(PersonalAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/personal/{memberId}")
    public PersonalAnalyticsDto getPersonalAnalytics(@PathVariable UUID memberId) {
        return analyticsService.getAnalytics(memberId);
    }
}
