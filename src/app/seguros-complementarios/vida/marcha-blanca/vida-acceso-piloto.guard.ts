import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IntegracionService } from '../../integracion/services/IntegracionService';
import { ContextoUsuario } from '../../integracion/models/IntegracionModels';
import { MARCHA_BLANCA_VIDA, redAdmitidaEnVida } from './configuracion-marcha-blanca-vida';

/** Guarda exclusiva de la navegacion Angular de +Vida. No autentica APIs. */
export const vidaAccesoPilotoGuard: CanActivateFn = () => {
  // Modo normal: preservar el comportamiento anterior del proyecto.
  if (!MARCHA_BLANCA_VIDA.restringirSedeCentral) {
    return true;
  }

  const integracion = inject(IntegracionService);
  const router = inject(Router);
  let contexto: ContextoUsuario | null = null;

  try {
    contexto = integracion.obtenerContexto();
  } catch {
    // Storage malformado: no debe permitir ingresar al tramite.
    integracion.limpiarContexto();
  }

  if (!contexto) {
    return router.createUrlTree(['/vida/acceso-requerido']);
  }

  if (!redAdmitidaEnVida(contexto.codigoRed)) {
    integracion.limpiarContexto();
    return router.createUrlTree(['/vida/proximamente']);
  }

  return true;
};
