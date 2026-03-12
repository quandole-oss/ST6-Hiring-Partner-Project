package com.st6.weeklycommit.model.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_export_settings")
public class TeamExportSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false, unique = true)
    private Team team;

    @Column(name = "slack_webhook_url")
    private String slackWebhookUrl;

    @Column(name = "default_email_recipients")
    private String defaultEmailRecipients;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public String getSlackWebhookUrl() { return slackWebhookUrl; }
    public void setSlackWebhookUrl(String slackWebhookUrl) { this.slackWebhookUrl = slackWebhookUrl; }
    public String getDefaultEmailRecipients() { return defaultEmailRecipients; }
    public void setDefaultEmailRecipients(String defaultEmailRecipients) { this.defaultEmailRecipients = defaultEmailRecipients; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @PreUpdate
    private void onUpdate() { this.updatedAt = Instant.now(); }
}
