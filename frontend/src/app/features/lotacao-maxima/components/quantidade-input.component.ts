import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NumericChipInputDirective } from '../directives/numeric-chip-input.directive';

@Component({
  selector: 'app-quantidade-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, NumericChipInputDirective],
  template: `
    <mat-form-field appearance="outline" class="campo-completo">
      <mat-label>Número de passageiros (N)</mat-label>
      <input
        #quantidadeInput
        appNumericChipInput
        matInput
        type="number"
        [formControl]="controle"
        [errorStateMatcher]="errorStateMatcher"
        min="1"
        max="100"
        step="1"
      />
      <mat-error role="alert">{{ obterMensagemErro() }}</mat-error>
    </mat-form-field>
  `,
  styles: [
    `
      .campo-completo {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantidadeInputComponent {
  @ViewChild('quantidadeInput', { read: NumericChipInputDirective })
  protected readonly diretivaCampo?: NumericChipInputDirective;

  @Input() controle: FormControl<number | null> = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), Validators.max(100)],
    nonNullable: false,
  });

  @Input() tentouSubmeter = false;

  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: AbstractControl | null): boolean =>
      !!(control?.invalid && this.tentouSubmeter),
  };

  obterMensagemErro(): string {
    const erros = this.controle.errors;
    if (!erros) return '';

    if (erros['required']) {
      return 'Número de passageiros (N) obrigatório.';
    }
    if (erros['min'] || erros['max']) {
      return 'N deve estar entre 1 e 100.';
    }

    return 'Valor inválido.';
  }

  focusarCampo(): void {
    this.diretivaCampo?.focusarCampo();
  }
}
