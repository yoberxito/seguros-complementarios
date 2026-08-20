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
  selector: 'app-vida-beneficiarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl:
    './vida-beneficiarios.component.html',
  styleUrls: [
    '../../vida-form/vida-form.component.css',
    './vida-beneficiarios.component.css'
  ]
})
export class VidaBeneficiariosComponent {

  @Input({ required: true })
  form!: FormularioVida;

  @Input()
  intentoEnviar = false;

  @Input()
  tiposDocumento: TipoDocumento[] = [];

  @Input()
  consultandoInformacionPersona = false;

  @Input()
  pendienteBeneficiariosPara6012 = false;

  @Input()
  edicionBloqueada = false;

  @Output()
  borradorModificado =
    new EventEmitter<void>();

  @Output()
  buscarDatosPersona =
    new EventEmitter<Beneficiario>();

  @Output()
  agregar =
    new EventEmitter<void>();

  @Output()
  quitar =
    new EventEmitter<number>();

  @Output()
  avanzarSinBeneficiarios =
    new EventEmitter<void>();

  @Output()
  volver =
    new EventEmitter<void>();

  @Output()
  continuar =
    new EventEmitter<void>();

  @Output()
  confirmarBeneficiarios =
    new EventEmitter<void>();

  get sumaPorcentajes(): number {
    return this.form.beneficiarios.reduce(
      (
        total: number,
        beneficiario: Beneficiario
      ) => {
        return total
          + (
            Number(beneficiario.porcentaje)
            || 0
          );
      },
      0
    );
  }

  get porcentajeCorrecto(): boolean {
    if (
      this.form.beneficiarios.length === 0
    ) {
      return true;
    }

    return this.sumaPorcentajes === 100;
  }

  get textoEstadoPorcentaje(): string {
    if (
      this.form.beneficiarios.length === 0
    ) {
      return 'No se registraron beneficiarios.';
    }

    if (this.sumaPorcentajes === 100) {
      return 'Porcentaje distribuido correctamente.';
    }

    if (this.sumaPorcentajes < 100) {
      return `Falta asignar ${
        100 - this.sumaPorcentajes
      }%.`;
    }

    return `El porcentaje excede el 100% por ${
      this.sumaPorcentajes - 100
    }%.`;
  }

  beneficiarioTieneDatos(
    beneficiario: Beneficiario
  ): boolean {
    return !this.campoVacio(
      beneficiario.numeroDocumento
    )
      || !this.campoVacio(
        beneficiario.apellidoPaterno
      )
      || !this.campoVacio(
        beneficiario.apellidoMaterno
      )
      || !this.campoVacio(
        beneficiario.primerNombre
      )
      || !this.campoVacio(
        beneficiario.segundoNombre
      )
      || !this.campoVacio(
        beneficiario.porcentaje
      );
  }

  hayBeneficiariosIniciados(): boolean {
    return this.form.beneficiarios.some(
      beneficiario =>
        this.beneficiarioTieneDatos(
          beneficiario
        )
    );
  }

  beneficiarioRegistradoCompleto(
    beneficiario: Beneficiario
  ): boolean {
    return !this.tipoDocumentoVacio(
      beneficiario
    )
      && !this.numeroDocumentoInvalido(
        beneficiario
      )
      && !this.campoVacio(
        beneficiario.apellidoPaterno
      )
      && !this.campoVacio(
        beneficiario.apellidoMaterno
      )
      && !this.campoVacio(
        beneficiario.primerNombre
      )
      && !this.porcentajeBeneficiarioInvalido(
        beneficiario
      );
  }

  hayBeneficiariosRegistrados(): boolean {
    return this.form.beneficiarios.some(
      beneficiario =>
        this.beneficiarioRegistradoCompleto(
          beneficiario
        )
    );
  }

  beneficiariosValidosPara6012(): boolean {
    const beneficiariosConDatos =
      this.form.beneficiarios.filter(
        beneficiario =>
          this.beneficiarioTieneDatos(
            beneficiario
          )
      );

    if (
      beneficiariosConDatos.length === 0
    ) {
      return false;
    }

    for (
      const beneficiario
      of beneficiariosConDatos
    ) {
      if (
        this.beneficiarioIncompleto(
          beneficiario
        )
      ) {
        return false;
      }
    }

    return this.porcentajeCorrecto;
  }

  beneficiarioIncompleto(
    beneficiario: Beneficiario
  ): boolean {
    return this.tipoDocumentoVacio(
      beneficiario
    )
      || this.otroDocumentoInvalido(
        beneficiario
      )
      || this.numeroDocumentoInvalido(
        beneficiario
      )
      || this.nombresSeparadosInvalidos(
        beneficiario
      )
      || this.porcentajeBeneficiarioInvalido(
        beneficiario
      );
  }

  nombresSeparadosInvalidos(
    persona: PersonaDocumento
  ): boolean {
    return this.campoVacio(
      persona.apellidoPaterno
    )
      || this.campoVacio(
        persona.apellidoMaterno
      )
      || this.campoVacio(
        persona.primerNombre
      );
  }

  porcentajeBeneficiarioInvalido(
    beneficiario: Beneficiario
  ): boolean {
    if (
      this.campoVacio(
        beneficiario.porcentaje
      )
    ) {
      return true;
    }

    const porcentaje =
      Number(beneficiario.porcentaje);

    if (Number.isNaN(porcentaje)) {
      return true;
    }

    if (porcentaje < 1) {
      return true;
    }

    if (porcentaje > 100) {
      return true;
    }

    return false;
  }

  mostrarErrorPorcentajeBeneficiario(
    beneficiario: Beneficiario
  ): boolean {
    if (
      this.intentoEnviar
      && this.porcentajeBeneficiarioInvalido(
        beneficiario
      )
    ) {
      return true;
    }

    return !this.campoVacio(
      beneficiario.porcentaje
    )
      && this.porcentajeBeneficiarioInvalido(
        beneficiario
      );
  }

  mensajePorcentajeInvalido(
    beneficiario: Beneficiario
  ): string {
    if (
      this.campoVacio(
        beneficiario.porcentaje
      )
    ) {
      return 'Requiere mínimo 1%.';
    }

    const porcentaje =
      Number(beneficiario.porcentaje);

    if (Number.isNaN(porcentaje)) {
      return 'Ingrese un porcentaje válido.';
    }

    if (porcentaje < 1) {
      return 'Requiere mínimo 1%.';
    }

    if (porcentaje > 100) {
      return 'No puede ser mayor a 100%.';
    }

    return '';
  }

  tipoDocumentoVacio(
    persona: PersonaDocumento
  ): boolean {
    return this.campoVacio(
      persona.tipoDocumento
    );
  }

  requiereOtroDocumento(
    persona: PersonaDocumento
  ): boolean {
    return persona.tipoDocumento === 'Otro';
  }

  otroDocumentoInvalido(
    persona: PersonaDocumento
  ): boolean {
    return persona.tipoDocumento === 'Otro'
      && this.campoVacio(
        persona.otroTipoDocumento
      );
  }

  numeroDocumentoInvalido(
    persona: PersonaDocumento
  ): boolean {
    const numero =
      persona.numeroDocumento?.trim()
      || '';

    if (this.campoVacio(numero)) {
      return true;
    }

    if (persona.tipoDocumento === '01') {
      return !/^\d{8}$/.test(numero);
    }

    if (persona.tipoDocumento === '04') {
      return !/^\d{9}$/.test(numero);
    }

    return numero.length < 3
      || numero.length > 15;
  }

  mensajeDocumentoInvalido(
    persona: PersonaDocumento
  ): string {
    const numero =
      persona.numeroDocumento?.trim()
      || '';

    if (this.campoVacio(numero)) {
      return 'Este campo es obligatorio.';
    }

    if (persona.tipoDocumento === '01') {
      return 'El DNI debe tener exactamente 8 dígitos.';
    }

    if (persona.tipoDocumento === '04') {
      return 'El C.E. debe tener exactamente 9 dígitos.';
    }

    return 'Ingrese un documento válido. Máximo 15 caracteres.';
  }

  alCambiarTipoDocumento(
    persona: PersonaDocumento
  ): void {
    if (persona.tipoDocumento !== 'Otro') {
      persona.otroTipoDocumento = '';
    }
  }

  convertirMayusculas(
    valor: string
  ): string {
    return (valor || '').toUpperCase();
  }

  soloNumeros(
    valor: string
  ): string {
    return (valor || '').replace(
      /\D/g,
      ''
    );
  }

  limpiarDocumento(
    persona: PersonaDocumento
  ): void {
    if (
      persona.tipoDocumento === '01'
      || persona.tipoDocumento === '04'
    ) {
      persona.numeroDocumento =
        this.soloNumeros(
          persona.numeroDocumento
        );

      return;
    }

    persona.numeroDocumento =
      (
        persona.numeroDocumento
        || ''
      )
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ''
        );
  }

  limpiarPorcentaje(
    beneficiario: Beneficiario
  ): void {
    beneficiario.porcentaje =
      this.soloNumeros(
        beneficiario.porcentaje
      );
  }

  campoVacio(
    valor: string | undefined | null
  ): boolean {
    return !valor
      || valor.toString().trim() === '';
  }

  trackByIndex(
    index: number
  ): number {
    return index;
  }
}