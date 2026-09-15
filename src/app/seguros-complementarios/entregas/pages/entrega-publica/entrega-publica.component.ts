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

  identidadValidadaLocal = false;

  private otpValidadoInstitucionalmenteLocal =
    false;

  private mensajeOtpValidadoInstitucional =
    '';


  descargandoLote = false;
  registrandoDescarga = false;

  private descargaTransferidaLocal =
    false;

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

    return this.identidadValidadaLocal;
  }


  get descargaRegistrada(): boolean {

    return this.entrega
      ?.descargaRegistrada === true;
  }


  get descargaPendienteRegistro(): boolean {

    return this.descargaTransferidaLocal
      && !this.descargaRegistrada;
  }


  get puedeVerificarIdentidad(): boolean {

    return !!this.entrega
      && !this.identidadValidadaLocal
      && !this.entrega.acuseRegistrado;
  }


  get puedeDescargarLote(): boolean {

    return !!this.entrega
      && this.identidadValidadaLocal
      && !this.entrega.descargaRegistrada
      && !this.entrega.acuseRegistrado;
  }


  get puedeConfirmarRecepcion(): boolean {

    return !!this.entrega
      && this.identidadValidadaLocal
      && this.entrega.descargaRegistrada
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

      if (!this.descargaRegistrada) {
        return 'Pendiente de descarga';
      }

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
      .solicitarOtp()
      .subscribe({

        next: respuesta => {

          this.solicitandoOtp =
            false;

          const codResultado =
            String(
              respuesta.codResultado
              ?? ''
            ).trim();

          const mensaje =
            (
              respuesta.mensaje
              || ''
            ).trim();

          if (codResultado === '0') {

            this.mensajeOtp =
              mensaje
              || 'El código de verificación fue generado y enviado correctamente.';

            return;
          }

          this.errorOtp =
            mensaje
            || 'No fue posible generar y enviar el código OTP.';
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

    if (
      this.otpValidadoInstitucionalmenteLocal
    ) {

      this.validandoOtp =
        true;

      this.errorOtp = '';

      this.registrarTrazabilidadOtp();

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
        this.codigoOtp
      )
      .subscribe({

        next: respuesta => {

          this.validandoOtp =
            false;


          if (
            respuesta.valido !== true
          ) {

            this.validandoOtp =
              false;

            this.errorOtp =
              respuesta.mensaje
              || 'El código OTP ingresado no es válido.';

            return;
          }

          this.otpValidadoInstitucionalmenteLocal =
            true;

          this.mensajeOtpValidadoInstitucional =
            respuesta.mensaje
            || 'Identidad verificada correctamente.';

          this.registrarTrazabilidadOtp();
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




  private registrarTrazabilidadOtp(): void {

    this.validandoOtp =
      true;

    this.errorOtp = '';
    this.entregaApi
      .registrarOtpValidado(
        this.token
      )
      .subscribe({

        next: () => {

          this.validandoOtp =
            false;

          this.codigoOtp = '';
          this.mostrarModalOtp = false;

          this.mensajeAccion =
            this.mensajeOtpValidadoInstitucional
            || 'Identidad verificada correctamente.';

          this.errorAccion = '';
          this.errorOtp = '';

          this.identidadValidadaLocal =
            true;

          this.otpValidadoInstitucionalmenteLocal =
            false;

          this.mensajeOtpValidadoInstitucional =
            '';
        },

        error: error => {

          this.validandoOtp =
            false;

          this.errorOtp =
            this.obtenerMensajeError(
              error,
              'El OTP fue validado, pero no fue posible registrar la trazabilidad. Intente nuevamente.'
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
    this.otpValidadoInstitucionalmenteLocal =
      false;

    this.mensajeOtpValidadoInstitucional =
      '';
  }


  descargarLote(): void {

    if (
      !this.puedeDescargarLote
      || this.descargandoLote
      || this.registrandoDescarga
    ) {
      return;
    }

    this.mensajeAccion = '';
    this.errorAccion = '';

    /*
     * Si el ZIP ya fue transferido pero falló
     * solamente el registro de trazabilidad,
     * reintentamos solo el POST.
     */
    if (
      this.descargaTransferidaLocal
    ) {

      this.registrarTrazabilidadDescarga();

      return;
    }

    this.descargandoLote =
      true;

    this.entregaApi
      .descargarLote(
        this.token
      )
      .subscribe({

        next: resultado => {

          this.descargandoLote =
            false;

          const nombreArchivo =
            resultado.nombreArchivo
            || this.construirNombreLoteLocal();

          try {

            this.dispararDescargaArchivo(
              resultado.blob,
              nombreArchivo
            );

          } catch {

            this.errorAccion =
              'El lote fue recibido, pero el navegador no pudo iniciar la descarga del archivo.';

            return;
          }

          this.descargaTransferidaLocal =
            true;

          this.registrarTrazabilidadDescarga();
        },


        error: error => {

          this.descargandoLote =
            false;

          this.errorAccion =
            this.obtenerMensajeError(
              error,
              'No fue posible descargar el lote.'
            );
        }

      });
  }


  private registrarTrazabilidadDescarga(): void {

    if (
      this.registrandoDescarga
    ) {
      return;
    }

    this.registrandoDescarga =
      true;

    this.errorAccion = '';

    this.entregaApi
      .registrarDescargaCompletada(
        this.token
      )
      .subscribe({

        next: () => {

          this.registrandoDescarga =
            false;

          this.descargaTransferidaLocal =
            false;

          if (this.entrega) {

            this.entrega = {
              ...this.entrega,
              descargaRegistrada: true
            };
          }

          this.mensajeAccion =
            'Descarga del lote registrada correctamente. Ya puede confirmar la recepción.';

          this.errorAccion = '';
        },


        error: error => {

          this.registrandoDescarga =
            false;

          this.errorAccion =
            this.obtenerMensajeError(
              error,
              'El lote fue descargado, pero no fue posible registrar la trazabilidad. Intente nuevamente.'
            );
        }

      });
  }


  private dispararDescargaArchivo(
    blob: Blob,
    nombreArchivo: string
  ): void {

    if (
      !blob
      || blob.size <= 0
    ) {
      throw new Error(
        'El lote descargado se encuentra vacío.'
      );
    }

    const url =
      URL.createObjectURL(
        blob
      );

    const enlace =
      document.createElement(
        'a'
      );

    enlace.href =
      url;

    enlace.download =
      nombreArchivo;

    enlace.style.display =
      'none';

    document.body.appendChild(
      enlace
    );

    enlace.click();

    enlace.remove();

    window.setTimeout(
      () => {
        URL.revokeObjectURL(
          url
        );
      },
      1000
    );
  }


  private construirNombreLoteLocal(): string {

    const inicio =
      (
        this.entrega
          ?.fechaInicioPeriodo
        || 'inicio'
      ).split('T')[0];

    const fin =
      (
        this.entrega
          ?.fechaFinPeriodo
        || 'fin'
      ).split('T')[0];

    return (
      'Lote_Mas_Vida_PERSONAL_'
      + inicio
      + '_'
      + fin
      + '.zip'
    );
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