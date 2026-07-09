package com.oeps.service;

import com.oeps.dto.ExamDtos.*;
import com.oeps.entity.*;
import com.oeps.enums.AttemptStatus;
import com.oeps.enums.ProctoringEventType;
import com.oeps.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ProctoringEventRepository proctoringEventRepository;

    public ExamAttempt startAttempt(Long examId, User student) {
        attemptRepository.findByExamIdAndStudentId(examId, student.getId())
                .ifPresent(a -> {
                    if (a.getStatus() != AttemptStatus.IN_PROGRESS) {
                        throw new IllegalStateException("Exam already submitted");
                    }
                });

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        return attemptRepository.findByExamIdAndStudentId(examId, student.getId())
                .orElseGet(() -> attemptRepository.save(ExamAttempt.builder()
                        .exam(exam)
                        .student(student)
                        .status(AttemptStatus.IN_PROGRESS)
                        .startedAt(LocalDateTime.now())
                        .build()));
    }

    public void submitAnswer(Long attemptId, AnswerRequest req) {
        ExamAttempt attempt = getAttempt(attemptId);
        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Answer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, req.getQuestionId())
                .orElse(Answer.builder().attempt(attempt).question(question).build());
        answer.setSelectedOptionIndex(req.getSelectedOptionIndex());
        answerRepository.save(answer);
    }

    public ExamAttempt submitExam(Long attemptId) {
        ExamAttempt attempt = getAttempt(attemptId);
        int score = 0;
        for (Answer ans : attempt.getAnswers()) {
            if (ans.getSelectedOptionIndex() != null
                    && ans.getSelectedOptionIndex().equals(ans.getQuestion().getCorrectOptionIndex())) {
                score += ans.getQuestion().getMarks();
            }
        }
        attempt.setScore(score);
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    public ProctoringEvent logProctoringEvent(Long attemptId, ProctoringEventRequest req) {
        ExamAttempt attempt = getAttempt(attemptId);
        ProctoringEvent event = ProctoringEvent.builder()
                .attempt(attempt)
                .eventType(ProctoringEventType.valueOf(req.getEventType()))
                .details(req.getDetails())
                .build();
        proctoringEventRepository.save(event);

        attempt.setFlagCount(attempt.getFlagCount() + 1);
        attemptRepository.save(attempt);
        return event;
    }

    public List<ProctoringEvent> getProctoringEvents(Long attemptId) {
        return proctoringEventRepository.findByAttemptId(attemptId);
    }

    public List<ExamAttempt> getAttemptsForExam(Long examId) {
        return attemptRepository.findByExamId(examId);
    }

    public List<ExamAttempt> getAttemptsForStudent(Long studentId) {
        return attemptRepository.findByStudentId(studentId);
    }

    public ExamAttempt getAttempt(Long attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));
    }
}
