const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: [
    './src-sample/index.html',
    './src-sample/sample.jsx',
    './src-sample/sample.pdf',
  ],
  output: {
    path: path.join(__dirname, './sample'),
    filename: 'sample.js',
    chunkFilename: 'sample.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'file-loader?name=[name].[ext]',
      },
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
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
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
    new webpack.optimize.UglifyJsPlugin(),
  ],
};
