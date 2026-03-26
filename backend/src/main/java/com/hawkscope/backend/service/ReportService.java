package com.hawkscope.backend.service;

import com.hawkscope.backend.entity.Server;
import com.hawkscope.backend.repository.ServerRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final ServerRepository serverRepository;
    private final S3Service s3Service;

    public ReportService(ServerRepository serverRepository, S3Service s3Service) {
        this.serverRepository = serverRepository;
        this.s3Service = s3Service;
    }

    public String generateAndUploadServerReport(UUID orgId) throws Exception {
        List<Server> servers = serverRepository.findByOrganizationId(orgId);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Hostname,IP Address,OS,Status,CPU %,RAM %,Disk %,Uptime (s)\n");
        
        for (Server s : servers) {
            String host = s.getHostname() != null ? s.getHostname() : "N/A";
            String ip = s.getIpAddress() != null ? s.getIpAddress() : "N/A";
            String os = s.getOsName() != null ? s.getOsName() : "N/A";
            
            host = host.replace(",", " ");
            ip = ip.replace(",", " ");
            os = os.replace(",", " ");
            
            csv.append(String.format(java.util.Locale.US, "%s,%s,%s,%s,%.2f,%.2f,%.2f,%d\n",
                host,
                ip,
                os,
                s.getStatus(),
                s.getCpuUsage() != null ? s.getCpuUsage() : 0.0,
                s.getRamUsage() != null ? s.getRamUsage() : 0.0,
                s.getDiskUsage() != null ? s.getDiskUsage() : 0.0,
                s.getUptimeSeconds() != null ? s.getUptimeSeconds() : 0L
            ));
        }
        
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        InputStream is = new ByteArrayInputStream(bytes);
        
        String key = "reports/servers-" + orgId + "-" + System.currentTimeMillis() + ".csv";
        return s3Service.uploadFile(key, is, bytes.length, "text/csv");
    }
}
