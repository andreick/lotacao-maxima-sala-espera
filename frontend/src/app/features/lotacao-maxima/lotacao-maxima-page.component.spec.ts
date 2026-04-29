import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';

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

  it('deve validar inconsistência de quantidade em E e S', () => {
    const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
    const component = fixture.componentInstance;

    component.formulario.setValue({
      quantidadePassageiros: 3,
      temposEntrada: '1, 5',
      temposSaida: '9, 13, 12',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errosFormulario().temposEntrada).toBe('A lista de entradas (E) precisa ter N números.');
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

  it('deve calcular lotação máxima em caso de sucesso', () => {
    apiMock.calcularLotacaoMaxima.mockReturnValue(of({ maxOcupacao: 3 }));

    const fixture = TestBed.createComponent(LotacaoMaximaPageComponent);
    const component = fixture.componentInstance;

    component.formulario.setValue({
      quantidadePassageiros: 3,
      temposEntrada: '1, 5, 7',
      temposSaida: '9, 13, 12',
    });

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

    component.formulario.setValue({
      quantidadePassageiros: 2,
      temposEntrada: '1, 2',
      temposSaida: '3, 4',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.erroApi()).toBe('Não foi possível calcular agora. Tente novamente em instantes.');
  });
});
