package com.hawkscope.backend.service;

import com.hawkscope.backend.dto.LoginRequestDto;
import com.hawkscope.backend.dto.LoginResponseDto;
import com.hawkscope.backend.dto.RegisterRequestDto;
import com.hawkscope.backend.dto.UserInfoDto;
import com.hawkscope.backend.entity.Organization;
import com.hawkscope.backend.entity.User;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.repository.UserRepository;
import com.hawkscope.backend.repository.AuditLogRepository;
import com.hawkscope.backend.entity.AuditLog;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtService jwtService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogRepository auditLogRepository;

    public AuthService(UserRepository userRepository, OrganizationRepository organizationRepository, JwtService jwtService, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder, EmailService emailService, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.auditLogRepository = auditLogRepository;
    }

    public Optional<LoginResponseDto> authenticate(LoginRequestDto request) {
        return userRepository.findByEmail(request.email())
                .filter(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .map(user -> {
                    String token = jwtService.generateToken(
                        user.getEmail(),
                        user.getRole(),
                        user.getOrganization().getId().toString()
                    );
                    UserInfoDto userInfo = new UserInfoDto(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getRole(),
                        user.getFullName(),
                        user.getOrganization().getApiKey(),
                        user.getProfilePictureUrl()
                    );
                    return new LoginResponseDto(token, userInfo);
                });
    }

    @Transactional
    public LoginResponseDto register(RegisterRequestDto request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email ya registrado");
        }

        // Create Organization
        Organization org = new Organization();
        org.setName(request.companyName());
        org.setIndustry(request.industry());
        org.setCompanySize(request.companySize());
        org.setApiKey("sk_live_" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        org.setStatus("active");
        org = organizationRepository.save(org);

        // Create admin User
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole("admin");
        user.setOrganization(org);
        user.setStatus("active");
        user = userRepository.save(user);

        // Third-party requirement: Send Welcome Email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        // Audit Logging Requirement
        AuditLog audit = new AuditLog();
        audit.setOrganizationId(org.getId().toString());
        audit.setUserId(user.getId().toString());
        audit.setAction("Alta de usuario");
        audit.setResourceType("User");
        audit.setResourceId(user.getId().toString());
        audit.setResourceName(user.getEmail());
        audit.setIpAddress("Backend Process");
        audit.setDetails("{\"message\": \"User registered fully in HawkScope.\"}");
        auditLogRepository.save(audit);

        String token = jwtService.generateToken(
            user.getEmail(),
            user.getRole(),
            org.getId().toString()
        );

        return new LoginResponseDto(token, new UserInfoDto(
            user.getId().toString(),
            user.getEmail(),
            user.getRole(),
            user.getFullName(),
            org.getApiKey(),
            user.getProfilePictureUrl()
        ));
    }

    public LoginResponseDto acceptInvite(com.hawkscope.backend.dto.AcceptInviteDto request) {
        io.jsonwebtoken.Claims claims;
        try {
            claims = jwtService.parseToken(request.token());
            if (!"invite".equals(claims.get("type", String.class))) {
                throw new RuntimeException("Invalid token type");
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired invite link");
        }

        String email = claims.getSubject();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"invited".equals(user.getStatus())) {
            throw new RuntimeException("User invite already accepted or revoked");
        }

        // Apply new password
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setStatus("active");
        userRepository.save(user);

        Organization org = user.getOrganization();

        // Generate final login token
        String token = jwtService.generateToken(
            user.getEmail(),
            user.getRole(),
            org.getId().toString()
        );

        return new LoginResponseDto(token, new UserInfoDto(
            user.getId().toString(),
            user.getEmail(),
            user.getRole(),
            user.getFullName(),
            org.getApiKey(),
            user.getProfilePictureUrl()
        ));
    }

    public boolean isTokenValid(String token) {
        return jwtService.isValid(token);
    }

    public Map<String, Object> getClaims(String token) {
        Claims claims = jwtService.parseToken(token);
        return Map.of(
            "email", claims.get("email", String.class),
            "role",  claims.get("role", String.class)
        );
    }

    public Optional<String> refreshToken(String token) {
        if (!jwtService.isValid(token)) return Optional.empty();
        Claims claims = jwtService.parseToken(token);
        
        String newToken = jwtService.generateToken(
            claims.get("email", String.class),
            claims.get("role", String.class),
            claims.get("org_id", String.class)
        );
        return Optional.of(newToken);
    }
}
