package com.st6.weeklycommit.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "commit_item")
public class CommitItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_commit_id", nullable = false)
    private WeeklyCommit weeklyCommit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outcome_id")
    private Outcome outcome;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "chess_category", columnDefinition = "chess_category")
    private ChessCategory chessCategory;

    @Column(name = "effort_estimate")
    private Integer effortEstimate;

    @Column(name = "impact_estimate")
    private Integer impactEstimate;

    @Column(name = "risk_flag")
    private String riskFlag;

    @Column(name = "risk_note")
    private String riskNote;

    @Column(name = "risk_flagged_at")
    private Instant riskFlaggedAt;

    @Column(name = "carry_forward_count", nullable = false)
    private int carryForwardCount = 0;

    @Column(name = "flagged_stale", nullable = false)
    private boolean flaggedStale = false;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToOne(mappedBy = "commitItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Reconciliation reconciliation;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WeeklyCommit getWeeklyCommit() { return weeklyCommit; }
    public void setWeeklyCommit(WeeklyCommit weeklyCommit) { this.weeklyCommit = weeklyCommit; }
    public Outcome getOutcome() { return outcome; }
    public void setOutcome(Outcome outcome) { this.outcome = outcome; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ChessCategory getChessCategory() { return chessCategory; }
    public void setChessCategory(ChessCategory chessCategory) { this.chessCategory = chessCategory; }
    public Integer getEffortEstimate() { return effortEstimate; }
    public void setEffortEstimate(Integer effortEstimate) { this.effortEstimate = effortEstimate; }
    public Integer getImpactEstimate() { return impactEstimate; }
    public void setImpactEstimate(Integer impactEstimate) { this.impactEstimate = impactEstimate; }
    public String getRiskFlag() { return riskFlag; }
    public void setRiskFlag(String riskFlag) { this.riskFlag = riskFlag; }
    public String getRiskNote() { return riskNote; }
    public void setRiskNote(String riskNote) { this.riskNote = riskNote; }
    public Instant getRiskFlaggedAt() { return riskFlaggedAt; }
    public void setRiskFlaggedAt(Instant riskFlaggedAt) { this.riskFlaggedAt = riskFlaggedAt; }
    public int getCarryForwardCount() { return carryForwardCount; }
    public void setCarryForwardCount(int carryForwardCount) { this.carryForwardCount = carryForwardCount; }
    public boolean isFlaggedStale() { return flaggedStale; }
    public void setFlaggedStale(boolean flaggedStale) { this.flaggedStale = flaggedStale; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Reconciliation getReconciliation() { return reconciliation; }
    public void setReconciliation(Reconciliation reconciliation) { this.reconciliation = reconciliation; }

    @PreUpdate
    private void onUpdate() { this.updatedAt = Instant.now(); }
}
