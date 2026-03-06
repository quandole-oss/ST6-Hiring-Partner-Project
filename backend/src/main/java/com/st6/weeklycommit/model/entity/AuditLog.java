package com.st6.weeklycommit.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_commit_id", nullable = false)
    private WeeklyCommit weeklyCommit;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "previous_state", columnDefinition = "commit_status")
    private CommitStatus previousState;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "new_state", columnDefinition = "commit_status")
    private CommitStatus newState;

    @Column(name = "triggered_by", nullable = false)
    private String triggeredBy = "ANONYMOUS";

    @Column(name = "is_manual_override", nullable = false)
    private boolean manualOverride = false;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commit_item_id")
    private CommitItem commitItem;

    @Column(name = "action_type", nullable = false)
    private String actionType = "STATE_TRANSITION";

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WeeklyCommit getWeeklyCommit() { return weeklyCommit; }
    public void setWeeklyCommit(WeeklyCommit weeklyCommit) { this.weeklyCommit = weeklyCommit; }
    public CommitStatus getPreviousState() { return previousState; }
    public void setPreviousState(CommitStatus previousState) { this.previousState = previousState; }
    public CommitStatus getNewState() { return newState; }
    public void setNewState(CommitStatus newState) { this.newState = newState; }
    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
    public boolean isManualOverride() { return manualOverride; }
    public void setManualOverride(boolean manualOverride) { this.manualOverride = manualOverride; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public CommitItem getCommitItem() { return commitItem; }
    public void setCommitItem(CommitItem commitItem) { this.commitItem = commitItem; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public Instant getCreatedAt() { return createdAt; }
}
