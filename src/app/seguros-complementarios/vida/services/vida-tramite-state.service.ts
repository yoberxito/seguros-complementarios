import { Injectable } from '@angular/core';

import {
  FormularioVida,
  PasoFormulario
} from '../models/vida-form.models';

@Injectable({
  providedIn: 'root'
})
export class VidaTramiteStateService {

   private estadoInicializado = false;

    estaInicializado(): boolean {
    return this.estadoInicializado;
    }

    marcarInicializado(): void {
    this.estadoInicializado = true;
    }

  form: FormularioVida =
    this.crearCasoNuevo();

  pasoActual: PasoFormulario =
    'titular';

  registroInternoProceso = '';

  seccionesGrabadas:
    Record<PasoFormulario, boolean> =
      this.crearEstadoSecciones();

    documentosGenerados = false;

    solicitudBloqueada = false;

    pendienteBeneficiariosPara6012 = false;

    documentosPublicados = false;


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
      razonSocial: '',
      rucDesdeBase: false,
      razonSocialDesdeBase: false,

      conyuge: null,
      conyugeDesdeBase: false,

      beneficiarios: []
    };
  }

  crearEstadoSecciones():
    Record<PasoFormulario, boolean> {
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
}