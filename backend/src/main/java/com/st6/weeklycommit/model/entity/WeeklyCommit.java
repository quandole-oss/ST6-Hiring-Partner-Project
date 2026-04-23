package com.st6.weeklycommit.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "weekly_commit", uniqueConstraints = @UniqueConstraint(columnNames = {"team_member_id", "week_start"}))
public class WeeklyCommit extends AbstractAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_member_id", nullable = false)
    private TeamMember teamMember;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "commit_status")
    private CommitStatus status = CommitStatus.DRAFT;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "reconciled_at")
    private Instant reconciledAt;

    @OneToMany(mappedBy = "weeklyCommit", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<CommitItem> items = new ArrayList<>();

    @Column(name = "mood_score")
    private Integer moodScore;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public TeamMember getTeamMember() { return teamMember; }
    public void setTeamMember(TeamMember teamMember) { this.teamMember = teamMember; }
    public LocalDate getWeekStart() { return weekStart; }
    public void setWeekStart(LocalDate weekStart) { this.weekStart = weekStart; }
    public CommitStatus getStatus() { return status; }
    public void setStatus(CommitStatus status) { this.status = status; }
    public Instant getLockedAt() { return lockedAt; }
    public void setLockedAt(Instant lockedAt) { this.lockedAt = lockedAt; }
    public Instant getReconciledAt() { return reconciledAt; }
    public void setReconciledAt(Instant reconciledAt) { this.reconciledAt = reconciledAt; }
    public List<CommitItem> getItems() { return items; }
    public void setItems(List<CommitItem> items) { this.items = items; }

    public Integer getMoodScore() { return moodScore; }
    public void setMoodScore(Integer moodScore) { this.moodScore = moodScore; }
}
