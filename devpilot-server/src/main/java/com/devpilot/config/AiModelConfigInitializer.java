package com.devpilot.config;

import com.devpilot.entity.AiModelConfig;
import com.devpilot.repository.AiModelConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AiModelConfigInitializer implements CommandLineRunner {

	private final AiModelConfigRepository configRepository;

	@Override
	@Transactional
	public void run(String... args) {
		if (configRepository.count() > 0) {
			repairDefaultOllamaName();
			return;
		}

		AiModelConfig config = new AiModelConfig();
		config.setName("本地 Ollama");
		config.setProvider("ollama");
		config.setBaseUrl("http://localhost:11434");
		config.setModelName("qwen2.5-coder");
		config.setApiKey("");
		config.setEnabled(true);
		config.setIsDefault(true);
		configRepository.save(config);
	}

	private void repairDefaultOllamaName() {
		configRepository.findFirstByIsDefaultTrueAndEnabledTrue().ifPresent(config -> {
			if ("ollama".equals(config.getProvider())
					&& "qwen2.5-coder".equals(config.getModelName())
					&& !"本地 Ollama".equals(config.getName())) {
				config.setName("本地 Ollama");
				configRepository.save(config);
			}
		});
	}
}
