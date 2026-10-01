import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IntegracionService } from '../../services/IntegracionService';

@Component({
  selector: 'app-acceso-integracion',
  standalone: true,
  imports: [],
  templateUrl: './acceso-integracion.component.html',
  styleUrl: './acceso-integracion.component.css'
})
export class AccesoIntegracionComponent {
   private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly integracionService = inject(IntegracionService);

  mensaje = 'Validando acceso...';

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.mensaje = 'Token no proporcionado';
      return;
    }

    this.integracionService.validarToken(token).subscribe({
      next: datos => {
        this.integracionService.guardarContexto(datos);

        this.router.navigate(
          ['/vida', 'titular'],
          { replaceUrl: true }
        );
      },
      error: () => {
        this.mensaje =
          'El enlace es inválido, expiró o ya fue utilizado';
      }
    });
  }

}
