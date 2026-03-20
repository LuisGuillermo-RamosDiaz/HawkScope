package com.hawkscope.backend.service;

import com.hawkscope.backend.dto.LoginRequestDto;
import com.hawkscope.backend.dto.LoginResponseDto;
import com.hawkscope.backend.dto.UserInfoDto;
import com.hawkscope.backend.entity.User;
import com.hawkscope.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<LoginResponseDto> authenticate(LoginRequestDto request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // MVP: Comparación directa para pruebas o hashes sin bcrypt temporalmente
            // TODO: Agregar BCryptPasswordEncoder en fase de seguridad avanzada
            if (user.getPasswordHash().equals(request.password())) {
                String dummyToken = "jwt-mock-token-" + UUID.randomUUID().toString();
                UserInfoDto userInfo = new UserInfoDto(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getRole(),
                        user.getName()
                );
                return Optional.of(new LoginResponseDto(dummyToken, userInfo));
            }
        }
        return Optional.empty();
    }
}
