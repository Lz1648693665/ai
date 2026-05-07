package com.devpilot.common;

import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	public Result<Void> handleBusinessException(BusinessException exception) {
		return Result.fail(exception.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public Result<Void> handleValidationException(MethodArgumentNotValidException exception) {
		FieldError fieldError = exception.getBindingResult().getFieldError();
		String message = fieldError == null ? "请求参数不正确" : fieldError.getDefaultMessage();
		return Result.fail(message);
	}

	@ExceptionHandler(Exception.class)
	public Result<Void> handleException(Exception exception) {
		return Result.fail(exception.getMessage());
	}
}
