package com.st6.weeklycommit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

/**
 * Shifts seed demo data to the current ISO week on every startup.
 * Active when app.demo-mode=true OR app.seed-demo-data=true.
 */
@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true", matchIfMissing = false)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final JdbcTemplate jdbc;

    public DemoDataSeeder(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("[DemoDataSeeder] Active — seed-demo-data is enabled");

        LocalDate currentMonday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        LocalDate existingMonday = jdbc.query(
                "SELECT week_start FROM weekly_commit WHERE id = 'f0000000-0000-0000-0000-000000000001'::uuid",
                rs -> rs.next() ? rs.getObject("week_start", LocalDate.class) : null
        );

        if (existingMonday == null) {
            log.warn("[DemoDataSeeder] Seed commit not found, skipping");
            return;
        }

        if (existingMonday.equals(currentMonday)) {
            log.info("[DemoDataSeeder] Seed data already at current week (Monday={}), no update needed", currentMonday);
            return;
        }

        long daysDelta = ChronoUnit.DAYS.between(existingMonday, currentMonday);
        log.info("[DemoDataSeeder] Shifting seed data by {} days ({} -> {})", daysDelta, existingMonday, currentMonday);

        // 1. weekly_commit: shift week_start, locked_at, reconciled_at
        int n = jdbc.update("""
                UPDATE weekly_commit
                SET week_start    = week_start    + CAST(? AS INTEGER),
                    locked_at     = locked_at     + CAST(? AS INTEGER) * INTERVAL '1 day',
                    reconciled_at = reconciled_at + CAST(? AS INTEGER) * INTERVAL '1 day',
                    updated_at    = NOW()
                WHERE id IN (
                    'f0000000-0000-0000-0000-000000000001'::uuid,
                    'f0000000-0000-0000-0000-000000000002'::uuid,
                    'f0000000-0000-0000-0000-000000000003'::uuid,
                    'f0000000-0000-0000-0000-000000000004'::uuid,
                    'f1000000-0000-0000-0000-000000000001'::uuid,
                    'f1000000-0000-0000-0000-000000000002'::uuid,
                    'f1000000-0000-0000-0000-000000000003'::uuid,
                    'f1000000-0000-0000-0000-000000000004'::uuid
                )
                """, daysDelta, daysDelta, daysDelta);
        log.info("[DemoDataSeeder] Updated {} weekly_commit rows", n);

        // 2. commit_item: shift risk_flagged_at
        n = jdbc.update("""
                UPDATE commit_item
                SET risk_flagged_at = risk_flagged_at + CAST(? AS INTEGER) * INTERVAL '1 day',
                    updated_at      = NOW()
                WHERE weekly_commit_id IN (
                    'f0000000-0000-0000-0000-000000000001'::uuid,
                    'f0000000-0000-0000-0000-000000000002'::uuid,
                    'f0000000-0000-0000-0000-000000000003'::uuid,
                    'f0000000-0000-0000-0000-000000000004'::uuid
                )
                AND risk_flagged_at IS NOT NULL
                """, daysDelta);
        log.info("[DemoDataSeeder] Updated {} commit_item risk timestamps", n);

        // 3. high_five: shift week_start
        n = jdbc.update("""
                UPDATE high_five
                SET week_start = week_start + CAST(? AS INTEGER),
                    updated_at = NOW()
                WHERE id IN (
                    '30000000-0000-0000-0000-000000000001'::uuid,
                    '30000000-0000-0000-0000-000000000002'::uuid,
                    '30000000-0000-0000-0000-000000000003'::uuid,
                    '30000000-0000-0000-0000-000000000004'::uuid
                )
                """, daysDelta);
        log.info("[DemoDataSeeder] Updated {} high_five rows", n);

        // 4. retrospective_entry: shift week_start
        n = jdbc.update("""
                UPDATE retrospective_entry
                SET week_start = week_start + CAST(? AS INTEGER),
                    updated_at = NOW()
                WHERE id IN (
                    '40000000-0000-0000-0000-000000000001'::uuid,
                    '40000000-0000-0000-0000-000000000002'::uuid,
                    '40000000-0000-0000-0000-000000000003'::uuid,
                    '40000000-0000-0000-0000-000000000004'::uuid,
                    '40000000-0000-0000-0000-000000000005'::uuid,
                    '40000000-0000-0000-0000-000000000006'::uuid,
                    '40000000-0000-0000-0000-000000000007'::uuid,
                    '40000000-0000-0000-0000-000000000008'::uuid
                )
                """, daysDelta);
        log.info("[DemoDataSeeder] Updated {} retrospective_entry rows", n);

        log.info("[DemoDataSeeder] Demo data refresh complete");
    }
}
