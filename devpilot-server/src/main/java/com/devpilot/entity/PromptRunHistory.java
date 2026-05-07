package com.devpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "prompt_run_history")
@Data
public class PromptRunHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long userId;

	private Long templateId;

	private String templateTitle;

	private String runType;

	@Column(columnDefinition = "TEXT")
	private String variablesJson;

	@Column(columnDefinition = "TEXT")
	private String finalPrompt;

	@Column(columnDefinition = "TEXT")
	private String aiResult;

	private Boolean favorite = false;

	private LocalDateTime createdAt;

	private LocalDateTime favoriteAt;

	@PrePersist
	public void prePersist() {
		createdAt = LocalDateTime.now();
		if (favorite == null) {
			favorite = false;
		}
	}
}
