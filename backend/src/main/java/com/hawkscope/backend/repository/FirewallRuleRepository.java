package com.hawkscope.backend.repository;

import com.hawkscope.backend.entity.FirewallRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FirewallRuleRepository extends JpaRepository<FirewallRule, String> {
    List<FirewallRule> findByOrganizationIdOrderByPriorityAsc(String organizationId);
}
