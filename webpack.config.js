const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { WebpackPluginServe: Serve } = require('webpack-plugin-serve')

const IS_PROD = process.env.NODE_ENV !== 'development'

const publicPath = '/'
const pathSrc = path.join(__dirname, 'src')
const pathBuild = path.join(__dirname, 'build')

const serveOptions = {
  port: 8080,
  historyFallback: {
    index: path.join(publicPath, 'index.html'),
    verbose: true,
  },
  client: {
    retry: true,
  },
  static: [pathBuild],
}

module.exports = {
  mode: IS_PROD ? 'production' : 'development',
  watch: !IS_PROD,
  entry: [
    ...(IS_PROD ? [] : ['webpack-plugin-serve/client']),
    path.join(pathSrc, 'index.tsx'),
  ],
  output: {
    filename: IS_PROD ? '[name].[contenthash].js' : '[name].js',
    path: path.join(pathBuild, publicPath.replace(/\$/, '')),
    devtoolModuleFilenameTemplate: IS_PROD
      ? undefined
      : (info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    publicPath,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: IS_PROD ? '[name].[contenthash:8].css' : '[name].css',
      chunkFilename: IS_PROD
        ? '[name].[contenthash:8].chunk.css'
        : '[name].chunk.css',
    }),
    new HtmlWebPackPlugin({
      template: 'index_template.ejs',
      filename: 'index.html',
    }),
    ...(IS_PROD ? [] : [new Serve(serveOptions)]),
  ],
  resolve: {
    modules: [pathSrc, 'node_modules'],
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    ...(IS_PROD
      ? {}
      : {
          alias: {
            'react-dom': '@hot-loader/react-dom',
          },
        }),
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        include: [pathSrc],
        exclude: [/node_modules/],
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !IS_PROD,
            },
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !IS_PROD,
            },
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
          {
            loader: 'js-to-styles-var-loader',
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
}
