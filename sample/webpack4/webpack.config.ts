import webpack from 'webpack';
import path from 'node:path';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import type { Configuration } from 'webpack';
import 'webpack-dev-server';

const isProduction = process.env.NODE_ENV === 'production';

const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
const standardFontsDir = path.join(
  path.dirname(require.resolve('pdfjs-dist/package.json')),
  'standard_fonts',
);

const config = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  context: path.join(__dirname),
  entry: {
    src: './index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './sample.pdf' },
        { from: cMapsDir, to: 'cmaps/' },
        { from: standardFontsDir, to: 'standard_fonts/' },
      ],
    }),
  ],
  devServer: {
    compress: true,
    historyApiFallback: true, // respond to 404s with index.html
    host: 'localhost',
    hot: true, // enable HMR on the server
    port: 3000,
  },
} satisfies Configuration;

export default config;
