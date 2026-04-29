import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { LotacaoMaximaRequest, LotacaoMaximaResponse } from '../models/lotacao-maxima.model';

@Injectable({ providedIn: 'root' })
export class LotacaoMaximaApiService {
  private readonly http = inject(HttpClient);

  calcularLotacaoMaxima(request: LotacaoMaximaRequest): Observable<LotacaoMaximaResponse> {
    return this.http.post<LotacaoMaximaResponse>('/api/lotacao-maxima', request);
  }
}
