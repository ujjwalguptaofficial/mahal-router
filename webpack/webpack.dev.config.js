const path = require('path');
const baseConfig = require('./webpack.base.config');
const { merge } = require('webpack-merge');
const webpack = require("webpack");

const libraryTarget = [{
    type: "var",
    name: 'mahal-router.js'
}, {
    type: "commonjs2",
    name: 'mahal-router.commonjs2.js'
}];

function getConfigForTaget(target) {
    return {
        devtool: 'source-map',
        output: {
            path: path.join(__dirname, "../dist"),
            filename: target.name,
            library: target.type === 'var' ? 'MahalRouter' : undefined,
            libraryTarget: target.type
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': "'development'",
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