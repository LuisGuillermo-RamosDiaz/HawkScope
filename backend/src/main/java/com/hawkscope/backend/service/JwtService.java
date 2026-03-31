package com.hawkscope.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret:hawkscope-secret-key-at-least-32-characters-long}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String role, String orgId, String userId) {
        return Jwts.builder()
                .subject(email)
                .claim("email", email)
                .claim("role", role)
                .claim("org_id", orgId)
                .claim("user_id", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 8 * 60 * 60 * 1000)) // 8 hours
                .signWith(getKey())
                .compact();
    }

    public String generateInviteToken(String email, String role, String orgId) {
        return Jwts.builder()
                .subject(email)
                .claim("email", email)
                .claim("role", role)
                .claim("org_id", orgId)
                .claim("type", "invite")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000)) // 7 days
                .signWith(getKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
