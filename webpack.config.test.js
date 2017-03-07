module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: [
    './src-test/index.html',
    './src-test/test.jsx',
    './src-test/test.pdf',
  ],
  output: {
    path: './test',
    filename: 'test.js',
    chunkFilename: 'test.js',
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
};
