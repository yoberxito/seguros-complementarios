import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { Beneficiarios, BenfMasVIdaRes } from '../models/beneficiarios';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BeneficiarioService {
  private http = inject(HttpClient);
  baseUrl = `${environment.apiUrlServices}/api/seguro-complementario`;
  baseUrlSeguros = `${environment.apiUrlServices}/api`;
  baseUrlVivaSolicitud = `${environment.baseUrlVivaSolicitud}/api`;
  baseUrlDatosMaestros = `${environment.baseUrlDatosMaestros}/api`;
  baseUrlNotificaciones = `${environment.baseUrlNotificaciones}/seguros-complementarios`;

  constructor() { }
 private handlerError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
  getBeneficiarios(tipoDocumento?:string,numDocTitular?:string):Observable<BenfMasVIdaRes>{
     const url = new URL(`${this.baseUrlSeguros}/informacion-beneficiario/get-beneficiarios`);
    url.searchParams.set('tipoDocumento', `${tipoDocumento}`);
    url.searchParams.set('numDocTitular', `${numDocTitular}`);
    return this.http.get<BenfMasVIdaRes>(url.href).pipe(catchError(this.handlerError));



  }

  updateBenefciarios(
  tpDocTitular: string,
  numDocTitular: string,
  listBeneficiarios: Beneficiarios[]
): Observable<void> {

  const url = `${this.baseUrlSeguros}/informacion-beneficiario/update-prcentaje-participacion`;

  const params = new HttpParams()
    .set('tpDocTitular', tpDocTitular)
    .set('numDocTitular', numDocTitular);

  return this.http.put<void>(
    url,
    listBeneficiarios,
    { params }
  );
}

/** Baja logica de beneficiario en el servicio existente de SAS. */
deleteBeneficiario(
  tpDocTitular: string,
  numDocTitular: string,
  tpDocBenefic: string,
  numDocBenefic: string
): Observable<void> {
  const url = `${this.baseUrlSeguros}/informacion-beneficiario/delete-beneficiario`;
  const params = new HttpParams()
    .set('tpDocTitular', tpDocTitular)
    .set('numDocTitular', numDocTitular)
    .set('tpDocBenefic', tpDocBenefic)
    .set('numDocBenefic', numDocBenefic);

  return this.http.put<void>(url, null, { params });
}

    
  
}
