package com.hawkscope.backend.controller;

import com.hawkscope.backend.dto.InviteUserDto;
import com.hawkscope.backend.service.JwtService;
import com.hawkscope.backend.service.UserService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    private UUID getOrgId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtService.parseToken(token);
        return UUID.fromString(claims.get("org_id", String.class));
    }

    @GetMapping
    public ResponseEntity<?> getUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID orgId = getOrgId(authHeader);
            return ResponseEntity.ok(userService.getUsersByOrganization(orgId));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
    }

    @PostMapping("/invite")
    public ResponseEntity<?> inviteUser(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody InviteUserDto request) {
        try {
            UUID orgId = getOrgId(authHeader);
            String token = userService.inviteUser(request, orgId);
            return ResponseEntity.ok(Map.of("inviteToken", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id) {
        try {
            UUID orgId = getOrgId(authHeader);
            userService.deleteUser(id, orgId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }
}
