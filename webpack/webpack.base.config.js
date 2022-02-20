const path = require('path');
const nodeExternals = require('webpack-node-externals');
const SmartBannerPlugin = require('smart-banner-webpack-plugin');
const banner = require('../build_helper/licence');
const CopyPlugin = require('copy-webpack-plugin');

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
        new SmartBannerPlugin(banner),
        new CopyPlugin({
            patterns: [
                { from: 'build_helper', to: '' },
            ],
        }),
    ]
};