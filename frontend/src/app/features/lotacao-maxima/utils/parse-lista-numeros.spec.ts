import { parseListaNumeros } from './parse-lista-numeros';

describe('parseListaNumeros', () => {
  it('deve aceitar vírgula, espaço e quebra de linha', () => {
    const resultado = parseListaNumeros('1, 5\n7  10');

    expect(resultado.valores).toEqual([1, 5, 7, 10]);
    expect(resultado.tokensInvalidos).toEqual([]);
  });

  it('deve aceitar notação com caracteres não numéricos nas bordas', () => {
    expect(parseListaNumeros('[1, 2, 3]').valores).toEqual([1, 2, 3]);
    expect(parseListaNumeros('[1,2,3]').valores).toEqual([1, 2, 3]);
    expect(parseListaNumeros('(1, 2, 3)').valores).toEqual([1, 2, 3]);
    expect(parseListaNumeros('{1, 2, 3}').valores).toEqual([1, 2, 3]);
    expect(parseListaNumeros('[1, 2, 3]').tokensInvalidos).toEqual([]);
  });

  it('deve separar tokens inválidos', () => {
    const resultado = parseListaNumeros('1, abc, 3.5, 7');

    expect(resultado.valores).toEqual([1, 7]);
    expect(resultado.tokensInvalidos).toEqual(['abc', '3.5']);
  });
});
