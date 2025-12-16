export const environment = {
  production: false,
  local: {
    baseUrl: 'http://localhost:8080',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
      enabled: false,
    },
  },
  dev: {
    baseUrl: 'https://dev-api.catastro.gov.co',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
      enabled: true,
    },
  },
  qa: {
    baseUrl: 'http://vmprocondock.catastrobogota.gov.co:3402',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
      enabled: false,
    },
  },
  prod: {
    baseUrl: 'https://api.catastro.gov.co',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
      enabled: true,
    },
  },
};

export const currentEnvironment = environment.qa;
