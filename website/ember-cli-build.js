/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var Funnel = require('broccoli-funnel');
var uglify = require('broccoli-uglify-sourcemap');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    fingerprint: {
      prepend: 'https://static.prestine.io/'
    },
    cssModules: {
      intermediateOutputPath: 'app/styles/_modules.scss'
    }
  });

  var workers = new Funnel('workers', {
    include: ['*.js'],
    destDir: '/assets/workers'
  });

  if (process.env.EMBER_ENV === 'production') {
    workers = uglify(workers, {
      mangle: true,
      compress: true
    });
  }

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('bower_components/font-awesome/fonts/FontAwesome.otf', {
    destDir: 'assets/fonts'
  });
  app.import('bower_components/font-awesome/fonts/fontawesome-webfont.eot', {
    destDir: 'assets/fonts'
  });
  app.import('bower_components/font-awesome/fonts/fontawesome-webfont.svg', {
    destDir: 'assets/fonts'
  });
  app.import('bower_components/font-awesome/fonts/fontawesome-webfont.ttf', {
    destDir: 'assets/fonts'
  });
  app.import('bower_components/font-awesome/fonts/fontawesome-webfont.woff', {
    destDir: 'assets/fonts'
  });
  app.import('bower_components/font-awesome/fonts/fontawesome-webfont.woff2', {
    destDir: 'assets/fonts'
  });

  return app.toTree(workers);
};
