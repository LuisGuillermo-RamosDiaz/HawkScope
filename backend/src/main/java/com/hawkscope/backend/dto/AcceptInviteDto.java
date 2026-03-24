package com.hawkscope.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AcceptInviteDto(
    @NotBlank(message = "Token is required")
    String token,
    
    @NotBlank(message = "Password is required")
    String newPassword
) {}
