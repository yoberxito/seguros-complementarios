export const environment = {
  production: false,
  gViva: '1ddd7536-e95e-479e-9571-d820dc583d89',
  logosPath: 'assets/images/logos-essalud',
  imagesPath: 'assets/images',
  entorno: 'QA',
  
  urlDondeMeAtiendoService: 'https://appsqa.essalud.gob.pe/dondemeatiendo-service',
  sentry: {
    dsn: 'https://c4d9109f5ddce2e3e50f6e1097801159@o4506984073986048.ingest.us.sentry.io/4507013017894912',
    environment: 'qa',
    release: 'viva-essalud-web@develop',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    showDialog: false,
  },
};
