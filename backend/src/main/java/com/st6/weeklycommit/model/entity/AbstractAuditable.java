package com.st6.weeklycommit.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Mapped superclass for entities that maintain creation and last-modified
 * audit timestamps.
 *
 * <p>Spec alignment: the project specification calls for a shared audit
 * base class (spec text: "all entities extend AbstractAudity"). This class
 * provides that contract using Spring Data JPA auditing so the timestamps
 * are populated automatically without per-entity {@code @PreUpdate} hooks.
 *
 * <p>Column names match the existing schema (no Flyway migration required):
 * <ul>
 *   <li>{@code created_at} — set once on insert, non-updatable</li>
 *   <li>{@code updated_at} — set on insert and refreshed on every update</li>
 * </ul>
 *
 * <p>Requires {@code @EnableJpaAuditing} on the application config.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AbstractAuditable {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Test hooks only: allow tests to control timestamps when seeding
     * fixtures. Production code should not invoke these; auditing wires
     * the values on persist/merge.
     */
    protected void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    protected void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
