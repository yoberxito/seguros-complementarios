import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  FormularioVida
} from '../../models/vida-form.models';

@Component({
  selector: 'app-vida-conyuge',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl:
    './vida-conyuge.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css',
    './vida-conyuge.component.css'
  ]
})
export class VidaConyugeComponent {

  @Input({ required: true })
  form!: FormularioVida;

  @Input()
  cargandoConyuge = false;

  @Input()
  conyugeConsultado = false;

  @Input()
  errorConyuge = '';

  @Input()
  descripcionTipoDocumentoConyuge = '';

  @Input()
  continuarDeshabilitado = true;

  @Output()
  reintentarConsulta =
    new EventEmitter<void>();

  @Output()
  volver =
    new EventEmitter<void>();

  @Output()
  continuar =
    new EventEmitter<void>();
}