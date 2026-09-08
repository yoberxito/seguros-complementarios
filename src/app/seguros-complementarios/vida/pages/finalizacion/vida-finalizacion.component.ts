import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  TipoGeneracionDocumentos
} from '../../models/vida-form.models';

@Component({
  selector: 'app-vida-finalizacion',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl:
    './vida-finalizacion.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css',
    './vida-finalizacion.component.css'
  ]
})
export class VidaFinalizacionComponent {

  @Input()
  codigoSolicitud = '';

  @Input()
  fechaRecepcionDocumentos = '';

  @Input()
  tipoGeneracionDocumentos:
    TipoGeneracionDocumentos = null;

  @Input()
  mostrarInvitacionBeneficiarios = false;

  @Output()
  omitirBeneficiarios =
    new EventEmitter<void>();

  @Output()
  registrarBeneficiarios =
    new EventEmitter<void>();

  @Output()
  finalizar =
    new EventEmitter<void>();


  get esSoloAutorizacion(): boolean {
    return this.tipoGeneracionDocumentos ===
      'soloAutorizacion';
  }


  get esFlujoCompleto(): boolean {
    return this.tipoGeneracionDocumentos ===
      'completa';
  }


  get esFormulario6012Posterior(): boolean {
    return this.tipoGeneracionDocumentos ===
      'soloFormulario6012';
  }
}