package com.devpilot.dto;

import lombok.Data;

@Data
public class ChatSessionSummaryResponse {

	private Long id;

	private String title;

	private String lastMessage;

	private String model;

	private Boolean archived;

	private String updatedAt;
}
