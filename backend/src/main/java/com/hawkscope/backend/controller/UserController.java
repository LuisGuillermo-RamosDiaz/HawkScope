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
    private final com.hawkscope.backend.service.S3Service s3Service;
    private final com.hawkscope.backend.repository.UserRepository userRepository;
    private final com.hawkscope.backend.service.AuditService auditService;

    public UserController(UserService userService, JwtService jwtService, com.hawkscope.backend.service.S3Service s3Service, com.hawkscope.backend.repository.UserRepository userRepository, com.hawkscope.backend.service.AuditService auditService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.s3Service = s3Service;
        this.userRepository = userRepository;
        this.auditService = auditService;
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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id, @Valid @RequestBody InviteUserDto request) {
        try {
            UUID orgId = getOrgId(authHeader);
            userService.updateUser(id, request, orgId);
            return ResponseEntity.ok(Map.of("message", "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/regenerate-invite")
    public ResponseEntity<?> regenerateInvite(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id) {
        try {
            UUID orgId = getOrgId(authHeader);
            String token = userService.regenerateInviteToken(id, orgId);
            return ResponseEntity.ok(Map.of("inviteToken", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            UUID orgId = getOrgId(authHeader);
            com.hawkscope.backend.entity.User user = userRepository.findById(id)
                .filter(u -> u.getOrganization().getId().equals(orgId))
                .orElseThrow(() -> new RuntimeException("User not found or access denied"));

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String keyName = "profile-pictures/" + id.toString() + "-" + System.currentTimeMillis() + extension;

            String s3Url = s3Service.uploadFile(keyName, file.getInputStream(), file.getSize(), file.getContentType());
            
            user.setProfilePictureUrl(s3Url);
            userRepository.save(user);

            // Audit Logging Requirement
            auditService.log(
                orgId.toString(),
                id.toString(), // The user being updated
                "Perfil Actualizado",
                "User",
                id.toString(),
                user.getEmail(),
                "{\"message\": \"Cambio de foto de perfil exitoso (S3 Object Created).\"}"
            );
            
            return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully", "url", s3Url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image: " + e.getMessage()));
        }
    }
}
