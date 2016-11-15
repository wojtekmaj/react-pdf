module.exports = {
    context: __dirname,
    devtool: 'source-map',
    entry: ['./src-test/index.html', './src-test/test.jsx', './src-test/test.pdf'],
    output: {
        path: './test',
        filename: 'test.js',
        chunkFilename: 'test.js',
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
