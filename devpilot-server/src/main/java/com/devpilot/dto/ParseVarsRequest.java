package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParseVarsRequest {

	@NotBlank(message = "模板内容不能为空")
	private String content;
}
