import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Beneficiario,
  FormularioVida,
  PersonaDocumento,
  TipoDocumento
} from '../../models/vida-form.models';
import { BeneficiarioService } from '../../services/beneficiario.service';
import { IntegracionService } from 'src/app/seguros-complementarios/integracion/services/IntegracionService';
import { BenfMasVIdaRes } from '../../models/beneficiarios';

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

  @Input()
  modoActualizacionBeneficiarios = false;


  beneficiariosExistentesActualizacion: string[] = [];

  
  actualizacionBeneficiariosListaCargada = signal(false);
actualizandoBeneficiarios = false;
errorActualizacionBeneficiarios = '';
mensajeActualizacionBeneficiarios = '';

@Output()
solicitarConfirmacionActualizacion =
  new EventEmitter<void>();

@Output()
listaActualizacionCargada =
  new EventEmitter<Beneficiario[]>();

  private beneficiariosPorcentajeEnEdicion =
    new Set<string>();

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

  private readonly integracionService =
    inject(IntegracionService);

  constructor(
    private beneficiarioService: BeneficiarioService
  ) {
  }

  ngOnInit(): void {
  if (!this.modoActualizacionBeneficiarios) {
    return;
  }

  const contexto = this.integracionService.obtenerContexto();

  if (!contexto?.tipoDocumento || !contexto?.numeroDocumento) {
    this.errorActualizacionBeneficiarios =
      'No se encontró la información del titular.';
    return;
  }

  this.beneficiarioService.getBeneficiarios(
    contexto.tipoDocumento,
    contexto.numeroDocumento
  ).subscribe({
    next: (data: BenfMasVIdaRes) => {
      if (data.codResultado !== '0') {
        this.errorActualizacionBeneficiarios =
          data.message || 'No se pudieron cargar los beneficiarios.';
        return;
      }

      this.form.beneficiarios = (data.beneficiarios ?? []).map(b => {
        const nombres = (b.nombres ?? '').trim().split(/\s+/);

        return {
          tipoDocumento: b.tpDocumento,
          numeroDocumento: b.nroDocumento,
          apellidoPaterno: b.apellidoPaterno,
          apellidoMaterno: b.apellidoMaterno,
          primerNombre: nombres[0] ?? '',
          segundoNombre: nombres.slice(1).join(' '),
          fechaNacimiento: b.fechaNacimiento,
          codSexo: b.codSexo,
          codEstadoCivil: b.codEstadoCivil,
          porcentaje: String(b.porcentaje)
        };
      });

      this.beneficiariosExistentesActualizacion =
        this.form.beneficiarios.map(b =>
          this.claveBeneficiario(b)
        );

      this.actualizacionBeneficiariosListaCargada.set(true);
      this.listaActualizacionCargada.emit(
        this.form.beneficiarios.map(b => ({ ...b }))
      );
    },
    error: (error) => {
      this.errorActualizacionBeneficiarios =
        error?.error?.mensaje ||
        'Ocurrió un error al consultar los beneficiarios.';
    }
  });
}

  claveBeneficiario(
    beneficiario: Beneficiario
  ): string {
    return `${(beneficiario.tipoDocumento || '').trim()
      }|${(beneficiario.numeroDocumento || '').trim()
      }`;
  }

  esBeneficiarioExistente(
    beneficiario: Beneficiario
  ): boolean {
    if (!this.modoActualizacionBeneficiarios) {
      return false;
    }

    return this
      .beneficiariosExistentesActualizacion
      .includes(
        this.claveBeneficiario(beneficiario)
      );
  }
confirmarActualizarBeneficiarios(): void {
    if (!this.modoActualizacionBeneficiarios || this.edicionBloqueada) {
      return;
    }
    this.intentoEnviar = true;
    this.errorActualizacionBeneficiarios = '';
    if (!this.actualizacionBeneficiariosListaCargada()) {
      this.errorActualizacionBeneficiarios =
        'Primero debe cargarse la lista vigente de beneficiarios.';
      return;
    }
    if (!this.beneficiariosValidosPara6012()) {
      this.errorActualizacionBeneficiarios =
        'Verifique los beneficiarios: los porcentajes deben sumar 100%.';
      return;
    }
    // La modificacion de SAS se difiere hasta validar y sellar el 6012.
    this.solicitarConfirmacionActualizacion.emit();
  }

  porcentajeEnEdicion(
    beneficiario: Beneficiario
  ): boolean {
    return this
      .beneficiariosPorcentajeEnEdicion
      .has(
        this.claveBeneficiario(beneficiario)
      );
  }

  alternarEdicionPorcentaje(
    beneficiario: Beneficiario
  ): void {
    const clave =
      this.claveBeneficiario(beneficiario);

    if (
      this.beneficiariosPorcentajeEnEdicion
        .has(clave)
    ) {
      this.beneficiariosPorcentajeEnEdicion
        .delete(clave);

      return;
    }

    this.beneficiariosPorcentajeEnEdicion
      .add(clave);
  }

  bloquearIdentidadBeneficiario(
    beneficiario: Beneficiario
  ): boolean {
    return this.edicionBloqueada
      || this.esBeneficiarioExistente(
        beneficiario
      );
  }

  bloquearPorcentajeBeneficiario(
    beneficiario: Beneficiario
  ): boolean {
    if (this.edicionBloqueada) {
      return true;
    }

    if (
      !this.esBeneficiarioExistente(
        beneficiario
      )
    ) {
      return false;
    }

    return !this.porcentajeEnEdicion(
      beneficiario
    );
  }

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
      return `Falta asignar ${100 - this.sumaPorcentajes
        }%.`;
    }

    return `El porcentaje excede el 100% por ${this.sumaPorcentajes - 100
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