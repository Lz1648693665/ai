package com.devpilot.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

	private static final String HMAC_ALGORITHM = "HmacSHA256";

	private final ObjectMapper objectMapper;
	private final String secret;
	private final long expirationSeconds;

	public JwtUtil(
			ObjectMapper objectMapper,
			@Value("${devpilot.jwt.secret}") String secret,
			@Value("${devpilot.jwt.expiration-seconds}") long expirationSeconds) {
		this.objectMapper = objectMapper;
		this.secret = secret;
		this.expirationSeconds = expirationSeconds;
	}

	public String generateToken(Long userId, String username) {
		try {
			Map<String, Object> header = new LinkedHashMap<>();
			header.put("alg", "HS256");
			header.put("typ", "JWT");

			Map<String, Object> payload = new LinkedHashMap<>();
			payload.put("sub", userId.toString());
			payload.put("username", username);
			payload.put("exp", Instant.now().plusSeconds(expirationSeconds).getEpochSecond());

			String headerPart = base64UrlEncode(objectMapper.writeValueAsBytes(header));
			String payloadPart = base64UrlEncode(objectMapper.writeValueAsBytes(payload));
			String unsignedToken = headerPart + "." + payloadPart;
			String signature = base64UrlEncode(sign(unsignedToken));
			return unsignedToken + "." + signature;
		} catch (Exception exception) {
			throw new IllegalStateException("Token 生成失败", exception);
		}
	}

	public TokenClaims parseToken(String token) {
		try {
			String[] parts = token.split("\\.");
			if (parts.length != 3) {
				throw new IllegalArgumentException("Token 格式不正确");
			}

			String unsignedToken = parts[0] + "." + parts[1];
			byte[] expectedSignature = sign(unsignedToken);
			byte[] actualSignature = Base64.getUrlDecoder().decode(parts[2]);
			if (!MessageDigest.isEqual(expectedSignature, actualSignature)) {
				throw new IllegalArgumentException("Token 签名不正确");
			}

			byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
			Map<String, Object> payload = objectMapper.readValue(payloadBytes, new TypeReference<>() {
			});
			long exp = ((Number) payload.get("exp")).longValue();
			if (Instant.now().getEpochSecond() > exp) {
				throw new IllegalArgumentException("Token 已过期");
			}

			Long userId = Long.valueOf(String.valueOf(payload.get("sub")));
			String username = String.valueOf(payload.get("username"));
			return new TokenClaims(userId, username, exp);
		} catch (Exception exception) {
			throw new IllegalArgumentException("Token 校验失败", exception);
		}
	}

	private byte[] sign(String content) throws Exception {
		Mac mac = Mac.getInstance(HMAC_ALGORITHM);
		mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
		return mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
	}

	private String base64UrlEncode(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	public record TokenClaims(Long userId, String username, long exp) {
	}
}
