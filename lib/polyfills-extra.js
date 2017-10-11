/* eslint-disable import/no-unassigned-import */
/* eslint-disable no-extend-native */

// Extra polyfills needed when cfxnes is imported directly from its sources
// and not as a bundled cfxnes.js library. The closure compiler translates
// some ES6 features (iterators) into ES5 features, so when used as a bundled
// library, none of these polyfills are required.

import 'core-js/modules/es6.symbol'; // IE11
import 'core-js/modules/es6.array.iterator'; // IE11
