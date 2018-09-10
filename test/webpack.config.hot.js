const webpack = require('webpack');
// eslint-disable-next-line import/no-unresolved
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname,
  devtool: 'source-map',
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:3000',
    './index',
  ],
  output: {
    filename: '[name].bundle.js',
    globalObject: 'this', // See: https://github.com/webpack/webpack/issues/6642
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.pdf$/,
        use: 'url-loader',
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { babelrcRoots: ['.', '../'] },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './index.html' },
      { from: './test.pdf' },
      { from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/' },
    ]),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  devServer: {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true, // respond to 404s with index.html
    hot: true, // enable HMR on the server
  },
};
