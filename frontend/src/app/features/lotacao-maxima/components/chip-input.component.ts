import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipGrid, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NumericChipInputDirective } from '../directives/numeric-chip-input.directive';
import { parseListaNumeros } from '../utils/parse-lista-numeros';

@Component({
  selector: 'app-chip-input',
  imports: [
    CommonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    NumericChipInputDirective,
  ],
  template: `
    <div class="container-chip-input" [attr.data-testid]="testid">
      <mat-form-field appearance="outline" class="campo-completo">
        <mat-label>{{ rotulo }}</mat-label>
        <mat-chip-grid #chipGrid [attr.aria-label]="rotulo">
          @for (valor of valores(); track $index) {
          <mat-chip-row (removed)="removerValor($index)">
            {{ valor }}
            <button matChipRemove [attr.aria-label]="'Remover ' + rotulo + ' ' + valor">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
          }
          <input
            #chipInput
            appNumericChipInput
            [matChipInputFor]="chipGrid"
            [matChipInputSeparatorKeyCodes]="separadorTeclas"
            (matChipInputTokenEnd)="adicionarValor($event)"
            (paste)="colarValores($event)"
            (blur)="onBlur($event)"
            (keydown)="onKeydown($event)"
            [placeholder]="placeholder"
            [attr.data-testid]="testid + '-input'"
          />
        </mat-chip-grid>
        <mat-hint
          >Adicione um por vez ou cole vários. Detectados: {{ quantidadeDetectada() }} de
          {{ quantidadeEsperada ?? 0 }}.</mat-hint
        >
      </mat-form-field>
      @if (erroChip()) {
      <div class="mensagem-erro" role="alert">{{ erroChip() }}</div>
      } @else if (deveExibirErroValidacao()) {
      <div class="mensagem-erro" role="alert">{{ mensagemErroValidacao }}</div>
      }
    </div>
  `,
  styles: [
    `
      .container-chip-input {
        width: 100%;
      }

      .campo-completo {
        width: 100%;
      }

      .mensagem-erro {
        color: var(--mdc-theme-error, #f44336);
        font-size: 0.75rem;
        margin-top: 0.5rem;
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipInputComponent {
  @ViewChild('chipGrid', { static: false }) protected chipGrid?: MatChipGrid;
  @ViewChild('chipInput', { read: NumericChipInputDirective, static: false })
  protected diretivaCampo?: NumericChipInputDirective;

  @Input() rotulo: string = '';
  @Input() placeholder: string = '';
  @Input() quantidadeEsperada: number | null = null;
  @Input() mensagemErroValidacao: string = '';
  @Input() deveExibirErroValidacao: () => boolean = () => false;
  @Input() testid: string = '';

  @Output() readonly valoresAlterados = new EventEmitter<number[]>();

  readonly separadorTeclas = [ENTER, COMMA];
  readonly valores: WritableSignal<number[]> = signal([]);
  readonly erroChip = signal<string | null>(null);

  readonly quantidadeDetectada = computed(() => this.valores().length);

  adicionarValor(event: MatChipInputEvent): void {
    this.processarValor(event.value, () => event.chipInput.clear());
  }

  removerValor(index: number): void {
    this.valores.update((vals) => vals.filter((_, i) => i !== index));
    this.emitirMudanca();
  }

  colarValores(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const { valores, tokensInvalidos } = parseListaNumeros(text);
    const validos = valores.filter((v) => v >= 1 && v <= 1000);
    this.valores.update((vals) => [...vals, ...validos]);
    const ignorados = tokensInvalidos.length + (valores.length - validos.length);
    this.erroChip.set(
      ignorados > 0 ? `${ignorados} valor(es) ignorado(s): apenas inteiros entre 1 e 1000 são aceitos.` : null,
    );
    this.emitirMudanca();
  }

  onBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    this.processarValor(input.value, () => {
      input.value = '';
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.deveRegistrarPorTecla(event)) return;
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.processarValor(input.value, () => {
      input.value = '';
    });
  }

  focusarCampo(): void {
    this.diretivaCampo?.focusarCampo();
  }

  private processarValor(value: string, limparCampo: () => void): void {
    const trimmed = value.trim();
    if (!trimmed) return;
    const num = this.parseValor(trimmed);
    if (num !== null) {
      this.valores.update((vals) => [...vals, num]);
      this.erroChip.set(null);
      this.emitirMudanca();
    } else {
      this.erroChip.set('Informe um número inteiro entre 1 e 1000.');
    }
    limparCampo();
  }

  private parseValor(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const { valores, tokensInvalidos } = parseListaNumeros(trimmed);
    if (tokensInvalidos.length > 0 || valores.length !== 1) return null;
    const num = valores[0];
    return num >= 1 && num <= 1000 ? num : null;
  }

  private deveRegistrarPorTecla(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    if (!input.value.trim()) return false;
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    if (/^\d$/.test(event.key)) return false;
    if (event.key === 'Enter' || event.key === ',') return false;
    if (event.key.length > 1) return false;
    return true;
  }

  private emitirMudanca(): void {
    this.valoresAlterados.emit([...this.valores()]);
  }
}
