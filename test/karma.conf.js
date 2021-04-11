const webpack = require("webpack");
const path = require("path");
const webpackConfig = require("./webpack/webpack.config.test")
// const path = require("path");
process.env.CHROME_BIN = require('puppeteer').executablePath();

// return console.log(webpackConfig);
// const basePath = path.join(__dirname);
// console.log('basePath', basePath);
module.exports = function (config) {
    config.set({
        // basePath: '',
        frameworks: ["mocha", 'chai'],
        // plugins: ['karma-chai'],
        files: [
            // "src/**/*.ts",
            "bin/bundles.js",
            { pattern: 'bin/**/*.js', included: false, watched: false, served: true },
            "test/start.js",
            // "test/task.js"
        ],
        client: {
            mocha: {
                timeout: 5000
            }
        },
        proxies: {
            '/bin/': '/base/bin'
        },
        reporters: ["mocha"],
        // browsers: ["jsdom"],
        colors: true,
        logLevel: config.LOG_INFO,
        // browsers: ['HeadlessChrome'],
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