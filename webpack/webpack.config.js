const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs-extra');

// Load the variables defined in the .env file into process.env
require('dotenv').config();

const paths = {
  appPublic: path.resolve('public'),
  appBuild: path.resolve('build'),
  appHtml: path.resolve('public/index.html'),
};

copyPublicFolder();

module.exports = {
    devtool: 'eval',
    entry: './src/index.js',
    target: 'web',
    node: {
        fs: 'empty'
    },
    output: {
        path: paths.appBuild,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.json', '.css']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: '/\.json$/',
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react']
                    }
                }
            },
            {
                test: /\.json$/,
                enforce: 'pre',
                use: {
                    loader: require.resolve('./strip-json-loader'),
                },
                type: "javascript/auto"
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                loaders: ['style-loader', 'css-loader'],
            },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            // { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' }
            // ]
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            template: 'public/index.html'
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env': {
                REACT_APP_DEBUG: JSON.stringify(process.env.REACT_APP_DEBUG)
            }
        }),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
