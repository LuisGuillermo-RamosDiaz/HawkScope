package com.hawkscope.backend.dto;

public record LoginResponseDto(String token, UserInfoDto user) {}
