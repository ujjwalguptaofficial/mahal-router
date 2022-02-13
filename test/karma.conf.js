const webpack = require("webpack");
const path = require("path");
process.env.CHROME_BIN = require('puppeteer').executablePath();
const MahalPlugin = require('mahal-webpack-loader/lib/plugin');

module.exports = function (config) {
    config.set({
        frameworks: ["mocha"],
        // plugins: ['karma-chai'],
        files: [
            // "src/**/*.ts",
            "test/index.ts" // *.tsx for React Jsx
        ],
        preprocessors: {
            "**/*.ts": "webpack",
            // "**/*.js": "webpack"
        },
        webpack: {
            mode: "development",
            devServer: {
                host: 'localhost',
                historyApiFallback: true
            },
            module: {
                rules: [
                    {
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
                    }
                ],
            },
            resolve: {
                extensions: ['.tsx', '.ts', '.js', '.mahal']
            },
            output: {
                filename: 'bundle.js',
                path: path.resolve(__dirname, 'bin/')
            },
            plugins: [
                // new webpack.DefinePlugin({
                //     'process.env.NODE_ENV': "'test'"
                // }),
                new MahalPlugin({
                    lang: 'ts'
                }),
            ],
            devtool: 'source-map'
        },
        client: {
            mocha: {
                timeout: 60000
            }
        },
        reporters: ["mocha"],
        // browsers: ["jsdom"],
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['HeadlessChrome'],
        customLaunchers: {
            HeadlessChrome: {
                base: 'ChromeHeadless',
                flags: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--headless',
                    '--disable-gpu',
                    '--disable-translate',
                    '--disable-extensions'
                ]
            }
        },
        autoWatch: false,
        singleRun: false,
        concurrency: Infinity,
        browserNoActivityTimeout: 20000,
    });
};