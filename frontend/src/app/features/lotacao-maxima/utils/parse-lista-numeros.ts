export interface ListaNumerosParseada {
  valores: number[];
  tokensInvalidos: string[];
}

const TOKEN_SPLITTER = /[\s,]+/;
const INTEGER_PATTERN = /^-?\d+$/;

export function parseListaNumeros(input: string): ListaNumerosParseada {
  const tokens = input
    .trim()
    .split(TOKEN_SPLITTER)
    .filter((token) => token.length > 0);

  const valores: number[] = [];
  const tokensInvalidos: string[] = [];

  for (const token of tokens) {
    if (!INTEGER_PATTERN.test(token)) {
      tokensInvalidos.push(token);
      continue;
    }

    const valor = Number(token);
    if (!Number.isSafeInteger(valor)) {
      tokensInvalidos.push(token);
      continue;
    }

    valores.push(valor);
  }

  return { valores, tokensInvalidos };
}
