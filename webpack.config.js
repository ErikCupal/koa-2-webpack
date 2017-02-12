const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const config = {
  entry: [
    './lib.es2017/index.js',
  ],

  output: {
    filename: 'index.js',
    path: 'lib/',
    library: 'koa2webpack',
    libraryTarget: 'umd'
  },

  externals: [nodeExternals()],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
    ]
  },

  resolve: {
    extensions: ['.js'],
    modules: ['node_modules'],
  },
}

module.exports = config