export const environment = {
  production: false,
  gViva: '1ddd7536-e95e-479e-9571-d820dc583d89',
  logosPath: 'assets/images/logos-essalud',
  imagesPath: 'assets/images',
  entorno: 'QA',
  
  apiUrlServices: 'https://appsqa.essalud.gob.pe/sagw/mia-seguros-hijomenormayor',
  baseUrlVivaSolicitud: 'https://appsqa.essalud.gob.pe/sagw/viva-essalud/mia-api-solicitud-incapacidad',
  baseUrlDatosMaestros: 'https://appsqa.essalud.gob.pe/sagw/viva-essalud/viva-apidatosmaestros',
  baseUrlNotificaciones: 'https://appsqa.essalud.gob.pe/kgw/viva-essalud/viva-apinotificaciones',
  urlSomos:'https://appsqa.essalud.gob.pe/somosessalud/',
 

  sentry: {
    dsn: '',
    environment: 'local',
    release: 'local',
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    showDialog: false,
  },
};
