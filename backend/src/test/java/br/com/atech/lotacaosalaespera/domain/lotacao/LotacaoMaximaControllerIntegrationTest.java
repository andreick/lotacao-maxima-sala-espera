package br.com.atech.lotacaosalaespera.domain.lotacao;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.atech.lotacaosalaespera.shared.exception.ApiExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

class LotacaoMaximaControllerIntegrationTest {

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
		validator.afterPropertiesSet();

		mockMvc = MockMvcBuilders
				.standaloneSetup(new LotacaoMaximaController(new LotacaoMaximaService(new LotacaoMaximaCalculator())))
				.setControllerAdvice(new ApiExceptionHandler())
				.setValidator(validator)
				.build();
	}

	@Test
	void deveRetornarMaxOcupacaoQuandoRequisicaoValida() throws Exception {
		String requestBody = """
				{
				  "quantidadePassageiros": 3,
				  "temposEntrada": [1, 5, 7],
				  "temposSaida": [9, 13, 12]
				}
				""";

		mockMvc.perform(post("/api/lotacao-maxima")
						.contentType(MediaType.APPLICATION_JSON)
						.content(requestBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.maxOcupacao").value(3));
	}

	@Test
	void deveRetornarBadRequestQuandoListasNaoTiveremTamanhoN() throws Exception {
		String requestBody = """
				{
				  "quantidadePassageiros": 3,
				  "temposEntrada": [1, 5],
				  "temposSaida": [9, 13, 12]
				}
				""";

		mockMvc.perform(post("/api/lotacao-maxima")
						.contentType(MediaType.APPLICATION_JSON)
						.content(requestBody))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.title").value("Bad Request"))
				.andExpect(jsonPath("$.detail").value("Dados inválidos"))
				.andExpect(jsonPath("$.instance").value("/api/lotacao-maxima"))
				.andExpect(jsonPath("$.timestamp").isNotEmpty())
				.andExpect(jsonPath("$.details", hasItem("temposEntrada e temposSaida devem ter tamanho quantidadePassageiros")));
	}

	@Test
	void deveRetornarBadRequestQuandoEntradaForMaiorQueSaida() throws Exception {
		String requestBody = """
				{
				  "quantidadePassageiros": 1,
				  "temposEntrada": [5],
				  "temposSaida": [4]
				}
				""";

		mockMvc.perform(post("/api/lotacao-maxima")
						.contentType(MediaType.APPLICATION_JSON)
						.content(requestBody))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.title").value("Bad Request"))
				.andExpect(jsonPath("$.detail").value("Dados inválidos"))
				.andExpect(jsonPath("$.instance").value("/api/lotacao-maxima"))
				.andExpect(jsonPath("$.timestamp").isNotEmpty())
				.andExpect(jsonPath("$.details", hasItem("temposEntrada[0] deve ser menor ou igual a temposSaida[0]")));
	}
}
