package com.devpilot.dto;

import lombok.Data;

@Data
public class FavoriteHistoryResponse {

	private Long id;

	private String type;

	private String templateName;

	private String title;

	private String finalPrompt;

	private String aiResult;

	private String result;

	private String createdAt;

	private String favoriteAt;
}
