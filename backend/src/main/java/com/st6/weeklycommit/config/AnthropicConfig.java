package com.st6.weeklycommit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.ai")
public class AnthropicConfig {

    private String anthropicApiKey = "";
    private String model = "claude-sonnet-4-5-20250514";
    private int maxTokens = 1024;
    private boolean enabled = true;
    private int qaMaxTokens = 2048;

    public String getAnthropicApiKey() { return anthropicApiKey; }
    public void setAnthropicApiKey(String anthropicApiKey) { this.anthropicApiKey = anthropicApiKey; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public int getQaMaxTokens() { return qaMaxTokens; }
    public void setQaMaxTokens(int qaMaxTokens) { this.qaMaxTokens = qaMaxTokens; }
}
