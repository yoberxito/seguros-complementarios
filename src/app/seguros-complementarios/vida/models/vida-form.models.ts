export type Vista =
  | 'formulario'
  | 'exito';

export type TipoAviso =
  | 'info'
  | 'exito'
  | 'advertencia'
  | 'error';

export type ContextoConsultaPersona =
  | 'titular'
  | 'conyuge'
  | 'beneficiario';

export interface AvisoFlotante {
  tipo: TipoAviso;
  titulo: string;
  mensaje: string;
  persistente: boolean;
}

export type PasoFormulario =
  | 'titular'
  | 'trabajo'
  | 'conyuge'
  | 'beneficiarios'
  | 'declaracion'
  | 'documentos'
  | 'publicacion';

export type TipoDocumentoFirmado =
  | 'formulario6012'
  | 'autorizacionDescuento';

export type TipoGeneracionDocumentos =
  | 'completa'
  | 'soloAutorizacion'
  | 'soloFormulario6012'
  | null;

export type TipoAsegurado =
  | 'Regular'
  | 'Agrario'
  | 'Potestativo';

export interface TipoDocumento {
  codigo: string;
  descripcion: string;
  longitud?: number;
}

export interface PersonaDocumento {
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

export interface Beneficiario extends PersonaDocumento {
  porcentaje: string;
}

export interface FormularioVida {
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