import { Routes } from '@angular/router';

import {
  VidaFormComponent
} from './seguros-complementarios/vida/vida-form/vida-form.component';

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
    path: '**',
    redirectTo: 'vida/titular'
  }
];