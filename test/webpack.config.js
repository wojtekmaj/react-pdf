const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
const standardFontsDir = path.join(
  path.dirname(require.resolve('pdfjs-dist/package.json')),
  'standard_fonts',
);

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  context: path.join(__dirname),
  entry: {
    src: './index.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash:8].js',
  },
  resolve: {
    alias: {
      react: require.resolve('react'),
      'react-dom/server': require.resolve('react-dom/server'),
      'react-dom': require.resolve('react-dom'),
    },
    extensions: ['.js', '.jsx'],
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
        use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
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
        { from: cMapsDir, to: 'cmaps/' },
        { from: standardFontsDir, to: 'standard_fonts/' },
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
