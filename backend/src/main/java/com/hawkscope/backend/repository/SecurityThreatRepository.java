package com.hawkscope.backend.repository;

import com.hawkscope.backend.entity.SecurityThreat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SecurityThreatRepository extends JpaRepository<SecurityThreat, String> {
    List<SecurityThreat> findByOrganizationIdOrderByDetectedAtDesc(String organizationId);
}
