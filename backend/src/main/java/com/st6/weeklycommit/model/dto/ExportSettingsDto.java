package com.st6.weeklycommit.model.dto;

import java.util.UUID;

public record ExportSettingsDto(UUID id, UUID teamId, String slackWebhookUrl, String defaultEmailRecipients) {}
