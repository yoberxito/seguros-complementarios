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

  urlDondeMeAtiendoService: 'http://localhost:80',
  sentry: {
    dsn: 'https://c4d9109f5ddce2e3e50f6e1097801159@o4506984073986048.ingest.us.sentry.io/4507013017894912',
    environment: 'dev',
    release: 'viva-essalud-web@develop',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    showDialog: false,
  },
};
