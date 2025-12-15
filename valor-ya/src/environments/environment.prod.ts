export const environment = {
  production: true,
  local: {
    baseUrl: 'http://localhost:8080',
    recaptcha: {
      siteKey: '',
      enabled: true,
    },
  },
  dev: {
    baseUrl: 'https://dev-api.catastro.gov.co',
    recaptcha: {
      siteKey: '',
      enabled: true,
    },
  },
  qa: {
    baseUrl: 'http://vmprocondock.catastrobogota.gov.co:3402',
    recaptcha: {
      siteKey: '',
      enabled: true,
    },
  },
  prod: {
    baseUrl: 'https://api.catastro.gov.co',
    recaptcha: {
      siteKey: '',
      enabled: true,
    },
  },
};

export const currentEnvironment = environment.prod;
