package com.oeps.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class ExamDtos {

    @Data
    public static class ExamRequest {
        @NotBlank private String title;
        private String description;
        @NotNull private Integer durationMinutes;
        @NotNull private LocalDateTime startTime;
        @NotNull private LocalDateTime endTime;
        private boolean proctoringEnabled = true;
    }

    @Data
    public static class QuestionRequest {
        @NotBlank private String questionText;
        private String type = "MCQ";
        @NotNull private List<String> options;
        @NotNull private Integer correctOptionIndex;
        private Integer marks = 1;
    }

    @Data
    public static class AnswerRequest {
        @NotNull private Long questionId;
        @NotNull private Integer selectedOptionIndex;
    }

    @Data
    public static class ProctoringEventRequest {
        @NotBlank private String eventType;
        private String details;
    }

    /** Returned to students taking an exam — never includes the answer key. */
    @Data
    public static class QuestionPublicResponse {
        private Long id;
        private String questionText;
        private String type;
        private List<String> options;
        private Integer marks;

        public QuestionPublicResponse(Long id, String questionText, String type, List<String> options, Integer marks) {
            this.id = id;
            this.questionText = questionText;
            this.type = type;
            this.options = options;
            this.marks = marks;
        }
    }
}
