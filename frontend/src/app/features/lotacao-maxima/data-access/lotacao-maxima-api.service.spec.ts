import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { LotacaoMaximaApiService } from './lotacao-maxima-api.service';

describe('LotacaoMaximaApiService', () => {
  let service: LotacaoMaximaApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LotacaoMaximaApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LotacaoMaximaApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve chamar o endpoint de cálculo', () => {
    const payload = {
      quantidadePassageiros: 3,
      temposEntrada: [1, 5, 7],
      temposSaida: [9, 13, 12],
    };

    service.calcularLotacaoMaxima(payload).subscribe((response) => {
      expect(response).toEqual({ maxOcupacao: 3 });
    });

    const request = httpMock.expectOne('/api/lotacao-maxima');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ maxOcupacao: 3 });
  });
});
