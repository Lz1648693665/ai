package com.devpilot.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ChatRequest {

	private Long sessionId;

	@NotBlank(message = "消息内容不能为空")
	private String message;

	private String model;

	private List<ChatMessage> messages = new ArrayList<>();
}
