package br.com.atech.lotacaosalaespera.domain.lotacao;

enum LotacaoEventType {
	SAIDA(0, -1),
	ENTRADA(1, 1);

	private final int prioridade;
	private final int delta;

	LotacaoEventType(int prioridade, int delta) {
		this.prioridade = prioridade;
		this.delta = delta;
	}

	int prioridade() {
		return prioridade;
	}

	int delta() {
		return delta;
	}
}
