/**
 * Bandera temporal PROPIA del modulo +Vida.
 * No modifica environment.*, SOMOS ni la validacion de tokens de otro equipo.
 * Cambiar esta constante exige recompilar y redesplegar Angular.
 */
export const MARCHA_BLANCA_VIDA: Readonly<{
  restringirSedeCentral: boolean;
  codigoRedPermitida: string;
}> = {
  restringirSedeCentral: true,
  codigoRedPermitida: '100'
};

export const AVISO_MARCHA_BLANCA_RED =
  'Por el momento, el servicio se encuentra habilitado únicamente para ' +
  'trabajadores de Sede Central de EsSalud. ' +
  'Próximamente estará disponible para todas las redes asistenciales.';

/** Control de navegacion/UI, NO autorizacion de endpoints backend. */
export function redAdmitidaEnVida(codigoRed: string | null | undefined): boolean {
  return !MARCHA_BLANCA_VIDA.restringirSedeCentral ||
    (codigoRed ?? '').trim() === MARCHA_BLANCA_VIDA.codigoRedPermitida;
}
