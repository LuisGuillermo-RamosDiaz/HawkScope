package com.hawkscope.backend.service;

import com.hawkscope.backend.entity.Organization;
import com.hawkscope.backend.entity.Server;
import com.hawkscope.backend.repository.ServerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class DashboardService {
    
    private final ServerRepository serverRepository;

    public DashboardService(ServerRepository serverRepository) {
        this.serverRepository = serverRepository;
    }

    public Map<String, Object> getDashboardSummary(Organization org) {
        List<Server> servers = serverRepository.findByOrganizationId(org.getId());
        
        long totalServers = servers.size();
        long healthyServers = servers.stream().filter(s -> "healthy".equalsIgnoreCase(s.getStatus())).count();
        long warningServers = servers.stream().filter(s -> "warning".equalsIgnoreCase(s.getStatus())).count();
        long criticalServers = servers.stream().filter(s -> "critical".equalsIgnoreCase(s.getStatus())).count();
        long offlineServers = servers.stream().filter(s -> "offline".equalsIgnoreCase(s.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalServers", totalServers);
        summary.put("healthyServers", healthyServers);
        summary.put("warningServers", warningServers);
        summary.put("criticalServers", criticalServers);
        summary.put("offlineServers", offlineServers);
        
        return summary;
    }
}
