import {
  Routes
} from '@angular/router';

import {
  VidaFormComponent
} from './seguros-complementarios/vida/vida-form/vida-form.component';

import {
  EntregaPublicaComponent
} from './seguros-complementarios/entregas/pages/entrega-publica/entrega-publica.component';
import { AccesoIntegracionComponent } from './seguros-complementarios/integracion/pages/acceso-integracion/acceso-integracion.component';
import { VidaAfiliacionExistenteComponent } from './seguros-complementarios/vida/vida-afiliacion-existente/vida-afiliacion-existente.component';


export const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'vida/titular'
  },
    {
    path: 'acceso/:token',
    component: AccesoIntegracionComponent
  },
    {
    path: 'valida-seguro-mas-vida',
    component: VidaAfiliacionExistenteComponent
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