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
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			},

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

			// {
			// 	test: /\.(gif|png|jpe?g|svg)$/i,
			// 	use: [
			// 		'file-loader',
			// 		{
			// 			loader: 'image-webpack-loader',
			// 			options: {
			// 				mozjpeg: {
			// 					progressive: true,
			// 					quality: 65
			// 				},
			// 				optipng: {
			// 					enabled: false,
			// 				},
			// 				pngquant: {
			// 					quality: '65-90',
			// 					speed: 4
			// 				},
			// 			}
			// 		},
			// 	],
			// }

		],
	},
	plugins: [
		new ScriptExtHtmlWebpackPlugin({
			defer: ['index.bundle.js'],
			sync: ['animation.bundle.js', 'prefetch-images.bundle.js'],
		}),
		new UglifyJSPlugin({
			compress: true,
		}),
		new ExtractTextPlugin({
			filename: '[name].bundle.css',
			allChunks: true,
		}),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new BundleAnalyzerPlugin()
	]
})