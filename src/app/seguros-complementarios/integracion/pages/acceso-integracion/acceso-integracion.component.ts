import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IntegracionService } from '../../services/IntegracionService';
import { AVISO_MARCHA_BLANCA_RED, MARCHA_BLANCA_VIDA, redAdmitidaEnVida } from '../../../vida/marcha-blanca/configuracion-marcha-blanca-vida';

@Component({
  selector: 'app-acceso-integracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-integracion.component.html',
  styleUrl: './acceso-integracion.component.css'
})
export class AccesoIntegracionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly integracionService = inject(IntegracionService);

  mensaje = 'Validando acceso...';
  cargando = true;
  accesoNoHabilitado = false;

  ngOnInit(): void {
    // Solo en modo piloto, evita reutilizar un contexto de una sesion anterior.
    if (MARCHA_BLANCA_VIDA.restringirSedeCentral) {
      this.integracionService.limpiarContexto();
    }

    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.cargando = false;
      this.mensaje = 'Token no proporcionado';
      return;
    }

    // Conservamos el contrato y el comportamiento del servicio SOMOS de Yober.
    this.integracionService.validarToken(token).subscribe({
      next: datos => {
        if (!redAdmitidaEnVida(datos?.codigoRed)) {
          // El token SOMOS ya fue consumido por el servicio original.
          // Solo impedimos la navegacion de nuestro frontend Angular.
          this.integracionService.limpiarContexto();
          this.cargando = false;
          this.accesoNoHabilitado = true;
          this.mensaje = AVISO_MARCHA_BLANCA_RED;
          return;
        }

        this.integracionService.guardarContexto(datos);
        void this.router.navigate(['/vida', 'titular'], { replaceUrl: true });
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'El enlace es inválido, expiró o ya fue utilizado';
      }
    });
  }
}
