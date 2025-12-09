export const environment = {
  production: true,
  local: {
    baseUrl: 'http://localhost:8080',
  },
  dev: {
    baseUrl: 'https://dev-api.catastro.gov.co',
  },
  qa: {
    baseUrl: 'http://vmprocondock.catastrobogota.gov.co:3402',
  },
  prod: {
    baseUrl: 'https://api.catastro.gov.co',
  },
};

export const currentEnvironment = environment.prod;
