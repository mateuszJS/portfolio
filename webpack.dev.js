"use strict";
const DashboardPlugin = require('webpack-dashboard/plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const HOST = "127.0.0.1";
const PORT = "7777";



module.exports = merge(common, {
	devtool: 'eval-source-map',
	devServer: {
		contentBase: "./dist",
		hot: true,
		inline: true,
		port: PORT,
		host: HOST,
		historyApiFallback: true
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
		]
	},
	plugins: [
		new DashboardPlugin(),
	]
})