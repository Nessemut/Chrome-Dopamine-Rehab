const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './background.ts',
    dashboard: './src/dashboard/dashboard.ts',
    about: './src/about/about.ts',
    'common-config': './src/common-config/common-config.ts',
    applySettings: './applySettings.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'src/dashboard/dashboard.html', to: 'src' },
        { from: 'src/about/about.html', to: 'src' },
        { from: 'src/common-config/common-config.html', to: 'src' },
        { from: 'src/common-configs', to: 'src/common-configs' },
        { from: 'icons', to: 'icons' },
      ],
    }),
  ],
  devtool: 'source-map',
};
