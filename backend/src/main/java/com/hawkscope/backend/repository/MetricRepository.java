package com.hawkscope.backend.repository;

import com.hawkscope.backend.entity.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {
    List<Metric> findTop100ByServer_IdOrderByTimestampDesc(UUID serverId);
}
