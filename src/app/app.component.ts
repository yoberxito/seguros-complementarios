import { Component } from '@angular/core';
import { VidaFormComponent } from './seguros-complementarios/vida/vida-form/vida-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VidaFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}