const path = require('path');
const { updateManifestWithConfig } = require('./build-config');

class ManifestPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('ManifestPlugin', () => {
      updateManifestWithConfig();
    });
  }
}

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new ManifestPlugin()
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist')
      },
      {
        directory: path.join(__dirname)
      }
    ],
    port: 8080,
    hot: true,
    open: false,
    compress: true,
    historyApiFallback: {
      index: 'index.html'
    }
  },
  mode: 'development'
};