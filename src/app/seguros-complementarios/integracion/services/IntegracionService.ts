import { Injectable } from "@angular/core";
import { ContextoUsuario } from "../models/IntegracionModels";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class IntegracionService {
    private readonly claveContexto = 'masvida_contexto';


  private contextoUsuario: ContextoUsuario | null = null;
    baseUrlSeguros = `${environment.apiUrlServices}/api`;

  constructor(
    private readonly http: HttpClient
  ) {}

  validarToken(token: string) {
    return this.http.get<ContextoUsuario>(
      `${this.baseUrlSeguros}/integracion/validar-token/${token}`
    );
  }

  guardarContexto(contexto: ContextoUsuario): void {
     sessionStorage.setItem(
      this.claveContexto,
      JSON.stringify(contexto)
    );
  }

  obtenerContexto(): ContextoUsuario | null {
 const valor = sessionStorage.getItem(this.claveContexto);

    return valor
      ? JSON.parse(valor) as ContextoUsuario
      : null;
    
    }

     limpiarContexto(): void {
    sessionStorage.removeItem(this.claveContexto);
  }
}