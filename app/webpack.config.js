/* eslint-env node */
/* eslint-disable import/unambiguous */

const fs = require('fs');
const path = require('path');
const ip = require('ip');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env = {}) => {
  const {stdout} = process;
  const print = env.verbose ? stdout.write.bind(stdout) : () => {};
  const resolvePath = (...args) => path.resolve(__dirname, ...args);
  const isObject = value => value && typeof value == 'object';
  const {isArray} = Array;

  const serverIp = ip.address();
  const serverPort = 8080;

  const devConfig = {
    logLevel: 'info',
    reduxLoggerEnabled: true,
    reduxDevToolsEnabled: true,
  };

  if (!env.production && env.configured) {
    const devConfigFile = resolvePath('dev.config.js');
    if (fs.existsSync(devConfigFile)) {
      print(`\nReading development configuration from ${devConfigFile}\n`);
      Object.assign(devConfig, require(devConfigFile));
    } else {
      print(`\nWriting default development configuration to ${devConfigFile}\n`);
      const eslintDirectives = ['env node', 'disable import/unambiguous'];
      const header = eslintDirectives.map(d => `/* eslint-${d} */`).join('\n');
      const data = JSON.stringify(devConfig, null, '  ')
        .replace(/"(\w+)":/g, '$1:')
        .replace(/"/g, '\'')
        .replace(/\n}/, ',\n}');
      fs.writeFileSync(devConfigFile, `${header}\n\nmodule.exports = ${data};\n`);
    }
  }

  function merge(params) {
    const {common, production, development} = params;
    const environmental = env.production ? production : development;
    if (isArray(common || environmental)) {
      return (common || []).concat(environmental || []);
    }
    if (isObject(common || environmental)) {
      return Object.assign({}, common || {}, environmental || {});
    }
    return environmental || common;
  }

  function findCfxnes() {
    print('\n********************************************************************************\n');
    print('Looking for cfxnes library files...\n\n');

    const cfxnes = [
      {name: 'dist/cfxnes.js', production: true},
      {name: 'dist/cfxnes.debug.js'},
      {name: 'src/cfxnes.js'},
    ]
      .filter(({production}) => !env.production || production)
      .map(({name}) => {
        const file = resolvePath('../lib', name);
        const exists = fs.existsSync(file);
        print(`[${(exists ? '\u2713' : '\u2717')}] ${file}\n`);
        return {file, exists};
      })
      .filter(({exists}) => exists)
      .map(({file}) => file)[0];

    print('\n');
    print(cfxnes ? `Using ${cfxnes}` : 'Found none :(');
    print('\n********************************************************************************\n\n');

    return cfxnes;
  }

  return {
    context: resolvePath('src/client'),
    entry: merge({
      production: [
        resolvePath('../lib/polyfills.js'),
        'whatwg-fetch',
        './index.js',
      ],
      development: [
        resolvePath('../lib/polyfills.js'),
        resolvePath('../lib/polyfills-extra.js'), // Needed when importing cfxnes directly from its source code, not as bundled library
        'react-hot-loader/patch',
        'whatwg-fetch',
        './index.js',
      ],
    }),
    output: {
      path: resolvePath('dist/static'),
      filename: 'bundle.js',
      pathinfo: !env.production,
    },
    module: {
      rules: merge({
        common: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          {
            test: /\.(svg|woff|woff2|eot|ttf)(\?\S*)?$/,
            loader: 'file-loader?name=[name].[ext]',
          },
        ],
        production: [
          {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract([
              'css-loader?importLoaders=1',
              'postcss-loader',
            ]),
          },
        ],
        development: [
          {
            test: /\.(js|jsx)$/,
            loader: 'source-map-loader',
            enforce: 'pre',
          }, {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader?importLoaders=1',
              'postcss-loader',
            ],
          },
        ],
      }),
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        cfxnes: findCfxnes(),
      },
    },
    plugins: merge({
      common: [
        new webpack.DefinePlugin({
          __DEVELOPMENT__: env.production ? 'false' : 'true',
          __REDUX_LOGGER_ENABLED__: devConfig.reduxLoggerEnabled,
          __REDUX_DEVTOOLS_ENABLED__: devConfig.reduxDevToolsEnabled,
          __LOG_LEVEL__: JSON.stringify(merge({
            production: 'warn',
            development: devConfig.logLevel,
          })),
        }),
        new webpack.IgnorePlugin(/^fs$/), // cfxnes.debug.js contains unused required('fs') call
        new CopyPlugin([
          {from: 'index.html'},
          {from: 'images/favicon.png'},
        ]),
      ],
      production: [
        new ExtractTextPlugin({filename: 'bundle.css'}),
        // No need to include uglify plugin since we are running webpack with -p command line option
      ],
      development: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
      ],
    }),
    devtool: merge({
      production: 'nosources-source-map',
      development: 'eval-source-map', // eval-cheap-module-source-map is buggy in Chrome
    }),
    performance: {
      hints: false,
    },
    devServer: {
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      open: true,
      openPage: '',
      port: serverPort,
      proxy: {'/api': 'http://localhost:5000'},
      public: `${serverIp}:${serverPort}`,
      useLocalIp: true,
    },
  };
};
