package com.devpilot.repository;

import com.devpilot.entity.UserAiConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAiConfigRepository extends JpaRepository<UserAiConfig, Long> {

	Optional<UserAiConfig> findByUserId(Long userId);
}
