package com.devpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "ai_model_config")
@Data
public class AiModelConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false, length = 50)
	private String provider;

	@Column(nullable = false, length = 500)
	private String baseUrl;

	@Column(columnDefinition = "TEXT")
	private String apiKey;

	@Column(nullable = false, length = 200)
	private String modelName;

	private Boolean enabled = true;

	@Column(name = "is_default")
	private Boolean isDefault = false;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void prePersist() {
		LocalDateTime now = LocalDateTime.now();
		createdAt = now;
		updatedAt = now;
		normalizeBooleans();
	}

	@PreUpdate
	public void preUpdate() {
		updatedAt = LocalDateTime.now();
		normalizeBooleans();
	}

	private void normalizeBooleans() {
		if (enabled == null) {
			enabled = true;
		}
		if (isDefault == null) {
			isDefault = false;
		}
	}
}
