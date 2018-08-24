const path = require('path'); // require() loads an external module or library.'path' is a module used to provide utilities for working with file and directory paths.
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/js/index.js',],
    output: {
        path: path.resolve(__dirname, 'dist'), // path.resolve resolves a sequence of paths or path segments to its absolute path.
        filename: 'js/bundle.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};