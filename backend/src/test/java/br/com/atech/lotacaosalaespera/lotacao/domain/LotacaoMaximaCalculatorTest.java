package br.com.atech.lotacaosalaespera.lotacao.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class LotacaoMaximaCalculatorTest {

	@Test
	void deveRetornarTresParaExemploComSobreposicao() {
		int maxOcupacao = LotacaoMaximaCalculator.calcular(
				List.of(1, 5, 7),
				List.of(9, 13, 12)
		);

		assertEquals(3, maxOcupacao);
	}

	@Test
	void deveRetornarUmQuandoEntradaCoincideComSaida() {
		int maxOcupacao = LotacaoMaximaCalculator.calcular(
				List.of(1, 4, 8, 10),
				List.of(3, 8, 10, 17)
		);

		assertEquals(1, maxOcupacao);
	}

	@Test
	void deveProcessarSaidaAntesDeEntradaNoMesmoInstante() {
		int maxOcupacao = LotacaoMaximaCalculator.calcular(
				List.of(1, 2),
				List.of(2, 3)
		);

		assertEquals(1, maxOcupacao);
	}
}
