package br.com.atech.lotacaosalaespera.shared.exception;

import java.util.List;

public class DomainException extends RuntimeException {

	private final List<String> details;

	public DomainException(String message, List<String> details) {
		super(message);
		this.details = details == null ? List.of() : List.copyOf(details);
	}

	public List<String> getDetails() {
		return details;
	}
}
