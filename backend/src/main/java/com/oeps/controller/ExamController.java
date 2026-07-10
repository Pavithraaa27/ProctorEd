package com.oeps.controller;

import com.oeps.dto.ExamDtos.*;
import com.oeps.entity.Exam;
import com.oeps.entity.Question;
import com.oeps.security.UserPrincipal;
import com.oeps.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<List<Exam>> listExams() {
        return ResponseEntity.ok(examService.listExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExam(id));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionPublicResponse>> getQuestions(@PathVariable Long id) {
        List<QuestionPublicResponse> publicQuestions = examService.getQuestions(id).stream()
                .map(q -> new QuestionPublicResponse(
                        q.getId(), q.getQuestionText(), q.getType().name(),
                        new ArrayList<>(q.getOptions()), q.getMarks()))
                .toList();
        return ResponseEntity.ok(publicQuestions);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> createExam(@Valid @RequestBody ExamRequest req,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.createExam(req, principal.getUser()));
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Question> addQuestion(@PathVariable Long id,
                                                 @Valid @RequestBody QuestionRequest req) {
        return ResponseEntity.ok(examService.addQuestion(id, req));
    }
}
