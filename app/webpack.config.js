const path = require('path');
const ip = require('ip');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {mergeConfig, getLibFile} = require('../utils');

module.exports = (env = {}) => {
  const resolvePath = path.resolve.bind(path, __dirname);
  const myIpAddress = ip.address();
  const appServerPort = 5000;
  const devServerPort = 8080;

  const libFile = getLibFile({
    productionOnly: Boolean(env.production),
    verbose: Boolean(env.verbose),
  });

  if (!libFile) {
    process.exit(1);
  }

  const devConfig = {
    logLevel: 'warn',
    reduxLoggerEnabled: false,
    reduxDevToolsEnabled: false,
  };

  if (!env.production && env.extDevConfig) {
    mergeConfig(devConfig, resolvePath('webpack.dev.js'));
  }

  const productionEntry = [
    '../lib/polyfills.js',
    'whatwg-fetch',
    './src/client/index.js',
  ];

  const developmentEntry = [
    '../lib/polyfills.js',
    '../lib/polyfills-extra.js', // Needed when importing cfxnes directly from its source code, not as a bundled library
    'whatwg-fetch',
    './src/client/index.js',
  ];

  const commonRules = [
    {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    },
    {
      test: /\.(svg|woff|woff2|eot|ttf)(\?\S*)?$/,
      loader: 'file-loader?name=[name].[ext]',
    },
    {
      test: /\.hbs$/,
      loader: 'handlebars-loader',
    },
  ];

  const productionRules = [
    ...commonRules,
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader?importLoaders=1', // =1 means postcss-loader
        'postcss-loader',
      ],
    },
  ];

  const developmentRules = [
    ...commonRules,
    {
      test: /\.(js|jsx)$/,
      loader: 'source-map-loader',
      enforce: 'pre',
    },
    {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader?importLoaders=1', // =1 means postcss-loader
        'postcss-loader',
      ],
    },
  ];

  const commonPlugins = [
    new webpack.DefinePlugin({
      __DEVELOPMENT__: JSON.stringify(!env.production),
      __REDUX_LOGGER_ENABLED__: devConfig.reduxLoggerEnabled,
      __REDUX_DEVTOOLS_ENABLED__: devConfig.reduxDevToolsEnabled,
      __LOG_LEVEL__: JSON.stringify(env.production ? 'warn' : devConfig.logLevel),
    }),
    new webpack.IgnorePlugin(/^fs$/), // cfxnes.debug.js contains unused required('fs') call
    new CopyPlugin([
      {from: 'src/client/static'},
    ]),
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/client/index.hbs',
      templateParameters: {
        production: Boolean(env.production),
      },
    }),
  ];

  const productionPlugins = [
    ...commonPlugins,
    new MiniCssExtractPlugin({filename: 'bundle.css'}),
  ];

  const developmentPlugins = [
    ...commonPlugins,
    new webpack.HotModuleReplacementPlugin(),
  ];

  return {
    mode: env.production ? 'production' : 'development',
    context: __dirname,
    entry: env.production
      ? productionEntry
      : developmentEntry,
    output: {
      path: resolvePath('dist/static'),
      pathinfo: !env.production,
      filename: 'bundle.js',
    },
    module: {
      rules: env.production ? productionRules : developmentRules,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        cfxnes: libFile,
      },
    },
    plugins: env.production ? productionPlugins : developmentPlugins,
    devtool: env.production ? 'nosources-source-map' : 'eval-source-map',
    watch: !env.production,
    watchOptions: {
      poll: 1000,
    },
    performance: {
      hints: false,
    },
    devServer: {
      compress: true,
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      open: true,
      openPage: '',
      port: devServerPort,
      proxy: {
        '/api': `http://${myIpAddress}:${appServerPort}`,
      },
      public: `${myIpAddress}:${devServerPort}`,
      useLocalIp: true,
    },
  };
};
