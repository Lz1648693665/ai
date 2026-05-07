package com.devpilot.service;

import com.devpilot.common.BusinessException;
import com.devpilot.dto.LoginRequest;
import com.devpilot.dto.RegisterRequest;
import com.devpilot.entity.AppUser;
import com.devpilot.repository.AppUserRepository;
import com.devpilot.security.JwtUtil;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final AppUserRepository appUserRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	@Transactional
	public Map<String, Object> register(RegisterRequest request) {
		appUserRepository.findByUsername(request.getUsername()).ifPresent(user -> {
			throw new BusinessException("用户名已存在");
		});

		AppUser user = new AppUser();
		user.setUsername(request.getUsername());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setNickname(StringUtils.hasText(request.getNickname()) ? request.getNickname() : request.getUsername());
		appUserRepository.save(user);
		return authResponse(user);
	}

	@Transactional(readOnly = true)
	public Map<String, Object> login(LoginRequest request) {
		AppUser user = appUserRepository.findByUsername(request.getUsername())
				.orElseThrow(() -> new BusinessException("用户名或密码错误"));
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new BusinessException("用户名或密码错误");
		}
		return authResponse(user);
	}

	@Transactional(readOnly = true)
	public Map<String, Object> me(Long userId) {
		AppUser user = appUserRepository.findById(userId)
				.orElseThrow(() -> new BusinessException("用户不存在"));
		return userView(user);
	}

	private Map<String, Object> authResponse(AppUser user) {
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("token", jwtUtil.generateToken(user.getId(), user.getUsername()));
		result.put("user", userView(user));
		return result;
	}

	private Map<String, Object> userView(AppUser user) {
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("id", user.getId());
		result.put("username", user.getUsername());
		result.put("nickname", user.getNickname());
		return result;
	}
}
