const path = require('path');
const nodeExternals = require('webpack-node-externals');

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
    output: {
        library: 'mahalRouter',
        libraryTarget: "commonjs2",
        filename: 'mahal-router.lib.js',
        path: path.resolve(__dirname, 'dist/')
    },
    plugins: [
        // new MahalPlugin({
        //     lang: 'ts'
        // })
    ]
};