package com.devpilot.security;

import com.devpilot.common.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static Long currentUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
			throw new BusinessException("未登录或登录已过期");
		}
		return loginUser.userId();
	}
}
