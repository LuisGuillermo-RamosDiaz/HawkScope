package com.hawkscope.backend.repository;

import com.hawkscope.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByOrganizationIdOrderByTimestampDesc(String organizationId);

    @Modifying
    @Query("UPDATE AuditLog a SET a.userId = NULL WHERE a.userId = :userId")
    void nullifyUserId(@Param("userId") String userId);
}
