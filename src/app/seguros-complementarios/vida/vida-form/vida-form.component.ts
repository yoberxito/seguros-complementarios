import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy
} from '@angular/core';
import {
  DomSanitizer
} from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Subscription
} from 'rxjs';
import {
  VidaApiService,
  RepresentanteDtoApi,
  RespuestaPersonaContactoApi,
  RespuestaConyugeConcubinoApi,
  TipoAseguradoApi,
  EmpresaEmpleadorApi,
  SustentoSeguroComplementarioApi,
  TipoDocumentoCargaLocal,
  DocumentoCargadoLocalResponse,
  ValidacionDocumentalCompletaResponseLocal,
  RegistrarAvanceExpedienteRequest,
  RegistrarAceptacionRequest,
  DocumentoGeneradoDescargadoLocal,
  GenerarFormulario6012Request,
  GenerarFormularioDescuentoRequest,
  IniciarProcesoVidaRequestLocal,
  IniciarProcesoVidaResponseLocal,
  RecuperarAvanceProcesoResponseLocal,
  GuardarTitularProgresoRequestLocal,
  GuardarProgresoVidaResponseLocal,
  GuardarDatosComplementariosProgresoRequestLocal,
  GuardarConyugeProgresoRequestLocal,
  BeneficiarioProgresoRequestLocal,
  GuardarBeneficiariosProgresoRequestLocal,
  DocumentoPublicadoResumenLocal,
  GuardarBorradorTitularRequestLocal,
  GuardarBorradorDatosComplementariosRequestLocal,
  BeneficiarioBorradorRequestLocal,
  GuardarBorradorBeneficiariosRequestLocal,
  TipoDocumentoFormulario6012
} from '../services/vida-api.service';

import {
  AvisoFlotante,
  Beneficiario,
  ContextoConsultaPersona,
  FormularioVida,
  PasoFormulario,
  PersonaDocumento,
  TipoAsegurado,
  TipoAviso,
  TipoDocumento,
  TipoDocumentoFirmado,
  TipoGeneracionDocumentos,
  Vista
} from '../models/vida-form.models';

import {
  ArchivoDocumentoFirmado
} from '../models/vida-documentos.models';

import {
  VidaTramiteStateService
} from '../services/vida-tramite-state.service';

import {
  VidaTitularComponent
} from '../pages/titular/vida-titular.component';

import {
  VidaDatosComplementariosComponent
} from '../pages/datos-complementarios/vida-datos-complementarios.component';

import {
  VidaConyugeComponent
} from '../pages/conyuge/vida-conyuge.component';

import {
  VidaBeneficiariosComponent
} from '../pages/beneficiarios/vida-beneficiarios.component';

import {
  VidaDeclaracionComponent
} from '../pages/declaracion/vida-declaracion.component';

import {
  VidaDocumentosComponent
} from '../pages/documentos/vida-documentos.component';

import {
  VidaFinalizacionComponent
} from '../pages/finalizacion/vida-finalizacion.component';

@Component({
  selector: 'app-vida-form',
  standalone: true,
  imports: [
    CommonModule,
    VidaTitularComponent,
    VidaDatosComplementariosComponent,
    VidaConyugeComponent,
    VidaBeneficiariosComponent,
    VidaDeclaracionComponent,
    VidaDocumentosComponent,
    VidaFinalizacionComponent
  ],
  templateUrl: './vida-form.component.html',
  styleUrl: './vida-form.component.css'
})


export class VidaFormComponent
  implements OnDestroy {

private suscripcionRuta:
  Subscription | null = null;
private aplicandoRecuperacionVisual =
  false;

private readonly demoraAutosaveBorradorMs =
  600;

private temporizadorBorradorTitular:
  ReturnType<typeof setTimeout> | null =
    null;

private temporizadorBorradorDatosComplementarios:
  ReturnType<typeof setTimeout> | null =
    null;

private temporizadorBorradorBeneficiarios:
  ReturnType<typeof setTimeout> | null =
    null;
private readonly rutaPorPaso:
  Record<PasoFormulario, string> = {
    titular: 'titular',
    trabajo: 'datos-complementarios',
    conyuge: 'conyuge',
    beneficiarios: 'beneficiarios',
    declaracion: 'declaracion',
    documentos: 'documentos',
    publicacion: 'finalizacion'
  };

private readonly estadoBackendPorPaso:
  Record<PasoFormulario, string> = {

    titular:
      'DATOS_TITULAR',

    trabajo:
      'DATOS_COMPLEMENTARIOS',

    conyuge:
      'CONYUGE_CONCUBINO',

    beneficiarios:
      'BENEFICIARIOS',

    declaracion:
      'DECLARACION_JURADA',

    documentos:
      'DOCUMENTOS',

    publicacion:
      'FINALIZACION'
  };

get form(): FormularioVida {
  return this.vidaTramiteStateService.form;
}

set form(valor: FormularioVida) {
  this.vidaTramiteStateService.form =
    valor;
}

get pasoActual(): PasoFormulario {
  return this.vidaTramiteStateService.pasoActual;
}

set pasoActual(valor: PasoFormulario) {
  this.vidaTramiteStateService.pasoActual =
    valor;

  /*
   * Durante la rehidratación desde Oracle
   * podemos recorrer internamente distintos
   * estados para reconstruir las banderas,
   * pero no debemos navegar por cada uno.
   *
   * La ruta definitiva se sincroniza una sola
   * vez al terminar la recuperación.
   */
  if (this.aplicandoRecuperacionVisual) {
    return;
  }

  this.sincronizarRutaConPaso(
    valor
  );
}

get seccionesGrabadas():
  Record<PasoFormulario, boolean> {
  return this.vidaTramiteStateService
    .seccionesGrabadas;
}

set seccionesGrabadas(
  valor: Record<PasoFormulario, boolean>
) {
  this.vidaTramiteStateService
    .seccionesGrabadas = valor;
}

get documentosGenerados(): boolean {
  return this.vidaTramiteStateService
    .documentosGenerados;
}

set documentosGenerados(valor: boolean) {
  this.vidaTramiteStateService
    .documentosGenerados = valor;
}

get solicitudBloqueada(): boolean {
  return this.vidaTramiteStateService
    .solicitudBloqueada;
}

set solicitudBloqueada(valor: boolean) {
  this.vidaTramiteStateService
    .solicitudBloqueada = valor;
}

get pendienteBeneficiariosPara6012():
  boolean {
  return this.vidaTramiteStateService
    .pendienteBeneficiariosPara6012;
}

set pendienteBeneficiariosPara6012(
  valor: boolean
) {
  this.vidaTramiteStateService
    .pendienteBeneficiariosPara6012 =
      valor;
}

get documentosPublicados(): boolean {
  return this.vidaTramiteStateService
    .documentosPublicados;
}

set documentosPublicados(valor: boolean) {
  this.vidaTramiteStateService
    .documentosPublicados = valor;
}

vista: Vista = 'formulario';
intentoEnviar = false;
avisoFlotante: AvisoFlotante | null = null;
temporizadorAviso: ReturnType<typeof setTimeout> | null = null;

private readonly ordenPasos:
  PasoFormulario[] = [
    'titular',
    'trabajo',
    'conyuge',
    'beneficiarios',
    'declaracion',
    'documentos',
    'publicacion'
  ];

get codigoSolicitud(): string {
  return this.vidaTramiteStateService
    .registroInternoProceso;
}

set codigoSolicitud(valor: string) {
  this.vidaTramiteStateService
    .registroInternoProceso = valor;
}
fechaGeneracionDocumentos = '';

tipoGeneracionDocumentos: TipoGeneracionDocumentos = null;

autorizacionDescuentoGenerada = false;
formulario6012Generado = false;
autorizacionFirmadaBloqueada = false;

mostrarConfirmacionSinBeneficiarios = false;
mostrarInvitacionBeneficiarios = false;

cargandoTipoAsegurado = false;
tipoAseguradoValidado = false;
errorTipoAsegurado = '';

aceptaTratamientoDatos = false;
aceptaTerminosDeclaracion = false;

mostrarAyudaCgbvp = false;

archivoFormulario6012: ArchivoDocumentoFirmado = this.crearArchivoVacio();
archivoAutorizacionDescuento: ArchivoDocumentoFirmado = this.crearArchivoVacio();
cargandoDocumentosFirmadosBackend = false;
documentosFirmadosCargadosBackend = false;



idDocumentoCargadoFormulario6012 = '';
idDocumentoCargadoAutorizacion = '';
validandoDocumentosBackend = false;
documentosValidadosBackend = false;

cerrandoDocumentosBackend = false;
documentosCerradosBackend = false;

idDocumentoPublicadoAutorizacion = '';

idDocumentoPublicadoFormulario6012 = '';

mensajeErrorCierre = '';

autorizacionValidadaBackend = false;
formulario6012ValidadoBackend = false;

mensajeRechazoValidacion = '';
fechaRecepcionDocumentos = '';

consultandoDocumentoPublicado:
  TipoDocumentoFirmado | null = null;
recuperandoDocumentosPublicadosFinalizacion =
  false;
preparandoProcesoBackendLocal = false;
procesoBackendPreparado = false;

iniciandoProcesoVida = false;
procesoVidaInicializado = false;
recuperandoAvanceProceso = false;

guardandoTitularProgreso = false;
guardandoDatosComplementariosProgreso =
  false;
guardandoConyugeProgreso = false;
guardandoBeneficiariosProgreso = false;
generandoFormulario6012Servicio = false;

generandoFormularioDescuentoServicio = false;
descargandoDocumentos = false;

formulario6012Sellado = false;
autorizacionDescuentoSellada = false;

tiposDocumento: TipoDocumento[] = [];

sustentosSeguroComplementario:
  SustentoSeguroComplementarioApi[] =
    [];

cargandoSustentosSeguroComplementario =
  false;

errorSustentosSeguroComplementario =
  '';

tiposDocumentoRespaldo: TipoDocumento[] = [
  { codigo: '01', descripcion: '01-DNI' },
  { codigo: '04', descripcion: '04-C.E.' },
  { codigo: '07', descripcion: '07-PASAPORTE' },
  { codigo: '09', descripcion: '09-CARNE SOLIC REFUGIO' },
  { codigo: '23', descripcion: '23-PERMISO TEMPORAL PERMANEN' },
  { codigo: '27', descripcion: '27-C.IDENT-RREE' },
  { codigo: '28', descripcion: '28-DOC.ID.EXTR.' },
  { codigo: '29', descripcion: '29-CPP' }
];

seguroComplementarioValidado = false;
titularTieneSeguroComplementario = false;
mensajeSeguroComplementario = '';
errorValidacionSeguroComplementario = '';

empresasEmpleador: EmpresaEmpleadorApi[] = [];
cargandoEmpleador = false;
errorEmpleador = '';

consultandoInformacionPersona = false;

cargandoDatosTitular = false;
errorDatosTitular = '';

decretosLegislativos = ['1057', '276', '728'];

cargandoConyuge = false;
conyugeConsultado = false;
errorConyuge = '';

constructor(
  private sanitizer: DomSanitizer,
  private vidaApiService: VidaApiService,
  private vidaTramiteStateService:
    VidaTramiteStateService,
  private activatedRoute:
    ActivatedRoute,
  private router:
    Router
) {
  if (
    !this.vidaTramiteStateService
      .estaInicializado()
  ) {
    this.cargarCasoNuevo();
  }

  this.escucharPasoDesdeRuta();
}

private escucharPasoDesdeRuta(): void {
  this.suscripcionRuta =
    this.activatedRoute.paramMap
      .subscribe(parametros => {
        const pasoDesdeRuta =
          this.obtenerPasoDesdeRuta(
            parametros.get('paso')
          );

        if (!pasoDesdeRuta) {
          this.sincronizarRutaConPaso(
            this.pasoActual
          );

          return;
        }

        if (
          !this.puedeAccederPasoDesdeRuta(
            pasoDesdeRuta
          )
        ) {
          this.sincronizarRutaConPaso(
            this.pasoActual
          );

          return;
        }

        if (
          this.vidaTramiteStateService
            .pasoActual === pasoDesdeRuta
        ) {
          return;
        }

        /*
         * Se actualiza directamente el servicio
         * para no iniciar otra navegación desde
         * el setter de pasoActual.
         */
        this.vidaTramiteStateService
          .pasoActual = pasoDesdeRuta;

        this.persistirNavegacionActual(
          pasoDesdeRuta
        );

        this.intentoEnviar = false;

        if (pasoDesdeRuta === 'conyuge') {
          this.consultarConyugeConcubino();
        }

        this.scrollArriba();
      });
}

private sincronizarRutaConPaso(
  paso: PasoFormulario
): void {
  const segmento =
    this.rutaPorPaso[paso];

  const rutaEsperada =
    `/vida/${segmento}`;

  if (this.router.url === rutaEsperada) {
    return;
  }

  void this.router.navigate([
    '/vida',
    segmento
  ]);
}

private obtenerPasoDesdeRuta(
  segmento: string | null
): PasoFormulario | null {
  if (segmento === 'titular') {
    return 'titular';
  }

  if (segmento === 'datos-complementarios') {
    return 'trabajo';
  }

  if (segmento === 'conyuge') {
    return 'conyuge';
  }

  if (segmento === 'beneficiarios') {
    return 'beneficiarios';
  }

  if (segmento === 'declaracion') {
    return 'declaracion';
  }

  if (segmento === 'documentos') {
    return 'documentos';
  }

  if (segmento === 'finalizacion') {
    return 'publicacion';
  }

  return null;
}

private obtenerPasoDesdeEstadoBackend(
  codigoEstado?: string | null
): PasoFormulario | null {

  const estado =
    (codigoEstado || '')
      .trim()
      .toUpperCase();

  if (estado === 'DATOS_TITULAR') {
    return 'titular';
  }

  if (estado === 'DATOS_COMPLEMENTARIOS') {
    return 'trabajo';
  }

  if (estado === 'CONYUGE_CONCUBINO') {
    return 'conyuge';
  }

  if (estado === 'BENEFICIARIOS') {
    return 'beneficiarios';
  }

  if (estado === 'DECLARACION_JURADA') {
    return 'declaracion';
  }

  if (estado === 'DOCUMENTOS') {
    return 'documentos';
  }

  if (estado === 'FINALIZACION') {
    return 'publicacion';
  }

  return null;
}

private puedeAccederPasoDesdeRuta(
  paso: PasoFormulario
): boolean {
  if (this.solicitudBloqueada) {
    if (paso === 'declaracion') {
      return true;
    }

    if (paso === 'documentos') {
      return this.documentosGenerados;
    }

    if (paso === 'publicacion') {
      return this.documentosPublicados;
    }

    if (paso === 'beneficiarios') {
      return this.pendienteBeneficiariosPara6012;
    }

    return false;
  }

  if (paso === 'titular') {
    return true;
  }

  if (paso === 'trabajo') {
    return this.seccionesGrabadas.titular;
  }

  if (paso === 'conyuge') {
    return this.seccionesGrabadas.titular
      && this.seccionesGrabadas.trabajo;
  }

  if (paso === 'beneficiarios') {
    return this.seccionesGrabadas.titular
      && this.seccionesGrabadas.trabajo
      && this.seccionesGrabadas.conyuge;
  }

  if (paso === 'declaracion') {
    return this.seccionesGrabadas.titular
      && this.seccionesGrabadas.trabajo
      && this.seccionesGrabadas.conyuge
      && this.seccionesGrabadas.beneficiarios;
  }

  if (paso === 'documentos') {
    return this.documentosGenerados;
  }

  if (paso === 'publicacion') {
    return this.documentosPublicados;
  }

  return false;
}

private persistirNavegacionActual(
  paso: PasoFormulario
): void {

  /*
   * En fase documental la navegación editable
   * ya no debe modificarse.
   */
  if (this.solicitudBloqueada) {
    return;
  }

  const registro =
    this.codigoSolicitud.trim();

  if (!registro) {
    return;
  }

  const codigoEstadoNavegacion =
    this.estadoBackendPorPaso[paso];

  if (!codigoEstadoNavegacion) {
    return;
  }

  this.vidaApiService
    .actualizarNavegacionProceso(
      registro,
      codigoEstadoNavegacion
    )
    .subscribe({
      next: respuesta => {

        console.log(
          'Navegación del trámite persistida:',
          {
            paso,
            codigoEstadoProceso:
              respuesta.codigoEstadoProceso,
            codigoEstadoNavegacion:
              respuesta.codigoEstadoNavegacion
          }
        );
      },

      error: (error: unknown) => {

        console.error(
          'No fue posible persistir la navegación actual:',
          error
        );

        this.mostrarAviso(
          'La pantalla cambió correctamente, pero no fue posible guardar la ubicación actual del trámite.',
          'advertencia',
          'Ubicación no guardada'
        );
      }
    });
}

programarGuardadoBorradorTitular():
  void {

  if (
    this.solicitudBloqueada
    || this.aplicandoRecuperacionVisual
  ) {
    return;
  }

  if (!this.codigoSolicitud.trim()) {
    return;
  }

  if (this.temporizadorBorradorTitular) {
    clearTimeout(
      this.temporizadorBorradorTitular
    );
  }

  this.temporizadorBorradorTitular =
    setTimeout(
      () => {
        this.temporizadorBorradorTitular =
          null;

        this.guardarBorradorTitularAhora();
      },
      this.demoraAutosaveBorradorMs
    );
}


private guardarBorradorTitularAhora():
  void {

  const registro =
    this.codigoSolicitud.trim();

  if (
    !registro
    || this.solicitudBloqueada
  ) {
    return;
  }

  const payload:
    GuardarBorradorTitularRequestLocal = {

    correo:
      this.form.correoViva,

    celular:
      this.form.celular
  };

  this.vidaApiService
    .guardarBorradorTitular(
      registro,
      payload
    )
    .subscribe({
      next: respuesta => {

        console.log(
          'Borrador del titular guardado:',
          {
            codigoEstadoProceso:
              respuesta.codigoEstadoProceso,

            codigoEstadoNavegacion:
              respuesta
                .codigoEstadoNavegacion
          }
        );
      },

      error: (error: unknown) => {

        console.error(
          'No fue posible guardar automáticamente el borrador del titular:',
          error
        );
      }
    });
}


programarGuardadoBorradorDatosComplementarios():
  void {

  if (
    this.solicitudBloqueada
    || this.aplicandoRecuperacionVisual
  ) {
    return;
  }

  if (!this.codigoSolicitud.trim()) {
    return;
  }

  if (
    this
      .temporizadorBorradorDatosComplementarios
  ) {
    clearTimeout(
      this
        .temporizadorBorradorDatosComplementarios
    );
  }

  this
    .temporizadorBorradorDatosComplementarios =
      setTimeout(
        () => {

          this
            .temporizadorBorradorDatosComplementarios =
              null;

          this
            .guardarBorradorDatosComplementariosAhora();
        },
        this.demoraAutosaveBorradorMs
      );
}


private guardarBorradorDatosComplementariosAhora():
  void {

  const registro =
    this.codigoSolicitud.trim();

  if (
    !registro
    || this.solicitudBloqueada
  ) {
    return;
  }

  const payload:
    GuardarBorradorDatosComplementariosRequestLocal = {

    codigoPlanilla:
      this.form.codigoPlanilla,

    decretoLegislativo:
      this.form.decretoLegislativo,

    convenioCgbvp:
      this.form.convenioCGBVP === 'SI'
        ? 'SI'
        : 'NO',

    rucEmpleador:
      this.form.rucEmpleador,

    razonSocial:
      this.form.razonSocial
  };

  this.vidaApiService
    .guardarBorradorDatosComplementarios(
      registro,
      payload
    )
    .subscribe({
      next: respuesta => {

        console.log(
          'Borrador de datos complementarios guardado:',
          {
            codigoEstadoProceso:
              respuesta.codigoEstadoProceso,

            codigoEstadoNavegacion:
              respuesta
                .codigoEstadoNavegacion
          }
        );
      },

      error: (error: unknown) => {

        console.error(
          'No fue posible guardar automáticamente el borrador de datos complementarios:',
          error
        );
      }
    });
}


programarGuardadoBorradorBeneficiarios():
  void {

  if (
    this.solicitudBloqueada
    || this.aplicandoRecuperacionVisual
  ) {
    return;
  }

  if (!this.codigoSolicitud.trim()) {
    return;
  }

  if (
    this.temporizadorBorradorBeneficiarios
  ) {
    clearTimeout(
      this.temporizadorBorradorBeneficiarios
    );
  }

  this.temporizadorBorradorBeneficiarios =
    setTimeout(
      () => {

        this.temporizadorBorradorBeneficiarios =
          null;

        this
          .guardarBorradorBeneficiariosAhora();
      },
      this.demoraAutosaveBorradorMs
    );
}


private guardarBorradorBeneficiariosAhora():
  void {

  const registro =
    this.codigoSolicitud.trim();

  if (
    !registro
    || this.solicitudBloqueada
  ) {
    return;
  }

  const beneficiariosPayload:
    BeneficiarioBorradorRequestLocal[] =
      this.form.beneficiarios.map(
        beneficiario => {

          const tipoDocumento =
            (
              beneficiario.tipoDocumento
              || ''
            ).trim();

          const descripcionOtroDocumento =
            tipoDocumento !== '01'
            && tipoDocumento !== '04'
              ? (
                  beneficiario
                    .otroTipoDocumento
                  || this
                    .getDescripcionTipoDocumento(
                      tipoDocumento
                    )
                )
              : null;

          const porcentajeTexto =
            (
              beneficiario.porcentaje
              || ''
            ).trim();

          const porcentajeNumero =
            Number(
              porcentajeTexto
            );

          const porcentaje:
            number | null =
              porcentajeTexto === ''
              || Number.isNaN(
                porcentajeNumero
              )
                ? null
                : porcentajeNumero;

          return {
            tipoDocumento,

            descripcionOtroDocumento:
              descripcionOtroDocumento
              || null,

            numeroDocumento:
              beneficiario.numeroDocumento
              || '',

            apellidoPaterno:
              beneficiario.apellidoPaterno
              || '',

            apellidoMaterno:
              beneficiario.apellidoMaterno
              || '',

            primerNombre:
              beneficiario.primerNombre
              || '',

            segundoNombre:
              beneficiario.segundoNombre
              || '',

            porcentaje
          };
        }
      );

  const beneficiarioBorradorAbierto =
    this.form.beneficiarios.some(
      beneficiario =>
        !this.beneficiarioTieneDatos(
          beneficiario
        )
    );

  const payload:
    GuardarBorradorBeneficiariosRequestLocal = {

    beneficiarios:
      beneficiariosPayload,

    beneficiarioBorradorAbierto
  };

  this.vidaApiService
    .guardarBorradorBeneficiarios(
      registro,
      payload
    )
    .subscribe({
      next: respuesta => {

        console.log(
          'Borrador de beneficiarios guardado:',
          {
            cantidadEnFormulario:
              beneficiariosPayload.length,

            codigoEstadoProceso:
              respuesta.codigoEstadoProceso,

            codigoEstadoNavegacion:
              respuesta
                .codigoEstadoNavegacion
          }
        );
      },

      error: (error: unknown) => {

        console.error(
          'No fue posible guardar automáticamente el borrador de beneficiarios:',
          error
        );
      }
    });
}

obtenerDocumentoEmpleadoAutenticado(): { tipoDocumento: string; numeroDocumento: string } {
  // Temporal: simula el documento entregado por el sistema institucional de empleados.
  // Luego esto se reemplaza por la integración real.
  return {
    tipoDocumento: '01',
    numeroDocumento: '03700150'
  };
}

cargarCasoNuevo(): void {
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.cerrarAviso();

  this.form =
  this.vidaTramiteStateService
    .crearCasoNuevo();

  this.reiniciarFlujoPorPasos();

  this.vidaTramiteStateService
    .marcarInicializado();

  this.cargarTiposDocumentoDesdeServicio();

  this.cargarSustentosVidaDesdeServicio();

  this.cargarTitularDesdeSistemaEmpleado();

  this.scrollArriba();
}

cargarTitularDesdeSistemaEmpleado(): void {
  const documentoEmpleado = this.obtenerDocumentoEmpleadoAutenticado();

  this.cargandoDatosTitular = true;
  this.errorDatosTitular = '';

  this.resetearValidacionSeguroComplementario();
  this.resetearTipoAseguradoTitular();
  this.limpiarDatosTitularConsultados();

  // Documento temporal entregado por el sistema institucional.
  // Para la prueba utilizará: DNI 03700150.
  this.form.titular.tipoDocumento = documentoEmpleado.tipoDocumento;
  this.form.titular.numeroDocumento = documentoEmpleado.numeroDocumento;

  console.log('Consultando titular y contacto:', documentoEmpleado);

  this.vidaApiService
    .obtenerInformacionPersonaContacto(
      documentoEmpleado.tipoDocumento,
      documentoEmpleado.numeroDocumento
    )
    .subscribe({
      next: (respuesta: RespuestaPersonaContactoApi) => {
        this.cargandoDatosTitular = false;

        console.log(
          'Respuesta del servicio de titular y contacto:',
          respuesta
        );

        const consultaCorrecta =
          String(respuesta.codResultado).trim() === '0'
          && !!respuesta.representanteDto;

        if (!consultaCorrecta) {
          this.errorDatosTitular =
            respuesta.mensaje?.trim()
            || 'No se encontró información del titular para el documento indicado.';

          this.mostrarAviso(
            this.errorDatosTitular,
            'error',
            'Titular no encontrado',
            true
          );

          return;
        }

        const datosTitular = respuesta.representanteDto!;

        // Nombres y apellidos del titular.
        this.asignarDatosPersonaDesdeServicio(
          this.form.titular,
          datosTitular
        );

        // Correo y celular registrados.
        this.actualizarContactoTitularDesdeServicio(
          datosTitular
        );

        /*
        * Se valida institucionalmente si el titular
        * ya cuenta con +Vida Seguro de Accidentes.
        */
        this.validarSeguroComplementarioTitular();

        this
        .obtenerTipoAseguradoTitularDesdeServicio();

        // Se mantienen temporales los datos laborales y el empleador.
        this.precargarDatosLaboralesSimulados();
        this.precargarEmpleadorEssalud();

        this.iniciarORecuperarProcesoVida();

        this.mostrarAviso(
          'Los datos del titular y de contacto fueron cargados correctamente.',
          'exito',
          'Titular encontrado'
        );
      },

      error: (error: unknown) => {
        this.cargandoDatosTitular = false;

        this.errorDatosTitular =
          'No fue posible consultar los datos del titular y de contacto. Verifique la conexión con la red de EsSalud.';

        this.mostrarAviso(
          this.errorDatosTitular,
          'error',
          'Servicio no disponible',
          true
        );

        console.error(
          'Error consultando titular y contacto:',
          error
        );
      }
    });
}

consultarConyugeConcubino(
  forzarConsulta = false
): void {
  if (this.cargandoConyuge) {
    return;
  }

  if (
    this.conyugeConsultado
    && !forzarConsulta
  ) {
    return;
  }

  const tipoDocumento =
    this.form.titular.tipoDocumento;

  const numeroDocumento =
    this.form.titular.numeroDocumento;

  if (
    this.tipoDocumentoVacio(this.form.titular)
    || this.numeroDocumentoInvalido(this.form.titular)
  ) {
    this.errorConyuge =
      'No se puede consultar al cónyuge o concubino porque el documento del titular no es válido.';

    this.conyugeConsultado = false;
    return;
  }

  this.cargandoConyuge = true;
  this.conyugeConsultado = false;
  this.errorConyuge = '';

  this.form.conyuge = null;
  this.form.conyugeDesdeBase = false;

  console.log(
    'Consultando cónyuge o concubino:',
    {
      tipoDocumento,
      numeroDocumento
    }
  );

  this.vidaApiService
    .obtenerConyugeConcubino(
      tipoDocumento,
      numeroDocumento
    )
    .subscribe({
      next: (
        respuesta:
          RespuestaConyugeConcubinoApi
      ) => {
        this.cargandoConyuge = false;
        this.conyugeConsultado = true;

        console.log(
          'Respuesta del servicio de cónyuge o concubino:',
          respuesta
        );

        /*
         * El servicio actualmente devuelve flagResultado "0"
         * cuando encuentra a la persona.
         *
         * Para evitar depender de una convención distinta a otros
         * servicios, se toma la existencia de persona como resultado
         * principal.
         */
        if (!respuesta.persona) {
          this.form.conyuge = null;
          this.form.conyugeDesdeBase = false;
          return;
        }

        const tipoDocumentoConyuge =
        this.normalizarTextoServicio(
          respuesta.persona.tpDocumento
        );

      const numeroDocumentoConyuge =
        this.normalizarTextoServicio(
          respuesta.persona.nrDocumento
        );

      const apellidoPaterno =
        this.normalizarTextoServicio(
          respuesta.persona.apellidoPaterno
        );

      const apellidoMaterno =
        this.normalizarTextoServicio(
          respuesta.persona.apellidoMaterno
        );

      const nombres =
        this.normalizarTextoServicio(
          respuesta.persona.nombre
        );

      const tipoRelacion =
        this.normalizarTextoServicio(
          respuesta.persona.tipoRelacion
        );

        if (
          !tipoDocumentoConyuge
          || !numeroDocumentoConyuge
          || !apellidoPaterno
          || !apellidoMaterno
          || !nombres
          || !tipoRelacion
        ) {
          this.conyugeConsultado = false;

          this.errorConyuge =
            'El servicio devolvió información incompleta del cónyuge o concubino.';

          return;
        }

        const partesNombres =
          nombres
            .split(/\s+/)
            .filter(parte => parte !== '');

        this.form.conyuge = {
        tipoDocumento:
          tipoDocumentoConyuge,

        numeroDocumento:
          numeroDocumentoConyuge,

          nombres: [
            apellidoPaterno,
            apellidoMaterno,
            nombres
          ].join(' '),

          apellidoPaterno,
          apellidoMaterno,

          primerNombre:
            partesNombres[0] || '',

          segundoNombre:
            partesNombres
              .slice(1)
              .join(' '),

          tipoRelacion
        };

        this.form.conyugeDesdeBase = true;
      },

      error: (error: unknown) => {
        this.cargandoConyuge = false;
        this.conyugeConsultado = false;

        this.form.conyuge = null;
        this.form.conyugeDesdeBase = false;

        this.errorConyuge =
          'No fue posible consultar la información del cónyuge o concubino. Verifique la conexión con la red de EsSalud.';

        console.error(
          'Error consultando cónyuge o concubino:',
          error
        );
      }
    });
}

precargarEmpleadorEssalud(): void {
  this.empresasEmpleador = [];
  this.cargandoEmpleador = false;
  this.errorEmpleador = '';

  this.form.rucEmpleador = '20131257750';
  this.form.razonSocial = 'SEGURO SOCIAL DE SALUD';
  this.form.rucDesdeBase = true;
  this.form.razonSocialDesdeBase = true;
}

precargarDatosLaboralesSimulados(): void {
  this.form.codigoPlanilla = '77777777';
  this.form.decretoLegislativo = '728';
  this.form.convenioCGBVP = 'NO';
}

cargarTiposDocumentoDesdeServicio(): void {
  this.vidaApiService
    .obtenerTiposDocumentos()
    .subscribe({
      next: tipos => {
        this.tiposDocumento =
          tipos.map(tipo => ({
            codigo:
              tipo.idtipodocumento.trim(),

            descripcion:
              tipo.descripcion.trim()
          }));

        console.log(
          'Tipos de documento cargados:',
          this.tiposDocumento
        );
      },

      error: () => {
        this.tiposDocumento = [
          ...this.tiposDocumentoRespaldo
        ];

        this.mostrarAviso(
          'No se pudo conectar con el catálogo oficial. Se usará una lista temporal de documentos.',
          'advertencia'
        );
      }
    });
}

cargarSustentosVidaDesdeServicio():
  void {

  if (
    this
      .cargandoSustentosSeguroComplementario
  ) {
    return;
  }

  this
    .cargandoSustentosSeguroComplementario =
      true;

  this
    .errorSustentosSeguroComplementario =
      '';

  this
    .sustentosSeguroComplementario =
      [];

  this.vidaApiService
    .obtenerSustentosSeguroComplementario(
      '0600'
    )
    .subscribe({

      next: (
        sustentos:
          SustentoSeguroComplementarioApi[]
      ) => {

        this
          .cargandoSustentosSeguroComplementario =
            false;

        this
          .sustentosSeguroComplementario =
            sustentos;

        console.log(
          'Sustentos institucionales de +Vida:',
          sustentos
        );

        const formulario6012 =
          sustentos.find(
            sustento =>
              sustento
                .codElementoTabla
                ?.trim()
              === '244'
          );

        const autorizacionDescuento =
          sustentos.find(
            sustento =>
              sustento
                .codElementoTabla
                ?.trim()
              === '247'
          );

        console.log(
          'Catálogo documental +Vida interpretado:',
          {
            formulario6012,
            autorizacionDescuento
          }
        );

        if (
          !formulario6012
          || !autorizacionDescuento
        ) {
          this
            .errorSustentosSeguroComplementario =
              'El catálogo institucional de +Vida no devolvió todos los tipos de sustento esperados.';

          console.warn(
            this
              .errorSustentosSeguroComplementario
          );
        }
      },

      error: (
        error: unknown
      ) => {

        this
          .cargandoSustentosSeguroComplementario =
            false;

        this
          .errorSustentosSeguroComplementario =
            'No fue posible consultar los tipos de sustento de +Vida.';

        console.error(
          this
            .errorSustentosSeguroComplementario,
          error
        );
      }
    });
}

validarSeguroComplementarioTitular(): void {
  const tipoDocumento = this.form.titular.tipoDocumento;
  const numeroDocumento = this.form.titular.numeroDocumento;

  this.seguroComplementarioValidado = false;
  this.titularTieneSeguroComplementario = false;
  this.mensajeSeguroComplementario = '';
  this.errorValidacionSeguroComplementario = '';

  this.vidaApiService.validarSeguroComplementario(tipoDocumento, numeroDocumento).subscribe({
    next: respuesta => {
      this.titularTieneSeguroComplementario = respuesta.tieneSeguro;
      this.seguroComplementarioValidado = true;

      if (respuesta.tieneSeguro) {
        this.mensajeSeguroComplementario =
          `El titular ya cuenta con +Vida Seguro de Accidentes registrado. No corresponde una nueva afiliación${respuesta.nombreSeguro ? ' (' + respuesta.nombreSeguro + ').' : '.'}`;
      } else {
        this.mensajeSeguroComplementario =
          'El titular no cuenta con +Vida Seguro de Accidentes registrado. Puede continuar con la afiliación.';

        this.mostrarAviso(
          'Validación completada. Puede continuar con la afiliación.',
          'exito',
          '+Vida validado'
        );
      }

      console.log('Validación seguro complementario:', respuesta);
    },
    error: () => {
      this.seguroComplementarioValidado = false;
      this.errorValidacionSeguroComplementario =
        'No fue posible validar si el titular cuenta con +Vida Seguro de Accidentes. Verifique la conexión o intente nuevamente.';

      this.mostrarAviso(
        'No fue posible validar +Vida para este documento.',
        'error',
        'Validación pendiente',
        true
      );

      console.error(this.errorValidacionSeguroComplementario);
    }
  });
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

crearBeneficiarioVacio(): Beneficiario {
  return {
    tipoDocumento: '01',
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

    /*
    * No necesitamos múltiples formularios
    * completamente vacíos abiertos.
    */
    const yaExisteFormularioVacio =
      this.form.beneficiarios.some(
        beneficiario =>
          !this.beneficiarioTieneDatos(
            beneficiario
          )
      );

    if (yaExisteFormularioVacio) {
      return;
    }

    this.form.beneficiarios.push(
      this.crearBeneficiarioVacio()
    );

    /*
    * El click no genera un evento input,
    * por eso persistimos explícitamente
    * el estado visual del borrador.
    */
    this
      .programarGuardadoBorradorBeneficiarios();
  }

  quitarBeneficiario(
    index: number
  ): void {

    this.form.beneficiarios.splice(
      index,
      1
    );

    if (
      this.form.beneficiarios.length === 0
      && this.pasoActual ===
        'beneficiarios'
    ) {
      this.asegurarBeneficiarioInicial();
    }

    this
      .programarGuardadoBorradorBeneficiarios();
  }

  soloNumeros(valor: string): string {
    return (valor || '').replace(/\D/g, '');
  }

  limpiarRuc(): void {
    this.form.rucEmpleador = this.soloNumeros(this.form.rucEmpleador);
  }

  limpiarCelular(): void {
    this.form.celular = this.soloNumeros(this.form.celular);
  }

  getDescripcionTipoDocumento(codigo?: string): string {
    const codigoLimpio = (codigo || '').trim();

    if (!codigoLimpio) {
      return '';
    }

    const tipo = [...this.tiposDocumento, ...this.tiposDocumentoRespaldo]
      .find(item => item.codigo === codigoLimpio);

    return tipo?.descripcion || codigoLimpio;
  }

limpiarDatosTitularConsultados(): void {
  this.form.titular.nombres = '';
  this.form.titular.apellidoPaterno = '';
  this.form.titular.apellidoMaterno = '';
  this.form.titular.primerNombre = '';
  this.form.titular.segundoNombre = '';

  this.form.correoViva = '';
  this.form.celular = '';
}

resetearValidacionSeguroComplementario(): void {
  this.seguroComplementarioValidado = false;
  this.titularTieneSeguroComplementario = false;
  this.mensajeSeguroComplementario = '';
  this.errorValidacionSeguroComplementario = '';
}

obtenerEmpleadorTitularDesdeServicio(): void {
  if (
    this.tipoDocumentoVacio(this.form.titular)
    || this.numeroDocumentoInvalido(this.form.titular)
  ) {
    return;
  }

  this.cargandoEmpleador = true;
  this.errorEmpleador = '';

  this.vidaApiService
    .obtenerListaEmpresas(
      this.form.titular.tipoDocumento,
      this.form.titular.numeroDocumento
    )
    .subscribe({
      next: (empresas: EmpresaEmpleadorApi[]) => {
        this.cargandoEmpleador = false;
        this.empresasEmpleador = empresas || [];

        if (this.empresasEmpleador.length === 0) {
          this.errorEmpleador =
            'No se encontró empleador registrado para el titular.';

          this.form.rucDesdeBase = false;
          this.form.razonSocialDesdeBase = false;

          this.mostrarAviso(
            'No se encontró empleador registrado para el titular.',
            'advertencia',
            'Empleador no encontrado'
          );
          return;
        }

        this.seleccionarEmpleador(this.empresasEmpleador[0]);

        if (this.empresasEmpleador.length === 1) {
          this.mostrarAviso(
            'Empleador cargado correctamente.',
            'exito',
            'Empleador encontrado'
          );
          return;
        }

        this.mostrarAviso(
          'Se encontró más de un empleador. Revise la selección en Datos laborales.',
          'advertencia',
          'Empleadores encontrados'
        );
      },
      error: () => {
        this.cargandoEmpleador = false;
        this.errorEmpleador =
          'No se pudo consultar el empleador del titular.';

        this.form.rucDesdeBase = false;
        this.form.razonSocialDesdeBase = false;

        this.mostrarAviso(
          'No se pudo consultar el empleador del titular.',
          'advertencia',
          'Empleador no disponible'
        );
      }
    });
}

seleccionarEmpleador(empresa: EmpresaEmpleadorApi): void {
  this.form.rucEmpleador = (empresa.RUC || '').trim();
  this.form.razonSocial = (empresa.RAZON_SOCIAL || '').trim().toUpperCase();

  this.form.rucDesdeBase = !this.campoVacio(this.form.rucEmpleador);
  this.form.razonSocialDesdeBase = !this.campoVacio(this.form.razonSocial);
}

alternarAyudaCgbvp(): void {
  this.mostrarAyudaCgbvp = !this.mostrarAyudaCgbvp;
}

cerrarAyudaCgbvp(): void {
  this.mostrarAyudaCgbvp = false;
}

resetearTipoAseguradoTitular(): void {
  this.cargandoTipoAsegurado = false;
  this.tipoAseguradoValidado = false;
  this.errorTipoAsegurado = '';
}

obtenerTipoAseguradoTitularDesdeServicio():
  void {

  if (
    this.tipoDocumentoVacio(
      this.form.titular
    )
    || this.numeroDocumentoInvalido(
      this.form.titular
    )
  ) {
    return;
  }

  this.cargandoTipoAsegurado =
    true;

  this.tipoAseguradoValidado =
    false;

  this.errorTipoAsegurado =
    '';

  this.vidaApiService
    .obtenerTipoAsegurado(
      this.form.titular
        .tipoDocumento,

      this.form.titular
        .numeroDocumento
    )
    .subscribe({

      next: (
        respuesta:
          TipoAseguradoApi
      ) => {

        this.cargandoTipoAsegurado =
          false;

        console.log(
          'Tipo de asegurado institucional:',
          respuesta
        );

        const tipoAsegurado =
          this
            .normalizarTipoAseguradoDesdeServicio(
              respuesta.descripcion
            );

        if (!tipoAsegurado) {

          this.tipoAseguradoValidado =
            false;

          this.errorTipoAsegurado =
            'El servicio devolvió un tipo de asegurado que no pudo ser interpretado.';

          this.mostrarAviso(
            this.errorTipoAsegurado,
            'advertencia',
            'Tipo de asegurado no reconocido'
          );

          return;
        }

        this.form.tipoAsegurado =
          tipoAsegurado;

        this.tipoAseguradoValidado =
          true;

        this.errorTipoAsegurado =
          '';

        console.log(
          'Tipo de asegurado aplicado al formulario:',
          {
            codEmodalidadCobertura:
              respuesta
                .codEmodalidadCobertura,

            descripcion:
              respuesta.descripcion,

            tipoFormulario:
              this.form.tipoAsegurado
          }
        );
      },

      error: (
        error: unknown
      ) => {

        this.cargandoTipoAsegurado =
          false;

        this.tipoAseguradoValidado =
          false;

        this.errorTipoAsegurado =
          'No fue posible consultar el tipo de asegurado del titular.';

        console.error(
          'No fue posible consultar get-tp-seguro:',
          error
        );

        this.mostrarAviso(
          this.errorTipoAsegurado,
          'error',
          'Tipo de asegurado no disponible',
          true
        );
      }
    });
}

normalizarTipoAseguradoDesdeServicio(valor?: string | null): TipoAsegurado | null {
  const tipo = (valor || '').trim().toUpperCase();

  if (tipo.includes('REGULAR')) {
    return 'Regular';
  }

  if (tipo.includes('AGRARIO')) {
    return 'Agrario';
  }

  if (tipo.includes('POTESTATIVO')) {
    return 'Potestativo';
  }

  return null;
}

textoTipoAseguradoTitular(): string {
  if (this.cargandoTipoAsegurado) {
    return 'Consultando...';
  }

  if (!this.tipoAseguradoValidado) {
    return 'Pendiente de carga';
  }

  return this.form.tipoAsegurado;
}

  consultarInformacionPersona(
  persona: PersonaDocumento,
  contexto: ContextoConsultaPersona
): void {
  if (this.tipoDocumentoVacio(persona) || this.numeroDocumentoInvalido(persona)) {
    this.mostrarAviso(
      'Ingrese un tipo y número de documento válido antes de consultar.',
      'advertencia',
      'Documento requerido'
    );
    return;
  }

  this.consultandoInformacionPersona = true;

  this.vidaApiService
    .obtenerInformacionPersonaContacto(persona.tipoDocumento, persona.numeroDocumento)
    .subscribe({
      next: (respuesta: RespuestaPersonaContactoApi) => {
        this.consultandoInformacionPersona = false;

        if (respuesta.codResultado !== '0' || !respuesta.representanteDto) {
          this.mostrarAviso(
            respuesta.mensaje || 'No se encontró información para el documento ingresado.',
            'advertencia',
            'Sin resultados'
          );
          return;
        }

        this.asignarDatosPersonaDesdeServicio(persona, respuesta.representanteDto);

        if (contexto === 'titular') {

          this.actualizarContactoTitularDesdeServicio(
            respuesta.representanteDto
          );

          this.validarSeguroComplementarioTitular();

          this
            .obtenerTipoAseguradoTitularDesdeServicio();

          this.obtenerEmpleadorTitularDesdeServicio();

          return;
        }

        if (contexto === 'beneficiario') {
          this
            .programarGuardadoBorradorBeneficiarios();
        }

        this.mostrarAviso(
          `Datos de ${this.obtenerEtiquetaContextoPersona(contexto)} cargados correctamente.`,
          'exito',
          'Datos encontrados'
        );
      },
      error: () => {
        this.consultandoInformacionPersona = false;

        this.mostrarAviso(
          'No se pudo consultar la información de la persona. Verifique conexión a la red de EsSalud.',
          'error',
          'Consulta no disponible'
        );
      }
    });
}

asignarDatosPersonaDesdeServicio(
  persona: PersonaDocumento,
  datos: RepresentanteDtoApi
): void {
  const apellidoPaterno = this.normalizarTextoServicio(datos.apellidoPaterno);
  const apellidoMaterno = this.normalizarTextoServicio(datos.apellidoMaterno);
  const nombres = this.normalizarTextoServicio(datos.nombres);

  const partesNombres = nombres.split(/\s+/).filter(parte => parte !== '');

  persona.apellidoPaterno = apellidoPaterno;
  persona.apellidoMaterno = apellidoMaterno;
  persona.primerNombre = partesNombres[0] || '';
  persona.segundoNombre = partesNombres.slice(1).join(' ');
  persona.nombres = [
    apellidoPaterno,
    apellidoMaterno,
    persona.primerNombre,
    persona.segundoNombre
  ]
    .filter(parte => parte && parte.trim() !== '')
    .join(' ');
}

actualizarContactoTitularDesdeServicio(datos: RepresentanteDtoApi): void {
  const correo = datos.correo?.trim() || '';
  const celular = this.soloNumeros(datos.celular || '');

  if (correo) {
    this.form.correoViva = correo;
  }

  if (celular) {
    this.form.celular = celular.slice(0, 9);
  }
}

iniciarORecuperarProcesoVida(): void {
  if (this.iniciandoProcesoVida) {
    return;
  }

  if (
    this.procesoVidaInicializado
    && this.codigoSolicitud.trim()
  ) {
    return;
  }

  const payload:
    IniciarProcesoVidaRequestLocal = {

    tipoDocumentoTitular:
      this.form.titular.tipoDocumento,

    descripcionOtroDocumentoTitular:
      this.form.titular.otroTipoDocumento
      || null,

    numeroDocumentoTitular:
      this.form.titular.numeroDocumento,

    apellidoPaternoTitular:
      this.form.titular.apellidoPaterno,

    apellidoMaternoTitular:
      this.form.titular.apellidoMaterno,

    primerNombreTitular:
      this.form.titular.primerNombre,

    segundoNombreTitular:
      this.form.titular.segundoNombre
  };

  this.iniciandoProcesoVida = true;

  console.log(
    'Iniciando o recuperando proceso +Vida:',
    payload
  );

  this.vidaApiService
    .iniciarProcesoVida(payload)
    .subscribe({
      next: (
        respuesta:
          IniciarProcesoVidaResponseLocal
      ) => {
        this.iniciandoProcesoVida = false;

        this.codigoSolicitud =
          respuesta.registroInternoProceso;

        this.procesoVidaInicializado = true;

        console.log(
          'Proceso +Vida disponible:',
          {
            procesoCreado:
              respuesta.procesoCreado,

            registroInternoProceso:
              respuesta.registroInternoProceso,

            codigoEstadoProceso:
              respuesta.codigoEstadoProceso,

            rutaFrontend:
              respuesta.rutaFrontend
          }
        );
        /*
          * Si el backend reutilizó un proceso existente,
          * recuperamos desde Oracle todo el estado
          * persistido antes de permitir continuar.
          */
          if (respuesta.procesoCreado === false) {
            this.recuperarProcesoVidaPersistido(
              respuesta.registroInternoProceso
            );

            return;
          }
      },

      error: (error: unknown) => {
        this.iniciandoProcesoVida = false;
        this.procesoVidaInicializado = false;

        console.error(
          'No fue posible iniciar o recuperar el proceso +Vida:',
          error
        );

        this.mostrarAviso(
          'No fue posible preparar el guardado del trámite. Intente nuevamente.',
          'error',
          'Proceso no disponible',
          true
        );
      }
    });
}

private recuperarProcesoVidaPersistido(
  registroInternoProceso: string
): void {

  if (this.recuperandoAvanceProceso) {
    return;
  }

  const registro =
    registroInternoProceso.trim();

  if (!registro) {
    return;
  }

  this.recuperandoAvanceProceso =
    true;

  console.log(
    'Recuperando proceso +Vida persistido:',
    registro
  );

  this.vidaApiService
    .recuperarAvanceProceso(registro)
    .subscribe({
      next: (
        recupero:
          RecuperarAvanceProcesoResponseLocal
      ) => {
        this.recuperandoAvanceProceso =
          false;

        console.log(
          'Proceso +Vida recuperado desde Oracle:',
          recupero
        );

        this.aplicarProcesoVidaRecuperado(
          recupero
        );
      },

      error: (error: unknown) => {
        this.recuperandoAvanceProceso =
          false;

        console.error(
          'No fue posible recuperar el avance persistido:',
          error
        );

        this.mostrarAviso(
          'El proceso existe, pero no fue posible recuperar su avance guardado. Intente nuevamente.',
          'error',
          'Recuperación no disponible',
          true
        );
      }
    });
}

private aplicarProcesoVidaRecuperado(
  recupero:
    RecuperarAvanceProcesoResponseLocal
): void {

  const formulario =
    recupero.formularioVida;

  if (!formulario) {
    this.mostrarAviso(
      'El backend encontró el proceso, pero no devolvió los datos necesarios para reconstruir el trámite.',
      'error',
      'Recuperación incompleta',
      true
    );

    return;
  }

  const titular =
    formulario.titular;

  /*
   * Titular
   */
  this.form.titular = {
    tipoDocumento:
      titular.tipoDocumento || '01',

    otroTipoDocumento:
      titular.descripcionOtroDocumento
      || undefined,

    numeroDocumento:
      titular.numeroDocumento || '',

    apellidoPaterno:
      titular.apellidoPaterno || '',

    apellidoMaterno:
      titular.apellidoMaterno || '',

    primerNombre:
      titular.primerNombre || '',

    segundoNombre:
      titular.segundoNombre || '',

    nombres:
      this.construirNombreRecuperado(
        titular.apellidoPaterno,
        titular.apellidoMaterno,
        titular.primerNombre,
        titular.segundoNombre
      )
  };

  this.form.correoViva =
    titular.correo?.trim()
    || '';

  this.form.celular =
    titular.celular?.trim()
    || '';

  const tipoAseguradoRecuperado =
    this.normalizarTipoAseguradoDesdeServicio(
      titular.tipoAsegurado
    );

  if (tipoAseguradoRecuperado) {
    this.form.tipoAsegurado =
      tipoAseguradoRecuperado;
  }

  this.form.notificacionesCorreo =
    titular.notificacionesCorreo?.trim()
    || '';

  /*
   * Datos complementarios
   */
  const datosComplementarios =
    formulario.datosComplementarios;

  this.form.codigoPlanilla =
    datosComplementarios
      .codigoPlanilla
      ?.trim()
    || '';

  this.form.decretoLegislativo =
    datosComplementarios
      .decretoLegislativo
      ?.trim()
    || '';

  this.form.convenioCGBVP =
    datosComplementarios
      .convenioCgbvp
      ?.trim()
    || 'NO';

  this.form.rucEmpleador =
    datosComplementarios
      .rucEmpleador
      ?.trim()
    || '';

  this.form.razonSocial =
    datosComplementarios
      .razonSocial
      ?.trim()
    || '';

  /*
   * Estas banderas son únicamente de interfaz.
   * No se recuperan como datos de negocio.
   */
  this.form.rucDesdeBase =
    !this.campoVacio(
      this.form.rucEmpleador
    );

  this.form.razonSocialDesdeBase =
    !this.campoVacio(
      this.form.razonSocial
    );

  /*
   * Cónyuge / concubino
   */
  const conyuge =
    formulario.conyuge;

  if (conyuge) {
    this.form.conyuge = {
      tipoDocumento:
        conyuge.tipoDocumento || '',

      otroTipoDocumento:
        conyuge.descripcionOtroDocumento
        || undefined,

      numeroDocumento:
        conyuge.numeroDocumento || '',

      apellidoPaterno:
        conyuge.apellidoPaterno || '',

      apellidoMaterno:
        conyuge.apellidoMaterno || '',

      primerNombre:
        conyuge.primerNombre || '',

      segundoNombre:
        conyuge.segundoNombre || '',

      nombres:
        this.construirNombreRecuperado(
          conyuge.apellidoPaterno,
          conyuge.apellidoMaterno,
          conyuge.primerNombre,
          conyuge.segundoNombre
        ),

      tipoRelacion:
        conyuge.tipoRelacion || ''
    };

    this.form.conyugeDesdeBase =
      true;

  } else {
    this.form.conyuge =
      null;

    this.form.conyugeDesdeBase =
      false;
  }

  /*
   * Beneficiarios
   */
  this.form.beneficiarios =
  (formulario.beneficiarios || [])
    .map(beneficiario => ({
      tipoDocumento:
        beneficiario.tipoDocumento
        || '01',

      otroTipoDocumento:
        beneficiario
          .descripcionOtroDocumento
        || undefined,

      numeroDocumento:
        beneficiario.numeroDocumento
        || '',

      apellidoPaterno:
        beneficiario.apellidoPaterno
        || '',

      apellidoMaterno:
        beneficiario.apellidoMaterno
        || '',

      primerNombre:
        beneficiario.primerNombre
        || '',

      segundoNombre:
        beneficiario.segundoNombre
        || '',

      nombres:
        this.construirNombreRecuperado(
          beneficiario.apellidoPaterno,
          beneficiario.apellidoMaterno,
          beneficiario.primerNombre,
          beneficiario.segundoNombre
        ),

      porcentaje:
        String(
          beneficiario.porcentaje
          ?? ''
        )
    }));

/*
 * La fila vacía no representa un
 * beneficiario real y por eso no existe
 * en BENEFICIARIO.
 *
 * Se reconstruye únicamente a partir
 * del estado temporal del borrador.
 */
if (
  formulario
    .beneficiarioBorradorAbierto
  === true
) {
  this.form.beneficiarios.push(
    this.crearBeneficiarioVacio()
  );
}

  /*
   * Aceptaciones.
   */
  const aceptacion =
    formulario.aceptacionLegal;

  this.aceptaTerminosDeclaracion =
    aceptacion
      ?.aceptaDeclaracionJurada
    === true;

  this.aceptaTratamientoDatos =
    aceptacion
      ?.aceptaTratamientoDatosPersonales
    === true;

  /*
   * Si el trámite ya superó el titular,
   * no volvemos a exigir las validaciones
   * transitorias del navegador para poder
   * reanudarlo.
   */
  if (
    recupero.codigoEstadoProceso
    !== 'DATOS_TITULAR'
  ) {
    this.seguroComplementarioValidado =
      true;

    this.titularTieneSeguroComplementario =
      false;

    this.errorValidacionSeguroComplementario =
      '';

    this.tipoAseguradoValidado =
      true;

    this.errorTipoAsegurado =
      '';

    this.errorDatosTitular =
      '';
  }

  /*
 * Durante la reconstrucción no permitimos que
 * cada cambio interno de paso dispare una
 * navegación Angular.
 *
 * Primero reconstruimos el máximo alcanzado,
 * luego aplicamos la ubicación persistida y
 * finalmente sincronizamos una sola ruta.
 */
this.aplicandoRecuperacionVisual =
  true;

try {
  this.configurarEstadoVisualRecuperado(
    recupero
  );

  this.aplicarNavegacionRecuperada(
    recupero
  );

} finally {
  this.aplicandoRecuperacionVisual =
    false;
}

/*
 * En este momento pasoActual ya representa
 * la ubicación definitiva recuperada.
 */
this.sincronizarRutaConPaso(
  this.pasoActual
);

  console.log(
    'Estado Angular rehidratado:',
    {
      registroInternoProceso:
        this.codigoSolicitud,

      codigoEstadoProceso:
        recupero.codigoEstadoProceso,

      rutaFrontend:
        recupero.rutaFrontend,

      tipoFlujo:
        recupero.tipoFlujo,

      pasoActual:
        this.pasoActual,

      cantidadBeneficiarios:
        this.form.beneficiarios.length
    }
  );

  this.mostrarAviso(
    'Se recuperó el avance guardado de su trámite.',
    'exito',
    'Trámite recuperado'
  );
}

private construirNombreRecuperado(
  apellidoPaterno?: string | null,
  apellidoMaterno?: string | null,
  primerNombre?: string | null,
  segundoNombre?: string | null
): string {

  return [
    apellidoPaterno,
    apellidoMaterno,
    primerNombre,
    segundoNombre
  ]
    .map(valor =>
      (valor || '').trim()
    )
    .filter(valor =>
      valor !== ''
    )
    .join(' ');
}

private mapearTipoFlujoRecuperado(
  tipoFlujo?: string | null
): TipoGeneracionDocumentos {

  const tipo =
    (tipoFlujo || '')
      .trim()
      .toUpperCase();

  if (tipo === 'COMPLETO') {
    return 'completa';
  }

  if (tipo === 'SOLO_AUTORIZACION') {
    return 'soloAutorizacion';
  }

  if (
    tipo ===
    'FORMULARIO_6012_POSTERIOR'
  ) {
    return 'soloFormulario6012';
  }

  return null;
}

private configurarEstadoVisualRecuperado(
  recupero:
    RecuperarAvanceProcesoResponseLocal
): void {

  const estado =
    (recupero.codigoEstadoProceso || '')
      .trim()
      .toUpperCase();

  const tipoGeneracion =
    this.mapearTipoFlujoRecuperado(
      recupero.tipoFlujo
    );

  /*
   * Partimos de un estado visual limpio,
   * pero conservamos el formulario que
   * acabamos de reconstruir.
   */
  this.seccionesGrabadas =
    this.vidaTramiteStateService
      .crearEstadoSecciones();

  this.documentosGenerados =
    false;

  this.solicitudBloqueada =
    false;

  this.documentosPublicados =
    false;

  this.pendienteBeneficiariosPara6012 =
    false;

  this.mostrarInvitacionBeneficiarios =
    false;

  this.tipoGeneracionDocumentos =
    tipoGeneracion;

  this.procesoBackendPreparado =
    this.formularioTieneAceptacion(
      recupero
    );

  /*
   * DATOS_TITULAR:
   * todavía no hay una sección confirmada.
   */
  if (estado === 'DATOS_TITULAR') {
    this.conyugeConsultado =
      false;

    this.pasoActual =
      'titular';

    return;
  }

  /*
   * Desde aquí Titular ya fue confirmado.
   */
  this.seccionesGrabadas.titular =
    true;

  if (estado === 'DATOS_COMPLEMENTARIOS') {
    this.conyugeConsultado =
      false;

    this.pasoActual =
      'trabajo';

    return;
  }

  this.seccionesGrabadas.trabajo =
    true;

  if (estado === 'CONYUGE_CONCUBINO') {
    /*
     * En esta etapa todavía corresponde
     * consultar/revisar el cónyuge.
     */
    this.conyugeConsultado =
      false;

    this.pasoActual =
      'conyuge';

    return;
  }

  /*
   * Haber llegado a BENEFICIARIOS implica
   * que la sección cónyuge ya fue confirmada,
   * incluso cuando el resultado fue
   * "sin cónyuge".
   */
  this.seccionesGrabadas.conyuge =
    true;

  this.conyugeConsultado =
    true;

  if (estado === 'BENEFICIARIOS') {
    this.asegurarBeneficiarioInicial();

    this.pasoActual =
      'beneficiarios';

    return;
  }

  this.seccionesGrabadas.beneficiarios =
    true;

  if (estado === 'DECLARACION_JURADA') {
    this.pasoActual =
      'declaracion';

    return;
  }

  /*
   * A partir de DOCUMENTOS el tipo de flujo
   * debe existir porque determina qué
   * documentos corresponden al trámite.
   */
  if (
    estado === 'DOCUMENTOS'
    || estado === 'FINALIZACION'
  ) {
    if (!tipoGeneracion) {
      this.mostrarAviso(
        'El proceso fue recuperado, pero no tiene definido el tipo de flujo documental.',
        'error',
        'Flujo documental no definido',
        true
      );

      this.pasoActual =
        'declaracion';

      return;
    }

    this.seccionesGrabadas.declaracion =
      true;

    /*
     * "documentosGenerados" actualmente
     * representa que la solicitud quedó
     * preparada para generación.
     *
     * Los PDF reales siguen regenerándose
     * al pulsar Descargar.
     */
    this.documentosGenerados =
      true;

    this.solicitudBloqueada =
      true;

    /*
     * Un F5 no significa que el trabajador
     * haya descargado físicamente los PDF
     * en esta nueva sesión del navegador.
     */
    this.autorizacionDescuentoGenerada =
      false;

    this.formulario6012Generado =
      false;

    if (estado === 'DOCUMENTOS') {
      this.pasoActual =
        'documentos';

      return;
    }

    /*
    * FINALIZACION.
    *
    * La navegación se recupera desde
    * TEMP_SECOMASVIDA y los documentos
    * publicados se reconstruyen desde el
    * repositorio documental persistente.
    */
    this.seccionesGrabadas.documentos =
      true;

    this.seccionesGrabadas.publicacion =
      true;

    this.documentosPublicados =
      true;

    this.pasoActual =
      'publicacion';

    this.recuperarDocumentosPublicadosFinalizacion();

    return;
  }

  console.error(
    'Estado de proceso +Vida no reconocido:',
    recupero.codigoEstadoProceso
  );

  this.mostrarAviso(
    'El proceso fue recuperado, pero su etapa no pudo interpretarse.',
    'error',
    'Etapa no reconocida',
    true
  );

  this.pasoActual =
    'titular';
}

private aplicarNavegacionRecuperada(
  recupero:
    RecuperarAvanceProcesoResponseLocal
): void {

  const estadoMaximo =
    (recupero.codigoEstadoProceso || '')
      .trim()
      .toUpperCase();

  /*
   * DOCUMENTOS y FINALIZACION ya pertenecen
   * a la fase bloqueada. Allí conservamos la
   * navegación documental normal.
   */
  if (
    estadoMaximo === 'DOCUMENTOS'
    || estadoMaximo === 'FINALIZACION'
  ) {
    return;
  }

  const pasoNavegacion =
    this.obtenerPasoDesdeEstadoBackend(
      recupero.codigoEstadoNavegacion
    );

  if (!pasoNavegacion) {
    return;
  }

  /*
   * El máximo avance ya fue reconstruido por
   * configurarEstadoVisualRecuperado().
   *
   * Ahora simplemente colocamos al trabajador
   * donde realmente dejó el trámite.
   */
  if (
    !this.puedeAccederPasoDesdeRuta(
      pasoNavegacion
    )
  ) {
    console.warn(
      'La navegación recuperada no es accesible con el avance persistido:',
      {
        codigoEstadoProceso:
          recupero.codigoEstadoProceso,

        codigoEstadoNavegacion:
          recupero.codigoEstadoNavegacion
      }
    );

    return;
  }

  this.pasoActual =
    pasoNavegacion;
}

private recuperarDocumentosPublicadosFinalizacion():
  void {

  if (
    this
      .recuperandoDocumentosPublicadosFinalizacion
  ) {
    return;
  }

  const registroInternoProceso =
    this.codigoSolicitud.trim();

  const numeroDocumentoTrabajador =
    this.form.titular
      .numeroDocumento
      .trim();

  if (
    !registroInternoProceso
    || !numeroDocumentoTrabajador
  ) {
    console.error(
      'No existen datos suficientes para recuperar los documentos publicados.'
    );

    return;
  }

  this.recuperandoDocumentosPublicadosFinalizacion =
    true;

  console.log(
    'Recuperando documentos publicados para Finalización:',
    {
      registroInternoProceso,
      numeroDocumentoTrabajador
    }
  );

  this.vidaApiService
    .listarDocumentosPublicados(
      registroInternoProceso,
      numeroDocumentoTrabajador
    )
    .subscribe({
      next: (
        documentos:
          DocumentoPublicadoResumenLocal[]
      ) => {

        this.recuperandoDocumentosPublicadosFinalizacion =
          false;

        const documentosDisponibles =
          documentos.filter(
            documento =>
              documento.publicado === true
              && documento
                .disponibleParaUsuario === true
          );

        const autorizacion =
          documentosDisponibles.find(
            documento =>
              documento.tipoDocumento ===
              'AUTORIZACION_DESCUENTO'
          );

        const formulario6012 =
          documentosDisponibles.find(
            documento =>
              documento.tipoDocumento ===
              'FORMULARIO_6012'
          );

        /*
         * IDs publicados.
         */
        this.idDocumentoPublicadoAutorizacion =
          autorizacion
            ?.idDocumentoPublicado
            ?.trim()
          || '';

        this.idDocumentoPublicadoFormulario6012 =
          formulario6012
            ?.idDocumentoPublicado
            ?.trim()
          || '';

        /*
         * Flags que utiliza
         * VidaFinalizacionComponent para
         * mostrar las tarjetas.
         */
        this.autorizacionDescuentoSellada =
          !!autorizacion;

        this.formulario6012Sellado =
          !!formulario6012;

        /*
         * Si estamos recuperando FINALIZACION,
         * los documentos presentes ya fueron
         * cerrados/publicados.
         */
        this.documentosCerradosBackend =
          documentosDisponibles.length > 0;

        this.documentosPublicados =
          documentosDisponibles.length > 0;

        /*
         * La autorización ya publicada no debe
         * volver a cargarse.
         */
        this.autorizacionFirmadaBloqueada =
          !!autorizacion;

        /*
         * La fecha de recepción representa la
         * finalización de la recepción documental.
         * Cuando existen varios documentos,
         * tomamos la publicación más reciente.
         */
        const fechasPublicacion =
          documentosDisponibles
            .map(documento =>
              documento.fechaHoraPublicacion
            )
            .filter(
              (
                fecha
              ): fecha is string =>
                !!fecha
            )
            .map(fecha => new Date(fecha))
            .filter(
              fecha =>
                !Number.isNaN(
                  fecha.getTime()
                )
            )
            .sort(
              (a, b) =>
                b.getTime()
                - a.getTime()
            );

        if (fechasPublicacion.length > 0) {
          this.fechaRecepcionDocumentos =
            fechasPublicacion[0]
              .toLocaleString(
                'es-PE'
              );
        }

        /*
         * SOLO_AUTORIZACION:
         * recuperamos también la invitación
         * que existía antes del F5 para poder
         * registrar beneficiarios posteriormente.
         */
        this.mostrarInvitacionBeneficiarios =
          this.tipoGeneracionDocumentos ===
            'soloAutorizacion'
          && !!autorizacion
          && !formulario6012;

        console.log(
          'Documentos publicados recuperados:',
          {
            cantidad:
              documentosDisponibles.length,

            idAutorizacion:
              this
                .idDocumentoPublicadoAutorizacion,

            idFormulario6012:
              this
                .idDocumentoPublicadoFormulario6012,

            autorizacionSellada:
              this
                .autorizacionDescuentoSellada,

            formulario6012Sellado:
              this.formulario6012Sellado,

            fechaRecepcion:
              this.fechaRecepcionDocumentos,

            mostrarInvitacionBeneficiarios:
              this
                .mostrarInvitacionBeneficiarios
          }
        );

        if (
          documentosDisponibles.length === 0
        ) {
          this.mostrarAviso(
            'El trámite está en Finalización, pero no fue posible encontrar documentos publicados.',
            'advertencia',
            'Documentos no encontrados',
            true
          );
        }
      },

      error: (error: unknown) => {

        this.recuperandoDocumentosPublicadosFinalizacion =
          false;

        console.error(
          'No fue posible recuperar los documentos publicados:',
          error
        );

        this.mostrarAviso(
          'El trámite fue recuperado, pero no fue posible consultar los documentos publicados.',
          'advertencia',
          'Documentos no disponibles',
          true
        );
      }
    });
}

private formularioTieneAceptacion(
  recupero:
    RecuperarAvanceProcesoResponseLocal
): boolean {

  const aceptacion =
    recupero.formularioVida
      ?.aceptacionLegal;

  return !!aceptacion
    && aceptacion
      .aceptaDeclaracionJurada
      === true
    && aceptacion
      .aceptaTratamientoDatosPersonales
      === true;
}

guardarTitularYContinuar(): void {
  if (this.guardandoTitularProgreso) {
    return;
  }

  if (this.temporizadorBorradorTitular) {
  clearTimeout(
    this.temporizadorBorradorTitular
  );

  this.temporizadorBorradorTitular =
    null;
}

  const registroInternoProceso =
    this.codigoSolicitud.trim();

  if (!registroInternoProceso) {
    this.mostrarAviso(
      'El trámite todavía se está preparando. Intente continuar nuevamente en unos segundos.',
      'advertencia',
      'Proceso en preparación'
    );

    this.iniciarORecuperarProcesoVida();
    return;
  }

  const payload:
    GuardarTitularProgresoRequestLocal = {

    tipoDocumentoTitular:
      this.form.titular.tipoDocumento,

    descripcionOtroDocumentoTitular:
      this.form.titular.otroTipoDocumento
      || null,

    numeroDocumentoTitular:
      this.form.titular.numeroDocumento,

    apellidoPaternoTitular:
      this.form.titular.apellidoPaterno,

    apellidoMaternoTitular:
      this.form.titular.apellidoMaterno,

    primerNombreTitular:
      this.form.titular.primerNombre,

    segundoNombreTitular:
      this.form.titular.segundoNombre,

    correo:
      this.form.correoViva,

    celular:
      this.form.celular,

    tipoAsegurado:
      this.form.tipoAsegurado
  };

  this.guardandoTitularProgreso = true;

  console.log(
    'Guardando progreso del titular:',
    {
      registroInternoProceso,
      payload
    }
  );

  this.vidaApiService
    .guardarTitularProgreso(
      registroInternoProceso,
      payload
    )
    .subscribe({
      next: (
        respuesta:
          GuardarProgresoVidaResponseLocal
      ) => {
        this.guardandoTitularProgreso =
          false;

        console.log(
          'Progreso del titular guardado:',
          respuesta
        );

        this.seccionesGrabadas.titular =
          true;

        /*
         * Por ahora solo navegamos automáticamente
         * cuando el backend confirma el siguiente
         * estado esperado.
         *
         * Si Oracle indica un estado más avanzado,
         * no navegamos todavía porque falta conectar
         * la recuperación integral de los datos.
         */
        if (
          respuesta.codigoEstadoNavegacion
          !== 'DATOS_COMPLEMENTARIOS'
        ) {
          this.mostrarAviso(
            'El trámite registra un avance posterior. La recuperación completa del proceso será aplicada antes de continuar.',
            'advertencia',
            'Proceso existente',
            true
          );

          return;
        }

        this.pasoActual =
          'trabajo';

        this.intentoEnviar =
          false;

        this.scrollArriba();
      },

      error: (error: unknown) => {
        this.guardandoTitularProgreso =
          false;

        console.error(
          'Error guardando progreso del titular:',
          error
        );

        this.mostrarAviso(
          'No fue posible guardar los datos del titular. No se avanzará hasta completar el registro.',
          'error',
          'Guardado no completado',
          true
        );
      }
    });
}

guardarDatosComplementariosYContinuar():
  void {

  if (
    this
      .temporizadorBorradorDatosComplementarios
  ) {
    clearTimeout(
      this
        .temporizadorBorradorDatosComplementarios
    );

    this
      .temporizadorBorradorDatosComplementarios =
        null;
  }

  if (
    this.guardandoDatosComplementariosProgreso
  ) {
    return;
  }

  const registroInternoProceso =
    this.codigoSolicitud.trim();

  if (!registroInternoProceso) {
    this.mostrarAviso(
      'No se encontró el identificador del trámite.',
      'error',
      'Proceso no disponible',
      true
    );

    return;
  }

  const payload:
    GuardarDatosComplementariosProgresoRequestLocal = {

    codigoPlanilla:
      this.form.codigoPlanilla,

    decretoLegislativo:
      this.form.decretoLegislativo,

    convenioCgbvp:
      this.form.convenioCGBVP === 'SI'
        ? 'SI'
        : 'NO',

    rucEmpleador:
      this.form.rucEmpleador,

    razonSocial:
      this.form.razonSocial
  };

  this.guardandoDatosComplementariosProgreso =
    true;

  console.log(
    'Guardando progreso de datos complementarios:',
    {
      registroInternoProceso,
      payload
    }
  );

  this.vidaApiService
    .guardarDatosComplementariosProgreso(
      registroInternoProceso,
      payload
    )
    .subscribe({
      next: (
        respuesta:
          GuardarProgresoVidaResponseLocal
      ) => {

        this.guardandoDatosComplementariosProgreso =
          false;

        console.log(
          'Progreso de datos complementarios guardado:',
          respuesta
        );

        this.seccionesGrabadas.trabajo =
          true;

        if (
          respuesta.codigoEstadoNavegacion
          !== 'CONYUGE_CONCUBINO'
        ) {
          this.mostrarAviso(
            'El trámite registra un avance posterior. La recuperación completa será aplicada antes de continuar.',
            'advertencia',
            'Proceso existente',
            true
          );

          return;
        }

        /*
         * Se consulta al cónyuge únicamente
         * después de confirmar el guardado.
         */
        this.consultarConyugeConcubino();

        this.pasoActual =
          'conyuge';

        this.intentoEnviar =
          false;

        this.scrollArriba();
      },

      error: (error: unknown) => {

        this.guardandoDatosComplementariosProgreso =
          false;

        console.error(
          'Error guardando datos complementarios:',
          error
        );

        this.mostrarAviso(
          'No fue posible guardar los datos complementarios. No se avanzará hasta completar el registro.',
          'error',
          'Guardado no completado',
          true
        );
      }
    });
}

guardarConyugeYContinuar(): void {
  if (this.guardandoConyugeProgreso) {
    return;
  }

  const registroInternoProceso =
    this.codigoSolicitud.trim();

  if (!registroInternoProceso) {
    this.mostrarAviso(
      'No se encontró el identificador del trámite.',
      'error',
      'Proceso no disponible',
      true
    );

    return;
  }

  const conyuge =
    this.form.conyuge;

  const descripcionOtroDocumento =
    conyuge
    && conyuge.tipoDocumento !== '01'
    && conyuge.tipoDocumento !== '04'
      ? (
          conyuge.otroTipoDocumento
          || this.getDescripcionTipoDocumento(
            conyuge.tipoDocumento
          )
        )
      : null;

  const payload:
    GuardarConyugeProgresoRequestLocal = {

    tipoDocumentoConyuge:
      conyuge?.tipoDocumento
      || null,

    descripcionOtroDocumentoConyuge:
      descripcionOtroDocumento
      || null,

    numeroDocumentoConyuge:
      conyuge?.numeroDocumento
      || null,

    apellidoPaternoConyuge:
      conyuge?.apellidoPaterno
      || null,

    apellidoMaternoConyuge:
      conyuge?.apellidoMaterno
      || null,

    primerNombreConyuge:
      conyuge?.primerNombre
      || null,

    segundoNombreConyuge:
      conyuge?.segundoNombre
      || null,

    tipoRelacion:
      conyuge?.tipoRelacion
      || null
  };

  this.guardandoConyugeProgreso =
    true;

  console.log(
    'Guardando progreso del cónyuge o concubino:',
    {
      registroInternoProceso,
      payload
    }
  );

  this.vidaApiService
    .guardarConyugeProgreso(
      registroInternoProceso,
      payload
    )
    .subscribe({
      next: (
        respuesta:
          GuardarProgresoVidaResponseLocal
      ) => {

        this.guardandoConyugeProgreso =
          false;

        console.log(
          'Progreso del cónyuge o concubino guardado:',
          respuesta
        );

        this.seccionesGrabadas.conyuge =
          true;

        if (
          respuesta.codigoEstadoNavegacion
          !== 'BENEFICIARIOS'
        ) {
          this.mostrarAviso(
            'El trámite registra un avance posterior. La recuperación completa será aplicada antes de continuar.',
            'advertencia',
            'Proceso existente',
            true
          );

          return;
        }

        this.asegurarBeneficiarioInicial();

        this.pasoActual =
          'beneficiarios';

        this.intentoEnviar =
          false;

        this.scrollArriba();
      },

      error: (error: unknown) => {

        this.guardandoConyugeProgreso =
          false;

        console.error(
          'Error guardando progreso del cónyuge o concubino:',
          error
        );

        this.mostrarAviso(
          'No fue posible guardar la información del cónyuge o concubino. No se avanzará hasta completar el registro.',
          'error',
          'Guardado no completado',
          true
        );
      }
    });
}

guardarBeneficiariosYContinuar(
  beneficiarios: Beneficiario[] = this.beneficiariosConDatos()
): void {

  if (
    this.temporizadorBorradorBeneficiarios
  ) {
    clearTimeout(
      this.temporizadorBorradorBeneficiarios
    );

    this.temporizadorBorradorBeneficiarios =
      null;
  }

  if (this.guardandoBeneficiariosProgreso) {
    return;
  }

  const registroInternoProceso =
    this.codigoSolicitud.trim();

  if (!registroInternoProceso) {
    this.mostrarAviso(
      'No se encontró el identificador del trámite.',
      'error',
      'Proceso no disponible',
      true
    );

    return;
  }

  const beneficiariosPayload:
    BeneficiarioProgresoRequestLocal[] =
    beneficiarios.map(
      beneficiario => {

        const tipoDocumento =
          beneficiario.tipoDocumento.trim();

        const descripcionOtroDocumento =
          tipoDocumento !== '01'
          && tipoDocumento !== '04'
            ? (
                beneficiario.otroTipoDocumento
                || this.getDescripcionTipoDocumento(
                  tipoDocumento
                )
              )
            : null;

        return {
          tipoDocumento,

          descripcionOtroDocumento:
            descripcionOtroDocumento
            || null,

          numeroDocumento:
            beneficiario.numeroDocumento,

          apellidoPaterno:
            beneficiario.apellidoPaterno,

          apellidoMaterno:
            beneficiario.apellidoMaterno,

          primerNombre:
            beneficiario.primerNombre,

          segundoNombre:
            beneficiario.segundoNombre,

          porcentaje:
            Number(
              beneficiario.porcentaje
            )
        };
      }
    );

  const payload:
    GuardarBeneficiariosProgresoRequestLocal = {
      beneficiarios:
        beneficiariosPayload
  };

  this.guardandoBeneficiariosProgreso =
    true;

  console.log(
    'Guardando progreso de beneficiarios:',
    {
      registroInternoProceso,
      cantidadBeneficiarios:
        beneficiariosPayload.length,
      payload
    }
  );

  this.vidaApiService
    .guardarBeneficiariosProgreso(
      registroInternoProceso,
      payload
    )
    .subscribe({
      next: (
        respuesta:
          GuardarProgresoVidaResponseLocal
      ) => {

        this.guardandoBeneficiariosProgreso =
          false;

        console.log(
          'Progreso de beneficiarios guardado:',
          respuesta
        );

        this.seccionesGrabadas.beneficiarios =
          true;

        if (
          respuesta.codigoEstadoNavegacion
          !== 'DECLARACION_JURADA'
        ) {
          this.mostrarAviso(
            'El trámite registra un avance posterior. La recuperación completa será aplicada antes de continuar.',
            'advertencia',
            'Proceso existente',
            true
          );

          return;
        }

        this.pasoActual =
          'declaracion';

        this.intentoEnviar =
          false;

        this.scrollArriba();
      },

      error: (error: unknown) => {

        this.guardandoBeneficiariosProgreso =
          false;

        console.error(
          'Error guardando beneficiarios:',
          error
        );

        this.mostrarAviso(
          'No fue posible guardar los beneficiarios. No se avanzará hasta completar el registro.',
          'error',
          'Guardado no completado',
          true
        );
      }
    });
}

normalizarTextoServicio(valor: string | null): string {
  return (valor || '').trim().toUpperCase();
}

obtenerEtiquetaContextoPersona(contexto: ContextoConsultaPersona): string {
  if (contexto === 'titular') return 'titular';
  if (contexto === 'conyuge') return 'cónyuge';
  return 'beneficiario';
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

obtenerMensajeValidacionBeneficiarios(): string {
  for (let i = 0; i < this.form.beneficiarios.length; i++) {
    const beneficiario = this.form.beneficiarios[i];

    if (!this.beneficiarioTieneDatos(beneficiario)) {
      continue;
    }

    if (this.porcentajeBeneficiarioInvalido(beneficiario)) {
      return `El Beneficiario #${i + 1} requiere mínimo 1% en el porcentaje asignado.`;
    }

    if (this.beneficiarioIncompleto(beneficiario)) {
      return `Complete los datos obligatorios del Beneficiario #${i + 1}.`;
    }
  }

  if (!this.porcentajeCorrecto) {
    return 'La suma total de porcentajes debe ser igual al 100%.';
  }

  return 'Revise los datos de beneficiarios antes de continuar.';
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
    const numero = persona.numeroDocumento?.trim() || '';

    if (this.campoVacio(numero)) {
      return true;
    }

    if (persona.tipoDocumento === '01') {
      return !/^\d{8}$/.test(numero);
    }

    if (persona.tipoDocumento === '04') {
      return !/^\d{9}$/.test(numero);
    }

    return numero.length < 3 || numero.length > 15;
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
    if (!this.form.conyuge) {
      return false;
    }

    return this.nombresSeparadosInvalidos(
      this.form.conyuge
    )
      || this.campoVacio(
        this.form.conyuge.tipoRelacion
      );
  }

  formularioValido(): boolean {
  if (this.campoVacio(this.form.celular)) return false;
  if (this.correoInvalido()) return false;
  if (this.campoVacio(this.form.codigoPlanilla)) return false;
  if (this.campoVacio(this.form.decretoLegislativo)) return false;
  if (this.campoVacio(this.form.convenioCGBVP)) return false;

  if (!this.aceptaTerminosDeclaracion) return false;

  if (this.form.esNuevo && !this.aceptaTratamientoDatos) return false;

  if (this.rucInvalido()) return false;
  if (this.razonSocialInvalida()) return false;
  if (this.conyugeIncompleto()) return false;

  for (const beneficiario of this.form.beneficiarios) {
    if (this.beneficiarioIncompleto(beneficiario)) return false;
  }

  if (!this.porcentajeCorrecto) return false;

  return true;
}

  cerrarExito(): void {
  this.cargarCasoNuevo();
}

  mostrarAviso(
  mensaje: string,
  tipo: TipoAviso = 'info',
  titulo = '',
  persistente = false
): void {
  if (this.temporizadorAviso) {
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = null;
  }

  this.avisoFlotante = {
    tipo,
    titulo: titulo || this.obtenerTituloAviso(tipo),
    mensaje,
    persistente
  };

  if (!persistente) {
    this.temporizadorAviso = setTimeout(() => {
      this.avisoFlotante = null;
      this.temporizadorAviso = null;
    }, tipo === 'error' ? 6500 : 3800);
  }
}

cerrarAviso(): void {
  if (this.temporizadorAviso) {
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = null;
  }

  this.avisoFlotante = null;
}

obtenerTituloAviso(tipo: TipoAviso): string {
  if (tipo === 'exito') return 'Listo';
  if (tipo === 'advertencia') return 'Importante';
  if (tipo === 'error') return 'Atención';
  return 'Información';
}

obtenerIconoAviso(tipo: TipoAviso): string {
  if (tipo === 'exito') return '✅';
  if (tipo === 'advertencia') return '⚠️';
  if (tipo === 'error') return '⛔';
  return 'ℹ️';
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
this.seccionesGrabadas =
  this.vidaTramiteStateService
    .crearEstadoSecciones();

this.cargandoConyuge = false;
this.conyugeConsultado = false;
this.errorConyuge = '';
this.documentosGenerados = false;
this.solicitudBloqueada = false;
this.codigoSolicitud = '';
this.iniciandoProcesoVida = false;
this.procesoVidaInicializado = false;
this.guardandoTitularProgreso = false;
this.fechaGeneracionDocumentos = '';
this.recuperandoAvanceProceso = false;
this.preparandoProcesoBackendLocal = false;
this.procesoBackendPreparado = false;
this.consultandoDocumentoPublicado = null;
this.recuperandoDocumentosPublicadosFinalizacion =
  false;
this.tipoGeneracionDocumentos = null;
this.generandoFormulario6012Servicio = false;
this.generandoFormularioDescuentoServicio = false;
this.descargandoDocumentos = false;

this.cerrandoDocumentosBackend = false;
this.documentosCerradosBackend = false;

this.idDocumentoPublicadoAutorizacion = '';

this.idDocumentoPublicadoFormulario6012 = '';

this.mensajeErrorCierre = '';

this.autorizacionDescuentoGenerada = false;
this.formulario6012Generado = false;
this.autorizacionFirmadaBloqueada = false;

this.pendienteBeneficiariosPara6012 = false;
this.mostrarConfirmacionSinBeneficiarios = false;
this.mostrarInvitacionBeneficiarios = false;

this.aceptaTerminosDeclaracion = false;
this.aceptaTratamientoDatos = false;
this.guardandoDatosComplementariosProgreso =
  false;
this.guardandoConyugeProgreso =
  false;
this.guardandoBeneficiariosProgreso =
  false;



  
this.archivoFormulario6012 = this.crearArchivoVacio();
this.archivoAutorizacionDescuento = this.crearArchivoVacio();
this.cargandoDocumentosFirmadosBackend =
  false;

this.documentosFirmadosCargadosBackend =
  false;

this.idDocumentoCargadoFormulario6012 =
  '';

this.idDocumentoCargadoAutorizacion =
  '';
this.validandoDocumentosBackend = false;
this.documentosValidadosBackend = false;

this.autorizacionValidadaBackend = false;
this.formulario6012ValidadoBackend = false;

this.mensajeRechazoValidacion = '';
this.documentosPublicados = false;
this.fechaRecepcionDocumentos = '';

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

  this.persistirNavegacionActual(
    paso
  );

  this.intentoEnviar = false;

  if (paso === 'conyuge') {
    this.consultarConyugeConcubino();
  }

  this.scrollArriba();
}

obtenerIndicePaso(
  paso: PasoFormulario
): number {
  return this.ordenPasos.indexOf(
    paso
  );
}

obtenerPasoSiguiente():
  PasoFormulario | null {
  const indiceActual =
    this.obtenerIndicePaso(
      this.pasoActual
    );

  return this.ordenPasos[
    indiceActual + 1
  ] ?? null;
}

obtenerPasoAnterior():
  PasoFormulario | null {
  const indiceActual =
    this.obtenerIndicePaso(
      this.pasoActual
    );

  return this.ordenPasos[
    indiceActual - 1
  ] ?? null;
}

volverPaso(): void {
  const anterior = this.obtenerPasoAnterior();

  if (!anterior) return;

  this.irAPaso(anterior);
}

validarPaso(paso: PasoFormulario): boolean {
  if (paso === 'titular') {
    return !this.tipoDocumentoVacio(this.form.titular)
      && !this.numeroDocumentoInvalido(this.form.titular)
      && !this.nombresSeparadosInvalidos(this.form.titular)
      && !this.campoVacio(this.form.celular)
      && !this.correoInvalido()
      && this.seguroComplementarioValidado
      && !this.titularTieneSeguroComplementario
      && this.campoVacio(this.errorValidacionSeguroComplementario)
      && this.campoVacio(this.errorDatosTitular)
      && this.tipoAseguradoValidado
      && this.campoVacio(this.errorTipoAsegurado);
  }

  if (paso === 'trabajo') {
    return !this.campoVacio(this.form.codigoPlanilla)
      && !this.campoVacio(this.form.decretoLegislativo)
      && !this.campoVacio(this.form.convenioCGBVP)
      && !this.rucInvalido()
      && !this.razonSocialInvalida();
  }

  if (paso === 'conyuge') {
    return this.conyugeConsultado
      && !this.cargandoConyuge
      && this.campoVacio(this.errorConyuge)
      && !this.conyugeIncompleto();
  }

  if (paso === 'beneficiarios') {
    const beneficiariosConDatos = this.beneficiariosConDatos();

    if (this.pendienteBeneficiariosPara6012) {
      return this.beneficiariosValidosPara6012();
    }

    if (beneficiariosConDatos.length === 0) {
      return true;
    }

    for (const beneficiario of beneficiariosConDatos) {
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
  this.mostrarConfirmacionSinBeneficiarios =
    false;

  this.form.beneficiarios = [];

  /*
   * La lista vacía se persiste en backend.
   * No navegamos hasta que Oracle confirme.
   */
  this.guardarBeneficiariosYContinuar(
    []
  );
}

cancelarContinuarSinBeneficiarios(): void {
  this.mostrarConfirmacionSinBeneficiarios = false;
  this.intentoEnviar = false;
}

continuarPaso(): void {
  if (
    this.pasoActual === 'beneficiarios'
    && !this.hayBeneficiariosIniciados()
    && !this.pendienteBeneficiariosPara6012
  ) {
    this.abrirConfirmacionSinBeneficiarios();
    return;
  }

  this.intentoEnviar = true;

  if (!this.validarPaso(this.pasoActual)) {
    if (this.pasoActual === 'beneficiarios') {
      this.mostrarAviso(
        this.obtenerMensajeValidacionBeneficiarios(),
        'advertencia',
        'Beneficiarios incompletos'
      );
      return;
    }

    this.mostrarAviso('Revise los campos pendientes antes de continuar.');
    return;
  }

  if (this.pasoActual === 'declaracion' && !this.documentosGenerados) {
    this.mostrarAviso('Primero debe generar los documentos antes de continuar a la carga de archivos.');
    return;
  }

  if (this.pasoActual === 'titular') {
    this.guardarTitularYContinuar();
    return;
  }

  if (this.pasoActual === 'trabajo') {
    this.guardarDatosComplementariosYContinuar();
    return;
  }

  if (this.pasoActual === 'conyuge') {
    this.guardarConyugeYContinuar();
    return;
  }

  if (this.pasoActual === 'beneficiarios') {
    this.guardarBeneficiariosYContinuar();
    return;
  }

  this.seccionesGrabadas[this.pasoActual] =
    true;

  const siguiente = this.obtenerPasoSiguiente();

  if (siguiente) {
    if (siguiente === 'conyuge') {
      this.consultarConyugeConcubino();
    }

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

beneficiariosConDatos(): Beneficiario[] {
  return this.form.beneficiarios.filter(beneficiario =>
    this.beneficiarioTieneDatos(beneficiario)
  );
}

beneficiariosBloqueados(): boolean {
  return this.solicitudBloqueada && !this.pendienteBeneficiariosPara6012;
}

textoBotonGenerarDocumentos(): string {
  if (!this.hayBeneficiariosRegistrados()) {
    return 'Confirmar autorización y continuar';
  }

  return 'Confirmar solicitud y continuar';
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

obtenerTipoDocumentoFormulario6012(codigoTipoDocumento: string): TipoDocumentoFormulario6012 {
  if (codigoTipoDocumento === '01') {
    return 'DNI';
  }

  if (codigoTipoDocumento === '04') {
    return 'CE';
  }

  return 'OTRO';
}

obtenerConvenioCgbvpFormulario6012(): 'SI' | 'NO' {
  return this.form.convenioCGBVP === 'SI' ? 'SI' : 'NO';
}

private descargarBlobGenerado(
  blob: Blob,
  nombreArchivo: string
): void {
  const urlTemporal =
    URL.createObjectURL(blob);

  const enlace =
    document.createElement('a');

  enlace.href =
    urlTemporal;

  enlace.download =
    nombreArchivo;

  document.body.appendChild(
    enlace
  );

  enlace.click();
  enlace.remove();

  setTimeout(
    () => {
      URL.revokeObjectURL(
        urlTemporal
      );
    },
    1_000
  );
}

generarFormulario6012DesdeServicio(
  callbackExito?: () => void,
  callbackError?: () => void
): void {
  if (!this.beneficiariosValidosPara6012()) {
    this.mostrarAviso(
      'Para generar el Formulario 6012 debe registrar beneficiarios válidos y distribuir el 100%.',
      'advertencia',
      'Formulario 6012'
    );

    callbackError?.();
    return;
  }

  if (this.generandoFormulario6012Servicio) {
    return;
  }

  const payload =
    this.construirPayloadFormulario6012();

  this.generandoFormulario6012Servicio =
    true;

  console.log(
    'Solicitando generación del Formulario 6012:',
    payload
  );

  this.vidaApiService
    .generarFormulario6012(payload)
    .subscribe({
      next: (
        resultado:
          DocumentoGeneradoDescargadoLocal
      ) => {
        this.generandoFormulario6012Servicio =
          false;

        this.formulario6012Generado =
          true;

        const nombreArchivo =
          resultado.nombreArchivo
          || `Formulario-6012-${this.form.titular.numeroDocumento || 'titular'}.pdf`;

        this.descargarBlobGenerado(
          resultado.blob,
          nombreArchivo
        );

        console.log(
          'Formulario 6012 generado y descargado:',
          {
            registroInternoProceso:
              this.codigoSolicitud,

            nombreArchivo,

            tamanioBytes:
              resultado.blob.size,

            contentType:
              resultado.blob.type
          }
        );

        callbackExito?.();
      },

      error: (error: unknown) => {
        this.generandoFormulario6012Servicio =
          false;

        console.error(
          'Error generando Formulario 6012:',
          error
        );

        this.mostrarAviso(
          'No se pudo generar el Formulario 6012. Intente nuevamente en unos momentos.',
          'error',
          'Error al generar',
          true
        );

        callbackError?.();
      }
    });
}

generarFormularioDescuentoDesdeServicio(
  callbackExito?: () => void,
  callbackError?: () => void
): void {
  if (this.generandoFormularioDescuentoServicio) {
    return;
  }

  const payload =
    this.construirPayloadFormularioDescuento();

  this.generandoFormularioDescuentoServicio =
    true;

  console.log(
    'Solicitando generación de la Autorización de Descuento:',
    payload
  );

  this.vidaApiService
    .generarFormularioDescuento(payload)
    .subscribe({
      next: (
        resultado:
          DocumentoGeneradoDescargadoLocal
      ) => {
        this.generandoFormularioDescuentoServicio =
          false;

        this.autorizacionDescuentoGenerada =
          true;

        const nombreArchivo =
          resultado.nombreArchivo
          || `Autorizacion-Descuento-${this.form.titular.numeroDocumento || 'titular'}.pdf`;

        this.descargarBlobGenerado(
          resultado.blob,
          nombreArchivo
        );

        console.log(
          'Autorización generada y descargada:',
          {
            registroInternoProceso:
              this.codigoSolicitud,
            nombreArchivo,

            tamanioBytes:
              resultado.blob.size,

            contentType:
              resultado.blob.type
          }
        );

        callbackExito?.();
      },

      error: (error: unknown) => {
        this.generandoFormularioDescuentoServicio =
          false;

        console.error(
          'Error generando Autorización de Descuento:',
          error
        );

        this.mostrarAviso(
          'No se pudo generar la Autorización de Descuento. Intente nuevamente en unos momentos.',
          'error',
          'Error al generar',
          true
        );

        callbackError?.();
      }
    });
}

conyugeRegistradoPara6012(): boolean {
  const conyuge = this.form.conyuge;

  if (!conyuge) {
    return false;
  }

  return !this.nombresSeparadosInvalidos(
    conyuge
  )
    && !this.campoVacio(
      conyuge.tipoRelacion
    );
}

asegurarCodigoSolicitud(): string {
  const codigoActual =
    (this.codigoSolicitud || '').trim();

  if (codigoActual) {
    return codigoActual;
  }

  const fecha = new Date();

  this.codigoSolicitud =
    `VIDA-${fecha.getFullYear()}-${fecha.getTime()}`;

  return this.codigoSolicitud;
}

construirPayloadRegistroAvance():
  RegistrarAvanceExpedienteRequest {

  const codigoSolicitud =
    this.asegurarCodigoSolicitud();

  return {
    registroInternoProceso:
      codigoSolicitud,

    tipoDocumentoTrabajador:
      this.form.titular.tipoDocumento,

    numeroDocumentoTrabajador:
      this.form.titular.numeroDocumento,

    nombresApellidosTrabajador:
      this.nombreCompletoPersona(this.form.titular),

    canalAcceso:
      'SOMOS_ESSALUD',

    estadoOperativo:
      'PROCESO_INICIADO',

    descripcionAvance:
      'Se inicia el proceso de afiliación digital al +Vida Seguro de Accidentes.',

    usuarioAutenticado:
      this.form.titular.numeroDocumento,

    ipOrigen:
      '0:0:0:0:0:0:0:1',

    datosSesionDispositivo:
      'Navegador local / integración frontend Angular'
  };
}

construirPayloadAceptacionLegal():
  RegistrarAceptacionRequest {

  const codigoSolicitud =
    this.asegurarCodigoSolicitud();

  return {
    registroInternoProceso:
      codigoSolicitud,

    tipoDocumentoTrabajador:
      this.form.titular.tipoDocumento,

    numeroDocumentoTrabajador:
      this.form.titular.numeroDocumento,

    nombresApellidosTrabajador:
      this.nombreCompletoPersona(this.form.titular),

    aceptaDeclaracionJurada:
      this.aceptaTerminosDeclaracion === true,

    aceptaTratamientoDatosPersonales:
      this.form.esNuevo
        ? this.aceptaTratamientoDatos === true
        : true,

    canalAcceso:
      'SOMOS EsSalud',

    datosSesionDispositivo:
      'Navegador local / aceptación legal',

    versionTextoDeclaracionJurada:
      'DJ_VIDA_001',

    versionTextoTratamientoDatos:
      'PDP_VIDA_001',

    referenciaPoliticaPrivacidad:
      'POLITICA_PRIVACIDAD_ESSALUD_001'
  };
}

prepararProcesoBackendLocal(
  callbackExito: () => void
): void {
  if (this.preparandoProcesoBackendLocal) {
    return;
  }

  if (this.procesoBackendPreparado) {
    callbackExito();
    return;
  }

  const payloadAvance =
    this.construirPayloadRegistroAvance();

  const payloadAceptacion =
    this.construirPayloadAceptacionLegal();

  this.preparandoProcesoBackendLocal = true;

  console.log(
    'Abriendo expediente digital:',
    payloadAvance
  );

  this.vidaApiService
    .registrarAvanceExpediente(payloadAvance)
    .subscribe({
      next: expediente => {
        console.log(
          'Expediente digital preparado:',
          expediente
        );

        this.vidaApiService
          .registrarAceptacionLegal(payloadAceptacion)
          .subscribe({
            next: aceptacion => {
              this.preparandoProcesoBackendLocal = false;
              this.procesoBackendPreparado = true;

              console.log(
                'Aceptación legal registrada:',
                aceptacion
              );

              this.mostrarAviso(
                'Expediente digital y aceptación legal registrados correctamente.',
                'exito',
                'Proceso preparado'
              );

              callbackExito();
            },

            error: (error: unknown) => {
              this.preparandoProcesoBackendLocal = false;
              this.procesoBackendPreparado = false;
              const mensajeError =
                'No fue posible registrar la aceptación legal.';

              console.error(
                mensajeError,
                error
              );

              this.mostrarAviso(
                mensajeError,
                'error',
                'Aceptación no registrada',
                true
              );
            }
          });
      },

      error: (error: unknown) => {
        this.preparandoProcesoBackendLocal = false;
        this.procesoBackendPreparado = false;

        const mensajeError =
          'No fue posible abrir el expediente digital.';

        console.error(
          mensajeError,
          error
        );

        this.mostrarAviso(
          mensajeError,
          'error',
          'Expediente no registrado',
          true
        );
      }
    });
}

construirPayloadFormulario6012():
  GenerarFormulario6012Request {

  const conyuge = this.form.conyuge;

  const existeConyuge =
    this.conyugeRegistradoPara6012();

  return {
    registroInternoProceso:
      this.asegurarCodigoSolicitud(),

    tipoDocumentoTitular:
      this.form.titular.tipoDocumento,

    numeroDocumentoTitular:
      this.form.titular.numeroDocumento,

    nombresApellidosTitular:
      this.nombreCompletoPersona(
        this.form.titular
      ),

    correoElectronico:
      this.form.correoViva,

    tipoAsegurado:
      this.form.tipoAsegurado,

    convenioCgbvp:
      this.obtenerConvenioCgbvpFormulario6012(),

    rucEmpleador:
      this.form.rucEmpleador,

    tipoDocumentoConyuge:
    existeConyuge
    && !this.campoVacio(
      conyuge!.tipoDocumento
    )
      ? conyuge!.tipoDocumento
      : null,

    numeroDocumentoConyuge:
    existeConyuge
    && !this.campoVacio(
      conyuge!.numeroDocumento
    )
      ? conyuge!.numeroDocumento
      : null,

    nombresApellidosConyuge:
      existeConyuge
        ? this.nombreCompletoPersona(
            conyuge!
          )
        : null,

notificacionCorreo:
  'SI',

    generadoPor:
      'SISTEMA',

    canalGeneracion:
      'MODULO_AFILIACION_DIGITAL',

    beneficiarios:
      this.beneficiariosRegistrados().map(
        beneficiario => ({
          tipoDocumento:
            this.obtenerTipoDocumentoFormulario6012(
              beneficiario.tipoDocumento
            ),

          numeroDocumento:
            beneficiario.numeroDocumento,

          nombresApellidos:
            this.nombreCompletoPersona(
              beneficiario
            ),

          porcentaje:
            Number(beneficiario.porcentaje)
        })
      )
  };
}

construirPayloadFormularioDescuento():
  GenerarFormularioDescuentoRequest {

  return {
    registroInternoProceso:
      this.asegurarCodigoSolicitud(),

    tipoDocumentoTrabajador:
      this.form.titular.tipoDocumento,

    numeroDocumentoTrabajador:
      this.form.titular.numeroDocumento,

    nombresApellidosTrabajador:
      this.nombreCompletoPersona(
        this.form.titular
      ),

    codigoPlanilla:
      this.form.codigoPlanilla,

    decretoLegislativo:
      this.form.decretoLegislativo,

    tipoAsegurado:
      this.form.tipoAsegurado,

    rucEmpleador:
      this.form.rucEmpleador,

    razonSocialEmpleador:
      this.form.razonSocial,

    montoPrimaMensual:
      5.00,

    correoElectronico:
      this.form.correoViva,

    celular:
      this.form.celular,

    generadoPor:
      'SISTEMA',

    canalGeneracion:
      'MODULO_AFILIACION_DIGITAL'
  };
}

generarDocumentos(): void {
  this.intentoEnviar = true;

  const requiereConsentimientoDatos =
    this.form.esNuevo === true;

  if (this.aceptaTerminosDeclaracion !== true) {
    this.mostrarAviso(
      'Debe aceptar los términos de la declaración jurada para continuar.',
      'advertencia',
      'Aceptación pendiente'
    );

    return;
  }

  if (
    requiereConsentimientoDatos
    && this.aceptaTratamientoDatos !== true
  ) {
    this.mostrarAviso(
      'Debe aceptar el tratamiento de datos personales para continuar.',
      'advertencia',
      'Consentimiento pendiente'
    );

    return;
  }

  if (!this.formularioValido()) {
    this.mostrarAviso(
      'Revise los campos pendientes antes de confirmar la solicitud.',
      'advertencia',
      'Información pendiente'
    );

    return;
  }

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

      this.mostrarAviso(
        'Hay información pendiente de revisión antes de confirmar la solicitud.',
        'advertencia',
        'Revise la solicitud'
      );

      this.scrollArriba();
      return;
    }
  }

  const tieneBeneficiarios =
    this.hayBeneficiariosRegistrados();

  if (
    tieneBeneficiarios
    && !this.beneficiariosValidosPara6012()
  ) {
    this.pasoActual =
      'beneficiarios';

    this.mostrarAviso(
      'Debe registrar beneficiarios válidos y asignar el 100% para preparar el Formulario 6012.',
      'advertencia',
      'Beneficiarios pendientes'
    );

    this.scrollArriba();
    return;
  }

  this.form.notificacionesCorreo =
    'SI';

  this.asegurarCodigoSolicitud();

  const finalizarPreparacionDocumental =
    (): void => {
      if (
        this.aceptaTerminosDeclaracion
        !== true
      ) {
        this.mostrarAviso(
          'Debe aceptar los términos de la declaración jurada para continuar.',
          'advertencia',
          'Aceptación pendiente'
        );

        return;
      }

      if (
        requiereConsentimientoDatos
        && this.aceptaTratamientoDatos
          !== true
      ) {
        this.mostrarAviso(
          'Debe aceptar el tratamiento de datos personales para continuar.',
          'advertencia',
          'Consentimiento pendiente'
        );

        return;
      }

      const fecha =
        new Date();

      this.fechaGeneracionDocumentos =
        fecha.toLocaleString('es-PE');

      this.tipoGeneracionDocumentos =
        tieneBeneficiarios
          ? 'completa'
          : 'soloAutorizacion';

      /*
       * Los PDF todavía no se generan.
       * Se generarán al pulsar Descargar.
       */
      this.autorizacionDescuentoGenerada =
        false;

      this.formulario6012Generado =
        false;

      /*
       * documentosGenerados se conserva como
       * indicador de solicitud preparada.
       */
      this.documentosGenerados =
        true;

      this.solicitudBloqueada =
        true;

      pasosPrevios.forEach(
        paso => {
          this.seccionesGrabadas[paso] =
            true;
        }
      );

      console.log(
        'Solicitud preparada para generación documental:',
        {
          registroInternoProceso:
            this.codigoSolicitud,

          tipoGeneracionDocumentos:
            this.tipoGeneracionDocumentos,

          incluyeFormulario6012:
            tieneBeneficiarios
        }
      );

      this.pasoActual =
        'documentos';

      this.intentoEnviar =
        false;

      this.scrollArriba();

      this.mostrarAviso(
        tieneBeneficiarios
          ? 'La solicitud fue confirmada. Descargue la Autorización de Descuento y el Formulario 6012.'
          : 'La solicitud fue confirmada. Descargue la Autorización de Descuento.',
        'exito',
        'Solicitud preparada'
      );
    };

  this.prepararProcesoBackendLocal(
    finalizarPreparacionDocumental
  );
}

iniciarRegistroBeneficiarios6012(): void {
  this.mostrarInvitacionBeneficiarios = false;
  this.pendienteBeneficiariosPara6012 = true;

  /*
   * Se inicia un nuevo ciclo documental únicamente
   * para el Formulario 6012.
   *
   * La Autorización ya publicada se conserva.
   */
  this.formulario6012Generado = false;
  this.formulario6012Sellado = false;

  this.archivoFormulario6012 =
    this.crearArchivoVacio();

  this.idDocumentoCargadoFormulario6012 = '';

  this.cargandoDocumentosFirmadosBackend = false;
  this.documentosFirmadosCargadosBackend = false;

  this.validandoDocumentosBackend = false;
  this.documentosValidadosBackend = false;

  this.formulario6012ValidadoBackend = false;

  this.cerrandoDocumentosBackend = false;
  this.documentosCerradosBackend = false;

  this.idDocumentoPublicadoFormulario6012 = '';

  this.mensajeRechazoValidacion = '';
  this.mensajeErrorCierre = '';

  this.documentosPublicados = false;

  this.seccionesGrabadas.documentos = false;
  this.seccionesGrabadas.publicacion = false;

  this.asegurarBeneficiarioInicial();

  this.pasoActual = 'beneficiarios';
  this.vista = 'formulario';
  this.intentoEnviar = false;

  this.scrollArriba();

  this.mostrarAviso(
    'Complete los beneficiarios para preparar el Formulario 6012.'
  );
}

omitirRegistroBeneficiariosPorAhora(): void {
  this.mostrarInvitacionBeneficiarios = false;
  this.seccionesGrabadas.documentos = true;
  this.vista = 'exito';
  this.scrollArriba();
}

generarFormulario6012Pendiente(): void {
  this.intentoEnviar =
    true;

  if (
    !this.beneficiariosValidosPara6012()
  ) {
    this.mostrarAviso(
      'Debe registrar beneficiarios válidos y asignar el 100% para preparar el Formulario 6012.',
      'advertencia',
      'Beneficiarios pendientes'
    );

    return;
  }

  const fecha =
    new Date();

  this.fechaGeneracionDocumentos =
    fecha.toLocaleString('es-PE');

  this.tipoGeneracionDocumentos =
    'soloFormulario6012';

  /*
   * El PDF queda pendiente de generación
   * hasta que se pulse Descargar.
   */
  this.formulario6012Generado =
    false;

  this.pendienteBeneficiariosPara6012 =
    false;

  this.documentosGenerados =
    true;

  this.solicitudBloqueada =
    true;

  this.seccionesGrabadas.beneficiarios =
    true;

  console.log(
    'Formulario 6012 preparado para generación:',
    {
      registroInternoProceso:
        this.codigoSolicitud,

      cantidadBeneficiarios:
        this.beneficiariosRegistrados()
          .length
    }
  );

  this.pasoActual =
    'documentos';

  this.intentoEnviar =
    false;

  this.scrollArriba();

  this.mostrarAviso(
    'Los beneficiarios fueron confirmados. Descargue el Formulario 6012 para generarlo.',
    'exito',
    'Formulario preparado'
  );
}

descargarDocumentos(): void {
  if (!this.documentosGenerados) {
    this.mostrarAviso(
      'Primero debe confirmar la solicitud.',
      'advertencia',
      'Solicitud no confirmada'
    );

    return;
  }

  if (
    this.descargandoDocumentos
    || this.generandoFormulario6012Servicio
    || this.generandoFormularioDescuentoServicio
  ) {
    return;
  }

  this.descargandoDocumentos =
    true;

  const finalizarDescargaCorrecta =
    (mensaje: string): void => {
      this.descargandoDocumentos =
        false;

      this.mostrarAviso(
        mensaje,
        'exito',
        'Descarga lista'
      );
    };

  const finalizarDescargaConError =
    (): void => {
      this.descargandoDocumentos =
        false;
    };

  if (
    this.tipoGeneracionDocumentos ===
    'soloAutorizacion'
  ) {
    this.generarFormularioDescuentoDesdeServicio(
      () => {
        finalizarDescargaCorrecta(
          'La Autorización de Descuento fue generada y descargada correctamente.'
        );
      },
      finalizarDescargaConError
    );

    return;
  }

  if (
    this.tipoGeneracionDocumentos ===
    'soloFormulario6012'
  ) {
    this.generarFormulario6012DesdeServicio(
      () => {
        finalizarDescargaCorrecta(
          'El Formulario 6012 fue generado y descargado correctamente.'
        );
      },
      finalizarDescargaConError
    );

    return;
  }

  if (
    this.tipoGeneracionDocumentos ===
    'completa'
  ) {
    this.generarFormularioDescuentoDesdeServicio(
      () => {
        this.generarFormulario6012DesdeServicio(
          () => {
            finalizarDescargaCorrecta(
              'La Autorización de Descuento y el Formulario 6012 fueron generados y descargados correctamente.'
            );
          },
          finalizarDescargaConError
        );
      },
      finalizarDescargaConError
    );

    return;
  }

  this.descargandoDocumentos =
    false;

  this.mostrarAviso(
    'No se pudo determinar qué documentos corresponden a la solicitud.',
    'error',
    'Flujo documental no definido',
    true
  );
}

seleccionarArchivo(
  event: Event,
  tipo: TipoDocumentoFirmado
): void {
  const input =
    event.target as HTMLInputElement;

  const archivo =
    input.files?.[0];

  if (!archivo) {
    return;
  }

  const archivoValidado =
    this.validarArchivoPdf(archivo);

  this.documentosFirmadosCargadosBackend =
  false;

  this.documentosValidadosBackend =
    false;

  this.mensajeRechazoValidacion = '';

  if (tipo === 'formulario6012') {
    this.archivoFormulario6012 =
      archivoValidado;

    this.idDocumentoCargadoFormulario6012 =
      '';

    this.formulario6012ValidadoBackend =
      false;
  }

  if (tipo === 'autorizacionDescuento') {
    this.archivoAutorizacionDescuento =
      archivoValidado;

    this.idDocumentoCargadoAutorizacion =
      '';

    this.autorizacionValidadaBackend =
      false;
  }
}

validarArchivoPdf(archivo: File): ArchivoDocumentoFirmado {
  const maximoMB = 10;
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
      error: 'El archivo no debe superar los 10 MB.',
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

finalizarPublicacionDocumentos(): void {
  this.vista = 'exito';
  this.scrollArriba();
}

obtenerTipoDocumentoCargaBackend(
  tipoDocumento: TipoDocumentoFirmado
): TipoDocumentoCargaLocal {
  return tipoDocumento === 'formulario6012'
    ? 'FORMULARIO_6012'
    : 'AUTORIZACION_DESCUENTO';
}

cargarDocumentoFirmadoDesdeServicio(
  tipoDocumento: TipoDocumentoFirmado,
  callbackExito: () => void,
  callbackError: () => void
): void {
  const documento =
    this.obtenerArchivoDocumento(
      tipoDocumento
    );

  if (
    !documento.cargado
    || !documento.archivo
  ) {
    this.mostrarAviso(
      `No existe un archivo válido para ${this.obtenerTituloDocumento(tipoDocumento)}.`,
      'error',
      'Archivo no disponible',
      true
    );

    callbackError();
    return;
  }

  const tipoDocumentoBackend =
    this.obtenerTipoDocumentoCargaBackend(
      tipoDocumento
    );

  console.log(
    'Cargando documento firmado:',
    {
      registroInternoProceso:
        this.codigoSolicitud,

      tipoDocumento:
        tipoDocumentoBackend,

      nombreArchivo:
        documento.archivo.name,

      tamanioBytes:
        documento.archivo.size
    }
  );

  this.vidaApiService
    .cargarDocumentoFirmado(
      documento.archivo,
      this.codigoSolicitud,
      tipoDocumentoBackend,
      this.form.titular.tipoDocumento,
      this.form.titular.numeroDocumento,
      this.nombreCompletoPersona(
        this.form.titular
      )
    )
    .subscribe({
      next: (
        respuesta:
          DocumentoCargadoLocalResponse
      ) => {

        if (respuesta.cargado === false) {

          const detalle =
            respuesta.observaciones
              ?.filter(
                observacion =>
                  !!observacion?.trim()
              )
              .join(' ')
              .trim()
            || '';

          const mensaje =
            detalle
            || respuesta.mensajeCarga
            || 'El archivo seleccionado no es un PDF válido o podría estar dañado. Seleccione otro archivo e inténtelo nuevamente.';

          this.cargandoDocumentosFirmadosBackend =
            false;

          this.documentosFirmadosCargadosBackend =
            false;

          this.mostrarAviso(
            mensaje,
            'error',
            'Documento no válido',
            true
          );

          return;
        }

        const idDocumentoCargado =
          respuesta.idDocumentoCargado
            ?.trim()
          || '';

        if (!idDocumentoCargado) {
          console.error(
            'La carga fue informada como exitosa, '
            + 'pero no se recibió el identificador '
            + 'del documento cargado.',
            respuesta
          );

          callbackError();
          return;
        }
        if (
          tipoDocumento ===
          'formulario6012'
        ) {
          this.idDocumentoCargadoFormulario6012 =
            idDocumentoCargado;
        }

        if (
          tipoDocumento ===
          'autorizacionDescuento'
        ) {
          this.idDocumentoCargadoAutorizacion =
            idDocumentoCargado;
        }

        console.log(
          'Documento firmado cargado:',
          {
            tipoDocumento:
              tipoDocumentoBackend,

            idDocumentoCargado:
              respuesta.idDocumentoCargado,

            hashDocumento:
              respuesta.hashDocumento,

            numeroPaginas:
              respuesta.numeroPaginas
          }
        );

        callbackExito();
      },

      error: (error: unknown) => {
        console.error(
          `Error cargando ${tipoDocumentoBackend}:`,
          error
        );

        callbackError();
      }
    });
}

validarDocumentoFirmadoDesdeServicio(
  tipoDocumento: TipoDocumentoFirmado,
  callbackAprobado: () => void,
  callbackRechazado: (
    resultado: ValidacionDocumentalCompletaResponseLocal
  ) => void,
  callbackError: () => void
): void {
  const documento =
    this.obtenerArchivoDocumento(
      tipoDocumento
    );

  const tipoDocumentoBackend =
    this.obtenerTipoDocumentoCargaBackend(
      tipoDocumento
    );

  const idDocumentoCargado =
    tipoDocumento === 'formulario6012'
      ? this.idDocumentoCargadoFormulario6012
      : this.idDocumentoCargadoAutorizacion;

  if (
    !documento.archivo
    || !documento.cargado
  ) {
    this.mostrarAviso(
      `No existe un PDF firmado válido para ${this.obtenerTituloDocumento(tipoDocumento)}.`,
      'error',
      'Archivo no disponible',
      true
    );

    callbackError();
    return;
  }

  if (!idDocumentoCargado) {
    this.mostrarAviso(
      `El documento ${this.obtenerTituloDocumento(tipoDocumento)} todavía no cuenta con un ID de carga.`,
      'error',
      'Carga pendiente',
      true
    );

    callbackError();
    return;
  }

  console.log(
    'Ejecutando validación completa:',
    {
      registroInternoProceso:
        this.codigoSolicitud,

      tipoDocumento:
        tipoDocumentoBackend,

      idDocumentoCargado,

      nombreArchivo:
        documento.archivo.name
    }
  );

  this.vidaApiService
    .validarDocumentoCompleto(
      documento.archivo,
      this.codigoSolicitud,
      tipoDocumentoBackend,
      this.form.titular.tipoDocumento,
      this.form.titular.numeroDocumento,
      idDocumentoCargado,
      this.form.titular.numeroDocumento
    )
    .subscribe({
      next: respuesta => {
        const resultado =
          respuesta.body!;

        const validacionAprobada =
          resultado.documentoAprobado === true
          && resultado.estadoValidacionDocumental ===
            'VALIDACION_DOCUMENTAL_APROBADA';

        console.log(
          'Resultado del orquestador:',
          {
            tipoDocumento:
              tipoDocumentoBackend,

            codResultado:
              respuesta.codResultado,

            mensaje:
              respuesta.mensaje,

            documentoAprobado:
              resultado.documentoAprobado,

            estado:
              resultado.estadoValidacionDocumental,

            etapas:
              resultado.etapas,

            permiteNuevaCargaTrabajador:
              resultado.permiteNuevaCargaTrabajador
          }
        );

        if (
          tipoDocumento ===
          'formulario6012'
        ) {
          this.formulario6012ValidadoBackend =
            validacionAprobada;
        }

        if (
          tipoDocumento ===
          'autorizacionDescuento'
        ) {
          this.autorizacionValidadaBackend =
            validacionAprobada;
        }

        if (validacionAprobada) {
          callbackAprobado();
          return;
        }

        const mensajeRechazo =
          resultado.mensajeValidacion
          || respuesta.mensaje
          || `El documento ${this.obtenerTituloDocumento(tipoDocumento)} fue rechazado durante la validación documental.`;

        this.mensajeRechazoValidacion =
          mensajeRechazo;

        callbackRechazado(resultado);
      },

      error: (error: unknown) => {
        console.error(
          `Error validando ${tipoDocumentoBackend}:`,
          error
        );

        callbackError();
      }
    });
}

procesarCierreDocumentoDesdeServicio(
  tipoDocumento: TipoDocumentoFirmado,
  callbackExito: () => void,
  callbackError: () => void
): void {
  const documento =
    this.obtenerArchivoDocumento(
      tipoDocumento
    );

  const tipoDocumentoBackend =
    this.obtenerTipoDocumentoCargaBackend(
      tipoDocumento
    );

  const documentoValidado =
    tipoDocumento === 'formulario6012'
      ? this.formulario6012ValidadoBackend
      : this.autorizacionValidadaBackend;

  if (
    !documento.archivo
    || !documento.cargado
  ) {
    this.mensajeErrorCierre =
      `No se encontró el PDF de ${this.obtenerTituloDocumento(tipoDocumento)}.`;

    callbackError();
    return;
  }

  if (!documentoValidado) {
    this.mensajeErrorCierre =
      `${this.obtenerTituloDocumento(tipoDocumento)} todavía no aprobó la validación documental.`;

    callbackError();
    return;
  }

  console.log(
    'Ejecutando cierre documental:',
    {
      registroInternoProceso:
        this.codigoSolicitud,

      tipoDocumento:
        tipoDocumentoBackend,

      nombreArchivo:
        documento.archivo.name
    }
  );

  this.vidaApiService
    .procesarCierreDocumental(
      documento.archivo,
      this.codigoSolicitud,
      tipoDocumentoBackend,
      this.form.titular.tipoDocumento,
      this.form.titular.numeroDocumento,
      this.nombreCompletoPersona(
        this.form.titular
      )
    )
    .subscribe({
      next: respuesta => {
        const resultado =
          respuesta.body!;

        const idDocumentoSellado =
          resultado.idDocumentoSellado
            ?.trim()
          || '';

        const idDocumentoPublicado =
          resultado.idDocumentoPublicado
            ?.trim()
          || '';

        const estado =
        String(
          resultado.estadoCierreDocumental
          ?? resultado.estadoDocumento
          ?? resultado.estadoProceso
          ?? resultado.estado
          ?? ''
        ).trim();

        const cierreCorrecto =
        String(respuesta.codResultado).trim() === '1'
        && resultado.cierreCompletado === true
        && !!idDocumentoSellado
        && !!idDocumentoPublicado
        && estado === 'DOCUMENTO_PUBLICADO';

        console.log(
          'Resultado del cierre documental:',
          {
            tipoDocumento:
              tipoDocumentoBackend,

            codResultado:
              respuesta.codResultado,

            mensaje:
              respuesta.mensaje,

            cierreCompletado:
              resultado.cierreCompletado,

            idDocumentoSellado,
            idDocumentoPublicado,
            estado
          }
        );

        if (
          tipoDocumento ===
          'autorizacionDescuento'
        ) {
          this.idDocumentoPublicadoAutorizacion =
            idDocumentoPublicado;
        }

        if (
          tipoDocumento ===
          'formulario6012'
        ) {
          this.idDocumentoPublicadoFormulario6012 =
            idDocumentoPublicado;
        }

        if (!cierreCorrecto) {
          this.mensajeErrorCierre =
            resultado.mensajeCierre
            || respuesta.mensaje
            || `No se pudo cerrar y publicar ${this.obtenerTituloDocumento(tipoDocumento)}.`;

          callbackError();
          return;
        }

        callbackExito();
      },

      error: (error: unknown) => {
        console.error(
          `Error cerrando ${tipoDocumentoBackend}:`,
          error
        );

        this.mensajeErrorCierre =
          `No se pudo completar el cierre de ${this.obtenerTituloDocumento(tipoDocumento)}.`;

        callbackError();
      }
    });
}

procesarCierreDocumental(): void {
  if (this.cerrandoDocumentosBackend) {
    return;
  }

  if (this.documentosCerradosBackend) {
    return;
  }

  if (!this.documentosValidadosBackend) {
    this.mostrarAviso(
      'Los documentos todavía no han superado la validación documental completa.',
      'advertencia',
      'Validación pendiente'
    );

    return;
  }

  this.cerrandoDocumentosBackend = true;
  this.mensajeErrorCierre = '';

  const finalizarCierreCorrecto = (): void => {
    const fecha =
      new Date();

    this.cerrandoDocumentosBackend =
      false;

    this.documentosCerradosBackend =
      true;

    this.documentosPublicados =
      true;

    this.fechaRecepcionDocumentos =
      fecha.toLocaleString('es-PE');

    if (
      this.tipoGeneracionDocumentos
      !== 'soloFormulario6012'
    ) {
      this.autorizacionDescuentoSellada =
        true;
    }

    if (
      this.tipoGeneracionDocumentos
      !== 'soloAutorizacion'
    ) {
      this.formulario6012Sellado =
        true;
    }

    this.seccionesGrabadas.documentos =
      true;

    this.seccionesGrabadas.publicacion =
      true;

    console.log(
      'Cierre documental completado:',
      {
        registroInternoProceso:
          this.codigoSolicitud,

        idDocumentoPublicadoAutorizacion:
          this.idDocumentoPublicadoAutorizacion,

        idDocumentoPublicadoFormulario6012:
          this.idDocumentoPublicadoFormulario6012
      }
    );

    if (
      this.tipoGeneracionDocumentos ===
      'soloAutorizacion'
    ) {
      this.autorizacionFirmadaBloqueada =
        true;

      this.pendienteBeneficiariosPara6012 =
        false;

      this.mostrarInvitacionBeneficiarios =
        true;
    }

    this.pasoActual =
      'publicacion';

    this.vista =
      'formulario';

    this.intentoEnviar =
      false;

    this.scrollArriba();

    this.mostrarAviso(
      'Los documentos fueron validados, sellados y publicados correctamente.',
      'exito',
      'Proceso completado',
      true
    );
  };

  const finalizarCierreConError = (): void => {
    this.cerrandoDocumentosBackend =
      false;

    this.documentosCerradosBackend =
      false;

    /*
     * La validación permanece aprobada.
     * No corresponde pedir otra carga al trabajador.
     */
    this.mostrarAviso(
      this.mensajeErrorCierre
      || 'Ocurrió una incidencia interna durante el sellado o la publicación. Los documentos siguen validados y no deben cargarse nuevamente.',
      'error',
      'Publicación pendiente',
      true
    );
  };

  const cerrarFormulario6012 = (): void => {
    if (
      this.idDocumentoPublicadoFormulario6012
    ) {
      finalizarCierreCorrecto();
      return;
    }

    this.procesarCierreDocumentoDesdeServicio(
      'formulario6012',
      finalizarCierreCorrecto,
      finalizarCierreConError
    );
  };

  if (
    this.tipoGeneracionDocumentos ===
    'soloAutorizacion'
  ) {
    if (
      this.idDocumentoPublicadoAutorizacion
    ) {
      finalizarCierreCorrecto();
      return;
    }

    this.procesarCierreDocumentoDesdeServicio(
      'autorizacionDescuento',
      finalizarCierreCorrecto,
      finalizarCierreConError
    );

    return;
  }

  if (
    this.tipoGeneracionDocumentos ===
    'soloFormulario6012'
  ) {
    cerrarFormulario6012();
    return;
  }

  /*
   * Flujo completo:
   * primero Autorización y luego Formulario 6012.
   *
   * Si el primero ya cerró en un intento anterior,
   * se omite y se reintenta solamente el segundo.
   */
  if (
    this.idDocumentoPublicadoAutorizacion
  ) {
    cerrarFormulario6012();
    return;
  }

  this.procesarCierreDocumentoDesdeServicio(
    'autorizacionDescuento',

    () => {
      cerrarFormulario6012();
    },

    finalizarCierreConError
  );
}

private obtenerIdDocumentoPublicado(
  tipoDocumento: TipoDocumentoFirmado
): string {
  return tipoDocumento === 'formulario6012'
    ? this.idDocumentoPublicadoFormulario6012
    : this.idDocumentoPublicadoAutorizacion;
}

private obtenerNombreDocumentoPublicado(
  tipoDocumento: TipoDocumentoFirmado
): string {
  const numeroDocumento =
    this.form.titular.numeroDocumento
    || 'trabajador';

  return tipoDocumento === 'formulario6012'
    ? `Formulario-6012-${numeroDocumento}-sellado.pdf`
    : `Autorizacion-Descuento-${numeroDocumento}-sellada.pdf`;
}

verDocumentoPublicado(
  tipoDocumento: TipoDocumentoFirmado
): void {
  const idDocumentoPublicado =
    this.obtenerIdDocumentoPublicado(
      tipoDocumento
    );

  if (!idDocumentoPublicado) {
    this.mostrarAviso(
      'El documento todavía no cuenta con un identificador de publicación.',
      'error',
      'Documento no disponible',
      true
    );

    return;
  }

  if (this.consultandoDocumentoPublicado) {
    return;
  }

  /*
   * La ventana se abre antes de la petición HTTP para
   * evitar que el navegador la bloquee como popup.
   */
  const ventanaDocumento =
    window.open(
      '',
      '_blank'
    );

  if (!ventanaDocumento) {
    this.mostrarAviso(
      'El navegador bloqueó la nueva ventana. Habilite las ventanas emergentes para visualizar el PDF.',
      'advertencia',
      'Ventana bloqueada',
      true
    );

    return;
  }

  ventanaDocumento.document.write(
    '<p style="font-family: Arial; padding: 24px;">'
    + 'Cargando documento publicado...'
    + '</p>'
  );

  this.consultandoDocumentoPublicado =
    tipoDocumento;

  this.vidaApiService
    .obtenerDocumentoPublicado(
      idDocumentoPublicado
    )
    .subscribe({
      next: blob => {
        this.consultandoDocumentoPublicado =
          null;

        const urlTemporal =
          URL.createObjectURL(blob);

        ventanaDocumento.location.href =
          urlTemporal;

        /*
         * Se concede tiempo suficiente para que
         * el visor del navegador cargue el PDF.
         */
        setTimeout(
          () => {
            URL.revokeObjectURL(
              urlTemporal
            );
          },
          60_000
        );
      },

      error: (error: unknown) => {
        this.consultandoDocumentoPublicado =
          null;

        console.error(
          'Error visualizando documento publicado:',
          error
        );

        ventanaDocumento.close();

        this.mostrarAviso(
          'No se pudo abrir el documento en este momento. Intente nuevamente.',
          'error',
          'Visualización no disponible',
          true
        );
      }
    });
}

descargarDocumentoPublicado(
  tipoDocumento: TipoDocumentoFirmado
): void {
  const idDocumentoPublicado =
    this.obtenerIdDocumentoPublicado(
      tipoDocumento
    );

  if (!idDocumentoPublicado) {
    this.mostrarAviso(
      'El documento todavía no cuenta con un identificador de publicación.',
      'error',
      'Documento no disponible',
      true
    );

    return;
  }

  if (this.consultandoDocumentoPublicado) {
    return;
  }

  this.consultandoDocumentoPublicado =
    tipoDocumento;

  this.vidaApiService
    .obtenerDocumentoPublicado(
      idDocumentoPublicado
    )
    .subscribe({
      next: blob => {
        this.consultandoDocumentoPublicado =
          null;

        const urlTemporal =
          URL.createObjectURL(blob);

        const enlace =
          document.createElement('a');

        enlace.href =
          urlTemporal;

        enlace.download =
          this.obtenerNombreDocumentoPublicado(
            tipoDocumento
          );

        document.body.appendChild(
          enlace
        );

        enlace.click();
        enlace.remove();

        setTimeout(
          () => {
            URL.revokeObjectURL(
              urlTemporal
            );
          },
          1_000
        );
      },

      error: (error: unknown) => {
        this.consultandoDocumentoPublicado =
          null;

        console.error(
          'Error descargando documento publicado:',
          error
        );

        this.mostrarAviso(
          'No se pudo descargar el documento en este momento. Intente nuevamente.',
          'error',
          'Descarga no disponible',
          true
        );
      }
    });
}

validarDocumentosFirmados(): void {
  if (this.validandoDocumentosBackend) {
    return;
  }

  if (!this.documentosFirmadosCargadosBackend) {
    this.mostrarAviso(
      'Primero debe cargar los documentos firmados.',
      'advertencia',
      'Carga pendiente'
    );

    return;
  }

  if (this.documentosValidadosBackend) {
    this.mostrarAviso(
      'Los documentos ya superaron la validación documental completa.',
      'info',
      'Validación completada'
    );

    return;
  }

  this.validandoDocumentosBackend = true;
  this.mensajeRechazoValidacion = '';

  const finalizarValidacionCorrecta = (): void => {
    this.validandoDocumentosBackend = false;
    this.documentosValidadosBackend = true;

    console.log(
      'Validación documental completada:',
      {
        registroInternoProceso:
          this.codigoSolicitud,

        autorizacionValidada:
          this.autorizacionValidadaBackend,

        formulario6012Validado:
          this.formulario6012ValidadoBackend,
      }
    );

    /*
    * La validación aprobada continúa automáticamente
    * con sellado y publicación.
    */
    this.procesarCierreDocumental();
  };

  const finalizarConRechazo = (
  resultado:
    ValidacionDocumentalCompletaResponseLocal
): void => {
  this.validandoDocumentosBackend =
    false;

  this.documentosValidadosBackend =
    false;

  const incidenciaOperativa =
    resultado.estadoValidacionDocumental ===
      'OBSERVADO_OPERATIVO'
    || resultado.permiteNuevaCargaTrabajador ===
      false;

  if (incidenciaOperativa) {
    this.mostrarAviso(
      resultado.mensajeValidacion
      || 'No fue posible completar la validación por una incidencia interna. El documento no fue rechazado.',
      'error',
      'Validación pendiente',
      true
    );

    return;
  }

  this.mostrarAviso(
    this.mensajeRechazoValidacion
    || 'El documento fue rechazado. Corrija el archivo y vuelva a cargarlo.',
    'error',
    'Documento rechazado',
    true
  );
};

  const finalizarConError = (): void => {
    this.validandoDocumentosBackend = false;
    this.documentosValidadosBackend = false;

    this.mostrarAviso(
      'No se pudo completar la validación del documento en este momento. Intente nuevamente.',
      'error',
      'Validación no disponible',
      true
    );
  };

  const validarFormulario6012 = (): void => {
    if (this.formulario6012ValidadoBackend) {
      finalizarValidacionCorrecta();
      return;
    }

    this.validarDocumentoFirmadoDesdeServicio(
      'formulario6012',
      finalizarValidacionCorrecta,
      finalizarConRechazo,
      finalizarConError
    );
  };

  if (
    this.tipoGeneracionDocumentos ===
    'soloAutorizacion'
  ) {
    this.validarDocumentoFirmadoDesdeServicio(
      'autorizacionDescuento',
      finalizarValidacionCorrecta,
      finalizarConRechazo,
      finalizarConError
    );

    return;
  }

  if (
    this.tipoGeneracionDocumentos ===
    'soloFormulario6012'
  ) {
    this.validarDocumentoFirmadoDesdeServicio(
      'formulario6012',
      finalizarValidacionCorrecta,
      finalizarConRechazo,
      finalizarConError
    );

    return;
  }

  if (this.autorizacionValidadaBackend) {
    validarFormulario6012();
    return;
  }

  this.validarDocumentoFirmadoDesdeServicio(
    'autorizacionDescuento',

    () => {
      validarFormulario6012();
    },

    finalizarConRechazo,
    finalizarConError
  );
}

enviarDocumentosFirmados(): void {
  this.intentoEnviar = true;

if (
  this.cargandoDocumentosFirmadosBackend
  || this.validandoDocumentosBackend
  || this.cerrandoDocumentosBackend
) {
  return;
}

if (this.documentosCerradosBackend) {
  return;
}

/*
 * Permite reintentar solamente el cierre
 * cuando carga y validación ya terminaron.
 */
if (
  this.documentosValidadosBackend
  && !this.documentosCerradosBackend
) {
  this.procesarCierreDocumental();
  return;
}

/*
 * Permite reintentar solamente la validación
 * cuando los documentos ya fueron cargados.
 */
if (
  this.documentosFirmadosCargadosBackend
  && !this.documentosValidadosBackend
) {
  this.validarDocumentosFirmados();
  return;
}

  if (!this.documentosFirmadosCompletos()) {
    if (
      this.tipoGeneracionDocumentos ===
      'soloAutorizacion'
    ) {
      this.mostrarAviso(
        'Debe cargar la Autorización de Descuento firmada en formato PDF.'
      );

      return;
    }

    if (
      this.tipoGeneracionDocumentos ===
      'soloFormulario6012'
    ) {
      this.mostrarAviso(
        'Debe cargar el Formulario 6012 firmado en formato PDF.'
      );

      return;
    }

    this.mostrarAviso(
      'Debe cargar ambos documentos firmados en formato PDF.'
    );

    return;
  }

  this.cargandoDocumentosFirmadosBackend =
    true;

  const finalizarCargaCorrecta = (): void => {
  this.cargandoDocumentosFirmadosBackend =
    false;

  this.documentosFirmadosCargadosBackend =
    true;

  this.seccionesGrabadas.documentos =
    true;

  console.log(
    'Carga documental completada:',
    {
      registroInternoProceso:
        this.codigoSolicitud,

      idDocumentoCargadoAutorizacion:
        this.idDocumentoCargadoAutorizacion,

      idDocumentoCargadoFormulario6012:
        this.idDocumentoCargadoFormulario6012
    }
  );

  /*
   * El aviso se muestra únicamente después de
   * que el backend confirma la carga de todos
   * los documentos correspondientes al flujo.
   */
  this.mostrarAviso(
    'Los documentos firmados fueron cargados correctamente. Se iniciará la validación documental.',
    'exito',
    'Carga completada',
    true
  );

  /*
   * Al terminar la carga, se ejecuta
   * automáticamente la validación documental
   * completa.
   */
  this.validarDocumentosFirmados();
};
  

  const finalizarCargaConError = (): void => {
    this.cargandoDocumentosFirmadosBackend =
      false;

    this.documentosFirmadosCargadosBackend =
      false;

    this.mostrarAviso(
      'No se pudo completar la carga del documento en este momento. Intente nuevamente.',
      'error',
      'Carga incompleta',
      true
    );
  };

  if (
    this.tipoGeneracionDocumentos ===
    'soloAutorizacion'
  ) {
    this.cargarDocumentoFirmadoDesdeServicio(
      'autorizacionDescuento',
      finalizarCargaCorrecta,
      finalizarCargaConError
    );

    return;
  }

  if (
    this.tipoGeneracionDocumentos ===
    'soloFormulario6012'
  ) {
    this.cargarDocumentoFirmadoDesdeServicio(
      'formulario6012',
      finalizarCargaCorrecta,
      finalizarCargaConError
    );

    return;
  }

  this.cargarDocumentoFirmadoDesdeServicio(
    'autorizacionDescuento',

    () => {
      this.cargarDocumentoFirmadoDesdeServicio(
        'formulario6012',
        finalizarCargaCorrecta,
        finalizarCargaConError
      );
    },

    finalizarCargaConError
  );
}

scrollArriba(): void {
  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

ngOnDestroy(): void {

  this.suscripcionRuta
    ?.unsubscribe();

  this.suscripcionRuta =
    null;

  if (this.temporizadorBorradorTitular) {
    clearTimeout(
      this.temporizadorBorradorTitular
    );
  }

  if (
    this
      .temporizadorBorradorDatosComplementarios
  ) {
    clearTimeout(
      this
        .temporizadorBorradorDatosComplementarios
    );
  }

  if (
    this.temporizadorBorradorBeneficiarios
  ) {
    clearTimeout(
      this.temporizadorBorradorBeneficiarios
    );
  }

  this.temporizadorBorradorTitular =
    null;

  this
    .temporizadorBorradorDatosComplementarios =
      null;

  this.temporizadorBorradorBeneficiarios =
    null;
}

};