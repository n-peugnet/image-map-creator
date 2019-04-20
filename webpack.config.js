module.exports = (env) => {
	return {
		// Environment dependent
		mode: env == 'dev' ? 'development' : 'production',
		devtool: env == 'dev' ? 'inline-source-map' : 'none',

		// Constant
		entry: './src/p5.image-map-creator.js',
		output: {
			filename: 'image-map-creator.bundle.js',
			libraryTarget: 'window'
		},
		externals: [
			'p5',
		],
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.tsx?$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				}
			],
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
	}
};