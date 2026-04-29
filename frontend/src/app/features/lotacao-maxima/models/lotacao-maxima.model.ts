export interface LotacaoMaximaRequest {
  quantidadePassageiros: number;
  temposEntrada: number[];
  temposSaida: number[];
}

export interface LotacaoMaximaResponse {
  maxOcupacao: number;
}

export interface ProblemDetail {
  status?: number;
  detail?: string;
  details?: string[];
}
