package com.hawkscope.backend.service;

import com.hawkscope.backend.entity.AuditLog;
import com.hawkscope.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final GeolocationService geolocationService;

    public AuditService(AuditLogRepository auditLogRepository, GeolocationService geolocationService) {
        this.auditLogRepository = auditLogRepository;
        this.geolocationService = geolocationService;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                return ip != null ? ip.split(",")[0].trim() : "Unknown";
            }
        } catch (Exception e) {}
        return "System Process";
    }

    public void log(String orgId, String userId, String action, String resourceType, String resourceId, String resourceName, String details) {
        String ip = getClientIp();
        String location = ("System Process".equals(ip) || "Unknown".equals(ip)) ? "" : " - " + geolocationService.getLocationDesc(ip);
        
        AuditLog log = new AuditLog();
        log.setOrganizationId(orgId);
        log.setUserId(userId);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setResourceName(resourceName);
        log.setIpAddress(ip + location);
        log.setDetails(details);
        log.setStatus("success");
        log.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
    
    public void logError(String orgId, String userId, String action, String resourceType, String details, String errorMessage) {
        String ip = getClientIp();
        String location = ("System Process".equals(ip) || "Unknown".equals(ip)) ? "" : " - " + geolocationService.getLocationDesc(ip);

        AuditLog log = new AuditLog();
        log.setOrganizationId(orgId);
        log.setUserId(userId);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setIpAddress(ip + location);
        log.setDetails(details);
        log.setStatus("ERROR");
        log.setErrorMessage(errorMessage);
        log.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
}
