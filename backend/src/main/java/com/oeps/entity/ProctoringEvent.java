package com.oeps.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.oeps.enums.ProctoringEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "proctoring_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProctoringEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnore
    private ExamAttempt attempt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProctoringEventType eventType;

    @Column(length = 500)
    private String details;

    @Builder.Default
    private LocalDateTime occurredAt = LocalDateTime.now();
}
