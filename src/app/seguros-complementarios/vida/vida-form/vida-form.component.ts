import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  VidaApiService,
  RepresentanteDtoApi,
  RespuestaPersonaContactoApi,
  RespuestaConyugeConcubinoApi,
  DatosAseguradoApi,
  EmpresaEmpleadorApi,
  TipoDocumentoCargaLocal,
  DocumentoCargadoLocalResponse,
  ValidacionDocumentalCompletaResponseLocal,
  CierreDocumentalCompletoResponseLocal,
  RegistrarAvanceExpedienteRequest,
  RegistrarAceptacionRequest,
  DocumentoGeneradoDescargadoLocal,
  GenerarFormulario6012Request,
  GenerarFormularioDescuentoRequest,
  TipoDocumentoFormulario6012
} from '../services/vida-api.service';

type Vista = 'formulario' | 'resumen' | 'exito';

type TipoAviso = 'info' | 'exito' | 'advertencia' | 'error';

type ContextoConsultaPersona = 'titular' | 'conyuge' | 'beneficiario';

interface AvisoFlotante {
  tipo: TipoAviso;
  titulo: string;
  mensaje: string;
  persistente: boolean;
}

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

interface PersonaDocumento {
  tipoDocumento: string;
  otroTipoDocumento?: string;
  numeroDocumento: string;

  nombres?: string;

  apellidoPaterno: string;
  apellidoMaterno: string;
  primerNombre: string;
  segundoNombre: string;

  tipoRelacion?: string;
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
avisoFlotante: AvisoFlotante | null = null;
temporizadorAviso: ReturnType<typeof setTimeout> | null = null;

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
  descripcion: 'Consulta automática desde base institucional'
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

cargandoTipoAsegurado = false;
tipoAseguradoValidado = false;
errorTipoAsegurado = '';

aceptaTratamientoDatos = false;
aceptaTerminosDeclaracion = false;

mostrarAyudaCgbvp = false;

modoRetornoPendiente = false;

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

idDocumentoSelladoAutorizacion = '';
idDocumentoPublicadoAutorizacion = '';

idDocumentoSelladoFormulario6012 = '';
idDocumentoPublicadoFormulario6012 = '';

resultadoCierreAutorizacion:
  CierreDocumentalCompletoResponseLocal | null = null;

resultadoCierreFormulario6012:
  CierreDocumentalCompletoResponseLocal | null = null;

mensajeErrorCierre = '';

autorizacionValidadaBackend = false;
formulario6012ValidadoBackend = false;

resultadoValidacionAutorizacion:
  ValidacionDocumentalCompletaResponseLocal | null = null;

resultadoValidacionFormulario6012:
  ValidacionDocumentalCompletaResponseLocal | null = null;

mensajeRechazoValidacion = '';
documentosPublicados = false;
fechaRecepcionDocumentos = '';
correoEnvioDocumentos = '';

consultandoDocumentoPublicado:
  TipoDocumentoFirmado | null = null;

preparandoProcesoBackendLocal = false;
procesoBackendPreparado = false;
errorPreparacionBackendLocal = '';

generandoFormulario6012Servicio = false;

idDocumentoGeneradoFormulario6012 = '';

blobFormulario6012Generado:
  Blob | null = null;

urlFormulario6012Generado:
  string | null = null;

generandoFormularioDescuentoServicio = false;

idDocumentoGeneradoAutorizacion = '';

blobFormularioDescuentoGenerado: Blob | null = null;
urlFormularioDescuentoGenerado: string | null = null;

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

tiposDocumento: TipoDocumento[] = [];

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

cargandoTiposDocumento = false;
errorTiposDocumento = '';

validandoSeguroComplementario = false;
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

form: FormularioVida = this.crearCasoNuevo();

constructor(
  private sanitizer: DomSanitizer,
  private vidaApiService: VidaApiService
) {
  this.establecerFechaActual();
  this.cargarCasoNuevo();
}

obtenerDocumentoEmpleadoAutenticado(): { tipoDocumento: string; numeroDocumento: string } {
  // Temporal: simula el documento entregado por el sistema institucional de empleados.
  // Luego esto se reemplaza por la integración real.
  return {
    tipoDocumento: '01',
    numeroDocumento: '73380348'
  };
}

cargarCasoNuevo(): void {
  this.vista = 'formulario';
  this.intentoEnviar = false;
  this.cerrarAviso();

  this.form = this.crearCasoNuevo();

  this.reiniciarFlujoPorPasos();
  this.cargarTiposDocumentoDesdeServicio();
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
          TEMPORAL:
          Estas validaciones permanecen simuladas mientras trabajamos
          únicamente en la reconexión del servicio de titular y contacto.
        */

        this.validandoSeguroComplementario = false;
        this.seguroComplementarioValidado = true;
        this.titularTieneSeguroComplementario = false;
        this.mensajeSeguroComplementario =
          'El titular no cuenta con +Vida Seguro de Accidentes registrado. Puede continuar con la afiliación.';
        this.errorValidacionSeguroComplementario = '';

        this.cargandoTipoAsegurado = false;
        this.tipoAseguradoValidado = true;
        this.errorTipoAsegurado = '';
        this.form.tipoAsegurado = 'Regular';

        // Se mantienen temporales los datos laborales y el empleador.
        this.precargarDatosLaboralesSimulados();
        this.precargarEmpleadorEssalud();

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
          !apellidoPaterno
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
          /*
           * Estos datos permanecerán vacíos hasta que el servicio
           * institucional los incorpore.
           */
          tipoDocumento: '',
          numeroDocumento: '',

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
  this.cargandoTiposDocumento = true;
  this.errorTiposDocumento = '';

  this.vidaApiService.obtenerTiposDocumentos().subscribe({
    next: tipos => {
      this.tiposDocumento = tipos.map(tipo => ({
        codigo: tipo.idtipodocumento.trim(),
        descripcion: tipo.descripcion.trim()
      }));

      this.cargandoTiposDocumento = false;
      console.log('Tipos de documento cargados:', this.tiposDocumento);
    },
    error: () => {
      this.tiposDocumento = [...this.tiposDocumentoRespaldo];
      this.errorTiposDocumento = '';
      this.cargandoTiposDocumento = false;

      this.mostrarAviso(
        'No se pudo conectar con el catálogo oficial. Se usará una lista temporal de documentos.',
        'advertencia'
      );
    }
  });
}

validarSeguroComplementarioTitular(): void {
  const tipoDocumento = this.form.titular.tipoDocumento;
  const numeroDocumento = this.form.titular.numeroDocumento;

  this.validandoSeguroComplementario = true;
  this.seguroComplementarioValidado = false;
  this.titularTieneSeguroComplementario = false;
  this.mensajeSeguroComplementario = '';
  this.errorValidacionSeguroComplementario = '';

  this.vidaApiService.validarSeguroComplementario(tipoDocumento, numeroDocumento).subscribe({
    next: respuesta => {
      this.titularTieneSeguroComplementario = respuesta.tieneSeguro;
      this.seguroComplementarioValidado = true;
      this.validandoSeguroComplementario = false;

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
      this.validandoSeguroComplementario = false;
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

 crearCasoNuevo(): FormularioVida {
  return {

      esNuevo: true,
      titular: {
        tipoDocumento: '01',
        numeroDocumento: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        primerNombre: '',
        segundoNombre: ''
      },
      correoViva: '',

      celular: '',
      tipoAsegurado: 'Regular',

      codigoPlanilla: '',
      decretoLegislativo: '',
      convenioCGBVP: 'NO',

      notificacionesCorreo: '',

      rucEmpleador: '',
      rucDesdeBase: false,
      razonSocial: '',
      razonSocialDesdeBase: false,

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
      return 'Porcentaje distribuido correctamente.';
    }

    if (this.sumaPorcentajes < 100) {
      return `Falta asignar ${100 - this.sumaPorcentajes}%.`;
    }

    return `El porcentaje excede el 100% por ${this.sumaPorcentajes - 100}%.`;
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
    if (persona.tipoDocumento === '01') {
      persona.numeroDocumento = this.soloNumeros(persona.numeroDocumento);
      return;
    }

    if (persona.tipoDocumento === '04') {
      persona.numeroDocumento = this.soloNumeros(persona.numeroDocumento);
      return;
    }

    persona.numeroDocumento = (persona.numeroDocumento || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
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

  getDescripcionTipoDocumento(codigo?: string): string {
    const codigoLimpio = (codigo || '').trim();

    if (!codigoLimpio) {
      return '';
    }

    const tipo = [...this.tiposDocumento, ...this.tiposDocumentoRespaldo]
      .find(item => item.codigo === codigoLimpio);

    return tipo?.descripcion || codigoLimpio;
  }

alCambiarTipoDocumentoTitular(): void {
  this.alCambiarTipoDocumento(this.form.titular);
  this.form.titular.numeroDocumento = '';
  this.limpiarDatosTitularConsultados();
  this.resetearValidacionSeguroComplementario();
  this.limpiarDatosEmpleador();
}

alCambiarDocumentoTitular(): void {
  this.limpiarDocumento(this.form.titular);
  this.limpiarDatosTitularConsultados();
  this.resetearValidacionSeguroComplementario();
  this.limpiarDatosEmpleador();
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
  this.validandoSeguroComplementario = false;
  this.seguroComplementarioValidado = false;
  this.titularTieneSeguroComplementario = false;
  this.mensajeSeguroComplementario = '';
  this.errorValidacionSeguroComplementario = '';
}

limpiarDatosEmpleador(): void {
  this.empresasEmpleador = [];
  this.errorEmpleador = '';

  this.form.rucEmpleador = '';
  this.form.razonSocial = '';
  this.form.rucDesdeBase = false;
  this.form.razonSocialDesdeBase = false;
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

obtenerTipoAseguradoTitularDesdeServicio(): void {
  if (
    this.tipoDocumentoVacio(this.form.titular)
    || this.numeroDocumentoInvalido(this.form.titular)
  ) {
    return;
  }

  this.cargandoTipoAsegurado = true;
  this.tipoAseguradoValidado = false;
  this.errorTipoAsegurado = '';

  this.vidaApiService
    .obtenerDatosAsegurado(
      this.form.titular.tipoDocumento,
      this.form.titular.numeroDocumento
    )
    .subscribe({
      next: (respuesta: DatosAseguradoApi) => {
        this.cargandoTipoAsegurado = false;

        const tipoAsegurado = this.normalizarTipoAseguradoDesdeServicio(
          respuesta.DGACTAS
        );

        if (!tipoAsegurado) {
          this.tipoAseguradoValidado = false;
          this.errorTipoAsegurado =
            'No se pudo obtener el tipo de asegurado del titular.';
          return;
        }

        this.form.tipoAsegurado = tipoAsegurado;
        this.tipoAseguradoValidado = true;
        this.errorTipoAsegurado = '';

        console.log('Tipo de asegurado cargado:', respuesta);
      },
      error: () => {
        this.cargandoTipoAsegurado = false;

        // Fallback temporal mientras se habilita token para el servicio de datos maestros.
        this.form.tipoAsegurado = 'Regular';
        this.tipoAseguradoValidado = true;
        this.errorTipoAsegurado = '';

        this.mostrarAviso(
          'No se pudo consultar el tipo de asegurado. Se usará Regular temporalmente.',
          'advertencia',
          'Tipo de asegurado temporal'
        );

        console.warn('Tipo de asegurado asignado temporalmente como Regular por falta de token.');
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

compararEmpleadorPorId(
  empresaA: EmpresaEmpleadorApi | null,
  empresaB: EmpresaEmpleadorApi | null
): boolean {
  return empresaA?.IDE_NUMERICO_ENTIDAD === empresaB?.IDE_NUMERICO_ENTIDAD;
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
          this.actualizarContactoTitularDesdeServicio(respuesta.representanteDto);
          this.validarSeguroComplementarioTitular();
          this.obtenerEmpleadorTitularDesdeServicio();
          return;
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

mensajePorcentajeInvalido(beneficiario: Beneficiario): string {
  if (this.campoVacio(beneficiario.porcentaje)) {
    return 'Requiere mínimo 1%.';
  }

  const porcentaje = Number(beneficiario.porcentaje);

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

mensajeDocumentoInvalido(persona: PersonaDocumento): string {
  const numero = persona.numeroDocumento?.trim() || '';

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

  continuarResumen(): void {
    this.intentoEnviar = true;
    this.cerrarAviso();

    if (!this.formularioValido()) {
      this.mostrarAviso('Revise los campos pendientes antes de continuar.');
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

this.cargandoConyuge = false;
this.conyugeConsultado = false;
this.errorConyuge = '';
this.documentosGenerados = false;
this.solicitudBloqueada = false;
this.codigoSolicitud = '';
this.fechaGeneracionDocumentos = '';

this.preparandoProcesoBackendLocal = false;
this.procesoBackendPreparado = false;
this.errorPreparacionBackendLocal = '';
this.consultandoDocumentoPublicado = null;
this.tipoGeneracionDocumentos = null;
this.idDocumentoGeneradoAutorizacion = '';
this.idDocumentoGeneradoFormulario6012 = '';

this.cerrandoDocumentosBackend = false;
this.documentosCerradosBackend = false;

this.idDocumentoSelladoAutorizacion = '';
this.idDocumentoPublicadoAutorizacion = '';

this.idDocumentoSelladoFormulario6012 = '';
this.idDocumentoPublicadoFormulario6012 = '';

this.resultadoCierreAutorizacion = null;
this.resultadoCierreFormulario6012 = null;

this.mensajeErrorCierre = '';

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
this.aceptaTratamientoDatos = false;

this.modoRetornoPendiente = false;

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

this.resultadoValidacionAutorizacion = null;
this.resultadoValidacionFormulario6012 = null;

this.mensajeRechazoValidacion = '';
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

  if (paso === 'conyuge') {
    this.consultarConyugeConcubino();
  }

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
  this.mostrarConfirmacionSinBeneficiarios = false;

  this.form.beneficiarios = [];

  this.seccionesGrabadas.beneficiarios = true;
  this.pasoActual = 'declaracion';
  this.intentoEnviar = false;
  this.scrollArriba();
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

  this.seccionesGrabadas[this.pasoActual] = true;

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
    return 'Generar autorización';
  }

  return 'Generar documentos';
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

obtenerTipoDocumentoFormulario6012(codigoTipoDocumento: string): TipoDocumentoFormulario6012 {
  if (codigoTipoDocumento === '01') {
    return 'DNI';
  }

  if (codigoTipoDocumento === '04') {
    return 'CE';
  }

  return 'OTRO';
}

obtenerOtroDocumentoFormulario6012(codigoTipoDocumento: string): string | null {
  const tipoDocumento = this.obtenerTipoDocumentoFormulario6012(codigoTipoDocumento);

  if (tipoDocumento !== 'OTRO') {
    return null;
  }

  return this.getDescripcionTipoDocumento(codigoTipoDocumento);
}

obtenerConvenioCgbvpFormulario6012(): 'SI' | 'NO' {
  return this.form.convenioCGBVP === 'SI' ? 'SI' : 'NO';
}

generarFormulario6012DesdeServicio(
  callbackExito?: () => void
): void {
  if (!this.beneficiariosValidosPara6012()) {
    this.mostrarAviso(
      'Para generar el Formulario 6012 debe registrar beneficiarios válidos y distribuir el 100%.',
      'advertencia',
      'Formulario 6012'
    );

    return;
  }

  const payload =
    this.construirPayloadFormulario6012();

  this.generandoFormulario6012Servicio = true;

  console.log(
    'Payload Formulario 6012 local:',
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

        this.idDocumentoGeneradoFormulario6012 =
          resultado.idDocumentoGenerado;

        this.blobFormulario6012Generado =
          resultado.blob;

        if (this.urlFormulario6012Generado) {
          URL.revokeObjectURL(
            this.urlFormulario6012Generado
          );
        }

        this.urlFormulario6012Generado =
          URL.createObjectURL(resultado.blob);

        this.formulario6012Generado = true;

        console.log(
          'Formulario 6012 recibido en el componente:',
          {
            registroInternoProceso:
              this.codigoSolicitud,

            idDocumentoGenerado:
              this.idDocumentoGeneradoFormulario6012,

            nombreArchivo:
              resultado.nombreArchivo,

            tamanioBytes:
              resultado.blob.size,

            contentType:
              resultado.blob.type
          }
        );

        this.descargarFormulario6012Generado();

        this.mostrarAviso(
          'El Formulario 6012 fue generado correctamente. Descargue el documento, fírmelo y cárguelo en formato PDF.',
          'exito',
          'Formulario 6012 listo'
        );

        if (callbackExito) {
          callbackExito();
        }
      },

      error: (error: unknown) => {
        this.generandoFormulario6012Servicio =
          false;

        console.error(
          'Error generando Formulario 6012 local:',
          error
        );

        this.mostrarAviso(
          'No se pudo generar el Formulario 6012. Revise la respuesta del backend local.',
          'error',
          'Error al generar',
          true
        );
      }
    });
}

generarFormularioDescuentoDesdeServicio(
  callbackExito?: () => void
): void {
  const payload =
    this.construirPayloadFormularioDescuento();

  this.generandoFormularioDescuentoServicio = true;

  console.log(
    'Payload Autorización de Descuento local:',
    payload
  );

  this.vidaApiService
    .generarFormularioDescuento(payload)
    .subscribe({
      next: (
        resultado: DocumentoGeneradoDescargadoLocal
      ) => {
        this.generandoFormularioDescuentoServicio = false;

        this.idDocumentoGeneradoAutorizacion =
          resultado.idDocumentoGenerado;

        this.blobFormularioDescuentoGenerado =
          resultado.blob;

        console.log(
          'Resultado recibido en el componente:',
          {
            idDocumentoGenerado:
              resultado.idDocumentoGenerado,

            nombreArchivo:
              resultado.nombreArchivo,

            tamanioBytes:
              resultado.blob.size,

            contentType:
              resultado.blob.type
          }
        );

        if (this.urlFormularioDescuentoGenerado) {
          URL.revokeObjectURL(
            this.urlFormularioDescuentoGenerado
          );
        }

        this.urlFormularioDescuentoGenerado =
          URL.createObjectURL(resultado.blob);

        this.autorizacionDescuentoGenerada = true;

        console.log(
          'Autorización descargada correctamente:',
          {
            registroInternoProceso:
              this.codigoSolicitud,

            idDocumentoGenerado:
              this.idDocumentoGeneradoAutorizacion,

            tamanioBytes:
              resultado.blob.size,

            tipoArchivo:
              resultado.blob.type
          }
        );

        this.descargarFormularioDescuentoGenerado();

        this.mostrarAviso(
          'La Autorización de Descuento fue generada correctamente. Descargue el documento, fírmelo y cárguelo en formato PDF.',
          'exito',
          'Autorización lista'
        );

        if (callbackExito) {
          callbackExito();
        }
      },

      error: (error: unknown) => {
        this.generandoFormularioDescuentoServicio = false;

        console.error(
          'Error generando autorización local:',
          error
        );

        this.mostrarAviso(
          'No se pudo generar la Autorización de Descuento. Revise la respuesta del backend local.',
          'error',
          'Error al generar',
          true
        );
      }
    });
}

descargarFormularioDescuentoGenerado(): void {
  if (!this.blobFormularioDescuentoGenerado) {
    return;
  }

  const enlace = document.createElement('a');
  enlace.href = this.urlFormularioDescuentoGenerado || URL.createObjectURL(this.blobFormularioDescuentoGenerado);
  enlace.download = `Autorizacion-Descuento-${this.form.titular.numeroDocumento || 'titular'}.pdf`;
  enlace.click();
}

descargarFormulario6012Generado(): void {
  if (!this.blobFormulario6012Generado) {
    return;
  }

  const enlace = document.createElement('a');
  enlace.href = this.urlFormulario6012Generado || URL.createObjectURL(this.blobFormulario6012Generado);
  enlace.download = `Formulario-6012-${this.form.titular.numeroDocumento || 'titular'}.pdf`;
  enlace.click();
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
  this.errorPreparacionBackendLocal = '';

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
              this.errorPreparacionBackendLocal = '';

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

              this.errorPreparacionBackendLocal =
                'No fue posible registrar la aceptación legal.';

              console.error(
                this.errorPreparacionBackendLocal,
                error
              );

              this.mostrarAviso(
                this.errorPreparacionBackendLocal,
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

        this.errorPreparacionBackendLocal =
          'No fue posible abrir el expediente digital.';

        console.error(
          this.errorPreparacionBackendLocal,
          error
        );

        this.mostrarAviso(
          this.errorPreparacionBackendLocal,
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
      this.aceptaNotificacionesDeclaracion
        ? 'SI'
        : 'NO',

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

  const requiereConsentimientoDatos = this.form.esNuevo === true;

  // 1. Validación obligatoria de Declaración Jurada
  if (this.aceptaTerminosDeclaracion !== true) {
    this.mostrarAviso(
      'Debe aceptar los términos de la declaración jurada para continuar.',
      'advertencia',
      'Aceptación pendiente'
    );
    return;
  }

  // 2. Validación obligatoria de Protección de Datos Personales
  if (requiereConsentimientoDatos && this.aceptaTratamientoDatos !== true) {
    this.mostrarAviso(
      'Debe aceptar el tratamiento de datos personales para continuar.',
      'advertencia',
      'Consentimiento pendiente'
    );
    return;
  }

  // 3. Validación general del formulario
  if (!this.formularioValido()) {
    this.mostrarAviso(
      'Revise los campos pendientes antes de generar los documentos.',
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
        'Hay información pendiente de revisión antes de generar los documentos.',
        'advertencia',
        'Revise la solicitud'
      );
      this.scrollArriba();
      return;
    }
  }

  const tieneBeneficiarios = this.hayBeneficiariosRegistrados();

  if (tieneBeneficiarios && !this.beneficiariosValidosPara6012()) {
    this.pasoActual = 'beneficiarios';
    this.mostrarAviso(
      'Debe registrar beneficiarios válidos y asignar el 100% para generar el Formulario 6012.',
      'advertencia',
      'Beneficiarios pendientes'
    );
    this.scrollArriba();
    return;
  }

  this.form.notificacionesCorreo = 'SI';

  this.asegurarCodigoSolicitud();

  const finalizarGeneracion = (incluyeFormulario6012: boolean): void => {
    // Seguridad adicional: evita avanzar si por algún motivo cambió la aceptación antes de finalizar.
    if (this.aceptaTerminosDeclaracion !== true) {
      this.mostrarAviso(
        'Debe aceptar los términos de la declaración jurada para continuar.',
        'advertencia',
        'Aceptación pendiente'
      );
      return;
    }

    if (requiereConsentimientoDatos && this.aceptaTratamientoDatos !== true) {
      this.mostrarAviso(
        'Debe aceptar el tratamiento de datos personales para continuar.',
        'advertencia',
        'Consentimiento pendiente'
      );
      return;
    }

    const fecha = new Date();

    this.asegurarCodigoSolicitud();

    this.fechaGeneracionDocumentos =
      fecha.toLocaleString('es-PE');

    this.tipoGeneracionDocumentos = incluyeFormulario6012
      ? 'completa'
      : 'soloAutorizacion';

    this.autorizacionDescuentoGenerada = true;
    this.formulario6012Generado = incluyeFormulario6012;

    this.documentosGenerados = true;
    this.solicitudBloqueada = true;

    pasosPrevios.forEach(paso => {
      this.seccionesGrabadas[paso] = true;
    });

    console.log('Payload para generación de documentos:', this.construirPayloadFinal());

    this.pasoActual = 'documentos';
    this.intentoEnviar = false;
    this.scrollArriba();
  };

  const continuarGeneracionDocumental = (): void => {
  if (tieneBeneficiarios) {
    this.tipoGeneracionDocumentos = 'completa';

    console.log(
      'Payload para Autorización de Descuento:',
      this.construirPayloadFormularioDescuento()
    );

    console.log(
      'Payload para Formulario 6012:',
      this.construirPayloadFormulario6012()
    );

    this.generarFormularioDescuentoDesdeServicio(() => {
      this.generarFormulario6012DesdeServicio(() => {
        finalizarGeneracion(true);
      });
    });

    return;
  }

  this.tipoGeneracionDocumentos =
    'soloAutorizacion';

  console.log(
    'Payload para Autorización de Descuento:',
    this.construirPayloadFormularioDescuento()
  );

  this.generarFormularioDescuentoDesdeServicio(() => {
    finalizarGeneracion(false);

    this.mostrarAviso(
      'Autorización generada. El Formulario 6012 podrá generarse cuando registre beneficiarios.',
      'exito',
      'Documento listo'
    );
  });
};

this.prepararProcesoBackendLocal(
  continuarGeneracionDocumental
);
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
    this.mostrarAviso(
      'Debe registrar beneficiarios válidos y asignar el 100% para generar el Formulario 6012.',
      'advertencia',
      'Beneficiarios pendientes'
    );
    return;
  }

  this.tipoGeneracionDocumentos = 'soloFormulario6012';

  console.log(
    'Payload para Formulario 6012 pendiente:',
    this.construirPayloadFormulario6012()
  );

  this.generarFormulario6012DesdeServicio(() => {
    const fecha = new Date();

    this.fechaGeneracionDocumentos = fecha.toLocaleString('es-PE');

    this.formulario6012Generado = true;
    this.tipoGeneracionDocumentos = 'soloFormulario6012';

    this.pendienteBeneficiariosPara6012 = false;
    this.actualizandoBeneficiarios6012 = false;

    this.documentosGenerados = true;
    this.solicitudBloqueada = true;
    this.seccionesGrabadas.beneficiarios = true;

    console.log(
      'Payload final luego de generar Formulario 6012 pendiente:',
      this.construirPayloadFinal()
    );

    this.pasoActual = 'documentos';
    this.intentoEnviar = false;
    this.scrollArriba();
  });
}

descargarDocumentosSimulados(): void {
  if (!this.documentosGenerados) {
    this.mostrarAviso(
      'Primero debe generar los documentos.',
      'advertencia',
      'Documentos no generados'
    );
    return;
  }

  if (this.tipoGeneracionDocumentos === 'soloAutorizacion') {
    if (!this.blobFormularioDescuentoGenerado) {
      this.mostrarAviso(
        'No se encontró la Autorización de Descuento generada para descargar.',
        'error',
        'Documento no disponible'
      );
      return;
    }

    this.descargarFormularioDescuentoGenerado();

    this.mostrarAviso(
      'Autorización de Descuento descargada correctamente.',
      'exito',
      'Descarga lista'
    );
    return;
  }

  if (this.tipoGeneracionDocumentos === 'soloFormulario6012') {
    if (!this.blobFormulario6012Generado) {
      this.mostrarAviso(
        'No se encontró el Formulario 6012 generado para descargar.',
        'error',
        'Documento no disponible'
      );
      return;
    }

    this.descargarFormulario6012Generado();

    this.mostrarAviso(
      'Formulario 6012 descargado correctamente.',
      'exito',
      'Descarga lista'
    );
    return;
  }

  if (this.tipoGeneracionDocumentos === 'completa') {
    if (!this.blobFormularioDescuentoGenerado || !this.blobFormulario6012Generado) {
      this.mostrarAviso(
        'No se encontraron todos los documentos generados para descargar.',
        'error',
        'Documentos no disponibles'
      );
      return;
    }

    this.descargarFormularioDescuentoGenerado();

    setTimeout(() => {
      this.descargarFormulario6012Generado();
    }, 300);

    this.mostrarAviso(
      'Formulario 6012 y Autorización de Descuento descargados correctamente.',
      'exito',
      'Descarga lista'
    );
  }
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

    this.resultadoValidacionFormulario6012 =
      null;
  }

  if (tipo === 'autorizacionDescuento') {
    this.archivoAutorizacionDescuento =
      archivoValidado;

    this.idDocumentoCargadoAutorizacion =
      '';

    this.autorizacionValidadaBackend =
      false;

    this.resultadoValidacionAutorizacion =
      null;
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

publicarDocumentosSellados(): void {
  this.procesarCierreDocumental();
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

  this.mostrarAviso('Documentos validados y sellados disponibles en la plataforma.');
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
        if (
          tipoDocumento ===
          'formulario6012'
        ) {
          this.idDocumentoCargadoFormulario6012 =
            respuesta.idDocumentoCargado;
        }

        if (
          tipoDocumento ===
          'autorizacionDescuento'
        ) {
          this.idDocumentoCargadoAutorizacion =
            respuesta.idDocumentoCargado;
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
          this.resultadoValidacionFormulario6012 =
            resultado;

          this.formulario6012ValidadoBackend =
            validacionAprobada;
        }

        if (
          tipoDocumento ===
          'autorizacionDescuento'
        ) {
          this.resultadoValidacionAutorizacion =
            resultado;

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
          this.resultadoCierreAutorizacion =
            resultado;

          this.idDocumentoSelladoAutorizacion =
            idDocumentoSellado;

          this.idDocumentoPublicadoAutorizacion =
            idDocumentoPublicado;
        }

        if (
          tipoDocumento ===
          'formulario6012'
        ) {
          this.resultadoCierreFormulario6012 =
            resultado;

          this.idDocumentoSelladoFormulario6012 =
            idDocumentoSellado;

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

    this.correoEnvioDocumentos =
      this.form.correoViva;

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

        idDocumentoSelladoAutorizacion:
          this.idDocumentoSelladoAutorizacion,

        idDocumentoPublicadoAutorizacion:
          this.idDocumentoPublicadoAutorizacion,

        idDocumentoSelladoFormulario6012:
          this.idDocumentoSelladoFormulario6012,

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

      this.modoRetornoPendiente =
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
          'No se pudo abrir el documento publicado. Revise la respuesta del backend.',
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
          'No se pudo descargar el documento publicado. Revise la respuesta del backend.',
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
      'Primero debe cargar los documentos firmados al backend.',
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

        resultadoAutorizacion:
          this.resultadoValidacionAutorizacion,

        resultadoFormulario6012:
          this.resultadoValidacionFormulario6012
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
    this.validandoDocumentosBackend = false;
    this.documentosValidadosBackend = false;

    const permiteNuevaCarga =
      resultado.permiteNuevaCargaTrabajador
      !== false;

    this.mostrarAviso(
      this.mensajeRechazoValidacion
      || (
        permiteNuevaCarga
          ? 'El documento fue rechazado. Corrija el archivo y vuelva a cargarlo.'
          : 'El documento no superó la validación documental.'
      ),
      'error',
      'Documento rechazado',
      true
    );
  };

  const finalizarConError = (): void => {
    this.validandoDocumentosBackend = false;
    this.documentosValidadosBackend = false;

    this.mostrarAviso(
      'No se pudo ejecutar la validación documental completa. Revise Network y la consola del backend.',
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
      * Al terminar la carga, se ejecuta automáticamente
      * la validación documental completa.
      */
      this.validarDocumentosFirmados();
    };

    this.mostrarAviso(
      'Los documentos firmados fueron cargados correctamente. Permanecen pendientes de validación documental.',
      'exito',
      'Carga completada',
      true
    );
  

  const finalizarCargaConError = (): void => {
    this.cargandoDocumentosFirmadosBackend =
      false;

    this.documentosFirmadosCargadosBackend =
      false;

    this.mostrarAviso(
      'No se pudo completar la carga de los documentos firmados. Revise Network y la respuesta del backend.',
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

trackByIndex(index: number): number {
  return index;
}

};