import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

import {
  VidaTramiteStateService
} from '../services/vida-tramite-state.service';

@Component({
  selector: 'app-vida-afiliacion-existente',
  standalone: true,
  templateUrl: './vida-afiliacion-existente.component.html',
  styleUrls: ['./vida-afiliacion-existente.component.css']
})
export class VidaAfiliacionExistenteComponent {

  @Output()
  volver = new EventEmitter<void>();

  constructor(
    private router: Router,
    private vidaTramiteStateService:
      VidaTramiteStateService
  ) {}

  iniciarActualizacionBeneficiarios(): void {
    this.vidaTramiteStateService
      .modoActualizacionBeneficiarios = true;

    this.vidaTramiteStateService
      .pendienteBeneficiariosPara6012 = false;

    this.vidaTramiteStateService
      .solicitudBloqueada = false;

    this.vidaTramiteStateService
      .documentosGenerados = false;

    this.vidaTramiteStateService
      .documentosPublicados = false;

    /*
     * La actualización debe crear su propio registro
     * cuando Yober exponga el servicio correspondiente.
     * Nunca reutilizamos aquí un proceso anterior.
     */
    this.vidaTramiteStateService
      .registroInternoProceso = '';

    this.vidaTramiteStateService
      .form.beneficiarios = [];

    this.vidaTramiteStateService
      .pasoActual = 'beneficiarios';

    void this.router.navigate([
      '/vida',
      'beneficiarios'
    ]);
  }

  irAlEnlaceSomos(): void {
    this.vidaTramiteStateService
      .modoActualizacionBeneficiarios = false;

    window.location.assign(
      environment.urlSomos
    );
  }
}
