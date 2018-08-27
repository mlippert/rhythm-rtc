var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var DashboardPlugin = require('webpack-dashboard/plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
var combineLoaders = require('webpack-combine-loaders');
//var MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: 'eval',
  entry: './src/index.js',
  target: 'web',
  mode: 'development',
  node: {
    fs: 'empty'
  },
  output: {
    path: path.resolve('build'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json', '.css']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve("src"),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react',
            ["@babel/preset-env", {
              "targets": {
                "chrome": 52
              },
              "modules": false,
              "loose": true
            }]],
          }
        }
      },
      {
        test: /\.coffee$/,
        use: ['coffee-loader']
      },
      {
        test: /\.json$/,
        enforce: 'pre',
        exclude:'/node_modules/clmtrackr/',
        use: [
          'cache-loader',
          require.resolve('./strip-json-loader'),
        ],
        type: "javascript/auto"
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader'
          ]
        })
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: combineLoaders([
          {
            loader: 'style-loader'
          }, {
            loader: 'css-loader',
            query: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          }
        ])
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      { test: /\.(jpe?g|gif|png|svg|ttf|wav|mp3)$/,
        loader: "file-loader"
      },
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: "WebpackBundleReport.html"
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: 'public/index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin(),
    new ExtractTextPlugin("css/styles.css")
    // new MiniCssExtractPlugin({
    //   filename: 'styles.css'
    // })
  ],
  devServer: {
    hot: true,
    quiet: true,
    inline: true,
    stats: false,
    watchOptions: { poll: 1000, ignored: /node_modules/ }
  }
};
