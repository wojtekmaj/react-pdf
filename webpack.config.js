const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    'react-pdf': './src/react-pdf.entry',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /pdf\.worker(\.min)?\.js$/,
        use: 'raw-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /pdf\.worker(\.min)?\.js$/,
      path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
    ),
    new webpack.optimize.UglifyJsPlugin(),
  ],
};
