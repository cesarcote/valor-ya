export const environment = {
  production: false,
  local: {
    baseUrl: 'http://localhost:8080',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
    },
  },
  dev: {
    baseUrl: 'https://dev-api.catastro.gov.co',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
    },
  },
  qa: {
    baseUrl: 'http://vmprocondock.catastrobogota.gov.co:3402',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
    },
  },
  prod: {
    baseUrl: 'https://api.catastro.gov.co',
    recaptcha: {
      siteKey: '6Lc64CgsAAAAAABnhATIqME3vAH1-FFdVZK74wAA',
    },
  },
};

export const currentEnvironment = environment.qa;
