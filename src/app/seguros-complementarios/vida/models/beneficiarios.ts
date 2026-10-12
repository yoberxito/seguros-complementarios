export interface BenfMasVIdaRes {
    beneficiarios: Beneficiarios[];
    codResultado: string;
    message: string;

}
export interface Beneficiarios {
    tpDocumento: string;
    nroDocumento: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    fechaNacimiento: string;
    codSexo: string;
    codEstadoCivil: string;
    porcentaje: string;
}