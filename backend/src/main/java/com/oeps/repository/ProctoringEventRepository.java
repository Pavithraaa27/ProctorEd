package com.oeps.repository;

import com.oeps.entity.ProctoringEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProctoringEventRepository extends JpaRepository<ProctoringEvent, Long> {
    List<ProctoringEvent> findByAttemptId(Long attemptId);
    long countByAttemptId(Long attemptId);
}
