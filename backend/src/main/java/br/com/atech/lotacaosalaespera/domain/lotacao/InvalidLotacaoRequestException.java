package br.com.atech.lotacaosalaespera.domain.lotacao;

import java.util.List;

import br.com.atech.lotacaosalaespera.shared.exception.DomainException;

public class InvalidLotacaoRequestException extends DomainException {

	public InvalidLotacaoRequestException(List<String> details) {
		super("Dados inválidos", details);
	}
}
