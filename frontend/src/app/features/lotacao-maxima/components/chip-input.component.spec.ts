import { TestBed } from '@angular/core/testing';
import { ChipInputComponent } from './chip-input.component';

describe('ChipInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipInputComponent],
    }).compileComponents();
  });

  describe('adição de valores', () => {
    it('deve adicionar valor inteiro válido', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;
      let valoresEmitidos: number[] = [];

      component.valoresAlterados.subscribe((valores) => {
        valoresEmitidos = valores;
      });

      component.adicionarValor({
        value: '42',
        chipInput: { clear: vi.fn() },
      } as any);

      expect(component.valores()).toEqual([42]);
      expect(component.erroChip()).toBeNull();
      expect(valoresEmitidos).toEqual([42]);
    });

    it('deve rejeitar valor não inteiro', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      component.adicionarValor({
        value: 'abc',
        chipInput: { clear: vi.fn() },
      } as any);

      expect(component.valores()).toEqual([]);
      expect(component.erroChip()).toBe('Informe um número inteiro entre 1 e 1000.');
    });

    it('deve rejeitar valor fora do intervalo 1 a 1000', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      component.adicionarValor({
        value: '0',
        chipInput: { clear: vi.fn() },
      } as any);

      expect(component.valores()).toEqual([]);
      expect(component.erroChip()).toBe('Informe um número inteiro entre 1 e 1000.');
    });

    it('deve limpar o erro ao adicionar valor válido após inválido', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      component.adicionarValor({
        value: 'abc',
        chipInput: { clear: vi.fn() },
      } as any);
      expect(component.erroChip()).not.toBeNull();

      component.adicionarValor({
        value: '5',
        chipInput: { clear: vi.fn() },
      } as any);
      expect(component.erroChip()).toBeNull();
    });
  });

  describe('remoção de valores', () => {
    it('deve remover valor pelo índice', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;
      let valoresEmitidos: number[] = [];

      component.valores.set([1, 5, 7]);
      component.valoresAlterados.subscribe((valores) => {
        valoresEmitidos = valores;
      });

      component.removerValor(1);

      expect(component.valores()).toEqual([1, 7]);
      expect(valoresEmitidos).toEqual([1, 7]);
    });
  });

  describe('colagem de valores', () => {
    it('deve adicionar múltiplos valores ao colar', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;
      let valoresEmitidos: number[] = [];

      component.valoresAlterados.subscribe((valores) => {
        valoresEmitidos = valores;
      });

      const event = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => '1, 5\n7' },
      } as any;

      component.colarValores(event);

      expect(component.valores()).toEqual([1, 5, 7]);
      expect(component.erroChip()).toBeNull();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('deve avisar quando valores inválidos foram ignorados ao colar', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      const event = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => '1, abc, 3' },
      } as any;

      component.colarValores(event);

      expect(component.valores()).toEqual([1, 3]);
      expect(component.erroChip()).toContain('1 valor(es) ignorado(s)');
    });
  });

  describe('blur e eventos de teclado', () => {
    it('deve registrar valor válido ao sair do campo', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      const input = { value: '42' } as HTMLInputElement;
      const event = { target: input } as unknown as FocusEvent;

      component.onBlur(event);

      expect(component.valores()).toEqual([42]);
      expect(component.erroChip()).toBeNull();
      expect(input.value).toBe('');
    });

    it('não deve registrar valor ao sair do campo vazio', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      const input = { value: '   ' } as HTMLInputElement;
      const event = { target: input } as unknown as FocusEvent;

      component.onBlur(event);

      expect(component.valores()).toEqual([]);
    });

    it('deve registrar valor ao digitar espaço após número válido', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      const input = { value: '7' } as HTMLInputElement;
      const event = {
        key: ' ',
        target: input,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      component.onKeydown(event);

      expect(component.valores()).toEqual([7]);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('não deve registrar valor ao digitar um dígito', () => {
      const fixture = TestBed.createComponent(ChipInputComponent);
      const component = fixture.componentInstance;

      const input = { value: '4' } as HTMLInputElement;
      const event = {
        key: '3',
        target: input,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      component.onKeydown(event);

      expect(component.valores()).toEqual([]);
    });
  });
});
