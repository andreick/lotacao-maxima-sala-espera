package br.com.atech.lotacaosalaespera.lotacao.domain;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class LotacaoMaximaCalculator {

	private static final Comparator<LotacaoEvent> COMPARADOR_EVENTO = Comparator
			.comparingInt(LotacaoEvent::tempo)
			.thenComparingInt(event -> event.tipo().prioridade());

	private LotacaoMaximaCalculator() {
	}

	public static int calcular(List<Integer> entradas, List<Integer> saidas) {
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
