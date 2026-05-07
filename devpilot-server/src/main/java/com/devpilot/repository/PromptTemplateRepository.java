package com.devpilot.repository;

import com.devpilot.entity.PromptTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromptTemplateRepository extends JpaRepository<PromptTemplate, Long> {

	List<PromptTemplate> findByUserIdOrderByUpdatedAtDesc(Long userId);

	Optional<PromptTemplate> findByIdAndUserId(Long id, Long userId);
}
