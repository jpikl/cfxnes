const path = require('path');
const ip = require('ip');
const {mergeConfig} = require('../utils');

const isTargetSrc = ({target}) => !target || target === 'src';
const isTargetLib = ({target}) => !target || target === 'lib';
const isTargetLibDebug = ({target}) => target === 'lib:debug';

const webdriverNames = {
  Chrome: 'chrome',
  Chromium: 'chromium',
  Firefox: 'firefox',
  Safari: 'safari',
  IE: 'internet explorer',
  Edge: 'MicrosoftEdge',
};

module.exports = config => {
  const browserConfigFile = path.resolve(__dirname, 'karma.browsers.js');

  const browserConfig = {
    Chrome: true,
    Chromium: false,
    Firefox: false,
    Safari: false,
    IE: false,
    Edge: false,
  };

  mergeConfig(browserConfig, browserConfigFile);

  configureBase(config);
  configureFiles(config, browserConfig);
  configureBrowsers(config, browserConfig);
};

function configureBase(config) {
  const {grep, fgrep} = config;

  config.set({
    singleRun: true,
    logLevel: 'ERROR',
    hostname: ip.address(),
    client: {mocha: {grep, fgrep, timeout: 5000}},
    frameworks: ['mocha', 'chai', 'browserify'],  // chai-as-promised must be bundled using browserify
    browserify: {debug: true, transform: ['babelify']},
    preprocessors: {
      'polyfills{,-extra}.js': ['browserify'],
      'test/**/*.js': ['browserify'],
    },
    proxies: {'/data/': '/base/test/data/'},
  });
}

function configureFiles(config, browserConfig) {
  const files = [];

  if (browserConfig.IE || browserConfig.Safari) {
    files.push('polyfills.js');

    if (isTargetSrc(config)) {
      files.push('polyfills-extra.js');
    }
  }

  files.push('node_modules/jszip/dist/jszip.min.js');
  files.push('test/init.js');

  if (isTargetSrc(config)) {
    files.push('test/*/**/*.js', 'test/cfxnesSrcTest.js');
  }

  if (isTargetLib(config) || isTargetLibDebug(config)) {
    files.push(isTargetLibDebug(config) ? 'dist/cfxnes.debug.js' : 'dist/cfxnes.js');
    files.push('test/cfxnesLibTest.js');
  }

  files.push({pattern: 'test/data/*', included: false, served: true});

  config.set({files});
}

function configureBrowsers(config, browserConfig) {
  const browsers = [];
  const customLaunchers = [];

  for (const browser in browserConfig) {
    const value = browserConfig[browser];
    if (value) {
      if (typeof value === 'string') {
        customLaunchers[browser] = createWebdriverLauncher(browser, value);
      }
      browsers.push(browser);
    }
  }

  config.set({browsers, customLaunchers});
}

function createWebdriverLauncher(browser, hostnamePort) {
  const [hostname, port] = hostnamePort.split(':');
  return {
    base: 'WebDriver',
    config: {
      hostname,
      port: parseInt(port) || 4444,
    },
    browserName: webdriverNames[browser],
    name: 'Karma',
  };
}
