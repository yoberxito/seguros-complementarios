import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Beneficiario,
  FormularioVida,
  PersonaDocumento,
  TipoDocumento
} from '../../models/vida-form.models';

@Component({
  selector: 'app-vida-declaracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl:
    './vida-declaracion.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css',
    './vida-declaracion.component.css'
  ]
})
export class VidaDeclaracionComponent {

  @Input({ required: true })
  form!: FormularioVida;

  @Input()
  intentoEnviar = false;

  @Input()
  tiposDocumento: TipoDocumento[] = [];

  @Input()
  tiposDocumentoRespaldo: TipoDocumento[] = [];

  @Input()
  beneficiariosRegistrados: Beneficiario[] = [];

  @Input()
  sumaPorcentajes = 0;

  @Input()
  mostrarRuc = false;

  @Input()
  mostrarRazonSocial = false;

  @Input()
  solicitudBloqueada = false;

  @Input()
  documentosGenerados = false;

  @Input()
  preparandoProcesoBackendLocal = false;

  @Input()
  textoBotonGenerarDocumentos = '';

  @Input()
  aceptaTerminosDeclaracion = false;

  @Output()
  aceptaTerminosDeclaracionChange =
    new EventEmitter<boolean>();

  @Input()
  aceptaTratamientoDatos = false;

  @Output()
  aceptaTratamientoDatosChange =
    new EventEmitter<boolean>();

  @Output()
  volver =
    new EventEmitter<void>();

  @Output()
  generar =
    new EventEmitter<void>();

  get hayBeneficiariosRegistrados(): boolean {
    return this.beneficiariosRegistrados.length > 0;
  }

  nombreCompletoPersona(
    persona: PersonaDocumento
  ): string {
    const partes = [
      persona.apellidoPaterno,
      persona.apellidoMaterno,
      persona.primerNombre,
      persona.segundoNombre
    ]
      .map(
        parte =>
          (parte || '').trim().toUpperCase()
      )
      .filter(
        parte => parte !== ''
      );

    if (partes.length > 0) {
      return partes.join(' ');
    }

    return (
      persona.nombres || ''
    )
      .trim()
      .toUpperCase();
  }

  getDescripcionTipoDocumento(
    codigo?: string
  ): string {
    const codigoLimpio =
      (codigo || '').trim();

    if (!codigoLimpio) {
      return '';
    }

    const tipo = [
      ...this.tiposDocumento,
      ...this.tiposDocumentoRespaldo
    ].find(
      item =>
        item.codigo === codigoLimpio
    );

    return tipo?.descripcion
      || codigoLimpio;
  }
}