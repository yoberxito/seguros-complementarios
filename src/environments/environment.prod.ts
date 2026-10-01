export const environment = {
  production: true,
  gViva: '1ddd7536-e95e-479e-9571-d820dc583d89',
  logosPath: 'assets/images/logos-essalud',
  imagesPath: 'assets/images',
  entorno: 'PRD',

  apiUrlServices: 'https://appsqa.essalud.gob.pe/sagw/mia-seguros-hijomenormayor',
  baseUrlVivaSolicitud: 'https://appsqa.essalud.gob.pe/sagw/viva-essalud/mia-api-solicitud-incapacidad',
  baseUrlDatosMaestros: 'https://appsqa.essalud.gob.pe/sagw/viva-essalud/viva-apidatosmaestros',
  baseUrlNotificaciones: 'https://appsqa.essalud.gob.pe/kgw/viva-essalud/viva-apinotificaciones',
  urlSomos: 'https://appsqa.essalud.gob.pe/somosessalud/',

  sentry: {
    dsn: 'https://c4d9109f5ddce2e3e50f6e1097801159@o4506984073986048.ingest.us.sentry.io/4507013017894912',
    environment: 'production',
    release: 'viva-essalud-web@1.3.0',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    showDialog: false,
  },
};
