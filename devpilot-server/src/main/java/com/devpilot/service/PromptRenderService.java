package com.devpilot.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class PromptRenderService {

	private static final Pattern VARIABLE_PATTERN =
			Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*}}");

	public List<String> parseVariables(String content) {
		Set<String> variables = new LinkedHashSet<>();
		Matcher matcher = VARIABLE_PATTERN.matcher(content);

		while (matcher.find()) {
			variables.add(matcher.group(1));
		}

		return new ArrayList<>(variables);
	}

	public String render(String template, Map<String, String> variables) {
		String result = template;

		for (Map.Entry<String, String> entry : variables.entrySet()) {
			String pattern = "\\{\\{\\s*" + Pattern.quote(entry.getKey()) + "\\s*}}";
			String value = entry.getValue() == null ? "" : entry.getValue();
			result = result.replaceAll(pattern, Matcher.quoteReplacement(value));
		}

		return result;
	}
}
