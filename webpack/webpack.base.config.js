const path = require('path');
const nodeExternals = require('webpack-node-externals');
const banner = require('../build_helper/licence');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const MahalPlugin = require('@mahaljs/webpack-loader/lib/plugin');

module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    mode: "development",
    externals: [
        nodeExternals()
    ],
    module: {
        rules: [
            {
                test: /\.mahal?$/,
                // loader: 'mahal-webpack-loader',
                use: {
                    loader: require.resolve('@mahaljs/webpack-loader')
                },
                exclude: /node_modules/
            },
            {
                test: /\.ts?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.mahal$/],
                    }
                },
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.css', '.mahal', '.scss'],
    },
    plugins: [
        new MahalPlugin({
            lang: 'ts'
        }),
        new webpack.BannerPlugin(banner),
        new CopyPlugin({
            patterns: [
                { from: 'build_helper', to: '' },
            ],
        }),
    ]
};