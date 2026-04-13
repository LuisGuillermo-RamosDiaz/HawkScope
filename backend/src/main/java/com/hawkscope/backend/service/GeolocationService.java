package com.hawkscope.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@Service
public class GeolocationService {
    
    private final RestTemplate restTemplate;
    
    public GeolocationService() {
        this.restTemplate = new RestTemplate();
    }
    
    public String getLocationDesc(String ip) {
        if (ip == null || ip.equals("0:0:0:0:0:0:0:1") || ip.equals("127.0.0.1") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
            return "Localhost / Red Privada";
        }
        try {
            // Tercero: Consumo de la API Pública de ip-api
            String url = "http://ip-api.com/json/" + ip;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && "success".equals(body.get("status"))) {
                Object city = body.get("city");
                Object countryCode = body.get("countryCode");
                return city + ", " + countryCode;
            }
        } catch (Exception e) {
            System.err.println("Advertencia - Error consumiendo Geolocation API: " + e.getMessage());
        }
        return "Desconocido";
    }
}
