import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  EntregaPublicaApiService,
  EntregaPublicaResponse
} from '../../services/entrega-publica-api.service';


@Component({
  selector: 'app-entrega-publica',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './entrega-publica.component.html',

  styleUrl:
    './entrega-publica.component.css'
})
export class EntregaPublicaComponent
        implements OnInit {

  token = '';

  entrega:
    EntregaPublicaResponse | null =
      null;


  cargandoEntrega = true;

  errorCarga = '';


  mostrarModalOtp = false;

  solicitandoOtp = false;
  validandoOtp = false;

  codigoOtp = '';

  mensajeOtp = '';
  errorOtp = '';


  confirmandoAcuse = false;

  mensajeAccion = '';
  errorAccion = '';


  constructor(
    private route: ActivatedRoute,

    private entregaApi:
      EntregaPublicaApiService
  ) {
  }


  ngOnInit(): void {

    this.token =
      (
        this.route
          .snapshot
          .paramMap
          .get('token')
        || ''
      ).trim();

    if (!this.token) {

      this.cargandoEntrega =
        false;

      this.errorCarga =
        'El enlace de recepción no es válido.';

      return;
    }

    this.cargarEntrega();
  }


  get recepcionRegistrada(): boolean {

    return this.entrega
      ?.acuseRegistrado === true;
  }


  get identidadValidada(): boolean {

    return this.entrega
      ?.otpValidado === true;
  }


  get puedeVerificarIdentidad(): boolean {

    return !!this.entrega
      && !this.entrega.otpValidado
      && !this.entrega.acuseRegistrado;
  }


  get puedeConfirmarRecepcion(): boolean {

    return !!this.entrega
      && this.entrega.otpValidado
      && !this.entrega.acuseRegistrado;
  }


  get estadoVisible(): string {

    if (
      this.recepcionRegistrada
    ) {

      return 'Recepción registrada';
    }

    if (
      this.identidadValidada
    ) {

      return 'Pendiente de confirmación';
    }

    return 'Pendiente de recepción';
  }

  get destinatarioVisible(): string {

    const destinatario =
      (
        this.entrega
          ?.destinatario
        || ''
      ).trim();

    if (
      destinatario
        .toUpperCase()
        === 'PERSONAL'
    ) {

      return 'Personal / Planillas EsSalud';
    }

    return destinatario || '—';
  }


  cargarEntrega(
    mostrarCarga = true
  ): void {

    if (mostrarCarga) {

      this.cargandoEntrega =
        true;
    }

    this.errorCarga = '';

    this.entregaApi
      .consultarEntrega(
        this.token
      )
      .subscribe({

        next: respuesta => {

          this.entrega =
            respuesta;

          this.cargandoEntrega =
            false;
        },


        error: error => {

          this.cargandoEntrega =
            false;

          this.errorCarga =
            this.obtenerMensajeError(
              error,
              'No fue posible consultar la entrega.'
            );
        }

      });
  }


  iniciarVerificacionIdentidad(): void {

    if (
      !this.puedeVerificarIdentidad
      || this.solicitandoOtp
      || this.validandoOtp
    ) {

      return;
    }

    this.codigoOtp = '';

    this.mensajeOtp = '';
    this.errorOtp = '';

    this.mostrarModalOtp =
      true;

    /*
     * Al abrir el modal solicitamos
     * inmediatamente el OTP.
     */
    this.solicitarCodigoOtp();
  }


  solicitarCodigoOtp(): void {

    if (
      this.solicitandoOtp
      || this.validandoOtp
    ) {

      return;
    }

    this.solicitandoOtp =
      true;

    this.mensajeOtp = '';
    this.errorOtp = '';

    this.entregaApi
      .solicitarOtp(
        this.token
      )
      .subscribe({

        next: respuesta => {

          this.solicitandoOtp =
            false;

          /*
           * Si por concurrencia/F5 Oracle
           * ya muestra OTP validado,
           * recuperamos el estado real.
           */
          if (
            respuesta.otpYaValidado
          ) {

            this.mostrarModalOtp =
              false;

            this.mensajeAccion =
              'La identidad ya se encontraba verificada.';

            this.errorAccion = '';

            this.cargarEntrega(
              false
            );

            return;
          }

          this.mensajeOtp =
            respuesta.mensaje
            || (
              respuesta.otpDisponible
                ? 'Código OTP disponible para validación.'
                : 'No fue posible disponer de un código OTP.'
            );
        },


        error: error => {

          this.solicitandoOtp =
            false;

          this.errorOtp =
            this.obtenerMensajeError(
              error,
              'No fue posible solicitar el código OTP.'
            );
        }

      });
  }


  normalizarCodigoOtp(): void {

    this.codigoOtp =
      (
        this.codigoOtp
        || ''
      )
        .replace(
          /\D/g,
          ''
        )
        .slice(
          0,
          6
        );
  }


  validarCodigoOtp(): void {

    if (
      this.validandoOtp
      || this.solicitandoOtp
    ) {

      return;
    }

    this.normalizarCodigoOtp();

    if (
      !/^\d{6}$/.test(
        this.codigoOtp
      )
    ) {

      this.errorOtp =
        'Ingrese los 6 dígitos del código recibido.';

      return;
    }

    this.validandoOtp =
      true;

    this.errorOtp = '';

    this.entregaApi
      .validarOtp(
        this.token,
        this.codigoOtp
      )
      .subscribe({

        next: respuesta => {

          this.validandoOtp =
            false;

          /*
           * OTP inválido no es error técnico.
           * Backend devuelve HTTP 200
           * con otpValidado=false.
           */
          if (
            !respuesta.otpValidado
          ) {

            this.errorOtp =
              respuesta.mensaje
              || 'El código OTP ingresado no es válido.';

            return;
          }

          this.codigoOtp = '';

          this.mostrarModalOtp =
            false;

          this.mensajeAccion =
            respuesta.yaValidado
              ? 'La identidad ya se encontraba verificada.'
              : 'Identidad verificada correctamente.';

          this.errorAccion = '';

          /*
           * GET nuevamente para que
           * Oracle sea fuente de verdad.
           */
          this.cargarEntrega(
            false
          );
        },


        error: error => {

          this.validandoOtp =
            false;

          this.errorOtp =
            this.obtenerMensajeError(
              error,
              'No fue posible validar el código OTP.'
            );
        }

      });
  }


  cerrarModalOtp(): void {

    if (
      this.solicitandoOtp
      || this.validandoOtp
    ) {

      return;
    }

    this.mostrarModalOtp =
      false;

    this.codigoOtp = '';

    this.mensajeOtp = '';
    this.errorOtp = '';
  }


  confirmarRecepcion(): void {

    if (
      !this.puedeConfirmarRecepcion
      || this.confirmandoAcuse
    ) {

      return;
    }

    this.confirmandoAcuse =
      true;

    this.mensajeAccion = '';
    this.errorAccion = '';

    this.entregaApi
      .confirmarRecepcion(
        this.token
      )
      .subscribe({

        next: respuesta => {

          this.confirmandoAcuse =
            false;

          this.mensajeAccion =
            respuesta.yaRegistrado
              ? 'La recepción ya se encontraba registrada.'
              : 'Recepción registrada correctamente.';

          /*
           * Recuperamos nuevamente el
           * estado definitivo desde Oracle.
           */
          this.cargarEntrega(
            false
          );
        },


        error: error => {

          this.confirmandoAcuse =
            false;

          this.errorAccion =
            this.obtenerMensajeError(
              error,
              'No fue posible registrar la recepción.'
            );
        }

      });
  }


  formatearPeriodo(): string {

    if (!this.entrega) {

      return '—';
    }

    return (
      this.formatearFecha(
        this.entrega
          .fechaInicioPeriodo
      )
      + ' - '
      + this.formatearFecha(
        this.entrega
          .fechaFinPeriodo
      )
    );
  }


  formatearFecha(
    valor:
      string | null | undefined
  ): string {

    if (!valor) {

      return '—';
    }

    /*
     * No usamos:
     *
     * new Date('2026-08-01')
     *
     * porque la conversión UTC/local
     * puede desplazar un día.
     */
    const parteFecha =
      valor
        .split('T')[0]
        .trim();

    const coincidencia =
      /^(\d{4})-(\d{2})-(\d{2})$/
        .exec(
          parteFecha
        );

    if (!coincidencia) {

      return valor;
    }

    return (
      coincidencia[3]
      + '/'
      + coincidencia[2]
      + '/'
      + coincidencia[1]
    );
  }


  formatearFechaHora(
  valor:
    string | null | undefined
): string {

  if (!valor) {

    return '';
  }

  const coincidencia =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
      .exec(
        valor.trim()
      );

  if (!coincidencia) {

    return valor;
  }

  return (
    coincidencia[3]
    + '/'
    + coincidencia[2]
    + '/'
    + coincidencia[1]
    + ' a las '
    + coincidencia[4]
    + ':'
    + coincidencia[5]
  );
}

  private obtenerMensajeError(
    error: unknown,
    respaldo: string
  ): string {

    const respuesta =
      error as {
        error?: {
          mensaje?: string;
        };
        message?: string;
      };

    return (
      respuesta
        ?.error
        ?.mensaje

      || respuesta
        ?.message

      || respaldo
    );
  }
}