package br.com.atech.lotacaosalaespera.lotacao.error;

import java.util.List;

public class InvalidLotacaoRequestException extends RuntimeException {

	private final List<String> details;

	public InvalidLotacaoRequestException(List<String> details) {
		super("Dados inválidos");
		this.details = List.copyOf(details);
	}

	public List<String> getDetails() {
		return details;
	}
}
