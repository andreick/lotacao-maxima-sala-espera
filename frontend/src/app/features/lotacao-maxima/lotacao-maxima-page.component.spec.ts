import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';

import { LotacaoMaximaApiService } from './data-access/lotacao-maxima-api.service';
import { LotacaoMaximaPageComponent } from './lotacao-maxima-page.component';

const criarEventoChip = (value: string): MatChipInputEvent =>
  ({ value, chipInput: { clear: vi.fn() } }) as unknown as MatChipInputEvent;

const criarEventoPaste = (text: string): ClipboardEvent =>
  ({
    preventDefault: vi.fn(),
    clipboardData: { getData: () => text },
  }) as unknown as ClipboardEvent;

const criarEventoBlur = (value: string): FocusEvent => {
  const input = { value } as HTMLInputElement;
  return { target: input } as unknown as FocusEvent;
};

const criarEventoKeydown = (key: string, value: string): KeyboardEvent => {
  const input = { value } as HTMLInputElement;
  return {
    key,
    target: input,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
};

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

  describe('validação de chips', () => {
    it('deve adicionar chip com valor inteiro válido', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;
      const event = criarEventoChip('42');

      component.addEntrada(event);

      expect(component.entradas()).toEqual([42]);
      expect(component.erroChipEntrada()).toBeNull();
      expect((event.chipInput.clear as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
    });

    it('deve rejeitar chip com valor não inteiro', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.addEntrada(criarEventoChip('abc'));

      expect(component.entradas()).toEqual([]);
      expect(component.erroChipEntrada()).toBe('Informe um número inteiro entre 1 e 1000.');
    });

    it('deve rejeitar chip com valor fora do intervalo 1 a 1000', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.addEntrada(criarEventoChip('0'));
      expect(component.entradas()).toEqual([]);
      expect(component.erroChipEntrada()).toBe('Informe um número inteiro entre 1 e 1000.');

      component.addSaida(criarEventoChip('1001'));
      expect(component.saidas()).toEqual([]);
      expect(component.erroChipSaida()).toBe('Informe um número inteiro entre 1 e 1000.');
    });

    it('deve limpar o erro ao adicionar chip válido após inválido', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.addEntrada(criarEventoChip('abc'));
      expect(component.erroChipEntrada()).not.toBeNull();

      component.addEntrada(criarEventoChip('5'));
      expect(component.erroChipEntrada()).toBeNull();
    });

    it('deve remover chip de entradas pelo índice', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.entradas.set([1, 5, 7]);
      component.removeEntrada(1);

      expect(component.entradas()).toEqual([1, 7]);
    });

    it('deve remover chip de saídas pelo índice', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.saidas.set([9, 13, 12]);
      component.removeSaida(0);

      expect(component.saidas()).toEqual([13, 12]);
    });
  });

  describe('colagem de valores', () => {
    it('deve adicionar chips válidos ao colar texto em entradas', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onPasteEntrada(criarEventoPaste('1, 5\n7'));

      expect(component.entradas()).toEqual([1, 5, 7]);
      expect(component.erroChipEntrada()).toBeNull();
    });

    it('deve adicionar chips válidos ao colar texto em saídas', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onPasteSaida(criarEventoPaste('9 13, 12'));

      expect(component.saidas()).toEqual([9, 13, 12]);
      expect(component.erroChipSaida()).toBeNull();
    });

    it('deve avisar quando valores inválidos foram ignorados ao colar', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onPasteEntrada(criarEventoPaste('1, abc, 3'));

      expect(component.entradas()).toEqual([1, 3]);
      expect(component.erroChipEntrada()).toContain('1 valor(es) ignorado(s)');
    });

    it('deve chamar preventDefault ao colar', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;
      const event = criarEventoPaste('1, 5');

      component.onPasteEntrada(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('blur e tecla não numérica nos chips', () => {
    it('deve registrar chip válido ao sair do campo de entradas', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;
      const event = criarEventoBlur('42');

      component.onBlurEntrada(event);

      expect(component.entradas()).toEqual([42]);
      expect(component.erroChipEntrada()).toBeNull();
      expect((event.target as HTMLInputElement).value).toBe('');
    });

    it('deve registrar chip válido ao sair do campo de saídas', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onBlurSaida(criarEventoBlur('99'));

      expect(component.saidas()).toEqual([99]);
      expect(component.erroChipSaida()).toBeNull();
    });

    it('não deve registrar chip ao sair do campo vazio', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onBlurEntrada(criarEventoBlur('   '));

      expect(component.entradas()).toEqual([]);
      expect(component.erroChipEntrada()).toBeNull();
    });

    it('deve registrar chip ao digitar espaço após número válido', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;
      const event = criarEventoKeydown(' ', '7');

      component.onKeydownEntrada(event);

      expect(component.entradas()).toEqual([7]);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('deve registrar chip ao digitar letra após número válido em saídas', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;
      const event = criarEventoKeydown('a', '15');

      component.onKeydownSaida(event);

      expect(component.saidas()).toEqual([15]);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('não deve registrar chip ao digitar um dígito', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onKeydownEntrada(criarEventoKeydown('3', '4'));

      expect(component.entradas()).toEqual([]);
    });

    it('não deve registrar chip ao digitar tecla especial (Backspace)', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.onKeydownEntrada(criarEventoKeydown('Backspace', '5'));

      expect(component.entradas()).toEqual([]);
    });

    it('não deve registrar chip ao usar atalho de teclado (Ctrl+A)', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;
      const event = {
        key: 'a',
        target: { value: '5' } as HTMLInputElement,
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      component.onKeydownEntrada(event);

      expect(component.entradas()).toEqual([]);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('validação do formulário', () => {
    it('deve validar inconsistência de quantidade em E e S', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 3 });
      component.entradas.set([1, 5]);
      component.saidas.set([9, 13, 12]);

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errosFormulario().temposEntrada).toBe('A lista de entradas (E) precisa ter 3 números.');
      expect(apiMock.calcularLotacaoMaxima).not.toHaveBeenCalled();
    });

    it('deve validar saída antes da entrada correspondente', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 2 });
      component.entradas.set([5, 10]);
      component.saidas.set([3, 15]);

      component.onSubmit();

      expect(component.errosFormulario().temposSaida).toBe(
        'Encontramos uma saída antes da entrada. Revise os valores.',
      );
      expect(apiMock.calcularLotacaoMaxima).not.toHaveBeenCalled();
    });

    it('deve validar N fora do intervalo 1 a 100', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 0 });
      component.onSubmit();

      expect(component.errosFormulario().quantidadePassageiros).toBe('N deve estar entre 1 e 100.');
      expect(apiMock.calcularLotacaoMaxima).not.toHaveBeenCalled();
    });

    it('deve exibir mensagens de validação apenas após clicar em calcular', () => {
      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.controls.quantidadePassageiros.markAsTouched();
      component.formulario.controls.quantidadePassageiros.markAsDirty();

      expect(component.deveExibirErro('quantidadePassageiros')).toBe(false);

      component.onSubmit();

      expect(component.deveExibirErro('quantidadePassageiros')).toBe(true);
    });
  });

  describe('submissão', () => {
    it('deve calcular lotação máxima em caso de sucesso', () => {
      apiMock.calcularLotacaoMaxima.mockReturnValue(of({ maxOcupacao: 3 }));

      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 3 });
      component.entradas.set([1, 5, 7]);
      component.saidas.set([9, 13, 12]);

      component.onSubmit();
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
      component.entradas.set([1, 2]);
      component.saidas.set([3, 4]);

      component.onSubmit();
      fixture.detectChanges();

      expect(component.erroApi()).toBe('Não foi possível calcular agora. Tente novamente em instantes.');
    });

    it('deve exibir detalhe de erro 400 da API', () => {
      const erroApi = { status: 400, error: { details: ['N deve ser compatível com E e S.'] } };
      apiMock.calcularLotacaoMaxima.mockReturnValue(throwError(() => erroApi));

      const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
      const component = fixture.componentInstance;

      component.formulario.setValue({ quantidadePassageiros: 2 });
      component.entradas.set([1, 2]);
      component.saidas.set([3, 4]);

      component.onSubmit();
      fixture.detectChanges();

      expect(component.erroApi()).toBe('N deve ser compatível com E e S.');
    });
  });
});
