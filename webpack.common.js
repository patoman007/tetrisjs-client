const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/main.js'
  },
  module: {
    rules: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(ttf|woff|woff2)$/, loader: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlPlugin({
      title: 'Tetris JS',
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
