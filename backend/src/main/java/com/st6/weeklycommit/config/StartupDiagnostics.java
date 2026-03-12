package com.st6.weeklycommit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.boot.context.event.ApplicationFailedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupDiagnostics {

    private static final Logger log = LoggerFactory.getLogger(StartupDiagnostics.class);

    @EventListener
    public void onStarted(ApplicationStartedEvent event) {
        Runtime rt = Runtime.getRuntime();
        log.info("=== APPLICATION STARTED SUCCESSFULLY ===");
        log.info("PORT={}", System.getenv("PORT"));
        log.info("DATASOURCE_URL set={}", System.getenv("SPRING_DATASOURCE_URL") != null);
        log.info("Heap: used={}MB, max={}MB", rt.totalMemory() / 1_048_576, rt.maxMemory() / 1_048_576);
    }

    @EventListener
    public void onFailed(ApplicationFailedEvent event) {
        log.error("=== APPLICATION FAILED TO START ===");
        log.error("PORT={}", System.getenv("PORT"));
        log.error("DATASOURCE_URL set={}", System.getenv("SPRING_DATASOURCE_URL") != null);
        log.error("Cause: {}", event.getException().getMessage());
    }
}
