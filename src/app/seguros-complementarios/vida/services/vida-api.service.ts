import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  map,
  Observable,
  throwError
} from 'rxjs';

export interface TipoDocumentoApi {
  idtipodocumento: string;
  descripcion: string;
}

interface RespuestaTiposDocumentoApi {
  flagResultado: string;
  mensaje: string;
  data: TipoDocumentoApi[];
}

export interface ValidarSeguroComplementarioResponse {
  tieneSeguro: boolean;
  nombreSeguro: string | null;
  tipoSeguro: string | null;
  dataCronogramaSegComplemt: unknown;
}

export interface RepresentanteDtoApi {
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  correo: string | null;
  celular: string | null;
}

export interface RespuestaPersonaContactoApi {
  representanteDto: RepresentanteDtoApi | null;
  codResultado: string;
  mensaje: string;
}

export interface PersonaConyugeConcubinoApi {
  nombre: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  tipoRelacion: string | null;
}

export interface RespuestaConyugeConcubinoApi {
  persona: PersonaConyugeConcubinoApi | null;
  flagResultado: string;
  mensaje: string;
}

export interface EmpresaEmpleadorApi {
  IDE_NUMERICO_ENTIDAD: number;
  RUC: string;
  RAZON_SOCIAL: string;
}

interface RespuestaListaEmpresasApi {
  flagResultado: string;
  mensaje: string;
  data: EmpresaEmpleadorApi[];
}

export interface DatosAseguradoApi {
  DGACTAS?: string | null;
}

export type TipoDocumentoFormulario6012 =
  | 'DNI'
  | 'CE'
  | 'OTRO';

export interface BeneficiarioFormulario6012Request {
  tipoDocumento: TipoDocumentoFormulario6012;
  numeroDocumento: string;
  nombresApellidos: string;
  porcentaje: number;
}

export interface GenerarFormulario6012Request {
  registroInternoProceso: string;

  tipoDocumentoTitular: string;
  numeroDocumentoTitular: string;
  nombresApellidosTitular: string;
  correoElectronico: string;

  tipoAsegurado: TipoAseguradoBackendLocal;

  convenioCgbvp: 'SI' | 'NO';
  rucEmpleador: string;

  tipoDocumentoConyuge: string | null;
  numeroDocumentoConyuge: string | null;
  nombresApellidosConyuge: string | null;

  notificacionCorreo: 'SI' | 'NO';

  generadoPor: 'SISTEMA';

  canalGeneracion:
    'MODULO_AFILIACION_DIGITAL';

  beneficiarios:
    BeneficiarioFormulario6012Request[];
}

export interface ApiResponseLocal<T> {
  codResultado: string;
  mensaje: string;
  body: T | null;
}

export interface RegistrarAvanceExpedienteRequest {
  registroInternoProceso: string;
  tipoDocumentoTrabajador: string;
  numeroDocumentoTrabajador: string;
  nombresApellidosTrabajador: string;

  canalAcceso: string;
  estadoOperativo: string;
  descripcionAvance: string;

  usuarioAutenticado: string;
  ipOrigen: string;
  datosSesionDispositivo: string;
}

export interface RegistrarAceptacionRequest {
  registroInternoProceso: string;
  tipoDocumentoTrabajador: string;
  numeroDocumentoTrabajador: string;
  nombresApellidosTrabajador: string;

  aceptaDeclaracionJurada: boolean;
  aceptaTratamientoDatosPersonales: boolean;

  canalAcceso: string;
  datosSesionDispositivo: string;

  versionTextoDeclaracionJurada: string;
  versionTextoTratamientoDatos: string;
  referenciaPoliticaPrivacidad: string;
}

export interface ExpedienteDigitalResponseLocal {
  registroInternoProceso?: string;
  estadoActual?: string;
  cantidadEventos?: number;

  [key: string]: unknown;
}

export interface RegistrarAceptacionResponseLocal {
  idAceptacion?: string;
  fechaRegistro?: string;

  [key: string]: unknown;
}

export type TipoAseguradoBackendLocal =
  | 'Regular'
  | 'Agrario'
  | 'Potestativo';

export interface GenerarFormularioDescuentoRequest {
  registroInternoProceso: string;

  tipoDocumentoTrabajador: string;
  numeroDocumentoTrabajador: string;
  nombresApellidosTrabajador: string;

  codigoPlanilla: string;
  decretoLegislativo: string;
  tipoAsegurado: TipoAseguradoBackendLocal;

  rucEmpleador: string;
  razonSocialEmpleador: string;

  montoPrimaMensual: number;

  correoElectronico: string;
  celular: string;

  generadoPor: string;
  canalGeneracion: 'MODULO_AFILIACION_DIGITAL';
}

export interface MetadataDocumentoGeneradoLocal {
  idDocumentoGenerado?: string;
  tipoDocumento?: string;
  registroInternoProceso?: string;

  [key: string]: unknown;
}

export interface GenerarDocumentoLocalResponse {
  generado: boolean;
  mensajeGeneracion: string;

  archivoBase64: string;
  contentType: string;
  nombreArchivo: string;

  metadataDocumentoGenerado:
    MetadataDocumentoGeneradoLocal | null;
}

export interface DocumentoGeneradoDescargadoLocal {
  idDocumentoGenerado: string;
  nombreArchivo: string;
  blob: Blob;
}

export type TipoDocumentoCargaLocal =
  | 'FORMULARIO_6012'
  | 'AUTORIZACION_DESCUENTO';

export interface DocumentoCargadoLocalResponse {
  idDocumentoCargado: string;

  hashDocumento?: string;
  numeroPaginas?: number;
  nombreArchivo?: string;
  tipoDocumento?: string;
  registroInternoProceso?: string;

  [key: string]: unknown;
}

export interface DetalleEtapaValidacionLocal {
  codigoEtapa?: string | number;
  nombreEtapa?: string;

  etapaAprobada?: boolean;
  estadoEtapa?: string;
  mensaje?: string;

  observaciones?: string[];

  [key: string]: unknown;
}

export interface ValidacionDocumentalCompletaResponseLocal {
  documentoAprobado: boolean;
  estadoValidacionDocumental: string;

  etapas?: DetalleEtapaValidacionLocal[];

  permiteNuevaCargaTrabajador?: boolean;
  idRechazoDocumental?: string | null;

  mensajeValidacion?: string;
  observaciones?: string[];

  registroInternoProceso?: string;
  tipoDocumento?: string;
  idDocumentoCargado?: string;

  [key: string]: unknown;
}

export interface CierreDocumentalCompletoResponseLocal {
  cierreCompletado: boolean;

  idDocumentoSellado?: string;
  idDocumentoPublicado?: string;


  estadoCierreDocumental?: string;
  urlVisualizacionSimulada?: string;
  estado?: string;
  estadoDocumento?: string;
  estadoProceso?: string;

  mensajeCierre?: string;

  registroInternoProceso?: string;
  tipoDocumento?: string;

  fechaHoraCierre?: string;
  fechaHoraPublicacion?: string;

  [key: string]: unknown;
}

export interface DatosAseguradoApi {
  DGACTAS?: string | null;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class VidaApiService {
  private readonly baseUrl = 'https://appsqa.essalud.gob.pe/sagw/mia-seguros-hijomenormayor/api';
  private readonly baseUrlVivaSolicitud =
  '/sagw/viva-essalud/mia-api-solicitud-incapacidad/api';
  private readonly baseUrlDatosMaestros =
  '/sagw/viva-essalud/viva-apidatosmaestros';
  private readonly baseUrlBackendLocal =
  'http://localhost/api/v1';

  constructor(private http: HttpClient) {}

  registrarAvanceExpediente(
    payload: RegistrarAvanceExpedienteRequest
  ): Observable<ExpedienteDigitalResponseLocal> {
    return this.http
      .post<ApiResponseLocal<ExpedienteDigitalResponseLocal>>(
        `${this.baseUrlBackendLocal}/expedientes/registrar-avance`,
        payload
      )
      .pipe(
        map(respuesta => {
          const operacionCorrecta =
            String(respuesta.codResultado).trim() === '1';

          if (!operacionCorrecta || !respuesta.body) {
            throw new Error(
              respuesta.mensaje
              || 'No fue posible abrir el expediente digital.'
            );
          }

          return respuesta.body;
        }),

        catchError((error: unknown) => {
          console.error(
            'Error registrando avance del expediente:',
            error
          );

          return throwError(() => error);
        })
      );
  }

  registrarAceptacionLegal(
    payload: RegistrarAceptacionRequest
  ): Observable<RegistrarAceptacionResponseLocal> {
    return this.http
      .post<ApiResponseLocal<RegistrarAceptacionResponseLocal>>(
        `${this.baseUrlBackendLocal}/aceptaciones/registrar`,
        payload
      )
      .pipe(
        map(respuesta => {
          const operacionCorrecta =
            String(respuesta.codResultado).trim() === '1';

          if (!operacionCorrecta || !respuesta.body) {
            throw new Error(
              respuesta.mensaje
              || 'No fue posible registrar la aceptación legal.'
            );
          }

          return respuesta.body;
        }),

        catchError((error: unknown) => {
          console.error(
            'Error registrando aceptación legal:',
            error
          );

          return throwError(() => error);
        })
      );
  }

  obtenerTiposDocumentos(): Observable<TipoDocumentoApi[]> {
    return this.http
      .get<RespuestaTiposDocumentoApi>(`${this.baseUrl}/informacion-general/getTiposDocumentos`)
      .pipe(
        map(respuesta => {
          if (respuesta.flagResultado !== '1') {
            throw new Error(respuesta.mensaje || 'No se pudo obtener los tipos de documento.');
          }

          return respuesta.data || [];
        }),
        catchError(error => {
          console.error('Error obteniendo tipos de documento:', error);
          return throwError(() => error);
        })
      );
  }

  validarSeguroComplementario(
    tipoDocumento: string,
    numeroDocumento: string
  ): Observable<ValidarSeguroComplementarioResponse> {
    const params = new HttpParams()
      .set('tpDocument', tipoDocumento)
      .set('numDocument', numeroDocumento);

    return this.http
      .get<ValidarSeguroComplementarioResponse>(
        `${this.baseUrl}/informacion-titular/val-seg-complement-vida`,
        { params }
      )
      .pipe(
        catchError(error => {
          console.error('Error validando seguro complementario:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerInformacionPersonaContacto(
    tipoDocumento: string,
    numeroDocumento: string
  ): Observable<RespuestaPersonaContactoApi> {
    const params = new HttpParams()
      .set('tipoDocumento', tipoDocumento)
      .set('numeroDocumento', numeroDocumento);

    return this.http
      .get<RespuestaPersonaContactoApi>(
        `${this.baseUrlVivaSolicitud}/consultas/get-data-representante`,
        { params }
      )
      .pipe(
        catchError((error: unknown) => {
          console.error('Error obteniendo información de persona/contacto:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerConyugeConcubino(
    tipoDocumento: string,
    numeroDocumento: string
  ): Observable<RespuestaConyugeConcubinoApi> {
    const params = new HttpParams()
      .set('tpDocument', tipoDocumento)
      .set('numDocument', numeroDocumento);

    return this.http
      .get<RespuestaConyugeConcubinoApi>(
        `${this.baseUrl}/informacion-titular/val-conguye-concubina`,
        { params }
      )
      .pipe(
        catchError((error: unknown) => {
          console.error(
            'Error obteniendo cónyuge o concubino:',
            error
          );

          return throwError(() => error);
        })
      );
  }

  obtenerListaEmpresas(
    tipoDocumento: string,
    numeroDocumento: string
  ): Observable<EmpresaEmpleadorApi[]> {
    const params = new HttpParams()
      .set('tipoDocumento', tipoDocumento)
      .set('numDocTitular', numeroDocumento);

    return this.http
      .get<RespuestaListaEmpresasApi>(
        `${this.baseUrl}/informacion-titular/obtenerListaEmpresas`,
        { params }
      )
      .pipe(
        map((respuesta: RespuestaListaEmpresasApi) => {
          if (respuesta.flagResultado !== '1') {
            throw new Error(respuesta.mensaje || 'No se pudo obtener el empleador.');
          }

          return respuesta.data || [];
        }),
        catchError((error: unknown) => {
          console.error('Error obteniendo empleador:', error);
          return throwError(() => error);
        })
      );
  }

generarFormulario6012(
  payload: GenerarFormulario6012Request
): Observable<DocumentoGeneradoDescargadoLocal> {
  const urlGeneracion =
    `${this.baseUrlBackendLocal}/documentos/formulario-6012/generar`;

  return this.http
    .post<ApiResponseLocal<GenerarDocumentoLocalResponse>>(
      urlGeneracion,
      payload
    )
    .pipe(
      map(respuesta => {
        const operacionCorrecta =
          String(respuesta.codResultado).trim() === '1';

        const resultado = respuesta.body;

        if (
          !operacionCorrecta
          || !resultado
          || resultado.generado !== true
          || !resultado.archivoBase64
        ) {
          throw new Error(
            respuesta.mensaje
            || resultado?.mensajeGeneracion
            || 'El backend no devolvió el PDF del Formulario 6012.'
          );
        }

        const blob = this.convertirBase64ABlob(
          resultado.archivoBase64,
          resultado.contentType
        );

        const idDocumentoGenerado =
          resultado.metadataDocumentoGenerado
            ?.idDocumentoGenerado
            ?.trim()
          || '';

        const nombreArchivo =
          resultado.nombreArchivo
          || `Formulario-6012-${payload.numeroDocumentoTitular}.pdf`;

        console.log(
          'Formulario 6012 generado en backend local:',
          {
            respuesta,
            idDocumentoGenerado,
            nombreArchivo,
            tipoArchivo: blob.type,
            tamanioBytes: blob.size
          }
        );

        return {
          idDocumentoGenerado,
          nombreArchivo,
          blob
        };
      }),

      catchError((error: unknown) => {
        console.error(
          'Error generando Formulario 6012 en backend local:',
          error
        );

        return throwError(() => error);
      })
    );
}  

generarFormularioDescuento(
  payload: GenerarFormularioDescuentoRequest
): Observable<DocumentoGeneradoDescargadoLocal> {
  const urlGeneracion =
    `${this.baseUrlBackendLocal}/documentos/autorizacion-descuento/generar`;

  return this.http
    .post<ApiResponseLocal<GenerarDocumentoLocalResponse>>(
      urlGeneracion,
      payload
    )
    .pipe(
      map(respuesta => {
        const operacionCorrecta =
          String(respuesta.codResultado).trim() === '1';

        const resultado = respuesta.body;

        if (
          !operacionCorrecta
          || !resultado
          || !resultado.generado
          || !resultado.archivoBase64
        ) {
          throw new Error(
            respuesta.mensaje
            || resultado?.mensajeGeneracion
            || 'El backend no devolvió el PDF de la Autorización de Descuento.'
          );
        }

        const blob = this.convertirBase64ABlob(
          resultado.archivoBase64,
          resultado.contentType
        );

        const idDocumentoGenerado =
          resultado.metadataDocumentoGenerado
            ?.idDocumentoGenerado
            ?.trim()
          || '';

        console.log(
          'Autorización generada en backend local:',
          {
            respuesta,
            idDocumentoGenerado,
            nombreArchivo: resultado.nombreArchivo,
            tipoArchivo: blob.type,
            tamanioBytes: blob.size
          }
        );

        return {
          idDocumentoGenerado,
          nombreArchivo:
            resultado.nombreArchivo
            || 'Autorizacion-Descuento.pdf',
          blob
        };
      }),

      catchError((error: unknown) => {
        console.error(
          'Error generando Autorización de Descuento en backend local:',
          error
        );

        return throwError(() => error);
      })
    );
}

cargarDocumentoFirmado(
  archivo: File,
  registroInternoProceso: string,
  tipoDocumento: TipoDocumentoCargaLocal,
  tipoDocumentoTrabajador: string,
  numeroDocumentoTrabajador: string,
  nombresApellidosTrabajador: string
): Observable<DocumentoCargadoLocalResponse> {
  const formData = new FormData();

  formData.append(
    'archivo',
    archivo,
    archivo.name
  );

  formData.append(
    'registroInternoProceso',
    registroInternoProceso
  );

  formData.append(
    'tipoDocumento',
    tipoDocumento
  );

  formData.append(
    'tipoDocumentoTrabajador',
    tipoDocumentoTrabajador
  );

  formData.append(
    'numeroDocumentoTrabajador',
    numeroDocumentoTrabajador
  );

  formData.append(
    'nombresApellidosTrabajador',
    nombresApellidosTrabajador
  );

  formData.append(
    'datosSesionDispositivo',
    'Navegador local / carga de documento firmado'
  );

  const url =
    `${this.baseUrlBackendLocal}/documentos/cargados/firmados`;

  return this.http
    .post<ApiResponseLocal<DocumentoCargadoLocalResponse>>(
      url,
      formData
    )
    .pipe(
      map(respuesta => {
        const operacionCorrecta =
          String(respuesta.codResultado).trim() === '1';

        const idDocumentoCargado =
          respuesta.body?.idDocumentoCargado?.trim()
          || '';

        if (
          !operacionCorrecta
          || !respuesta.body
          || !idDocumentoCargado
        ) {
          throw new Error(
            respuesta.mensaje
            || 'El backend no devolvió el identificador del documento cargado.'
          );
        }

        console.log(
          'Documento firmado registrado en backend:',
          respuesta
        );

        return respuesta.body;
      }),

      catchError((error: unknown) => {
        console.error(
          'Error cargando documento firmado:',
          error
        );

        return throwError(() => error);
      })
    );
}

validarDocumentoCompleto(
  archivo: File,
  registroInternoProceso: string,
  tipoDocumento: TipoDocumentoCargaLocal,
  tipoDocumentoTrabajador: string,
  numeroDocumentoTrabajador: string,
  idDocumentoCargado: string,
  usuarioAutenticado: string
): Observable<
  ApiResponseLocal<ValidacionDocumentalCompletaResponseLocal>
> {
  const formData = new FormData();

  formData.append(
    'archivo',
    archivo,
    archivo.name
  );

  formData.append(
    'registroInternoProceso',
    registroInternoProceso
  );

  formData.append(
    'tipoDocumento',
    tipoDocumento
  );

  formData.append(
    'tipoDocumentoTrabajador',
    tipoDocumentoTrabajador
  );

  formData.append(
    'numeroDocumentoTrabajador',
    numeroDocumentoTrabajador
  );

  formData.append(
    'idDocumentoCargado',
    idDocumentoCargado
  );

  formData.append(
    'usuarioAutenticado',
    usuarioAutenticado
  );

  formData.append(
    'ipOrigen',
    '0:0:0:0:0:0:0:1'
  );

  formData.append(
    'datosSesionDispositivo',
    'Navegador local / validación documental completa'
  );

  const url =
    `${this.baseUrlBackendLocal}/documentos/validacion/completa`;

  return this.http
    .post<
      ApiResponseLocal<ValidacionDocumentalCompletaResponseLocal>
    >(
      url,
      formData
    )
    .pipe(
      map(respuesta => {
        /*
          Una validación rechazada puede ser una respuesta funcional
          válida del backend. Por eso no exigimos codResultado === "1".
          Necesitamos conservar el body para distinguir aprobación
          de RECHAZADO_VALIDACION_DOCUMENTAL.
        */
        if (!respuesta.body) {
          throw new Error(
            respuesta.mensaje
            || 'El backend no devolvió el resultado de la validación documental.'
          );
        }

        console.log(
          'Respuesta de validación documental completa:',
          respuesta
        );

        return respuesta;
      }),

      catchError((error: unknown) => {
        console.error(
          'Error ejecutando validación documental completa:',
          error
        );

        return throwError(() => error);
      })
    );
}

procesarCierreDocumental(
  archivo: File,
  registroInternoProceso: string,
  tipoDocumento: TipoDocumentoCargaLocal,
  tipoDocumentoTrabajador: string,
  numeroDocumentoTrabajador: string,
  nombresApellidosTrabajador: string
): Observable<
  ApiResponseLocal<CierreDocumentalCompletoResponseLocal>
> {
  const formData = new FormData();

  formData.append(
    'archivo',
    archivo,
    archivo.name
  );

  formData.append(
    'registroInternoProceso',
    registroInternoProceso
  );

  formData.append(
    'tipoDocumento',
    tipoDocumento
  );

  formData.append(
    'tipoDocumentoTrabajador',
    tipoDocumentoTrabajador
  );

  formData.append(
    'numeroDocumentoTrabajador',
    numeroDocumentoTrabajador
  );

  formData.append(
    'nombresApellidosTrabajador',
    nombresApellidosTrabajador
  );

  formData.append(
    'canalPublicacion',
    'SOMOS_ESSALUD'
  );

  formData.append(
    'publicadoPor',
    'SISTEMA'
  );

  formData.append(
    'usuarioResponsable',
    'SISTEMA'
  );

  formData.append(
    'ipOrigen',
    '0:0:0:0:0:0:0:1'
  );

  formData.append(
    'datosSesionDispositivo',
    'Backend local / cierre documental completo'
  );

  const url =
    `${this.baseUrlBackendLocal}/documentos/cierre/procesar`;

  return this.http
    .post<
      ApiResponseLocal<CierreDocumentalCompletoResponseLocal>
    >(
      url,
      formData
    )
    .pipe(
      map(respuesta => {
        if (!respuesta.body) {
          throw new Error(
            respuesta.mensaje
            || 'El backend no devolvió el resultado del cierre documental.'
          );
        }

        console.log(
          'Respuesta del cierre documental:',
          respuesta
        );

        return respuesta;
      }),

      catchError((error: unknown) => {
        console.error(
          'Error ejecutando el cierre documental:',
          error
        );

        return throwError(() => error);
      })
    );
}

obtenerDocumentoPublicado(
  idDocumentoPublicado: string
): Observable<Blob> {
  const idSeguro =
    idDocumentoPublicado.trim();

  if (!idSeguro) {
    return throwError(
      () => new Error(
        'El identificador del documento publicado es obligatorio.'
      )
    );
  }

  const url =
    `${this.baseUrlBackendLocal}`
    + `/documentos/publicacion/`
    + `${encodeURIComponent(idSeguro)}`
    + `/archivo`;

  console.log(
    'Descargando documento publicado:',
    {
      idDocumentoPublicado: idSeguro,
      url
    }
  );

  return this.http
    .get(
      url,
      {
        responseType: 'blob'
      }
    )
    .pipe(
      map(blob => {
        if (!blob || blob.size === 0) {
          throw new Error(
            'El backend devolvió un archivo vacío.'
          );
        }

        console.log(
          'Documento publicado recibido:',
          {
            idDocumentoPublicado: idSeguro,
            tamanioBytes: blob.size,
            contentType: blob.type
          }
        );

        return blob;
      }),

      catchError((error: unknown) => {
        console.error(
          'Error obteniendo documento publicado:',
          error
        );

        return throwError(() => error);
      })
    );
}

private convertirBase64ABlob(
  archivoBase64: string,
  contentType: string
): Blob {
  const base64Limpio = archivoBase64.includes(',')
    ? archivoBase64.split(',')[1]
    : archivoBase64;

  const contenidoBinario = atob(base64Limpio);
  const bytes = new Uint8Array(contenidoBinario.length);

  for (let i = 0; i < contenidoBinario.length; i++) {
    bytes[i] = contenidoBinario.charCodeAt(i);
  }

  return new Blob(
    [bytes],
    {
      type: contentType || 'application/pdf'
    }
  );
}

private descargarDocumentoGenerado(
  idDocumentoGenerado: string
): Observable<Blob> {
  const idSeguro = encodeURIComponent(
    idDocumentoGenerado.trim()
  );

  const urlDescarga =
    `${this.baseUrlBackendLocal}/documentos/generados/${idSeguro}/archivo`;

  console.log(
    'Descargando documento generado:',
    urlDescarga
  );

  return this.http.get(
    urlDescarga,
    {
      responseType: 'blob'
    }
  );
}

  private mapearTipoDocumentoDatosMaestros(codigoTipoDocumento: string): number | null {
    const codigo = (codigoTipoDocumento || '')
      .trim()
      .split('-')[0]
      .padStart(2, '0');

    const mapaTipoDocumento: Record<string, number> = {
      '01': 1,
      '04': 2,
      '07': 3,
      '23': 4,
      '27': 5,
      '28': 6,
      '29': 7
    };

    return mapaTipoDocumento[codigo] ?? null;
  }

  obtenerDatosAsegurado(
    tipoDocumento: string,
    numeroDocumento: string
  ): Observable<DatosAseguradoApi> {
    const tipoDocumentoMapeado = this.mapearTipoDocumentoDatosMaestros(tipoDocumento);

    if (!tipoDocumentoMapeado) {
      return throwError(() => new Error(`Tipo de documento no soportado para datos maestros: ${tipoDocumento}`));
    }

    const params = new HttpParams()
      .set('VS_TIPODOCUME', tipoDocumentoMapeado.toString())
      .set('VS_NRODOCUMEN', numeroDocumento);

    console.log('Consultando tipo de asegurado:', {
      tipoDocumentoOriginal: tipoDocumento,
      tipoDocumentoMapeado,
      numeroDocumento
    });

    return this.http
      .get<DatosAseguradoApi>(
        `${this.baseUrlDatosMaestros}/ASEGURADO/Buscar`,
        { params }
      )
      .pipe(
        catchError((error: unknown) => {
          console.error('Error obteniendo datos de asegurado:', error);
          return throwError(() => error);
        })
      );
  }

}