package com.oeps.controller;

import com.oeps.dto.ExamDtos.*;
import com.oeps.entity.ExamAttempt;
import com.oeps.entity.ProctoringEvent;
import com.oeps.security.UserPrincipal;
import com.oeps.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/start/{examId}")
    public ResponseEntity<ExamAttempt> start(@PathVariable Long examId,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attemptService.startAttempt(examId, principal.getUser()));
    }

    @PostMapping("/{attemptId}/answer")
    public ResponseEntity<Void> answer(@PathVariable Long attemptId, @Valid @RequestBody AnswerRequest req) {
        attemptService.submitAnswer(attemptId, req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<ExamAttempt> submit(@PathVariable Long attemptId) {
        return ResponseEntity.ok(attemptService.submitExam(attemptId));
    }

    @PostMapping("/{attemptId}/proctoring-event")
    public ResponseEntity<ProctoringEvent> logEvent(@PathVariable Long attemptId,
                                                      @Valid @RequestBody ProctoringEventRequest req) {
        return ResponseEntity.ok(attemptService.logProctoringEvent(attemptId, req));
    }

    @GetMapping("/{attemptId}/proctoring-events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProctoringEvent>> getEvents(@PathVariable Long attemptId) {
        return ResponseEntity.ok(attemptService.getProctoringEvents(attemptId));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamAttempt>> forExam(@PathVariable Long examId) {
        return ResponseEntity.ok(attemptService.getAttemptsForExam(examId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ExamAttempt>> myAttempts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attemptService.getAttemptsForStudent(principal.getUser().getId()));
    }
}
