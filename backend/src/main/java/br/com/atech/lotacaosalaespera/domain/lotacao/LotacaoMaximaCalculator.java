package br.com.atech.lotacaosalaespera.domain.lotacao;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Calcula a lotação máxima (pico de ocupação) a partir dos instantes de entrada e saída.
 *
 * Ideia: transformar cada entrada/saída em um "evento" ordenado no tempo e fazer uma varredura
 * acumulando +1 para entrada e -1 para saída, guardando o maior valor observado.
 */
public class LotacaoMaximaCalculator {

	/**
	 * Ordena por tempo; em caso de empate, processa SAÍDA antes de ENTRADA para respeitar a regra:
	 * se alguém sai no mesmo instante em que outro entra, conta apenas 1 pessoa naquele instante.
	 */
	private static final Comparator<LotacaoEvent> COMPARADOR_EVENTO = Comparator
			.comparingInt(LotacaoEvent::tempo)
			.thenComparingInt(event -> event.tipo().prioridade());

	/**
	 * @param entradas lista de tempos de entrada (E)
	 * @param saidas   lista de tempos de saída (S) na mesma ordem/índices de {@code entradas}
	 * @return lotação máxima simultânea
	 */
	public int calcular(List<Integer> entradas, List<Integer> saidas) {
		List<LotacaoEvent> eventos = new ArrayList<>(entradas.size() * 2);

		for (int i = 0; i < entradas.size(); i++) {
			eventos.add(new LotacaoEvent(entradas.get(i), LotacaoEventType.ENTRADA));
			eventos.add(new LotacaoEvent(saidas.get(i), LotacaoEventType.SAIDA));
		}

		eventos.sort(COMPARADOR_EVENTO);

		int ocupacaoAtual = 0;
		int ocupacaoMaxima = 0;

		for (LotacaoEvent evento : eventos) {
			ocupacaoAtual += evento.tipo().delta();
			ocupacaoMaxima = Math.max(ocupacaoMaxima, ocupacaoAtual);
		}

		return ocupacaoMaxima;
	}
}
