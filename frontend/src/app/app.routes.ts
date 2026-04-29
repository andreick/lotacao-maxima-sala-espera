import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/lotacao-maxima/lotacao-maxima-page.component').then(
        (module) => module.LotacaoMaximaPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
