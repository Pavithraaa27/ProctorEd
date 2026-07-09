package com.oeps.service;

import com.oeps.dto.ExamDtos.*;
import com.oeps.entity.*;
import com.oeps.enums.QuestionType;
import com.oeps.repository.ExamRepository;
import com.oeps.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    public Exam createExam(ExamRequest req, User creator) {
        Exam exam = Exam.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .durationMinutes(req.getDurationMinutes())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .proctoringEnabled(req.isProctoringEnabled())
                .totalMarks(0)
                .createdBy(creator)
                .build();
        return examRepository.save(exam);
    }

    public Question addQuestion(Long examId, QuestionRequest req) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        Question question = Question.builder()
                .exam(exam)
                .questionText(req.getQuestionText())
                .type(QuestionType.valueOf(req.getType()))
                .options(req.getOptions())
                .correctOptionIndex(req.getCorrectOptionIndex())
                .marks(req.getMarks())
                .build();
        questionRepository.save(question);

        exam.setTotalMarks(exam.getTotalMarks() + req.getMarks());
        examRepository.save(exam);
        return question;
    }

    public List<Exam> listExams() {
        return examRepository.findAllByOrderByStartTimeDesc();
    }

    public Exam getExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    public List<Question> getQuestions(Long examId) {
        return questionRepository.findByExamId(examId);
    }
}
