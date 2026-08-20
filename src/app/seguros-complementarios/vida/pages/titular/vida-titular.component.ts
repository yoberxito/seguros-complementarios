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

@Component({
  selector: 'app-vida-titular',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './vida-titular.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css'
  ]
})
export class VidaTitularComponent {

  @Input({ required: true })
  form!: FormularioVida;

  @Input()
  intentoEnviar = false;

  @Input()
  cargandoDatosTitular = false;

  @Input()
  errorDatosTitular = '';

  @Input()
  errorTipoAsegurado = '';

  @Input()
  titularTieneSeguroComplementario = false;

  @Input()
  mensajeSeguroComplementario = '';

  @Input()
  errorValidacionSeguroComplementario = '';

  @Input()
  solicitudBloqueada = false;

  @Input()
  descripcionTipoDocumento = '';

  @Input()
  nombreCompletoTitular = '';

  @Input()
  nombresTitularInvalidos = false;

  @Input()
  correoTitularInvalido = false;

  @Input()
  correoTitularVacio = false;

  @Input()
  celularTitularVacio = false;

  @Input()
  textoTipoAsegurado = '';

  @Output()
  celularModificado =
    new EventEmitter<void>();

  @Output()
  borradorModificado =
    new EventEmitter<void>();

  @Output()
  continuar =
    new EventEmitter<void>();
}