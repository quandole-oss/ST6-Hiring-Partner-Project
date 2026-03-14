package com.st6.weeklycommit.model.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "high_five")
public class HighFive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "giver_id", nullable = false)
    private TeamMember giver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_team_id", nullable = false)
    private Team receiverTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_member_id")
    private TeamMember receiverMember;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Column(nullable = false)
    private String message;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public TeamMember getGiver() { return giver; }
    public void setGiver(TeamMember giver) { this.giver = giver; }
    public Team getReceiverTeam() { return receiverTeam; }
    public void setReceiverTeam(Team receiverTeam) { this.receiverTeam = receiverTeam; }
    public TeamMember getReceiverMember() { return receiverMember; }
    public void setReceiverMember(TeamMember receiverMember) { this.receiverMember = receiverMember; }
    public LocalDate getWeekStart() { return weekStart; }
    public void setWeekStart(LocalDate weekStart) { this.weekStart = weekStart; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @PreUpdate
    private void onUpdate() { this.updatedAt = Instant.now(); }
}
