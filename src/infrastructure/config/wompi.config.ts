import { registerAs } from '@nestjs/config';

export default registerAs('wompi', () => ({
  // URLs base por entorno
  urls: {
    staging: {
      api: process.env.WOMPI_UAT_URL || 'https://api.co.uat.wompi.dev/v1',
      sandbox: process.env.WOMPI_UAT_SANDBOX_URL || 'https://api-sandbox.co.uat.wompi.dev/v1',
    },
    production: {
      api: process.env.WOMPI_PRODUCTION_URL || 'https://api.wompi.co/v1',
      sandbox: process.env.WOMPI_PRODUCTION_SANDBOX_URL || 'https://api-sandbox.wompi.co/v1',
    },
  },

  // API Keys por entorno (prefijos de UAT correctos)
  keys: {
    staging: {
      public: process.env.WOMPI_PUBLIC_KEY || 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2IUV8t3s4mOt7',
      private: process.env.WOMPI_PRIVATE_KEY || 'prv_stagtest_5i0ZGIGIFcDQifYsXxvsny7Y37tKqFWg',
      events: process.env.WOMPI_EVENTS_KEY || 'stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N',
      integrity: process.env.WOMPI_INTEGRITY_KEY || 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYIlSd89Fp',
    },
    production: {
      public: process.env.WOMPI_PRODUCTION_PUBLIC_KEY,
      private: process.env.WOMPI_PRODUCTION_PRIVATE_KEY,
      events: process.env.WOMPI_PRODUCTION_EVENTS_KEY,
      integrity: process.env.WOMPI_PRODUCTION_INTEGRITY_KEY,
    },
  },

  // Entorno actual
  environment: process.env.WOMPI_ENVIRONMENT || 'staging',

  // URLs de webhook por entorno
  webhooks: {
    local: process.env.NGROK_URL || 'http://localhost:3012',
    staging: process.env.STAGING_WEBHOOK_URL || 'https://tu-app-staging.com',
    production: process.env.PRODUCTION_WEBHOOK_URL || 'https://tu-app.com',
  },

  // Configuración de pagos
  payment: {
    currency: process.env.DEFAULT_CURRENCY || 'COP',
    acceptanceToken: process.env.ACCEPTANCE_TOKEN || 'TOKEN_ACEPTACION',
  },
}));
