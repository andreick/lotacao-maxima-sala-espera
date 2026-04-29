import { Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NumericChipInputDirective } from './numeric-chip-input.directive';

@Component({
  selector: 'app-test-numeric-chip-input',
  template: '<input appNumericChipInput type="text" />',
  imports: [NumericChipInputDirective],
})
class TestComponent {}

describe('NumericChipInputDirective', () => {
  let component: TestComponent;
  let fixture: any;
  let directiveElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(NumericChipInputDirective));
  });

  it('deve criar a diretiva', () => {
    expect(directiveElement).toBeTruthy();
  });

  it('deve focar no campo', () => {
    const directive = directiveElement.injector.get(NumericChipInputDirective);
    const input = directiveElement.nativeElement as HTMLInputElement;

    vi.spyOn(input, 'focus');
    directive.focusarCampo();

    expect(input.focus).toHaveBeenCalled();
  });

  it('deve limpar o valor do campo', () => {
    const directive = directiveElement.injector.get(NumericChipInputDirective);
    const input = directiveElement.nativeElement as HTMLInputElement;

    input.value = 'teste';
    directive.limparCampo();

    expect(input.value).toBe('');
  });

  it('deve obter o valor do campo', () => {
    const directive = directiveElement.injector.get(NumericChipInputDirective);
    const input = directiveElement.nativeElement as HTMLInputElement;

    input.value = '42';

    expect(directive.obterValor()).toBe('42');
  });
});
