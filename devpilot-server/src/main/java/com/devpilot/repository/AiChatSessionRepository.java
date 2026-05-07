package com.devpilot.repository;

import com.devpilot.entity.AiChatSession;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiChatSessionRepository extends JpaRepository<AiChatSession, Long> {

	@Query("""
			select session from AiChatSession session
			where session.userId = :userId
			and session.archived = :archived
			and (
				:keyword is null
				or :keyword = ''
				or lower(session.title) like lower(concat('%', :keyword, '%'))
				or lower(session.lastMessage) like lower(concat('%', :keyword, '%'))
			)
			order by session.updatedAt desc
			""")
	List<AiChatSession> search(
			@Param("userId") Long userId,
			@Param("keyword") String keyword,
			@Param("archived") Boolean archived);

	Optional<AiChatSession> findByIdAndUserId(Long id, Long userId);
}
