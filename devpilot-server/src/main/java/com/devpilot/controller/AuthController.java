package com.devpilot.controller;

import com.devpilot.common.Result;
import com.devpilot.dto.LoginRequest;
import com.devpilot.dto.RegisterRequest;
import com.devpilot.security.SecurityUtils;
import com.devpilot.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	public Result<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
		return Result.success(authService.register(request));
	}

	@PostMapping("/login")
	public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
		return Result.success(authService.login(request));
	}

	@GetMapping("/me")
	public Result<Map<String, Object>> me() {
		return Result.success(authService.me(SecurityUtils.currentUserId()));
	}
}
