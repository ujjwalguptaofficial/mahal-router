const webpack = require("webpack");
const path = require("path");
const webpackConfig = require("./webpack/dev.config");
process.env.CHROME_BIN = require('puppeteer').executablePath();

// return console.log(webpackConfig)

module.exports = function (config) {
    config.set({
        frameworks: ["mocha", 'webpack'],
        // plugins: ['karma-chai'],
        plugins: [
            'karma-webpack',
            'karma-mocha',
            'karma-chai',
            'karma-chrome-launcher'
        ],
        files: [
            // "src/**/*.ts",
            "specs/index.ts" // *.tsx for React Jsx
        ],
        preprocessors: {
            "**/*.ts": "webpack",
            // "**/*.js": "webpack"
        },
        webpack: webpackConfig,
        client: {
            mocha: {
                timeout: 60000
            }
        },
        // reporters: ["mocha"],
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
        singleRun: true,
        concurrency: Infinity,
        browserNoActivityTimeout: 20000,
    });
};