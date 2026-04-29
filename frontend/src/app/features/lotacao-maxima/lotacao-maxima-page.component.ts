import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LotacaoMaximaApiService } from './data-access/lotacao-maxima-api.service';
import { ProblemDetail } from './models/lotacao-maxima.model';
import { parseListaNumeros } from './utils/parse-lista-numeros';

type LotacaoMaximaForm = FormGroup<{
  quantidadePassageiros: FormControl<number | null>;
  temposEntrada: FormControl<string>;
  temposSaida: FormControl<string>;
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
    MatFormFieldModule,
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
  @ViewChild('entradasInput') private entradasInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('saidasInput') private saidasInput?: ElementRef<HTMLTextAreaElement>;

  readonly formulario: LotacaoMaximaForm = new FormGroup({
    quantidadePassageiros: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
      nonNullable: false,
    }),
    temposEntrada: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    temposSaida: new FormControl('', { validators: [Validators.required], nonNullable: true }),
  });

  readonly carregando = signal(false);
  readonly resultado = signal<number | null>(null);
  readonly erroApi = signal<string | null>(null);
  readonly tentouSubmeter = signal(false);

  readonly listaEntradas = computed(() =>
    parseListaNumeros(this.formulario.controls.temposEntrada.value),
  );
  readonly listaSaidas = computed(() => parseListaNumeros(this.formulario.controls.temposSaida.value));
  readonly errosFormulario = computed(() => this.validarFormulario());

  readonly quantidadeEntradasDetectadas = computed(() => this.listaEntradas().valores.length);
  readonly quantidadeSaidasDetectadas = computed(() => this.listaSaidas().valores.length);

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
    const temposEntrada = this.listaEntradas().valores;
    const temposSaida = this.listaSaidas().valores;

    this.carregando.set(true);
    this.lotacaoApi
      .calcularLotacaoMaxima({ quantidadePassageiros: quantidade, temposEntrada, temposSaida })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (response) => {
          this.resultado.set(response.maxOcupacao);
        },
        error: (error: HttpErrorResponse) => {
          this.erroApi.set(this.mapearErroApi(error));
        },
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
    const quantidadeBruta = this.formulario.controls.quantidadePassageiros.value;
    const quantidade =
      typeof quantidadeBruta === 'number' && Number.isInteger(quantidadeBruta) ? quantidadeBruta : null;

    if (quantidade === null) {
      erros.quantidadePassageiros = 'Confira o número de passageiros (N).';
    } else if (quantidade < 1 || quantidade > 100) {
      erros.quantidadePassageiros = 'N deve estar entre 1 e 100.';
    }

    const entradas = this.listaEntradas();
    const saidas = this.listaSaidas();

    if (this.formulario.controls.temposEntrada.value.trim().length === 0) {
      erros.temposEntrada = 'A lista de entradas (E) precisa ter N números.';
    } else if (entradas.tokensInvalidos.length > 0) {
      erros.temposEntrada = 'A lista de entradas (E) aceita apenas números inteiros.';
    } else if (entradas.valores.some((valor) => valor < 1 || valor > 1000)) {
      erros.temposEntrada = 'As entradas (E) devem estar entre 1 e 1000.';
    } else if (quantidade !== null && entradas.valores.length !== quantidade) {
      erros.temposEntrada = 'A lista de entradas (E) precisa ter N números.';
    }

    if (this.formulario.controls.temposSaida.value.trim().length === 0) {
      erros.temposSaida = 'A lista de saídas (S) precisa ter N números.';
    } else if (saidas.tokensInvalidos.length > 0) {
      erros.temposSaida = 'A lista de saídas (S) aceita apenas números inteiros.';
    } else if (saidas.valores.some((valor) => valor < 1 || valor > 1000)) {
      erros.temposSaida = 'As saídas (S) devem estar entre 1 e 1000.';
    } else if (quantidade !== null && saidas.valores.length !== quantidade) {
      erros.temposSaida = 'A lista de saídas (S) precisa ter N números.';
    }

    if (
      !erros.temposEntrada &&
      !erros.temposSaida &&
      quantidade !== null &&
      entradas.valores.length === quantidade &&
      saidas.valores.length === quantidade
    ) {
      const possuiSaidaAntesDaEntrada = entradas.valores.some((entrada, index) => saidas.valores[index] < entrada);
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
      this.entradasInput?.nativeElement.focus();
      return;
    }

    if (erros.temposSaida) {
      this.saidasInput?.nativeElement.focus();
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
