/* eslint-env node */

module.exports = function(config) {
  configureBase(config);
  configureFiles(config);
  configureLaunchers(config);
};

function configureBase(config) {
  const {grep, fgrep} = config;

  config.set({
    logLevel: 'ERROR',
    singleRun: true,
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'browserify'],
    proxies: {
      '/data/': '/base/test/data/',
    },
    preprocessors: {
      'test/**/*.js': ['browserify'],
    },
    customLaunchers: {},
    client: {
      mocha: {grep, fgrep, timeout: 5000},
    },
    browserify: {
      debug: true,
      transform: ['babelify'],
    },
  });
}

function configureFiles(config) {
  const {files, target, noPolyfills} = config;

  files.push('node_modules/jszip/dist/jszip.min.js');

  if (!noPolyfills) {
    files.push('node_modules/core-js/client/shim.min.js');
  }

  if (!target || target === 'src') {
    files.push('test/*/**/*.js', 'test/cfxnesSrcTest.js');
  }

  if (!target || target === 'lib' || target === 'debug-lib') {
    files.push(target === 'debug-lib' ? 'dist/cfxnes.debug.js' : 'dist/cfxnes.js');
    files.push('test/cfxnesLibTest.js');
  }

  files.push({pattern: 'test/data/*', included: false, served: true});
}

function configureLaunchers(config) {
  const {winWebdriverHost, osxWebdriverHost, customLaunchers} = config;
  let {browsers, hostname} = config;

  if (winWebdriverHost || osxWebdriverHost) {
    hostname = require('ip').address();
  }

  if (winWebdriverHost) {
    customLaunchers.IE = webdriver('internet explorer', winWebdriverHost);
    customLaunchers.Edge = webdriver('MicrosoftEdge', winWebdriverHost);
  } else {
    browsers = browsers.filter(b => b !== 'IE' && b !== 'Edge');
  }

  if (osxWebdriverHost) {
    customLaunchers.Safari = webdriver('safari', osxWebdriverHost);
  } else {
    browsers = browsers.filter(b => b !== 'Safari');
  }

  config.set({browsers, hostname});
}

function webdriver(browserName, hostnamePort) {
  const [hostname, port] = hostnamePort.split(':');
  return {
    base: 'WebDriver',
    config: {
      hostname,
      port: parseInt(port) || 4444,
    },
    browserName,
    name: 'Karma',
  };
}
