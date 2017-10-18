//
// Additional configuration for karma that defines which browsers
// are used to run tests.
//
// Do not modify the karma.browsers.template.js file, copy it as
// karma.browsers.js first. This is automatically done when running
// karma for the first time.
//
// Possible configuration values for each browser:
//   false         - Exclude browser from tests.
//   true          - Run tests locally through appropriate karma-*-launcher.
//   'host(:port)' - Run test remotely through karma-webdriver-launcher.
//                   The value is an IP address and port of remote Selenium
//                   server. The port can be omitted and it defaults to 4444.
//
module.exports = {
  Chrome: true,
  Chromium: false,
  Firefox: false,
  Safari: false,
  IE: false,
  Edge: false,
};
