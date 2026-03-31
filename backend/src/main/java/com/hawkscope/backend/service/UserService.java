package com.hawkscope.backend.service;

import com.hawkscope.backend.dto.UserDto;
import com.hawkscope.backend.dto.InviteUserDto;
import com.hawkscope.backend.entity.Organization;
import com.hawkscope.backend.entity.User;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, OrganizationRepository organizationRepository, JwtService jwtService, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public List<UserDto> getUsersByOrganization(UUID orgId) {
        List<User> users = userRepository.findByOrganizationId(orgId);
        return users.stream().map(u -> new UserDto(
            u.getId(),
            u.getEmail(),
            u.getFullName(),
            u.getRole(),
            u.getStatus(),
            u.getCreatedAt() != null ? u.getCreatedAt().toString() : "-",
            u.getProfilePictureUrl()
        )).collect(Collectors.toList());
    }

    public String inviteUser(InviteUserDto request, UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.name());
        user.setRole(request.role());
        user.setOrganization(org);
        user.setStatus("invited");
        // Create an unguessable password hash so the account is secure until they accept the invite
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        
        userRepository.save(user);

        // Audit Logging Requirement
        auditService.log(
            orgId.toString(),
            null, // System/Context dependent
            "Invitación enviada",
            "User",
            user.getId().toString(),
            user.getEmail(),
            "{\"message\": \"Invitación de usuario creada con rol: " + request.role() + "\"}"
        );

        return jwtService.generateInviteToken(user.getEmail(), user.getRole(), org.getId().toString());
    }

    public String regenerateInviteToken(UUID userId, UUID orgId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getOrganization().getId().equals(orgId))
                .orElseThrow(() -> new RuntimeException("User not found or access denied"));

        if (!"invited".equals(user.getStatus())) {
            throw new RuntimeException("This user has already accepted the invitation");
        }

        return jwtService.generateInviteToken(user.getEmail(), user.getRole(), orgId.toString());
    }

    public void deleteUser(UUID userId, UUID orgId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getOrganization().getId().equals(orgId)) {
            userRepository.delete(userOpt.get());
            
            // Audit Logging Requirement
            auditService.log(
                orgId.toString(),
                null,
                "Usuario eliminado",
                "User",
                userId.toString(),
                userOpt.get().getEmail(),
                "{\"message\": \"El administrador ha eliminado este usuario del sistema.\"}"
            );
        } else {
            throw new RuntimeException("User not found or access denied");
        }
    }
}
