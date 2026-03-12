package com.st6.weeklycommit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.export")
public class ExportConfig {
    private String emailFrom = "noreply@st6weekly.com";

    public String getEmailFrom() { return emailFrom; }
    public void setEmailFrom(String emailFrom) { this.emailFrom = emailFrom; }
}
