package com.oeps.repository;

import com.oeps.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    Optional<Answer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
