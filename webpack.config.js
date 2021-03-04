const path = require('path');
const MahalPlugin = require('mahal-webpack-loader/lib/plugin');

module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    mode: "development",
    module: {
        rules: [{
            test: /\.mahal?$/,
            // loader: 'mahal-webpack-loader',
            use: {
                loader: require.resolve('mahal-webpack-loader')
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
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        library: 'mahal-router',
        libraryTarget: "commonjs2",
        filename: 'lib.js',
        path: path.resolve(__dirname, 'dist/')
    },
    plugins: [
        new MahalPlugin({
            lang: 'ts'
        })
    ]
};