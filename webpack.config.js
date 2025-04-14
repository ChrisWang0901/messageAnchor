const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    const outputDir = isProduction ? 'dist' : 'dev';

    return {
        mode: argv.mode,
        entry: {
            sidePanel: './src/side-panel.ts',
            background: './src/background.ts',
            content: './src/content.ts',
            style: './src/style.scss',
        },
        output: {
            path: path.resolve(__dirname, outputDir),
            filename: '[name].js',
            module: true,
        },
        devtool: isProduction ? false : 'source-map',
        resolve: {
            extensions: ['.ts', '.js', ],
        },
        experiments: {
            outputModule: true,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								sourceMap: !isProduction
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: !isProduction
							}
						}
					]
                }
            ],
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: 'src/manifest.json', to: 'manifest.json' },
                    { from: 'src/icons', to: 'icons' },
                    { from: 'src/side-panel.html', to: 'side-panel.html' },
                    { from: 'src/popup.html', to: 'popup.html' },
                ],
            }),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            }),
            new Dotenv(),
        ],
    };
};
