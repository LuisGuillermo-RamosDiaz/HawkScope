package com.hawkscope.backend.dto;

public record RegisterRequestDto(
    String email,
    String password,
    String companyName,
    String industry,
    String companySize
) {}
