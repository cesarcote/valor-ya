export const environment = {
  production: false,
  local: {
    baseUrl: 'http://localhost:8080',
  },
  dev: {
    baseUrl: 'https://dev-api.catastro.gov.co',
  },
  qa: {
    baseUrl: 'https://qa-api.catastro.gov.co',
  },
  prod: {
    baseUrl: 'https://api.catastro.gov.co',
  },
};

// Configuración actual del entorno para desarrollo
export const currentEnvironment = environment.dev;
