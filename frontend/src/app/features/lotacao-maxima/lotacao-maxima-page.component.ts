import { ChangeDetectionStrategy, Component, ViewChild, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LotacaoMaximaApiService } from './data-access/lotacao-maxima-api.service';
import { ProblemDetail } from './models/lotacao-maxima.model';
import { QuantidadeInputComponent } from './components/quantidade-input.component';
import { ChipInputComponent } from './components/chip-input.component';

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
    MatProgressSpinnerModule,
    QuantidadeInputComponent,
    ChipInputComponent,
  ],
  templateUrl: './lotacao-maxima-page.component.html',
  styleUrl: './lotacao-maxima-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotacaoMaximaPageComponent {
  private readonly lotacaoApi = inject(LotacaoMaximaApiService);

  @ViewChild(QuantidadeInputComponent) protected componenteQuantidade?: QuantidadeInputComponent;
  @ViewChild('componenteEntradas') protected componenteEntradas?: ChipInputComponent;
  @ViewChild('componenteSaidas') protected componenteSaidas?: ChipInputComponent;

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
  readonly carregando = signal(false);
  readonly resultado = signal<number | null>(null);
  readonly erroApi = signal<string | null>(null);
  readonly tentouSubmeter = signal(false);

  readonly errosFormulario = computed(() => this.validarFormulario());

  atualizarEntradas(valores: number[]): void {
    this.entradas.set(valores);
  }

  atualizarSaidas(valores: number[]): void {
    this.saidas.set(valores);
  }

  enviarFormulario(): void {
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

  protected focarPrimeiroCampoComErro(erros: ErrosFormulario): void {
    if (erros.quantidadePassageiros) {
      this.componenteQuantidade?.focusarCampo();
      return;
    }
    if (erros.temposEntrada) {
      this.componenteEntradas?.focusarCampo();
      return;
    }
    if (erros.temposSaida) {
      this.componenteSaidas?.focusarCampo();
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
