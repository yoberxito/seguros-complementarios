import type {
  SafeResourceUrl
} from '@angular/platform-browser';

export interface ArchivoDocumentoFirmado {
  archivo: File | null;
  nombre: string;
  tamanioMB: string;
  cargado: boolean;
  error: string;
  urlTemporal: string;
  urlVistaPrevia: SafeResourceUrl | null;
}