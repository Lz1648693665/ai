package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.ParseVarsRequest;
import com.devpilot.dto.TemplateCreateRequest;
import com.devpilot.dto.TemplateRunRequest;
import com.devpilot.entity.PromptTemplate;
import com.devpilot.security.SecurityUtils;
import com.devpilot.service.PromptTemplateService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class PromptTemplateController {

	private final PromptTemplateService templateService;

	@GetMapping
	public Result<List<PromptTemplate>> list() {
		return Result.success(templateService.list(SecurityUtils.currentUserId()));
	}

	@PostMapping("/parse-vars")
	public Result<Map<String, List<String>>> parseVars(@Valid @RequestBody ParseVarsRequest request) {
		return Result.success(Map.of("variables", templateService.parseVariables(request.getContent())));
	}

	@GetMapping("/{id}")
	public Result<PromptTemplate> get(@PathVariable Long id) {
		return Result.success(templateService.get(SecurityUtils.currentUserId(), id));
	}

	@PostMapping
	public Result<PromptTemplate> create(@Valid @RequestBody TemplateCreateRequest request) {
		return Result.success(templateService.create(SecurityUtils.currentUserId(), request));
	}

	@PutMapping("/{id}")
	public Result<PromptTemplate> update(@PathVariable Long id, @Valid @RequestBody TemplateCreateRequest request) {
		return Result.success(templateService.update(SecurityUtils.currentUserId(), id, request));
	}

	@DeleteMapping("/{id}")
	public Result<Void> delete(@PathVariable Long id) {
		templateService.delete(SecurityUtils.currentUserId(), id);
		return Result.success(null);
	}

	@PostMapping("/{id}/run")
	public Result<Map<String, Object>> run(@PathVariable Long id, @RequestBody TemplateRunRequest request) {
		return Result.success(templateService.run(SecurityUtils.currentUserId(), id, request));
	}
}
