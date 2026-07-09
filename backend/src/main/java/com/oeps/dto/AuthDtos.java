package com.oeps.dto;

import com.oeps.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class RegisterRequest {
        @NotBlank private String fullName;
        @Email @NotBlank private String email;
        @NotBlank private String password;
        @NotBlank private String registerNumber;
        private Role role = Role.STUDENT;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String fullName;
        private String email;
        private Role role;

        public AuthResponse(String token, String fullName, String email, Role role) {
            this.token = token;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
        }
    }
}
