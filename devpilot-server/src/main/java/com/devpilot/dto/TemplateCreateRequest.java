package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TemplateCreateRequest {

	@NotBlank(message = "模板标题不能为空")
	private String title;

	private String category;

	private String description;

	@NotBlank(message = "模板内容不能为空")
	private String content;

	private String tags;

	private Boolean favorite;
}
