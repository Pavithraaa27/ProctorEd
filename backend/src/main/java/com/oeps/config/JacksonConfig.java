package com.oeps.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Without this, any lazily-loaded Hibernate association that reaches
 * Jackson (e.g. Exam.createdBy, ExamAttempt.exam, ExamAttempt.student)
 * fails to serialize with "No serializer found for
 * ByteBuddyInterceptor" — Jackson tries to introspect the raw proxy
 * class instead of the real entity. Hibernate6Module teaches Jackson
 * how to unwrap proxies so every controller can safely return entities
 * directly.
 *
 * FORCE_LAZY_LOADING is enabled: without it, any lazy field that
 * hasn't already been touched by the time Jackson serializes the
 * response silently comes back as null instead of its real value
 * (e.g. ExamAttempt.exam being null right after submitting, since the
 * submit logic never happens to read that field itself). Since
 * open-in-view keeps the Hibernate session alive through response
 * writing, forcing the load here is safe and guarantees the JSON
 * always has real data rather than an unpredictable null.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        module.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }
}
