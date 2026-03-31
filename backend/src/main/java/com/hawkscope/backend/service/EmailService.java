package com.hawkscope.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    private final RestTemplate restTemplate;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY no configurada. No se pudo enviar el correo a " + toEmail);
            return;
        }

        String url = "https://api.resend.com/emails";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + resendApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", "HawkScope <onboarding@resend.dev>");
        body.put("to", toEmail);
        body.put("subject", "¡Bienvenido a HawkScope, " + fullName + "!");
        body.put("html", "<h1>¡Hola " + fullName + "!</h1><p>Gracias por registrarte en HawkScope. Estamos emocionados de ayudarte a monitorear y proteger tus servidores.</p><p>Puedes acceder a tu panel de control iniciando sesión.</p><br/><p>El Equipo de HawkScope</p>");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("Correo de bienvenida enviado exitosamente a " + toEmail + ". Status: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("Error enviando correo de bienvenida a " + toEmail + ": " + e.getMessage());
        }
    }
}
