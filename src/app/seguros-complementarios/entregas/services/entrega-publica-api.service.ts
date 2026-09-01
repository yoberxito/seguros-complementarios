import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable,
  map,
  throwError
} from 'rxjs';


export interface ApiResponseEntrega<T> {
  codResultado: string;
  mensaje: string;
  body: T | null;
}


export interface EntregaPublicaResponse {

  destinatario: string;

  fechaInicioPeriodo: string;
  fechaFinPeriodo: string;

  fechaPublicacion:
    string | null;

  cantidadDocumentos: number;

  correoEnmascarado:
    string | null;

  estadoEntrega: string;


  fechaAcuse:
  string | null;
  otpValidado: boolean;
  acuseRegistrado: boolean;

  accesoDisponible: boolean;

  urlAcceso:
    string | null;

  textoAcuse: string;
  versionTextoAcuse: string;
}


export interface SolicitarOtpEntregaResponse {

  correoEnmascarado:
    string | null;

  correoEnviado: boolean;

  mensaje: string;

  nuevoOtpGenerado: boolean;

  otpDisponible: boolean;

  otpYaValidado: boolean;
}


export interface ValidarOtpEntregaResponse {

  otpValidado: boolean;
  yaValidado: boolean;

  correoEnmascarado:
    string | null;

  mensaje: string;
}


export interface ConfirmarAcuseEntregaResponse {

  acuseRegistrado: boolean;
  yaRegistrado: boolean;

  fechaAcuse:
    string | null;

  textoAcuse:
    string | null;

  versionTextoAcuse:
    string | null;

  accesoDisponible: boolean;

  urlAcceso:
    string | null;
}


@Injectable({
  providedIn: 'root'
})
export class EntregaPublicaApiService {

  private readonly baseUrl =
    'http://localhost/api/v1/entregas/publicas';


  constructor(
    private http: HttpClient
  ) {
  }


  consultarEntrega(
    token: string
  ): Observable<EntregaPublicaResponse> {

    const tokenLimpio =
      (token || '').trim();

    if (!tokenLimpio) {

      return throwError(
        () => new Error(
          'El enlace de la entrega no es válido.'
        )
      );
    }

    const url =
      `${this.baseUrl}/`
      + `${encodeURIComponent(tokenLimpio)}`;

    return this.http
      .get<
        ApiResponseEntrega<
          EntregaPublicaResponse
        >
      >(url)
      .pipe(

        map(
          respuesta =>
            this.extraerBody(
              respuesta,
              'No fue posible consultar la entrega.'
            )
        )

      );
  }


  solicitarOtp(
    token: string
  ): Observable<SolicitarOtpEntregaResponse> {

    const tokenLimpio =
      (token || '').trim();

    if (!tokenLimpio) {

      return throwError(
        () => new Error(
          'El enlace de la entrega no es válido.'
        )
      );
    }

    const url =
      `${this.baseUrl}/`
      + `${encodeURIComponent(tokenLimpio)}`
      + `/otp/solicitar`;

    /*
     * IMPORTANTE:
     *
     * No enviamos correo desde Angular.
     *
     * El backend resuelve el correo autorizado
     * usando el token y Oracle.
     */
    return this.http
      .post<
        ApiResponseEntrega<
          SolicitarOtpEntregaResponse
        >
      >(
        url,
        null
      )
      .pipe(

        map(
          respuesta =>
            this.extraerBody(
              respuesta,
              'No fue posible solicitar el código OTP.'
            )
        )

      );
  }


  validarOtp(
    token: string,
    codigo: string
  ): Observable<ValidarOtpEntregaResponse> {

    const tokenLimpio =
      (token || '').trim();

    const codigoLimpio =
      (codigo || '').trim();

    if (!tokenLimpio) {

      return throwError(
        () => new Error(
          'El enlace de la entrega no es válido.'
        )
      );
    }

    if (
      !/^\d{6}$/.test(
        codigoLimpio
      )
    ) {

      return throwError(
        () => new Error(
          'El código OTP debe contener 6 dígitos.'
        )
      );
    }

    const url =
      `${this.baseUrl}/`
      + `${encodeURIComponent(tokenLimpio)}`
      + `/otp/validar`;

    /*
     * El único dato funcional enviado
     * por Angular es el código OTP.
     *
     * NO correo.
     */
    return this.http
      .post<
        ApiResponseEntrega<
          ValidarOtpEntregaResponse
        >
      >(
        url,
        {
          codigo: codigoLimpio
        }
      )
      .pipe(

        map(
          respuesta =>
            this.extraerBody(
              respuesta,
              'No fue posible validar el código OTP.'
            )
        )

      );
  }


  confirmarRecepcion(
    token: string
  ): Observable<ConfirmarAcuseEntregaResponse> {

    const tokenLimpio =
      (token || '').trim();

    if (!tokenLimpio) {

      return throwError(
        () => new Error(
          'El enlace de la entrega no es válido.'
        )
      );
    }

    const url =
      `${this.baseUrl}/`
      + `${encodeURIComponent(tokenLimpio)}`
      + `/confirmar`;

    /*
     * Angular NO manda:
     *
     * - texto del acuse
     * - versión
     * - correo
     * - fecha
     * - IP
     * - User-Agent
     *
     * Esa evidencia es responsabilidad
     * del backend.
     */
    return this.http
      .post<
        ApiResponseEntrega<
          ConfirmarAcuseEntregaResponse
        >
      >(
        url,
        null
      )
      .pipe(

        map(
          respuesta =>
            this.extraerBody(
              respuesta,
              'No fue posible registrar la recepción.'
            )
        )

      );
  }


  private extraerBody<T>(
    respuesta: ApiResponseEntrega<T>,
    mensajeRespaldo: string
  ): T {

    if (
      respuesta.body === null
      || respuesta.body === undefined
    ) {

      throw new Error(
        respuesta.mensaje
        || mensajeRespaldo
      );
    }

    return respuesta.body;
  }
}