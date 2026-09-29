import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-vida-afiliacion-existente',
  standalone: true,
  templateUrl: './vida-afiliacion-existente.component.html',
  styleUrls: ['./vida-afiliacion-existente.component.css']
})
export class VidaAfiliacionExistenteComponent {
  @Output() volver = new EventEmitter<void>();
}
