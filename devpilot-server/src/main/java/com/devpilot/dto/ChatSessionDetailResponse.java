package com.devpilot.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ChatSessionDetailResponse {

	private Long id;

	private String title;

	private String model;

	private Boolean archived;

	private List<ChatMessage> messages = new ArrayList<>();
}
