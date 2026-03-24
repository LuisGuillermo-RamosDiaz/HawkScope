package com.hawkscope.backend.dto;

/**
 * DTO para la solicitud de registro de nuevos usuarios y organizaciones.
 * Se usa un Record para simplicidad y compatibilidad con Jackson.
 */
public record RegisterRequestDto(
    String fullName,
    String companyName,
    String email,
    String password,
    String industry,
    String companySize
) {}
