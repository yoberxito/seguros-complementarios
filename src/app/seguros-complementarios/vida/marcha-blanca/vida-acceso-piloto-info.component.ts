import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AVISO_MARCHA_BLANCA_RED } from './configuracion-marcha-blanca-vida';

/** Pantalla de informacion, independiente de la ruta parametrizada /vida/:paso. */
@Component({
  selector: 'app-vida-acceso-piloto-info',
  standalone: true,
  template: `
    <main class="vida-piloto-info" aria-live="polite">
      <section class="vida-piloto-info__contenido">
        <h1>{{ titulo }}</h1>
        <p>{{ mensaje }}</p>
      </section>
    </main>
  `,
  styles: [`
    .vida-piloto-info {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #333;
      box-sizing: border-box;
    }
    .vida-piloto-info__contenido {
      max-width: 580px;
      text-align: center;
    }
    .vida-piloto-info h1 {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.35;
      margin: 0 0 16px;
    }
    .vida-piloto-info p {
      line-height: 1.6;
      margin: 0;
    }
  `]
})
export class VidaAccesoPilotoInfoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly esRedNoHabilitada =
    this.route.snapshot.data['motivo'] === 'RED_NO_HABILITADA';

  readonly titulo = this.esRedNoHabilitada
    ? '+Vida estará disponible próximamente'
    : 'Acceso a +Vida';

  readonly mensaje = this.esRedNoHabilitada
    ? AVISO_MARCHA_BLANCA_RED
    : 'Para ingresar al servicio, utilice el acceso habilitado desde SOMOS.';
}
