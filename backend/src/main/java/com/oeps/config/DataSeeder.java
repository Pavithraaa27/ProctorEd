package com.oeps.config;

import com.oeps.entity.User;
import com.oeps.enums.Role;
import com.oeps.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@oeps.edu")) {
            userRepository.save(User.builder()
                    .fullName("System Administrator")
                    .email("admin@oeps.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .registerNumber("ADMIN001")
                    .role(Role.ADMIN)
                    .build());
        }
    }
}
