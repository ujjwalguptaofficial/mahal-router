const path = require('path');
const nodeExternals = require('webpack-node-externals');
const banner = require('../build_helper/licence');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');


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
        extensions: ['.tsx', '.ts']
    },
    plugins: [
        new webpack.BannerPlugin(banner),
        new CopyPlugin({
            patterns: [
                { from: 'build_helper', to: '' },
            ],
        }),
    ]
};