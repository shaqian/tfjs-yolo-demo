const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  resolve: {
    modules: [
      path.join(__dirname, 'assets'),
      "node_modules"
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }, 
      { 
        test: /\.(png|woff|woff2|eot|ttf|svg|...)$/, 
        use: { 
          loader: 'url-loader?limit=100000', 
        }, 
      },
    ]
  }
};

