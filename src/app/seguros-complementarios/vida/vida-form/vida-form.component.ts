import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type Vista = 'formulario' | 'resumen' | 'exito';

type PasoFormulario =
  | 'titular'
  | 'trabajo'
  | 'conyuge'
  | 'beneficiarios'
  | 'declaracion'
  | 'documentos'
  | 'publicacion';
type TipoDocumentoFirmado = 'formulario6012' | 'autorizacionDescuento';

type TipoGeneracionDocumentos =
  | 'completa'
  | 'soloAutorizacion'
  | 'soloFormulario6012'
  | null;

type TipoAsegurado = 'Regular' | 'Agrario' | 'Potestativo';

interface TipoDocumento {
  codigo: string;
  descripcion: string;
  longitud?: number;
}

interface PersonaDocumento {
  tipoDocumento: string;
  otroTipoDocumento?: string;
  numeroDocumento: string;


  nombres?: string;

  apellidoPaterno: string;
  apellidoMaterno: string;
  primerNombre: string;
  segundoNombre: string;
}

interface Beneficiario extends PersonaDocumento {
  porcentaje: string;
}

interface PasoVida {
  codigo: PasoFormulario;
  numero: number;
  titulo: string;
  descripcion: string;
}

interface ArchivoDocumentoFirmado {
  archivo: File | null;
  nombre: string;
  tamanioMB: string;
  cargado: boolean;
  error: string;
  urlTemporal: string;
  urlVistaPrevia: SafeResourceUrl | null;
}

interface FormularioVida {
  esNuevo: boolean;

  titular: PersonaDocumento;
  correoViva: string;

  celular: string;
  tipoAsegurado: TipoAsegurado;

  codigoPlanilla: string;
  decretoLegislativo: string;
  convenioCGBVP: string;

  notificacionesCorreo: string;

  rucEmpleador: string;
  razonSocial: string;
  rucDesdeBase: boolean;
  razonSocialDesdeBase: boolean;

  conyuge: PersonaDocumento | null;
  conyugeDesdeBase: boolean;

  beneficiarios: Beneficiario[];
}

@Component({
  selector: 'app-vida-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vida-form.component.html',
  styleUrl: './vida-form.component.css'
})


export class VidaFormComponent {

vista: Vista = 'formulario';
intentoEnviar = false;
avisoTemporal = '';

pasoActual: PasoFormulario = 'titular';

pasosFormulario: PasoVida[] = [
  {
    codigo: 'titular',
    numero: 1,
    titulo: 'Titular',
    descripcion: 'Datos principales del asegurado'
  },
  {
    codigo: 'trabajo',
    numero: 2,
    titulo: 'Datos laborales',
    descripcion: 'Planilla, decreto, convenio y empleador'
  },
  {
    codigo: 'conyuge',
    numero: 3,
    titulo: 'Cónyuge',
    descripcion: 'Registro opcional o dato bloqueado desde EsSalud'
  },
  {
    codigo: 'beneficiarios',
    numero: 4,
    titulo: 'Beneficiarios',
    descripcion: 'Registro opcional con porcentajes'
  },
  {
    codigo: 'declaracion',
    numero: 5,
    titulo: 'Declaración',
    descripcion: 'Aceptación y generación de documentos'
  },
  {
    codigo: 'documentos',
    numero: 6,
    titulo: 'Documentos',
    descripcion: 'Carga de PDFs firmados'
  },
  {
    codigo: 'publicacion',
    numero: 7,
    titulo: 'Recepción',
    descripcion: 'Documentos sellados y publicados'
  }
];

seccionesGrabadas: Record<PasoFormulario, boolean> = this.crearEstadoSecciones();

documentosGenerados = false;
solicitudBloqueada = false;
codigoSolicitud = '';
fechaGeneracionDocumentos = '';

tipoGeneracionDocumentos: TipoGeneracionDocumentos = null;

autorizacionDescuentoGenerada = false;
formulario6012Generado = false;
autorizacionFirmadaBloqueada = false;

pendienteBeneficiariosPara6012 = false;
mostrarConfirmacionSinBeneficiarios = false;
mostrarInvitacionBeneficiarios = false;
actualizandoBeneficiarios6012 = false;
aceptaVeracidad = false;
aceptaAfiliacion = false;
aceptaNotificacionesDeclaracion = true;

aceptaTerminosDeclaracion = false;

modoRetornoPendiente = false;

archivoFormulario6012: ArchivoDocumentoFirmado = this.crearArchivoVacio();
archivoAutorizacionDescuento: ArchivoDocumentoFirmado = this.crearArchivoVacio();
documentosPublicados = false;
fechaRecepcionDocumentos = '';
correoEnvioDocumentos = '';

formulario6012Sellado = false;
autorizacionDescuentoSellada = false;
documentoPdfVisible = false;
tituloDocumentoPdf = '';
urlDocumentoPdf: SafeResourceUrl | null = null;

diaDeclaracion = '';
mesDeclaracion = '';

/*
    MAQUETA LOCAL:
    Esta lista simula el servicio que luego Tecnología te pasará.
    Después se reemplaza por una llamada real al servicio de tipos de documento de EsSalud.
*/

tiposDocumento: TipoDocumento[] = [
    { codigo: 'DNI', descripcion: 'DNI', longitud: 8 },
    { codigo: 'CE', descripcion: 'C.E.', longitud: 9 },
    { codigo: 'Otro', descripcion: 'Otro' }
];

decretosLegislativos = ['1057', '276', '728'];

form: FormularioVida = this.crearCasoNuevo();

constructor(private sanitizer: DomSanitizer) {
  this.establecerFechaActual();
  this.cargarCasoNuevo();
}

cargarCasoNuevo(): void {
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.avisoTemporal = '';

  this.form = this.crearCasoNuevo();

  this.reiniciarFlujoPorPasos();
  this.scrollArriba();
}

  crearCasoNuevo(): FormularioVida {
    return {
      esNuevo: true,
      titular: {
            tipoDocumento: 'DNI',
            numeroDocumento: '77777777',
            nombres: 'INGA JAYME DIEGO ARMANDO',
            apellidoPaterno: 'INGA',
            apellidoMaterno: 'JAYME',
            primerNombre: 'DIEGO',
            segundoNombre: 'ARMANDO'
          },
      correoViva: 'diego.usuario@correo.com',

      celular: '',
      tipoAsegurado: 'Regular',

      codigoPlanilla: '',
      decretoLegislativo: '',
      convenioCGBVP: 'NO',

      notificacionesCorreo: '',

      rucEmpleador: '20131257750',
      rucDesdeBase: true,
      razonSocial: 'SEGURO SOCIAL DE SALUD',
      razonSocialDesdeBase: true,

      conyuge: null,
      conyugeDesdeBase: false,

      beneficiarios: []
    };
  }

  get tituloFormulario(): string {
  return 'Afiliación al +Vida Seguro de Accidentes';
  }

  get subtituloFormulario(): string {
  return 'Complete la información requerida para generar el Formulario 6012 y la Autorización de Descuento por Planilla correspondientes.';
  }

  get mostrarRuc(): boolean {
    return this.form.tipoAsegurado === 'Regular' || this.form.tipoAsegurado === 'Agrario';
  }

  get mostrarRazonSocial(): boolean {
    return this.form.tipoAsegurado === 'Regular'
      || this.form.tipoAsegurado === 'Agrario'
      || this.form.tipoAsegurado === 'Potestativo';
  }

  get sumaPorcentajes(): number {
    return this.form.beneficiarios.reduce((total, beneficiario) => {
      return total + (Number(beneficiario.porcentaje) || 0);
    }, 0);
  }

  get porcentajeCorrecto(): boolean {
    if (this.form.beneficiarios.length === 0) return true;
    return this.sumaPorcentajes === 100;
  }

  get textoEstadoPorcentaje(): string {
    if (this.form.beneficiarios.length === 0) {
      return 'No se registraron beneficiarios.';
    }

    if (this.sumaPorcentajes === 100) {
      return '✅ Porcentaje distribuido correctamente (100%)';
    }

    if (this.sumaPorcentajes < 100) {
      return `⚠️ Falta asignar ${100 - this.sumaPorcentajes}%`;
    }

    return `❌ El porcentaje excede el 100% por ${this.sumaPorcentajes - 100}%`;
  }

  agregarConyuge(): void {
    if (this.form.conyuge) return;

    this.form.conyuge = {
      tipoDocumento: '',
      otroTipoDocumento: '',
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      primerNombre: '',
      segundoNombre: ''
    };

    this.form.conyugeDesdeBase = false;
  }

  quitarConyuge(): void {
    if (this.form.conyugeDesdeBase) return;
    this.form.conyuge = null;
  }

crearBeneficiarioVacio(): Beneficiario {
  return {
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    primerNombre: '',
    segundoNombre: '',
    porcentaje: ''
  };
}

asegurarBeneficiarioInicial(): void {
  if (this.form.beneficiarios.length === 0) {
    this.form.beneficiarios.push(this.crearBeneficiarioVacio());
  }
}

beneficiarioTieneDatos(beneficiario: Beneficiario): boolean {
  return !this.campoVacio(beneficiario.numeroDocumento)
    || !this.campoVacio(beneficiario.apellidoPaterno)
    || !this.campoVacio(beneficiario.apellidoMaterno)
    || !this.campoVacio(beneficiario.primerNombre)
    || !this.campoVacio(beneficiario.segundoNombre)
    || !this.campoVacio(beneficiario.porcentaje);
}

hayBeneficiariosIniciados(): boolean {
  return this.form.beneficiarios.some(beneficiario =>
    this.beneficiarioTieneDatos(beneficiario)
  );
}

mostrarErrorPorcentajeBeneficiario(beneficiario: Beneficiario): boolean {
  if (this.intentoEnviar && this.porcentajeBeneficiarioInvalido(beneficiario)) {
    return true;
  }

  return !this.campoVacio(beneficiario.porcentaje)
    && this.porcentajeBeneficiarioInvalido(beneficiario);
}

beneficiarioRegistradoCompleto(beneficiario: Beneficiario): boolean {
  return !this.tipoDocumentoVacio(beneficiario)
    && !this.numeroDocumentoInvalido(beneficiario)
    && !this.campoVacio(beneficiario.apellidoPaterno)
    && !this.campoVacio(beneficiario.apellidoMaterno)
    && !this.campoVacio(beneficiario.primerNombre)
    && !this.porcentajeBeneficiarioInvalido(beneficiario);
}

hayBeneficiariosRegistrados(): boolean {
  return this.form.beneficiarios.some(beneficiario =>
    this.beneficiarioRegistradoCompleto(beneficiario)
  );
}

beneficiariosRegistrados(): Beneficiario[] {
  return this.form.beneficiarios.filter(beneficiario =>
    this.beneficiarioRegistradoCompleto(beneficiario)
  );
}

  agregarBeneficiario(): void {
  if (this.form.beneficiarios.length >= 5) {
    this.mostrarAviso('Solo puede registrar hasta 5 beneficiarios.');
    return;
  }

  this.form.beneficiarios.push(this.crearBeneficiarioVacio());
}

  quitarBeneficiario(index: number): void {
  this.form.beneficiarios.splice(index, 1);

  if (this.form.beneficiarios.length === 0 && this.pasoActual === 'beneficiarios') {
    this.asegurarBeneficiarioInicial();
  }
  }

  alCambiarTipoDocumento(persona: PersonaDocumento): void {
    if (persona.tipoDocumento !== 'Otro') {
      persona.otroTipoDocumento = '';
    }
  }

  convertirMayusculas(valor: string): string {
    return (valor || '').toUpperCase();
  }

  soloNumeros(valor: string): string {
    return (valor || '').replace(/\D/g, '');
  }

  limpiarDocumento(persona: PersonaDocumento): void {
    if (persona.tipoDocumento === 'DNI' || persona.tipoDocumento === 'CE') {
      persona.numeroDocumento = this.soloNumeros(persona.numeroDocumento);
    }
  }

  limpiarRuc(): void {
    this.form.rucEmpleador = this.soloNumeros(this.form.rucEmpleador);
  }

  limpiarCelular(): void {
    this.form.celular = this.soloNumeros(this.form.celular);
  }

  limpiarPorcentaje(beneficiario: Beneficiario): void {
    beneficiario.porcentaje = this.soloNumeros(beneficiario.porcentaje);
  }

  getMaxLengthDocumento(tipoDocumento: string): number {
    const tipo = this.tiposDocumento.find(t => t.codigo === tipoDocumento);
    return tipo?.longitud || 20;
  }

  getDescripcionTipoDocumento(codigo: string): string {
    const tipo = this.tiposDocumento.find(t => t.codigo === codigo);
    return tipo ? tipo.descripcion : codigo;
  }

  nombreCompletoPersona(persona: PersonaDocumento): string {
  const partes = [
    persona.apellidoPaterno,
    persona.apellidoMaterno,
    persona.primerNombre,
    persona.segundoNombre
  ]
    .map(parte => (parte || '').trim().toUpperCase())
    .filter(parte => parte !== '');

  if (partes.length > 0) {
    return partes.join(' ');
  }

  return (persona.nombres || '').trim().toUpperCase();
}

nombresSeparadosInvalidos(persona: PersonaDocumento): boolean {
  return this.campoVacio(persona.apellidoPaterno)
    || this.campoVacio(persona.apellidoMaterno)
    || this.campoVacio(persona.primerNombre);
}

porcentajeBeneficiarioInvalido(beneficiario: Beneficiario): boolean {
  if (this.campoVacio(beneficiario.porcentaje)) return true;

  const porcentaje = Number(beneficiario.porcentaje);

  if (Number.isNaN(porcentaje)) return true;
  if (porcentaje < 1) return true;
  if (porcentaje > 100) return true;

  return false;
}

mensajePorcentajeInvalido(beneficiario: Beneficiario): string {
  if (this.campoVacio(beneficiario.porcentaje)) {
    return 'Req.';
  }

  const porcentaje = Number(beneficiario.porcentaje);

  if (Number.isNaN(porcentaje)) {
    return 'Ingrese un porcentaje válido.';
  }

  if (porcentaje < 1) {
    return 'Debe ser mínimo 1%.';
  }

  if (porcentaje > 100) {
    return 'No puede ser mayor a 100%.';
  }

  return '';
}

mensajeDocumentoInvalido(persona: PersonaDocumento): string {
  if (this.campoVacio(persona.numeroDocumento)) {
    return 'Obligatorio.';
  }

  if (persona.tipoDocumento === 'DNI') {
    return 'Deben ser 8 dígitos.';
  }

  if (persona.tipoDocumento === 'CE') {
    return 'Deben ser 9 dígitos.';
  }

  if (persona.tipoDocumento === 'Otro') {
    return 'Ingrese el número de documento.';
  }

  return 'Número de documento inválido.';
}


  requiereOtroDocumento(persona: PersonaDocumento): boolean {
    return persona.tipoDocumento === 'Otro';
  }

  campoVacio(valor: string | undefined | null): boolean {
    return !valor || valor.toString().trim() === '';
  }

  correoInvalido(): boolean {
  const correo = this.form.correoViva?.trim() || '';

  if (this.campoVacio(correo)) return true;

  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return !regexCorreo.test(correo);
  }

  tipoDocumentoVacio(persona: PersonaDocumento): boolean {
    return this.campoVacio(persona.tipoDocumento);
  }

  otroDocumentoInvalido(persona: PersonaDocumento): boolean {
    return persona.tipoDocumento === 'Otro' && this.campoVacio(persona.otroTipoDocumento);
  }

  numeroDocumentoInvalido(persona: PersonaDocumento): boolean {
    const tipo = persona.tipoDocumento;
    const numero = persona.numeroDocumento?.trim() || '';

    if (this.campoVacio(tipo)) return true;
    if (this.campoVacio(numero)) return true;

    if (tipo === 'DNI') return numero.length !== 8;
    if (tipo === 'CE') return numero.length !== 9;
    if (tipo === 'Otro') return numero.length === 0;

    return false;
  }

  nombresInvalidos(persona: PersonaDocumento): boolean {
    return this.campoVacio(persona.nombres);
  }

  rucInvalido(): boolean {
    if (!this.mostrarRuc) return false;

    const ruc = this.form.rucEmpleador?.trim() || '';

    if (this.campoVacio(ruc)) return true;
    return ruc.length !== 11;
  }

  razonSocialInvalida(): boolean {
    if (!this.mostrarRazonSocial) return false;
    return this.campoVacio(this.form.razonSocial);
  }

  beneficiarioIncompleto(beneficiario: Beneficiario): boolean {
  return this.tipoDocumentoVacio(beneficiario)
    || this.otroDocumentoInvalido(beneficiario)
    || this.numeroDocumentoInvalido(beneficiario)
    || this.nombresSeparadosInvalidos(beneficiario)
    || this.porcentajeBeneficiarioInvalido(beneficiario);
}

  conyugeIncompleto(): boolean {
  if (!this.form.conyuge) return false;

  return this.tipoDocumentoVacio(this.form.conyuge)
    || this.otroDocumentoInvalido(this.form.conyuge)
    || this.numeroDocumentoInvalido(this.form.conyuge)
    || this.nombresSeparadosInvalidos(this.form.conyuge);
}

  formularioValido(): boolean {
  if (this.campoVacio(this.form.celular)) return false;
if (this.correoInvalido()) return false;
if (this.campoVacio(this.form.codigoPlanilla)) return false;
  if (this.campoVacio(this.form.decretoLegislativo)) return false;
  if (this.campoVacio(this.form.convenioCGBVP)) return false;

 if (!this.aceptaTerminosDeclaracion) return false;

  if (this.rucInvalido()) return false;
  if (this.razonSocialInvalida()) return false;
  if (this.conyugeIncompleto()) return false;

  for (const beneficiario of this.form.beneficiarios) {
    if (this.beneficiarioIncompleto(beneficiario)) return false;
  }

  if (!this.porcentajeCorrecto) return false;

  return true;
}

  continuarResumen(): void {
    this.intentoEnviar = true;
    this.avisoTemporal = '';

    if (!this.formularioValido()) {
      this.mostrarAviso('Revise los campos observados antes de continuar.');
      setTimeout(() => {
        const primerError = document.querySelector('.is-invalid, .alerta-porcentaje');
        primerError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    this.vista = 'resumen';
    this.scrollArriba();
  }

  volverEditar(): void {
    this.vista = 'formulario';
    this.scrollArriba();
  }

  generarSolicitud(): void {
    const payload = this.construirPayloadFinal();

    console.log('Payload simulado para backend:', payload);

    this.vista = 'exito';
    this.scrollArriba();
  }

  construirPayloadFinal(): object {
    return {
      modo: this.form.esNuevo ? 'AFILIACION' : 'ACTUALIZACION',
      titular: {
        tipoDocumento: this.form.titular.tipoDocumento,
        numeroDocumento: this.form.titular.numeroDocumento,
        nombres: this.form.titular.nombres,
        correoViva: this.form.correoViva
      },
      contacto: {
        celular: this.form.celular
      },
      informacionComplementaria: {
        tipoAsegurado: this.form.tipoAsegurado,
        codigoPlanilla: this.form.codigoPlanilla,
        decretoLegislativo: this.form.decretoLegislativo,
        convenioCGBVP: this.form.convenioCGBVP,
        notificacionesCorreo: this.form.esNuevo ? this.form.notificacionesCorreo : null,
        rucEmpleador: this.mostrarRuc ? this.form.rucEmpleador : '',
        razonSocial: this.mostrarRazonSocial ? this.form.razonSocial : ''
      },
      conyuge: this.form.conyuge
  ? {
      ...this.form.conyuge,
      nombres: this.nombreCompletoPersona(this.form.conyuge)
    }
  : null,
    beneficiarios: this.beneficiariosRegistrados().map(beneficiario => ({
      ...beneficiario,
      nombres: this.nombreCompletoPersona(beneficiario)
    })),

      fechaDeclaracion: {
        dia: this.diaDeclaracion,
        mes: this.mesDeclaracion
      },
documentoEmitido: {
  documentosGenerados: this.documentosGenerados,
  codigoSolicitud: this.codigoSolicitud,
  fechaGeneracion: this.fechaGeneracionDocumentos
},
archivosFirmados: {
  formulario6012: this.archivoFormulario6012.cargado
    ? this.archivoFormulario6012.nombre
    : null,
  autorizacionDescuento: this.archivoAutorizacionDescuento.cargado
    ? this.archivoAutorizacionDescuento.nombre
    : null
}
    };
  }

  cerrarExito(): void {
  this.cargarCasoNuevo();
}

  mostrarAviso(mensaje: string): void {
    this.avisoTemporal = mensaje;

    setTimeout(() => {
      this.avisoTemporal = '';
    }, 3500);
  }

  establecerFechaActual(): void {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const hoy = new Date();

    this.diaDeclaracion = String(hoy.getDate());
    this.mesDeclaracion = meses[hoy.getMonth()];
  }

  crearEstadoSecciones(): Record<PasoFormulario, boolean> {
  return {
    titular: false,
    trabajo: false,
    conyuge: false,
    beneficiarios: false,
    declaracion: false,
    documentos: false,
    publicacion: false
  };
}

crearArchivoVacio(): ArchivoDocumentoFirmado {
  return {
    archivo: null,
    nombre: '',
    tamanioMB: '',
    cargado: false,
    error: '',
    urlTemporal: '',
    urlVistaPrevia: null
  };
}

reiniciarFlujoPorPasos(): void {
  this.pasoActual = 'titular';
  this.seccionesGrabadas = this.crearEstadoSecciones();

  this.documentosGenerados = false;
this.solicitudBloqueada = false;
this.codigoSolicitud = '';
this.fechaGeneracionDocumentos = '';

this.tipoGeneracionDocumentos = null;

this.autorizacionDescuentoGenerada = false;
this.formulario6012Generado = false;
this.autorizacionFirmadaBloqueada = false;

this.pendienteBeneficiariosPara6012 = false;
this.mostrarConfirmacionSinBeneficiarios = false;
this.mostrarInvitacionBeneficiarios = false;
this.actualizandoBeneficiarios6012 = false;
  this.aceptaVeracidad = false;
this.aceptaAfiliacion = false;
this.aceptaNotificacionesDeclaracion = true;

this.aceptaTerminosDeclaracion = false;

this.modoRetornoPendiente = false;

this.archivoFormulario6012 = this.crearArchivoVacio();
this.archivoAutorizacionDescuento = this.crearArchivoVacio();
this.documentosPublicados = false;
this.fechaRecepcionDocumentos = '';
this.correoEnvioDocumentos = '';

this.formulario6012Sellado = false;
this.autorizacionDescuentoSellada = false;

}

irAPaso(paso: PasoFormulario): void {
  if (
    this.solicitudBloqueada
    && paso !== 'declaracion'
    && paso !== 'documentos'
  ) {
    this.mostrarAviso('La solicitud ya generó documentos. Los datos registrados no pueden modificarse.');
    return;
  }

  this.pasoActual = paso;
  this.intentoEnviar = false;
  this.scrollArriba();
}

obtenerIndicePaso(paso: PasoFormulario): number {
  return this.pasosFormulario.findIndex(item => item.codigo === paso);
}

obtenerPasoSiguiente(): PasoFormulario | null {
  const indiceActual = this.obtenerIndicePaso(this.pasoActual);
  const siguiente = this.pasosFormulario[indiceActual + 1];

  return siguiente ? siguiente.codigo : null;
}

obtenerPasoAnterior(): PasoFormulario | null {
  const indiceActual = this.obtenerIndicePaso(this.pasoActual);
  const anterior = this.pasosFormulario[indiceActual - 1];

  return anterior ? anterior.codigo : null;
}

volverPaso(): void {
  const anterior = this.obtenerPasoAnterior();

  if (!anterior) return;

  this.irAPaso(anterior);
}

validarPaso(paso: PasoFormulario): boolean {
  if (paso === 'titular') {
  return !this.campoVacio(this.form.celular)
    && !this.correoInvalido();
  }

  if (paso === 'trabajo') {
    return !this.campoVacio(this.form.codigoPlanilla)
      && !this.campoVacio(this.form.decretoLegislativo)
      && !this.campoVacio(this.form.convenioCGBVP)
      && !this.rucInvalido()
      && !this.razonSocialInvalida();
  }

  if (paso === 'conyuge') {
    return !this.conyugeIncompleto();
  }

  if (paso === 'beneficiarios') {
  const beneficiariosRegistrados = this.beneficiariosRegistrados();

  if (this.pendienteBeneficiariosPara6012) {
      return this.beneficiariosValidosPara6012();
    }

    if (beneficiariosRegistrados.length === 0) {
      return true;
    }

    for (const beneficiario of beneficiariosRegistrados) {
      if (this.beneficiarioIncompleto(beneficiario)) {
        return false;
      }
    }

    return this.porcentajeCorrecto;
  }

  if (paso === 'declaracion') {
    return this.declaracionValida();
  }

  if (paso === 'documentos') {
  return this.documentosFirmadosCompletos();
}

if (paso === 'publicacion') {
  return this.documentosPublicados;
}

return false;

}

abrirConfirmacionSinBeneficiarios(): void {
  if (this.pendienteBeneficiariosPara6012) {
    this.mostrarAviso('Debe registrar al menos un beneficiario para generar el Formulario 6012.');
    return;
  }

  this.intentoEnviar = false;
  this.mostrarConfirmacionSinBeneficiarios = true;
}

confirmarContinuarSinBeneficiarios(): void {
  this.mostrarConfirmacionSinBeneficiarios = false;

  this.form.beneficiarios = [];

  this.seccionesGrabadas.beneficiarios = true;
  this.pasoActual = 'declaracion';
  this.intentoEnviar = false;
  this.scrollArriba();

  this.mostrarAviso(
    'Continuará sin beneficiarios. Solo podrá generar la Autorización de Descuento; el Formulario 6012 podrá generarse posteriormente si registra beneficiarios.'
  );
}

cancelarContinuarSinBeneficiarios(): void {
  this.mostrarConfirmacionSinBeneficiarios = false;
  this.intentoEnviar = false;
}

grabarSeccion(): void {
  this.intentoEnviar = true;

  if (!this.validarPaso(this.pasoActual)) {
    this.mostrarAviso('Revise los campos observados antes de grabar esta sección.');
    return;
  }

  this.seccionesGrabadas[this.pasoActual] = true;
  this.mostrarAviso('Sección grabada correctamente.');
}

continuarPaso(): void {
  if (
    this.pasoActual === 'beneficiarios'
    && !this.hayBeneficiariosRegistrados()
    && !this.pendienteBeneficiariosPara6012
  ) {
    this.abrirConfirmacionSinBeneficiarios();
    return;
  }

  this.intentoEnviar = true;

  if (!this.validarPaso(this.pasoActual)) {
    this.mostrarAviso('Revise los campos observados antes de continuar.');
    return;
  }

  if (this.pasoActual === 'declaracion' && !this.documentosGenerados) {
    this.mostrarAviso('Primero debe generar los documentos antes de continuar a la carga de archivos.');
    return;
  }

  this.seccionesGrabadas[this.pasoActual] = true;

  const siguiente = this.obtenerPasoSiguiente();

  if (siguiente) {
    if (siguiente === 'beneficiarios') {
      this.asegurarBeneficiarioInicial();
    }

    this.pasoActual = siguiente;
    this.intentoEnviar = false;
    this.scrollArriba();
  }
}

beneficiariosValidosPara6012(): boolean {
  const beneficiariosConDatos = this.form.beneficiarios.filter(beneficiario =>
    this.beneficiarioTieneDatos(beneficiario)
  );

  if (beneficiariosConDatos.length === 0) return false;

  for (const beneficiario of beneficiariosConDatos) {
    if (this.beneficiarioIncompleto(beneficiario)) {
      return false;
    }
  }

  return this.porcentajeCorrecto;
}

beneficiariosBloqueados(): boolean {
  return this.solicitudBloqueada && !this.pendienteBeneficiariosPara6012;
}

textoBotonGenerarDocumentos(): string {
  if (!this.hayBeneficiariosRegistrados()) {
    return 'Generar solo Autorización de Descuento';
  }

  return 'Generar documentos de afiliación';
}

tituloDescargaDocumentos(): string {
  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    return 'Descarga de Autorización de Descuento';
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    return 'Descarga del Formulario 6012';
  }

  return 'Descarga de documentos';
}

descripcionDescargaDocumentos(): string {
  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    return 'Descargue la Autorización de Descuento por Planilla para imprimirla, firmarla manuscritamente y cargarla en formato PDF.';
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    return 'Descargue el Formulario 6012 generado con los beneficiarios registrados para imprimirlo, firmarlo manuscritamente y cargarlo en formato PDF.';
  }

  return 'Descargue en un solo archivo el Formulario 6012 y la Autorización de Descuento por Planilla para imprimirlos, firmarlos manuscritamente y cargarlos por separado.';
}

textoBotonDescargaDocumentos(): string {
  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    return 'Descargar Autorización de Descuento';
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    return 'Descargar Formulario 6012';
  }

  return 'Descargar documentos para firma';
}

textoBotonEnvioDocumentos(): string {
  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    return 'Guardar autorización firmada';
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    return 'Enviar Formulario 6012 firmado';
  }

  return 'Enviar documentos firmados';
}

declaracionValida(): boolean {
  return this.aceptaTerminosDeclaracion;
}

alCambiarAutorizacionNotificaciones(): void {
  if (this.form.esNuevo && !this.aceptaNotificacionesDeclaracion) {
    this.mostrarAviso(
      'Para solicitar una vía de comunicación distinta al correo electrónico, deberá realizar una solicitud por el canal correspondiente. Por el momento, la afiliación digital no podrá continuar sin esta autorización.'
    );
  }
}

generarDocumentos(): void {
  this.intentoEnviar = true;

  const pasosPrevios: PasoFormulario[] = [
    'titular',
    'trabajo',
    'conyuge',
    'beneficiarios',
    'declaracion'
  ];

  for (const paso of pasosPrevios) {
    if (!this.validarPaso(paso)) {
      this.pasoActual = paso;
      this.mostrarAviso('Hay información pendiente u observada antes de generar los documentos.');
      this.scrollArriba();
      return;
    }
  }

  const tieneBeneficiarios = this.hayBeneficiariosRegistrados();

  if (tieneBeneficiarios && !this.beneficiariosValidosPara6012()) {
    this.pasoActual = 'beneficiarios';
    this.mostrarAviso('Debe registrar al menos un beneficiario válido y asignar el 100% para generar el Formulario 6012.');
    this.scrollArriba();
    return;
  }

  this.form.notificacionesCorreo = 'SI';

  const fecha = new Date();

  this.codigoSolicitud = 'VIDA-' + fecha.getFullYear() + '-' + fecha.getTime();
  this.fechaGeneracionDocumentos = fecha.toLocaleString('es-PE');

  this.tipoGeneracionDocumentos = tieneBeneficiarios
    ? 'completa'
    : 'soloAutorizacion';

  this.autorizacionDescuentoGenerada = true;
  this.formulario6012Generado = tieneBeneficiarios;

  this.documentosGenerados = true;
  this.solicitudBloqueada = true;

  pasosPrevios.forEach(paso => {
    this.seccionesGrabadas[paso] = true;
  });

  console.log('Payload para generación de documentos:', this.construirPayloadFinal());

  this.pasoActual = 'documentos';
  this.intentoEnviar = false;
  this.scrollArriba();

  if (tieneBeneficiarios) {
    this.mostrarAviso('Documentos generados correctamente. Descárguelos, fírmelos y cargue los archivos escaneados.');
    return;
  }

  this.mostrarAviso('Se generó solo la Autorización de Descuento. El Formulario 6012 quedará pendiente hasta registrar beneficiarios.');
}

mostrarPantallaInvitacionBeneficiarios(): void {
  this.mostrarInvitacionBeneficiarios = true;
  this.pendienteBeneficiariosPara6012 = false;
  this.pasoActual = 'publicacion';
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.scrollArriba();
}

iniciarRegistroBeneficiarios6012(): void {
  this.mostrarInvitacionBeneficiarios = false;
  this.pendienteBeneficiariosPara6012 = true;
  this.actualizandoBeneficiarios6012 = false;
  this.asegurarBeneficiarioInicial();

  this.pasoActual = 'beneficiarios';
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.scrollArriba();

  this.mostrarAviso('Complete los beneficiarios para generar el Formulario 6012.');
}

omitirRegistroBeneficiariosPorAhora(): void {
  this.mostrarInvitacionBeneficiarios = false;
  this.seccionesGrabadas.documentos = true;
  this.vista = 'exito';
  this.scrollArriba();
}

iniciarActualizacionBeneficiarios6012(): void {
  this.mostrarInvitacionBeneficiarios = false;
  this.pendienteBeneficiariosPara6012 = true;
  this.actualizandoBeneficiarios6012 = true;

  this.tipoGeneracionDocumentos = 'soloFormulario6012';

  this.formulario6012Generado = false;
  this.formulario6012Sellado = false;
  this.archivoFormulario6012 = this.crearArchivoVacio();

  this.seccionesGrabadas.documentos = false;
  this.seccionesGrabadas.publicacion = false;

  this.asegurarBeneficiarioInicial();

  this.pasoActual = 'beneficiarios';
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.scrollArriba();

  this.mostrarAviso('Actualice los beneficiarios y genere nuevamente el Formulario 6012.');
}

textoBotonGenerarFormulario6012(): string {
  return this.actualizandoBeneficiarios6012
    ? 'Generar Formulario 6012 actualizado'
    : 'Generar Formulario 6012';
}

generarFormulario6012Pendiente(): void {
  this.intentoEnviar = true;

  if (!this.beneficiariosValidosPara6012()) {
    this.mostrarAviso('Debe registrar al menos un beneficiario válido y asignar el 100% para generar el Formulario 6012.');
    return;
  }

  const fecha = new Date();

  this.fechaGeneracionDocumentos = fecha.toLocaleString('es-PE');

  this.formulario6012Generado = true;
  this.formulario6012Generado = true;
  this.tipoGeneracionDocumentos = 'soloFormulario6012';

  this.pendienteBeneficiariosPara6012 = false;
  this.actualizandoBeneficiarios6012 = false;
  this.documentosGenerados = true;
  this.solicitudBloqueada = true;
  this.seccionesGrabadas.beneficiarios = true;

  console.log('Payload para generación del Formulario 6012 pendiente:', this.construirPayloadFinal());

  this.pasoActual = 'documentos';
  this.intentoEnviar = false;
  this.scrollArriba();

  this.mostrarAviso('Formulario 6012 generado correctamente. Descárguelo, fírmelo y cargue el PDF escaneado.');
}

descargarDocumentosSimulados(): void {
  if (!this.documentosGenerados) {
    this.mostrarAviso('Primero debe generar los documentos.');
    return;
  }

  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    this.mostrarAviso('Descarga lista: Autorización de Descuento por Planilla.');
    return;
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    this.mostrarAviso('Descarga lista: Formulario 6012.');
    return;
  }

  this.mostrarAviso('Descarga única lista: Formulario 6012 y Autorización de Descuento por Planilla.');
}

simularRetornoPendienteCarga(): void {
  if (!this.documentosGenerados) {
    this.mostrarAviso('Primero genere los documentos para simular el retorno pendiente de carga.');
    return;
  }

  this.modoRetornoPendiente = true;
  this.pasoActual = 'documentos';
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.scrollArriba();

  this.mostrarAviso('Simulación: el usuario volvió para subir sus documentos firmados.');
}

simularRetornoPendienteBeneficiarios(): void {
  if (!this.autorizacionFirmadaBloqueada) {
    this.mostrarAviso('Primero debe registrar la Autorización de Descuento firmada.');
    return;
  }

  this.solicitudBloqueada = true;
  this.pendienteBeneficiariosPara6012 = false;
  this.modoRetornoPendiente = false;

  this.mostrarPantallaInvitacionBeneficiarios();

  this.mostrarAviso('Autorización de Descuento enviada. Puede registrar beneficiarios y generar el Formulario 6012.');
}

seleccionarArchivo(event: Event, tipo: TipoDocumentoFirmado): void {
  const input = event.target as HTMLInputElement;
  const archivo = input.files?.[0];

  if (!archivo) return;

  const archivoValidado = this.validarArchivoPdf(archivo);

  if (tipo === 'formulario6012') {
    this.archivoFormulario6012 = archivoValidado;
  }

  if (tipo === 'autorizacionDescuento') {
    this.archivoAutorizacionDescuento = archivoValidado;
  }
}

validarArchivoPdf(archivo: File): ArchivoDocumentoFirmado {
  const maximoMB = 15;
  const maximoBytes = maximoMB * 1024 * 1024;

  const esPdf = archivo.type === 'application/pdf'
    || archivo.name.toLowerCase().endsWith('.pdf');

  if (!esPdf) {
    return {
      archivo: null,
      nombre: archivo.name,
      tamanioMB: this.formatearPesoArchivo(archivo.size),
      cargado: false,
      error: 'El archivo debe estar en formato PDF.',
      urlTemporal: '',
      urlVistaPrevia: null
    };
  }

  if (archivo.size > maximoBytes) {
    return {
      archivo: null,
      nombre: archivo.name,
      tamanioMB: this.formatearPesoArchivo(archivo.size),
      cargado: false,
      error: 'El archivo no debe superar los 15 MB.',
      urlTemporal: '',
      urlVistaPrevia: null
    };
  }

  const urlTemporal = URL.createObjectURL(archivo);

  return {
    archivo,
    nombre: archivo.name,
    tamanioMB: this.formatearPesoArchivo(archivo.size),
    cargado: true,
    error: '',
    urlTemporal,
    urlVistaPrevia: this.sanitizer.bypassSecurityTrustResourceUrl(urlTemporal)
  };
}

formatearPesoArchivo(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

documentosFirmadosCompletos(): boolean {
  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    return this.archivoAutorizacionDescuento.cargado;
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    return this.archivoFormulario6012.cargado;
  }

  return this.archivoFormulario6012.cargado
    && this.archivoAutorizacionDescuento.cargado;
}

publicarDocumentosSellados(): void {
  const fecha = new Date();

  this.fechaRecepcionDocumentos = fecha.toLocaleString('es-PE');
  this.correoEnvioDocumentos = this.form.correoViva;

  this.documentosPublicados = true;

  this.autorizacionDescuentoSellada =
    this.autorizacionDescuentoGenerada && this.archivoAutorizacionDescuento.cargado;

  this.formulario6012Sellado =
    this.formulario6012Generado && this.archivoFormulario6012.cargado;

  this.seccionesGrabadas.documentos = true;
  this.seccionesGrabadas.publicacion = true;

  this.pasoActual = 'publicacion';
  this.vista = 'formulario';
  this.intentoEnviar = false;

  console.log('Documentos sellados y publicados:', {
    codigoSolicitud: this.codigoSolicitud,
    fechaRecepcion: this.fechaRecepcionDocumentos,
    correoEnvio: this.correoEnvioDocumentos,
    formulario6012Sellado: this.formulario6012Sellado,
    autorizacionDescuentoSellada: this.autorizacionDescuentoSellada
  });

  this.scrollArriba();
}

obtenerArchivoDocumento(tipoDocumento: TipoDocumentoFirmado): ArchivoDocumentoFirmado {
  return tipoDocumento === 'formulario6012'
    ? this.archivoFormulario6012
    : this.archivoAutorizacionDescuento;
}

obtenerTituloDocumento(tipoDocumento: TipoDocumentoFirmado): string {
  return tipoDocumento === 'formulario6012'
    ? 'Formulario 6012'
    : 'Autorización de Descuento';
}

verDocumentoSelladoSimulado(tipoDocumento: TipoDocumentoFirmado): void {
  const documento = this.obtenerArchivoDocumento(tipoDocumento);

  if (!documento.cargado || !documento.urlVistaPrevia) {
    this.mostrarAviso('No hay un PDF cargado para visualizar.');
    return;
  }

  this.tituloDocumentoPdf = `${this.obtenerTituloDocumento(tipoDocumento)} recepcionado`;
  this.urlDocumentoPdf = documento.urlVistaPrevia;
  this.documentoPdfVisible = true;
}

descargarDocumentoSelladoSimulado(tipoDocumento: TipoDocumentoFirmado): void {
  const documento = this.obtenerArchivoDocumento(tipoDocumento);

  if (!documento.cargado || !documento.urlTemporal) {
    this.mostrarAviso('No hay un PDF cargado para descargar.');
    return;
  }

  const enlace = document.createElement('a');
  enlace.href = documento.urlTemporal;
  enlace.download = `SELLADO-${documento.nombre}`;
  enlace.click();
}

cerrarVistaPreviaPdf(): void {
  this.documentoPdfVisible = false;
  this.tituloDocumentoPdf = '';
  this.urlDocumentoPdf = null;
}

simularRetornoDocumentosPublicados(): void {
  if (!this.documentosPublicados) {
    this.mostrarAviso('Aún no existen documentos recepcionados para visualizar.');
    return;
  }

  this.pasoActual = 'publicacion';
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.scrollArriba();

  this.mostrarAviso('Documentos recepcionados disponibles en la plataforma.');
}

finalizarPublicacionDocumentos(): void {
  this.vista = 'exito';
  this.scrollArriba();
}

enviarDocumentosFirmados(): void {
  this.intentoEnviar = true;

  if (!this.documentosFirmadosCompletos()) {
    if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
      this.mostrarAviso('Debe cargar la Autorización de Descuento firmada en formato PDF.');
      return;
    }

    if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
      this.mostrarAviso('Debe cargar el Formulario 6012 firmado en formato PDF.');
      return;
    }

    this.mostrarAviso('Debe cargar ambos documentos firmados en formato PDF.');
    return;
  }

  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    this.autorizacionFirmadaBloqueada = true;
    this.pendienteBeneficiariosPara6012 = false;
    this.modoRetornoPendiente = false;

    console.log('Autorización de descuento firmada registrada:', {
      codigoSolicitud: this.codigoSolicitud,
      autorizacionDescuento: this.archivoAutorizacionDescuento.nombre
    });

    this.publicarDocumentosSellados();
    this.mostrarInvitacionBeneficiarios = true;

    this.mostrarAviso('Autorización recepcionada, sellada y publicada en la plataforma.');
    return;
  }

  console.log('Archivos firmados listos para backend:', {
    codigoSolicitud: this.codigoSolicitud,
    formulario6012: this.archivoFormulario6012.nombre,
    autorizacionDescuento: this.archivoAutorizacionDescuento.nombre,
    autorizacionPreviamenteRegistrada: this.autorizacionFirmadaBloqueada
  });

  this.publicarDocumentosSellados();

  this.mostrarAviso('Documentos recepcionados, sellados y publicados en la plataforma.');
}

scrollArriba(): void {
  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

trackByIndex(index: number): number {
  return index;
}

}