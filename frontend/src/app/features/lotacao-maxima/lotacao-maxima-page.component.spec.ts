import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { LotacaoMaximaApiService } from './data-access/lotacao-maxima-api.service';
import { LotacaoMaximaPageComponent } from './lotacao-maxima-page.component';

describe('LotacaoMaximaPageComponent', () => {
  const apiMock = {
    calcularLotacaoMaxima: vi.fn(),
  };

  beforeEach(async () => {
    apiMock.calcularLotacaoMaxima.mockReset();

    await TestBed.configureTestingModule({
      imports: [LotacaoMaximaPageComponent],
      providers: [{ provide: LotacaoMaximaApiService, useValue: apiMock }],
    }).compileComponents();
  });

  describe('validação do formulário', () => {
    it('deve validar inconsistência de quantidade em E e S', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 3 });
      component.atualizarEntradas([1, 5]);
      component.atualizarSaidas([9, 13, 12]);

      component.enviarFormulario();
      fixture.detectChanges();

      expect(component.errosFormulario().temposEntrada).toBe('A lista de entradas (E) precisa ter 3 números.');
      expect(apiMock.calcularLotacaoMaxima).not.toHaveBeenCalled();
    });

    it('deve validar saída antes da entrada correspondente', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 2 });
      component.atualizarEntradas([5, 10]);
      component.atualizarSaidas([3, 15]);

      component.enviarFormulario();

      expect(component.errosFormulario().temposSaida).toBe(
        'Encontramos uma saída antes da entrada. Revise os valores.',
      );
      expect(apiMock.calcularLotacaoMaxima).not.toHaveBeenCalled();
    });

    it('deve validar N fora do intervalo 1 a 100', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 0 });
      component.enviarFormulario();

      expect(component.errosFormulario().quantidadePassageiros).toBe('N deve estar entre 1 e 100.');
      expect(apiMock.calcularLotacaoMaxima).not.toHaveBeenCalled();
    });

    it('deve exibir mensagens de validação apenas após clicar em calcular', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.controls.quantidadePassageiros.markAsTouched();
      component.formulario.controls.quantidadePassageiros.markAsDirty();

      expect(component.deveExibirErro('quantidadePassageiros')).toBe(false);

      component.enviarFormulario();

      expect(component.deveExibirErro('quantidadePassageiros')).toBe(true);
    });
  });

  describe('submissão', () => {
    it('deve calcular lotação máxima em caso de sucesso', () => {
      apiMock.calcularLotacaoMaxima.mockReturnValue(of({ maxOcupacao: 3 }));

      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 3 });
      component.atualizarEntradas([1, 5, 7]);
      component.atualizarSaidas([9, 13, 12]);

      component.enviarFormulario();
      fixture.detectChanges();

      expect(apiMock.calcularLotacaoMaxima).toHaveBeenCalledWith({
        quantidadePassageiros: 3,
        temposEntrada: [1, 5, 7],
        temposSaida: [9, 13, 12],
      });
      expect(component.resultado()).toBe(3);
    });

    it('deve exibir erro amigável em falha da API', () => {
      apiMock.calcularLotacaoMaxima.mockReturnValue(throwError(() => ({ status: 503 })));

      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 2 });
      component.atualizarEntradas([1, 2]);
      component.atualizarSaidas([3, 4]);

      component.enviarFormulario();
      fixture.detectChanges();

      expect(component.erroApi()).toBe('Não foi possível calcular agora. Tente novamente em instantes.');
    });

    it('deve exibir detalhe de erro 400 da API', () => {
      const erroApi = { status: 400, error: { details: ['N deve ser compatível com E e S.'] } };
      apiMock.calcularLotacaoMaxima.mockReturnValue(throwError(() => erroApi));

      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 2 });
      component.atualizarEntradas([1, 2]);
      component.atualizarSaidas([3, 4]);

      component.enviarFormulario();
      fixture.detectChanges();

      expect(component.erroApi()).toBe('N deve ser compatível com E e S.');
    });
  });
});
