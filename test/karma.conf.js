const webpack = require("webpack");
const path = require("path");
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
    config.set({
        frameworks: ["mocha", 'webpack'],
        // plugins: ['karma-chai'],
        files: [
            // "src/**/*.ts",
            "unit/index.ts", // *.tsx for React Jsx
            "unit/error.ts", // *.tsx for React Jsx
            "unit/router_view_warning.ts" // *.tsx for React Jsx
        ],
        preprocessors: {
            "**/*.ts": "webpack",
            // "**/*.js": "webpack"
        },
        webpack: {
            mode: "development",
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: 'ts-loader',
                        exclude: /node_modules/
                    },
                    {
                        test: /\.mahal?$/,
                        // loader: 'mahal-webpack-loader',
                        use: {
                            loader: require.resolve('@mahaljs/webpack-loader')
                        },
                        exclude: /node_modules/
                    },
                ]
            },
            resolve: {
                extensions: ['.ts', '.js', '.css', '.mahal', '.scss'],
            },
            output: {
                filename: 'bundle.js',
                path: path.resolve(__dirname, 'bin/karma')
            },
            plugins: [
                // new webpack.DefinePlugin({
                //     'process.env.NODE_ENV': "'test'"
                // })

                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
                    'process.env.BUILD_ENV': "'test'"
                })
            ],
            devtool: 'inline-source-map'
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
        autoWatch: true,
        singleRun: true,
        concurrency: Infinity,
        browserNoActivityTimeout: 20000,
    });
};