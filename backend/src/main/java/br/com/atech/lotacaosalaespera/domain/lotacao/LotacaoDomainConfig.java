package br.com.atech.lotacaosalaespera.shared.config;

import br.com.atech.lotacaosalaespera.domain.lotacao.LotacaoMaximaCalculator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LotacaoDomainConfig {

	@Bean
	public LotacaoMaximaCalculator lotacaoMaximaCalculator() {
		return new LotacaoMaximaCalculator();
	}
}
