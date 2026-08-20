import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  ArchivoDocumentoFirmado
} from '../../models/vida-documentos.models';

import {
  TipoDocumentoFirmado
} from '../../models/vida-form.models';

export interface SeleccionArchivoDocumentoEvent {
  evento: Event;
  tipoDocumento: TipoDocumentoFirmado;
}

@Component({
  selector: 'app-vida-documentos',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl:
    './vida-documentos.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css',
    './vida-documentos.component.css'
  ]
})
export class VidaDocumentosComponent {

  @Input()
  codigoSolicitud = '';

  @Input()
  fechaGeneracionDocumentos = '';

  @Input()
  mostrarInvitacionBeneficiarios = false;

  @Input()
  tituloDescargaDocumentos = '';

  @Input()
  descripcionDescargaDocumentos = '';

  @Input()
  textoBotonDescargaDocumentos = '';

  @Input()
  textoBotonEnvioDocumentos = '';

  @Input()
  descargandoDocumentos = false;

  @Input()
  generandoFormulario6012Servicio = false;

  @Input()
  generandoFormularioDescuentoServicio = false;

  @Input()
  autorizacionFirmadaBloqueada = false;

  @Input()
  formulario6012Generado = false;

  @Input()
  autorizacionDescuentoGenerada = false;

  @Input({ required: true })
  archivoFormulario6012!:
    ArchivoDocumentoFirmado;

  @Input({ required: true })
  archivoAutorizacionDescuento!:
    ArchivoDocumentoFirmado;

  @Input()
  cargandoDocumentosFirmadosBackend = false;

  @Input()
  documentosFirmadosCargadosBackend = false;

  @Input()
  validandoDocumentosBackend = false;

  @Input()
  documentosValidadosBackend = false;

  @Input()
  cerrandoDocumentosBackend = false;

  @Input()
  documentosCerradosBackend = false;

  @Input()
  mensajeErrorCierre = '';

  @Output()
  omitirBeneficiarios =
    new EventEmitter<void>();

  @Output()
  registrarBeneficiarios =
    new EventEmitter<void>();

  @Output()
  descargar =
    new EventEmitter<void>();

  @Output()
  archivoSeleccionado =
    new EventEmitter<
      SeleccionArchivoDocumentoEvent
    >();

  @Output()
  enviar =
    new EventEmitter<void>();
}