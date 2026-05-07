package com.devpilot.repository;

import com.devpilot.entity.PromptRunHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromptRunHistoryRepository extends JpaRepository<PromptRunHistory, Long> {

	List<PromptRunHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

	List<PromptRunHistory> findByUserIdAndFavoriteTrueOrderByFavoriteAtDesc(Long userId);

	Optional<PromptRunHistory> findByIdAndUserId(Long id, Long userId);
}
