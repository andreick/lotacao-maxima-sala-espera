package br.com.atech.lotacaosalaespera.domain.lotacao;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LotacaoMaximaService {

	private final LotacaoMaximaCalculator lotacaoMaximaCalculator;

	public LotacaoMaximaService(LotacaoMaximaCalculator lotacaoMaximaCalculator) {
		this.lotacaoMaximaCalculator = lotacaoMaximaCalculator;
	}

	public int calcular(LotacaoMaximaRequest request) {
		validarConsistencia(request);
		return lotacaoMaximaCalculator.calcular(request.e(), request.s());
	}

	private void validarConsistencia(LotacaoMaximaRequest request) {
		List<String> erros = new ArrayList<>();

		if (request.e().size() != request.n() || request.s().size() != request.n()) {
			erros.add("e e s devem ter tamanho n");
		}

		int limite = Math.min(request.e().size(), request.s().size());
		for (int i = 0; i < limite; i++) {
			if (request.e().get(i) > request.s().get(i)) {
				erros.add(String.format("e[%d] deve ser menor ou igual a s[%d]", i, i));
			}
		}

		if (!erros.isEmpty()) {
			throw new InvalidLotacaoRequestException(erros);
		}
	}
}
