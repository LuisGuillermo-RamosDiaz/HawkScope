package com.hawkscope.backend.controller;

import com.hawkscope.backend.dto.LoginRequestDto;
import com.hawkscope.backend.dto.RegisterRequestDto;
import com.hawkscope.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        return authService.authenticate(request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }

        String token = authHeader.replace("Bearer ", "");
        if (!authService.isTokenValid(token)) {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }

        Map<String, Object> claims = authService.getClaims(token);
        return ResponseEntity.ok(Map.of("valid", true, "user", claims));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT es stateless — el logout real lo maneja el frontend borrando el token
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return authService.refreshToken(token)
                .map(newToken -> ResponseEntity.ok(Map.of("token", newToken)))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }
}
