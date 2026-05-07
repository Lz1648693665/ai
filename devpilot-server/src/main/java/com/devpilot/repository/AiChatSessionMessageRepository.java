package com.devpilot.repository;

import com.devpilot.entity.AiChatSessionMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatSessionMessageRepository extends JpaRepository<AiChatSessionMessage, Long> {

	List<AiChatSessionMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

	void deleteBySessionId(Long sessionId);
}
