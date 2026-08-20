import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  FormularioVida
} from '../../models/vida-form.models';

import {
  EmpresaEmpleadorApi
} from '../../services/vida-api.service';

@Component({
  selector: 'app-vida-datos-complementarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl:
    './vida-datos-complementarios.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css',
    './vida-datos-complementarios.component.css'
  ]
})
export class VidaDatosComplementariosComponent {

  @Input({ required: true })
  form!: FormularioVida;

  @Input()
  intentoEnviar = false;

  @Input()
  cargandoEmpleador = false;

  @Input()
  errorEmpleador = '';

  @Input()
  empresasEmpleador:
    EmpresaEmpleadorApi[] = [];

  @Input()
  decretosLegislativos:
    string[] = [];

  @Input()
  mostrarAyudaCgbvp = false;

  @Input()
  mostrarRuc = false;

  @Input()
  solicitudBloqueada = false;

  @Input()
  codigoPlanillaVacio = false;

  @Input()
  decretoLegislativoVacio = false;

  @Input()
  convenioCgbvpVacio = false;

  @Input()
  rucVacio = false;

  @Input()
  rucInvalido = false;

  @Input()
  razonSocialInvalida = false;

  @Output()
  empleadorSeleccionado =
    new EventEmitter<EmpresaEmpleadorApi>();

  @Output()
  ayudaCgbvpAlternada =
    new EventEmitter<void>();

  @Output()
  ayudaCgbvpCerrada =
    new EventEmitter<void>();

  @Output()
  rucModificado =
    new EventEmitter<void>();

  @Output()
  volver =
    new EventEmitter<void>();

  @Output()
  borradorModificado =
    new EventEmitter<void>();  

  @Output()
  continuar =
    new EventEmitter<void>();

  compararEmpleadorPorId(
    empresaA: EmpresaEmpleadorApi | null,
    empresaB: EmpresaEmpleadorApi | null
  ): boolean {
    return empresaA?.IDE_NUMERICO_ENTIDAD
      === empresaB?.IDE_NUMERICO_ENTIDAD;
  }
}