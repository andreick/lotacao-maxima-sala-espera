package br.com.atech.lotacaosalaespera.lotacao.controller;

import br.com.atech.lotacaosalaespera.lotacao.dto.LotacaoMaximaRequest;
import br.com.atech.lotacaosalaespera.lotacao.dto.LotacaoMaximaResponse;
import br.com.atech.lotacaosalaespera.lotacao.service.LotacaoMaximaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lotacao-maxima")
public class LotacaoMaximaController {

	private final LotacaoMaximaService lotacaoMaximaService;

	public LotacaoMaximaController(LotacaoMaximaService lotacaoMaximaService) {
		this.lotacaoMaximaService = lotacaoMaximaService;
	}

	@PostMapping
	public ResponseEntity<LotacaoMaximaResponse> calcularLotacaoMaxima(
			@Valid @RequestBody LotacaoMaximaRequest request
	) {
		int maxOcupacao = lotacaoMaximaService.calcular(request);
		return ResponseEntity.ok(new LotacaoMaximaResponse(maxOcupacao));
	}
}
