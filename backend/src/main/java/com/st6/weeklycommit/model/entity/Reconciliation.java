package com.st6.weeklycommit.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reconciliation")
public class Reconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commit_item_id", nullable = false, unique = true)
    private CommitItem commitItem;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "completion_status", nullable = false, columnDefinition = "completion_status")
    private CompletionStatus completionStatus;

    private String notes;

    @Column(name = "actual_story_points")
    private Integer actualStoryPoints;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public CommitItem getCommitItem() { return commitItem; }
    public void setCommitItem(CommitItem commitItem) { this.commitItem = commitItem; }
    public CompletionStatus getCompletionStatus() { return completionStatus; }
    public void setCompletionStatus(CompletionStatus completionStatus) { this.completionStatus = completionStatus; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Integer getActualStoryPoints() { return actualStoryPoints; }
    public void setActualStoryPoints(Integer actualStoryPoints) { this.actualStoryPoints = actualStoryPoints; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @PreUpdate
    private void onUpdate() { this.updatedAt = Instant.now(); }
}
