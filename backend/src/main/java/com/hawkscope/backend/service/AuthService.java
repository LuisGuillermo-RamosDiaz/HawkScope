package com.hawkscope.backend.service;

import com.hawkscope.backend.dto.LoginRequestDto;
import com.hawkscope.backend.dto.LoginResponseDto;
import com.hawkscope.backend.dto.RegisterRequestDto;
import com.hawkscope.backend.dto.UserInfoDto;
import com.hawkscope.backend.entity.Organization;
import com.hawkscope.backend.entity.User;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.repository.UserRepository;
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

    public AuthService(UserRepository userRepository, OrganizationRepository organizationRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.jwtService = jwtService;
    }

    public Optional<LoginResponseDto> authenticate(LoginRequestDto request) {
        return userRepository.findByEmail(request.email())
                .filter(user -> user.getPasswordHash().equals(request.password()))
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
                        user.getFullName()
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
        user.setPasswordHash(request.password());  // stored as-is, same as existing login comparison
        user.setFullName(request.fullName());
        user.setRole("admin");
        user.setOrganization(org);
        user = userRepository.save(user);

        // Generate JWT and return response
        String token = jwtService.generateToken(
            user.getEmail(),
            user.getRole(),
            user.getOrganization().getId().toString()
        );
        UserInfoDto userInfo = new UserInfoDto(
            user.getId().toString(),
            user.getEmail(),
            user.getRole(),
            user.getFullName()
        );
        return new LoginResponseDto(token, userInfo);
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
