"use strict";
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MediaQueryPlugin = require('media-query-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
	module: {
		rules: [
			{
				test: /\.scss$/,
				exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/'
            }
          },
          'css-loader',
          MediaQueryPlugin.loader,
          {
            loader: "postcss-loader",
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')({
                  'browsers': '> 1%, not IE 11'
                }),
              ],
            }
          },
          "sass-loader",
        ],
			},
		],
	},
	plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new MediaQueryPlugin({
      include: [
        'index'
      ],
      queries: {
        '(min-width: 768px)': 'desktop'
      }
    }),
		new UglifyJSPlugin({
      uglifyOptions: {
        compress: true,
        ecma: 6,
        ie8: false,
      }
		}),
		new BundleAnalyzerPlugin()
	]
})