import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable,
  map,
  throwError
} from 'rxjs';
import { environment } from '@environments/environment';


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
  acuseRegistrado: boolean;

  accesoDisponible: boolean;

  urlAcceso:
    string | null;

  textoAcuse: string;
  versionTextoAcuse: string;
}


export interface SolicitarOtpEntregaResponse {

  codResultado:
    string | number;

  mensaje: string;
}


export interface ValidarOtpEntregaResponse {

  valido: boolean;

  mensaje: string;

  intentosRestantes: number;
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

  /*
   * OTP institucional desplegado en QA.
   *
   * Solo generar y validar OTP utilizan
   * esta base por ahora.
   *
   * consultarEntrega() y confirmarRecepcion()
   * siguen temporalmente con baseUrl local
   * hasta confirmar sus endpoints QA.
   */

  baseUrlOtpQa = `${environment.apiUrlServices}/api/seguro-complementario`;

  /*
   * Correo temporal para pruebas QA
   * solicitado para la pantalla de acuse.
   */
  private readonly correoOtpQa =
    'diego.inga@essalud.gob.pe';


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
  ): Observable<SolicitarOtpEntregaResponse> {

    const params =
      new HttpParams()
        .set(
          'correo',
          this.correoOtpQa
        );

    const url =
      `${this.baseUrlOtpQa}/genera-otp`;

    /*
     * QA:
     *
     * POST /genera-otp
     * ?correo=...
     *
     * Este mismo endpoint genera el OTP
     * y envia el correo.
     */
    return this.http
      .post<SolicitarOtpEntregaResponse>(
        url,
        null,
        {
          params
        }
      );
  }

  validarOtp(
    codigo: string
  ): Observable<ValidarOtpEntregaResponse> {

    const codigoLimpio =
      (codigo || '').trim();

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

    const params =
      new HttpParams()
        .set(
          'correo',
          this.correoOtpQa
        )
        .set(
          'codigo',
          codigoLimpio
        );

    const url =
      `${this.baseUrlOtpQa}/validar-otp`;

    /*
     * QA:
     *
     * GET /validar-otp
     * ?correo=...
     * &codigo=XXXXXX
     */
    return this.http
      .get<ValidarOtpEntregaResponse>(
        url,
        {
          params
        }
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