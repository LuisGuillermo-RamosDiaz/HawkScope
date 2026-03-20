package com.hawkscope.backend.repository;

import com.hawkscope.backend.entity.Server;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServerRepository extends JpaRepository<Server, UUID> {
    List<Server> findByOrganizationId(UUID organizationId);
    Optional<Server> findByOrganizationIdAndHostname(UUID organizationId, String hostname);
}
