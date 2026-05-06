package br.com.atech.lotacaosalaespera.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleBeanValidation(
			MethodArgumentNotValidException exception,
			HttpServletRequest request
	) {
		List<String> details = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.distinct()
				.toList();
		return buildError(HttpStatus.BAD_REQUEST, "Dados inválidos", request, details);
	}

	@ExceptionHandler(DomainException.class)
	public ResponseEntity<ProblemDetail> handleDomainException(
			DomainException exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.BAD_REQUEST, exception.getMessage(), request, exception.getDetails());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleUnexpectedException(
			Exception exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado", request, List.of());
	}

	private ResponseEntity<ProblemDetail> buildError(
			HttpStatus status,
			String message,
			HttpServletRequest request,
			List<String> details
	) {
		ProblemDetail body = ProblemDetail.forStatusAndDetail(status, message);
		body.setTitle(status.getReasonPhrase());
		body.setInstance(URI.create(request.getRequestURI()));
		body.setProperty("timestamp", OffsetDateTime.now());
		if (!details.isEmpty()) {
			body.setProperty("details", details);
		}
		return ResponseEntity.status(status).body(body);
	}
}
