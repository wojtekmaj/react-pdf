const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  context: path.join(__dirname),
  entry: {
    src: './index.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].[chunkhash:8].js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    symlinks: false,
  },
  resolveLoader: {
    alias: {
      'file-loader': require.resolve('file-loader'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules(?!\/react-pdf)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrcRoots: ['.', '../'],
              plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.pdf$/,
        type: 'asset/inline',
      },
    ].filter(Boolean),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        'test.pdf',
        { from: '../node_modules/@orbiseed/pdfjs-dist/cmaps/', to: 'cmaps/' },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: '[name].[chunkhash:8].css',
        chunkFilename: '[name].[chunkhash:8].css',
      }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  optimization: {
    moduleIds: 'named',
  },
  stats: {
    assetsSort: '!size',
    entrypoints: false,
  },
  devServer: {
    compress: true,
    historyApiFallback: true, // respond to 404s with index.html
    hot: true, // enable HMR on the server
    port: 3000,
  },
};
