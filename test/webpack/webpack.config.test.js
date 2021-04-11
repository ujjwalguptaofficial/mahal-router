const MahalPlugin = require('mahal-webpack-loader/lib/plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    devServer: {
        host: 'localhost',
        historyApiFallback: true
    },
    mode: "development",
    module: {
        rules: [{
            test: /\.mahal?$/,
            loader: 'mahal-webpack-loader',

            exclude: /node_modules/
        }, {
            test: /\.css?$/,
            use: [
                'style-loader',
                {
                    loader: require.resolve('css-loader')
                }
            ],
        }, {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.mahal']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bin/')
    },
    plugins: [
        new MahalPlugin({
            lang: 'ts'
        }),
        // new webpack.DefinePlugin({
        //     'process.env.NODE_ENV': "'test'"
        // })
    ],
    devtool: 'inline-source-map'
}