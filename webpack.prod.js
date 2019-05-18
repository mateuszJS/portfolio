"use strict";
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = merge(common, {
	module: {
		rules: [
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				loader: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: [
						{ loader: 'css-loader', options: { minimize: true } },
						"postcss-loader",
						"sass-loader"
					],
				}),
			},
		],
	},
	plugins: [
		new ScriptExtHtmlWebpackPlugin({
			defer: ['index.bundle.js'],
			sync: ['animation.bundle.js', 'prefetch-images.bundle.js'],
		}),
		new UglifyJSPlugin({
      compress: true,
        uglifyOptions: {
          output: {
            comments: false,
          },
        },
		}),
		new ExtractTextPlugin({
			filename: '[name].bundle.css',
			allChunks: true,
		}),
		new BundleAnalyzerPlugin()
	]
})