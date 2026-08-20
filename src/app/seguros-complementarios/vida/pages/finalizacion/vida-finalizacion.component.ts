import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  TipoDocumentoFirmado
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
  autorizacionDescuentoSellada = false;

  @Input()
  formulario6012Sellado = false;

  @Input()
  idDocumentoPublicadoAutorizacion = '';

  @Input()
  idDocumentoPublicadoFormulario6012 = '';

  @Input()
  consultandoDocumentoPublicado:
    TipoDocumentoFirmado | null = null;

  @Input()
  mostrarInvitacionBeneficiarios = false;

  @Output()
  visualizarDocumento =
    new EventEmitter<TipoDocumentoFirmado>();

  @Output()
  descargarDocumento =
    new EventEmitter<TipoDocumentoFirmado>();

  @Output()
  omitirBeneficiarios =
    new EventEmitter<void>();

  @Output()
  registrarBeneficiarios =
    new EventEmitter<void>();

  @Output()
  finalizar =
    new EventEmitter<void>();
}