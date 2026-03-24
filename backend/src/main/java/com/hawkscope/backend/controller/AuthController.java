package com.hawkscope.backend.controller;

import com.hawkscope.backend.dto.LoginRequestDto;
import com.hawkscope.backend.dto.RegisterRequestDto;
import com.hawkscope.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;

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
        } catch (Exception e) { // Broad catch for any other unexpected errors
            e.printStackTrace(); // Log the exception for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error interno del servidor: " + e.getMessage(), "type", e.getClass().getSimpleName()));
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

    @PostMapping("/accept-invite")
    public ResponseEntity<?> acceptInvite(@Valid @RequestBody com.hawkscope.backend.dto.AcceptInviteDto request) {
        try {
            return ResponseEntity.ok(authService.acceptInvite(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
