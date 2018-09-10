const path = require('path');
// eslint-disable-next-line import/no-unresolved
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  devtool: 'source-map',
  entry: [
    './index',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
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
  ],
};
