const path = require('path');
const baseConfig = require('./webpack.base.config');
const { merge } = require('webpack-merge');
const webpack = require("webpack");

const libraryTarget = [{
    type: "var",
    name: 'mahal-router.min.js'
}, {
    type: "commonjs2",
    name: 'mahal-router.min.commonjs2.js'
}];

function getConfigForTaget(target) {
    return {
        mode: 'production',
        output: {
            path: path.join(__dirname, "../dist"),
            filename: target.name,
            library: 'MahalRouter',
            libraryTarget: target.type
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': "'production'",
            })
        ]
    }
}

function createConfigsForAllLibraryTarget() {
    var configs = [];
    libraryTarget.forEach(function (target) {
        configs.push(merge(baseConfig, getConfigForTaget(target)));
    })
    return configs;
}

module.exports = [...createConfigsForAllLibraryTarget()]