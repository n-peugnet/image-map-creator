module.exports = (env) => {
	return {
		// Environment dependent
		mode: env == 'dev' ? 'development' : 'production',
		devtool: env == 'dev' ? 'eval-cheap-module-source-map' : 'source-map',

		// Constant
		entry: './src/p5.image-map-creator.ts',
		output: {
			filename: 'image-map-creator.bundle.js',
			libraryTarget: 'umd',
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