const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('node:path');

module.exports = (env, argv) => {
  const isDev = argv.mode == 'development';

  return {
    entry: path.join(__dirname, 'src', 'index.ts'),
    cache: isDev,
    devtool: isDev ? 'inline-source-map' : 'eval',
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'dist'),
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(svg)$/,
          use: 'file-loader',
        },
        {
          test: /\.s?css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'index.html'),
      }),
      new CopyPlugin({
        patterns: [{ from: path.join(__dirname, 'public') }],
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
          },
        }),
      ],
    },
    devServer: {
      port: 9000,
      hot: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
    },
  };
};
