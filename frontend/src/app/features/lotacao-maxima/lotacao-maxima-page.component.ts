import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LotacaoMaximaApiService } from './data-access/lotacao-maxima-api.service';
import { ProblemDetail } from './models/lotacao-maxima.model';
import { parseListaNumeros } from './utils/parse-lista-numeros';

type LotacaoMaximaForm = FormGroup<{
  quantidadePassageiros: FormControl<number | null>;
}>;

interface ErrosFormulario {
  quantidadePassageiros?: string;
  temposEntrada?: string;
  temposSaida?: string;
}

@Component({
  selector: 'app-lotacao-maxima-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './lotacao-maxima-page.component.html',
  styleUrl: './lotacao-maxima-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotacaoMaximaPageComponent {
  private readonly lotacaoApi = inject(LotacaoMaximaApiService);

  @ViewChild('quantidadeInput') private quantidadeInput?: ElementRef<HTMLInputElement>;
  @ViewChild('entradasChipInput') private entradasChipInput?: ElementRef<HTMLInputElement>;
  @ViewChild('saidasChipInput') private saidasChipInput?: ElementRef<HTMLInputElement>;

  readonly separadorTeclas: readonly number[] = [ENTER, COMMA];

  readonly formulario: LotacaoMaximaForm = new FormGroup({
    quantidadePassageiros: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
      nonNullable: false,
    }),
  });

  private readonly quantidadePassageiros = toSignal(
    this.formulario.controls.quantidadePassageiros.valueChanges,
    { initialValue: this.formulario.controls.quantidadePassageiros.value },
  );

  readonly entradas = signal<number[]>([]);
  readonly saidas = signal<number[]>([]);
  readonly erroChipEntrada = signal<string | null>(null);
  readonly erroChipSaida = signal<string | null>(null);
  readonly carregando = signal(false);
  readonly resultado = signal<number | null>(null);
  readonly erroApi = signal<string | null>(null);
  readonly tentouSubmeter = signal(false);

  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: AbstractControl | null): boolean =>
      !!(control?.invalid && this.tentouSubmeter()),
  };

  readonly errosFormulario = computed(() => this.validarFormulario());
  readonly quantidadeEntradasDetectadas = computed(() => this.entradas().length);
  readonly quantidadeSaidasDetectadas = computed(() => this.saidas().length);

  addEntrada(event: MatChipInputEvent): void {
    this.processChipValue(event.value, this.entradas, this.erroChipEntrada, () => event.chipInput.clear());
  }

  removeEntrada(index: number): void {
    this.entradas.update((vals) => vals.filter((_, i) => i !== index));
  }

  onBlurEntrada(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    this.processChipValue(input.value, this.entradas, this.erroChipEntrada, () => { input.value = ''; });
  }

  onKeydownEntrada(event: KeyboardEvent): void {
    if (!this.deveRegistrarPorTecla(event)) return;
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.processChipValue(input.value, this.entradas, this.erroChipEntrada, () => { input.value = ''; });
  }

  onPasteEntrada(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const { valores, tokensInvalidos } = parseListaNumeros(text);
    const validos = valores.filter((v) => v >= 1 && v <= 1000);
    this.entradas.update((vals) => [...vals, ...validos]);
    const ignorados = tokensInvalidos.length + (valores.length - validos.length);
    this.erroChipEntrada.set(
      ignorados > 0 ? `${ignorados} valor(es) ignorado(s): apenas inteiros entre 1 e 1000 são aceitos.` : null,
    );
  }

  addSaida(event: MatChipInputEvent): void {
    this.processChipValue(event.value, this.saidas, this.erroChipSaida, () => event.chipInput.clear());
  }

  removeSaida(index: number): void {
    this.saidas.update((vals) => vals.filter((_, i) => i !== index));
  }

  onBlurSaida(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    this.processChipValue(input.value, this.saidas, this.erroChipSaida, () => { input.value = ''; });
  }

  onKeydownSaida(event: KeyboardEvent): void {
    if (!this.deveRegistrarPorTecla(event)) return;
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    this.processChipValue(input.value, this.saidas, this.erroChipSaida, () => { input.value = ''; });
  }

  onPasteSaida(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const { valores, tokensInvalidos } = parseListaNumeros(text);
    const validos = valores.filter((v) => v >= 1 && v <= 1000);
    this.saidas.update((vals) => [...vals, ...validos]);
    const ignorados = tokensInvalidos.length + (valores.length - validos.length);
    this.erroChipSaida.set(
      ignorados > 0 ? `${ignorados} valor(es) ignorado(s): apenas inteiros entre 1 e 1000 são aceitos.` : null,
    );
  }

  onSubmit(): void {
    this.tentouSubmeter.set(true);
    this.erroApi.set(null);
    this.resultado.set(null);

    const erros = this.validarFormulario();
    if (Object.keys(erros).length > 0) {
      this.formulario.markAllAsTouched();
      this.focarPrimeiroCampoComErro(erros);
      return;
    }

    const quantidade = Number(this.formulario.controls.quantidadePassageiros.value);
    const temposEntrada = this.entradas();
    const temposSaida = this.saidas();

    this.carregando.set(true);
    this.lotacaoApi
      .calcularLotacaoMaxima({ quantidadePassageiros: quantidade, temposEntrada, temposSaida })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (response) => this.resultado.set(response.maxOcupacao),
        error: (error: HttpErrorResponse) => this.erroApi.set(this.mapearErroApi(error)),
      });
  }

  deveExibirErro(campo: keyof ErrosFormulario): boolean {
    if (!this.errosFormulario()[campo]) {
      return false;
    }
    return this.tentouSubmeter();
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

  private processChipValue(
    value: string,
    values: WritableSignal<number[]>,
    error: WritableSignal<string | null>,
    clearInput: () => void,
  ): void {
    const trimmed = value.trim();
    if (!trimmed) return;
    const num = this.parseChipValue(trimmed);
    if (num !== null) {
      values.update((vals) => [...vals, num]);
      error.set(null);
    } else {
      error.set('Informe um número inteiro entre 1 e 1000.');
    }
    clearInput();
  }

  private parseChipValue(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const { valores, tokensInvalidos } = parseListaNumeros(trimmed);
    if (tokensInvalidos.length > 0 || valores.length !== 1) return null;
    const num = valores[0];
    return num >= 1 && num <= 1000 ? num : null;
  }

  private validarFormulario(): ErrosFormulario {
    const erros: ErrosFormulario = {};
    const quantidadeBruta = this.quantidadePassageiros();
    const quantidade =
      typeof quantidadeBruta === 'number' && Number.isInteger(quantidadeBruta) ? quantidadeBruta : null;

    if (quantidade === null) {
      erros.quantidadePassageiros = 'Número de passageiros (N) obrigatório.';
    } else if (quantidade < 1 || quantidade > 100) {
      erros.quantidadePassageiros = 'N deve estar entre 1 e 100.';
    }

    const entradas = this.entradas();
    const saidas = this.saidas();

    const quantidadeLabel =
      quantidade !== null ? `${quantidade} número${quantidade === 1 ? '' : 's'}` : 'N números';

    if (entradas.length === 0 || (quantidade !== null && entradas.length !== quantidade)) {
      erros.temposEntrada = `A lista de entradas (E) precisa ter ${quantidadeLabel}.`;
    }

    if (saidas.length === 0 || (quantidade !== null && saidas.length !== quantidade)) {
      erros.temposSaida = `A lista de saídas (S) precisa ter ${quantidadeLabel}.`;
    }

    if (
      !erros.temposEntrada &&
      !erros.temposSaida &&
      quantidade !== null &&
      entradas.length === quantidade &&
      saidas.length === quantidade
    ) {
      const possuiSaidaAntesDaEntrada = entradas.some((entrada, index) => saidas[index] < entrada);
      if (possuiSaidaAntesDaEntrada) {
        erros.temposSaida = 'Encontramos uma saída antes da entrada. Revise os valores.';
      }
    }

    return erros;
  }

  private focarPrimeiroCampoComErro(erros: ErrosFormulario): void {
    if (erros.quantidadePassageiros) {
      this.quantidadeInput?.nativeElement.focus();
      return;
    }
    if (erros.temposEntrada) {
      this.entradasChipInput?.nativeElement.focus();
      return;
    }
    if (erros.temposSaida) {
      this.saidasChipInput?.nativeElement.focus();
    }
  }

  private mapearErroApi(error: HttpErrorResponse): string {
    if (error.status === 400) {
      const problemDetail = error.error as ProblemDetail | null;
      if (problemDetail?.details && problemDetail.details.length > 0) {
        return problemDetail.details[0];
      }

      if (problemDetail?.detail) {
        return problemDetail.detail;
      }

      return 'Os dados informados são inválidos. Revise N, E e S.';
    }

    return 'Não foi possível calcular agora. Tente novamente em instantes.';
  }
}
