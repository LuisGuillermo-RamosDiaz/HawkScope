package com.hawkscope.backend.service;

import com.hawkscope.backend.dto.LoginRequestDto;
import com.hawkscope.backend.dto.LoginResponseDto;
import com.hawkscope.backend.dto.UserInfoDto;
import com.hawkscope.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
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
                        user.getName()
                    );
                    return new LoginResponseDto(token, userInfo);
                });
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
