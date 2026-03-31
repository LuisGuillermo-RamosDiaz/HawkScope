package com.hawkscope.backend.service;

import com.hawkscope.backend.entity.AuditLog;
import com.hawkscope.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String orgId, String userId, String action, String resourceType, String resourceId, String resourceName, String details) {
        AuditLog log = new AuditLog();
        log.setOrganizationId(orgId);
        log.setUserId(userId);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setResourceName(resourceName);
        log.setIpAddress("Backend Process");
        log.setDetails(details);
        log.setStatus("success");
        log.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
    
    public void logError(String orgId, String userId, String action, String resourceType, String details, String errorMessage) {
        AuditLog log = new AuditLog();
        log.setOrganizationId(orgId);
        log.setUserId(userId);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setIpAddress("Backend Process");
        log.setDetails(details);
        log.setStatus("ERROR");
        log.setErrorMessage(errorMessage);
        log.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
}
