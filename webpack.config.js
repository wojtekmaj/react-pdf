var webpack = require('webpack');

module.exports = {
    context: __dirname,
    devtool: 'source-map',
    entry: ['./src-sample/index.html', './src-sample/sample.jsx', './src-sample/sample.pdf'],
    output: {
        path: './sample',
        filename: 'sample.js',
        chunkFilename: 'sample.js',
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'file?name=[name].[ext]',
            },
            {
                test: /\.pdf$/,
                loader: 'url',
            },
            {
                test: /\.less$/,
                loader: 'style!css!less',
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ],
    },
};

