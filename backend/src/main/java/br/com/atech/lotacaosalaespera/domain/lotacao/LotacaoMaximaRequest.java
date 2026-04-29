package br.com.atech.lotacaosalaespera.domain.lotacao;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record LotacaoMaximaRequest(
		@NotNull @Min(1) @Max(100) Integer quantidadePassageiros,
		@NotNull @Size(min = 1, max = 100) List<@NotNull @Min(1) @Max(1000) Integer> temposEntrada,
		@NotNull @Size(min = 1, max = 100) List<@NotNull @Min(1) @Max(1000) Integer> temposSaida) {
}
