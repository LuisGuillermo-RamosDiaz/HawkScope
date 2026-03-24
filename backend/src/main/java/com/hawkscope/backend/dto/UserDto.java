package com.hawkscope.backend.dto;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String fullName,
    String role,
    String status,
    String lastAccess // Placeholder for now, can map from last heartbeat if it were an agent, but for users, we just put "-" or created_at
) {}
