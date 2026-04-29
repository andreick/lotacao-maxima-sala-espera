import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Diretiva para gerenciar acesso programático a campos de entrada numéricos.
 * Elimina a necessidade de @ViewChild para operações como foco e limpeza.
 */
@Directive({
  selector: 'input[appNumericChipInput]',
})
export class NumericChipInputDirective {
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);

  focusarCampo(): void {
    this.elementRef.nativeElement.focus();
  }

  limparCampo(): void {
    this.elementRef.nativeElement.value = '';
  }

  obterValor(): string {
    return this.elementRef.nativeElement.value;
  }
}
