package com.devpilot.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class AiModelsResponse {

	private String defaultModel;

	private List<AiModelOption> models = new ArrayList<>();
}
