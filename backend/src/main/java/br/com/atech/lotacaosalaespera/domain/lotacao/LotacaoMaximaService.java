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
		return lotacaoMaximaCalculator.calcular(request.temposEntrada(), request.temposSaida());
	}

	private void validarConsistencia(LotacaoMaximaRequest request) {
		List<String> erros = new ArrayList<>();

		if (request.temposEntrada().size() != request.quantidadePassageiros()
				|| request.temposSaida().size() != request.quantidadePassageiros()) {
			erros.add("temposEntrada e temposSaida devem ter tamanho quantidadePassageiros");
		}

		int limite = Math.min(request.temposEntrada().size(), request.temposSaida().size());
		for (int i = 0; i < limite; i++) {
			if (request.temposEntrada().get(i) > request.temposSaida().get(i)) {
				erros.add(String.format("temposEntrada[%d] deve ser menor ou igual a temposSaida[%d]", i, i));
			}
		}

		if (!erros.isEmpty()) {
			throw new InvalidLotacaoRequestException(erros);
		}
	}
}
