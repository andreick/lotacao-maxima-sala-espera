import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { QuantidadeInputComponent } from './quantidade-input.component';

describe('QuantidadeInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantidadeInputComponent],
    }).compileComponents();
  });

  it('deve renderizar com controle de formulário', () => {
    const fixture = TestBed.createComponent(QuantidadeInputComponent);
    const component = fixture.componentInstance;

    expect(component.controle).toBeDefined();
  });

  it('deve aceitar valor válido entre 1 e 100', () => {
    const fixture = TestBed.createComponent(QuantidadeInputComponent);
    const component = fixture.componentInstance;
    const control = new FormControl<number | null>(50, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
      nonNullable: false,
    });

    component.controle = control;
    fixture.detectChanges();

    expect(control.valid).toBe(true);
  });

  it('deve retornar mensagem de erro para campo obrigatório', () => {
    const fixture = TestBed.createComponent(QuantidadeInputComponent);
    const component = fixture.componentInstance;
    const control = new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
      nonNullable: false,
    });

    component.controle = control;
    control.setErrors({ required: true });

    expect(component.obterMensagemErro()).toContain('obrigatório');
  });

  it('deve retornar mensagem de erro para fora do intervalo', () => {
    const fixture = TestBed.createComponent(QuantidadeInputComponent);
    const component = fixture.componentInstance;
    const control = new FormControl<number | null>(200, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
      nonNullable: false,
    });

    component.controle = control;
    control.setErrors({ max: true });

    expect(component.obterMensagemErro()).toContain('entre 1 e 100');
  });
});
