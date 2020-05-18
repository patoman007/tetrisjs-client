const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/main.js'
  },
  module: {
    rules: [
      { test: /\.css$/i, loader: 'style-loader!css-loader' },
      { test: /\.(ttf|woff|woff2)$/i, loader: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlPlugin({
      favicon: path.resolve(__dirname, 'src', 'img', 'shapes.png'),
      meta: {
        'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'X-UA-Compatible': { 
          'http-equiv': 'X-UA-Compatible', 
          'content': 'IE=edge'
        }
      },
      title: 'Tetris JS'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
