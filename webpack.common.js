"use strict";
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js', '.glsl' ]
  },
	entry: {
		index: `${__dirname}/src/index.js`,
		animationMobile: `${__dirname}/src/animationMobile/mainAnimation.ts`,
		// animationDesktop: `${__dirname}/src/animationDesktop/mainAnimation.ts`,
		prefetchImages: `${__dirname}/src/prefetch-images.js`,
		sayHello: `${__dirname}/src/sayHello.js`,
	},
	output: {
		path: `${__dirname}/dist`,
		publicPath: '/',
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env'],
					}
				}
			},

			// {
			// 	test: /\.svg$/,
			// 	loader: 'svg-inline-loader'
			// },

			{
        test: /\.(svg|png|jpg|woff|woff2|eot|ttf)$/,
        oneOf: [
          {
            test: /(bebasneue|Inline)/,
						use: [
							{
								loader: 'url-loader',
								options: {
									limit: 20 * 1024
								}
							}
						],
          },
          {
            test: /\.(svg|png|jpg|woff|woff2|eot|ttf)$/,
						use: [
							{
								loader: 'url-loader',
								options: {
									limit: 10
								}
							}
						],
          },
        ]
			},
      {
        test: /\.glsl$/,
        use: [
          'glsl-shader-loader',
          // path.resolve(__dirname, 'loader.js'),
        ]
      },
			{
				test: /\.html$/,
				exclude: /node_modules/,
				use: {loader: 'html-loader'}
			},
		]
	},
	plugins: [
	  new HtmlWebpackPlugin({
	    template: 'src/template.html'
		})
	]
}
