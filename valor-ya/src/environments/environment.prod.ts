export const environment = {
  production: true,
  local: {
    baseUrl: 'http://localhost:8080'
  },
  dev: {
    baseUrl: 'https://dev-api.catastro.gov.co'
  },
  qa: {
    baseUrl: 'https://qa-api.catastro.gov.co'
  },
  prod: {
    baseUrl: 'https://api.catastro.gov.co'
  }
};

// Configuración actual del entorno para producción
export const currentEnvironment = environment.prod;