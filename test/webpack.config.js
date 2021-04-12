const path = require('path');
const MahalPlugin = require('mahal-webpack-loader/lib/plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

console.log("ujjwal");
module.exports = {
    devServer: {
        host: 'localhost',
        historyApiFallback: true
    },
    entry: './src/index.ts',
    devtool: 'source-map',
    mode: "development",
    module: {
        rules: [{
            test: /\.mahal?$/,
            loader: 'mahal-webpack-loader',

            exclude: /node_modules/
        },
        {
            test: /\.css?$/,
            use: [
                'style-loader',
                {
                    loader: require.resolve('css-loader')
                }
            ],
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
        extensions: ['.mahal', '.tsx', '.ts', '.js', '.css',]
    },
    output: {
        filename: 'bundles.js',
        path: path.resolve(__dirname, 'bin/'),
        publicPath: "/"
        // process.env.NODE_ENV == "test" ? '/bin/' : "/"
    },
    plugins: [
        new MahalPlugin({
            lang: 'ts'
        }),
        new HtmlWebPackPlugin({
            cache: true,
            hash: true,
            template: './src/index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            }
        })
    ]
};