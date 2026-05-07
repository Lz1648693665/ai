package com.devpilot.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class FavoriteHistoryRequest {

	private List<Long> historyIds = new ArrayList<>();
}
