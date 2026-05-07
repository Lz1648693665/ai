package com.devpilot.repository;

import com.devpilot.entity.AiModelConfig;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiModelConfigRepository extends JpaRepository<AiModelConfig, Long> {

	List<AiModelConfig> findAllByOrderByUpdatedAtDesc();

	List<AiModelConfig> findByEnabledTrueOrderByUpdatedAtDesc();

	Optional<AiModelConfig> findFirstByIsDefaultTrueAndEnabledTrue();

	Optional<AiModelConfig> findFirstByModelNameAndEnabledTrue(String modelName);

	boolean existsByEnabledTrueAndIsDefaultTrue();
}
