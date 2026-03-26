package com.hawkscope.backend.dto;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String fullName,
    String role,
    String status,
    String lastAccess,
    String profilePictureUrl
) {}
