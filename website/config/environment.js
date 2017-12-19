/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'prestine',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      PUSH_NOTIFICATION_PUBLIC_KEY: 'BFARvvLAfWlPm9fGIYMWdOsPXxIfpkRMyi-Cdd1Z6iFAHz8Za84IEVjWGc79yTkSFPkIOQiK9_xyxsfzDunupyU',
      RECAPTCHA_LANGUAGE: 'fr'
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    'ember-simple-auth': {
      authenticationRoute: 'login',
      routeAfterAuthentication: 'dashboard'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.APP.API_HOST      = 'http://localhost:3002';
    ENV.APP.API_NAMESPACE = '/';
    ENV.APP.API_CLIENT_ID = '0e7814b6-b793-44f5-aab0-9644be51f1ae';
    ENV.APP.RECAPTCHA_SITE_KEY = '6Ld0SBgUAAAAADZIZ4zTp1l1bnX0JDxlOYIVyvOf';
    ENV.APP.STRIPE_PUBLISHABLE_KEY = 'pk_test_ytM3zWErx4sK19p2lcC85y2v';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.APP.API_HOST      = 'https://api.prestine.io';
    ENV.APP.API_NAMESPACE = '/';
    ENV.APP.API_CLIENT_ID = '0e7814b6-b793-44f5-aab0-9644be51f1ae';
    ENV.APP.RECAPTCHA_SITE_KEY = '6Ld0SBgUAAAAADZIZ4zTp1l1bnX0JDxlOYIVyvOf';
    ENV.APP.STRIPE_PUBLISHABLE_KEY = 'pk_live_AQCpzCr77D4MuIC47q2WNGKO';
  }

  return ENV;
};
