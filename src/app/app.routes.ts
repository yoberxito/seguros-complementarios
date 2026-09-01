import {
  Routes
} from '@angular/router';

import {
  VidaFormComponent
} from './seguros-complementarios/vida/vida-form/vida-form.component';

import {
  EntregaPublicaComponent
} from './seguros-complementarios/entregas/pages/entrega-publica/entrega-publica.component';


export const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'vida/titular'
  },

  {
    path: 'vida/:paso',
    component: VidaFormComponent
  },

  {
    path: 'entregas/:token',
    component: EntregaPublicaComponent
  },

  {
    path: '**',
    redirectTo: 'vida/titular'
  }

];