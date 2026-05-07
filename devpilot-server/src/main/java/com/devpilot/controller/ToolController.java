package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.BugAnalyzeRequest;
import com.devpilot.dto.JsonToTsRequest;
import com.devpilot.security.SecurityUtils;
import com.devpilot.service.ToolService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolController {

	private final ToolService toolService;

	@PostMapping("/json-to-ts")
	public Result<Map<String, Object>> jsonToTs(@Valid @RequestBody JsonToTsRequest request) {
		return Result.success(toolService.jsonToTs(SecurityUtils.currentUserId(), request));
	}

	@PostMapping("/bug-analyze")
	public Result<Map<String, Object>> bugAnalyze(@RequestBody BugAnalyzeRequest request) {
		return Result.success(toolService.bugAnalyze(SecurityUtils.currentUserId(), request));
	}
}
