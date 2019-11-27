var autoprefixer = require('autoprefixer') //css格式化加前缀的插件
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin') //区分大小写路径网页包插件  https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin') //这个WebPACK插件让我们将自定义变量插入到indexx.html中。它通过事件与HtmlWebpackPlugin 2.x协同工作。
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin') //下方由解释
var getClientEnvironment = require('./env')
var paths = require('./paths')

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.

// Webpack使用“publicPath”来确定应用程序从何处提供服务。在开发过程中，我们总是从根目录提供服务。这使得配置更容易。
var publicPath = '/'

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.

// `publicUrl与publicPath类似，
// 但我们将在index.html和JavaScript中分别以%PUBLIC_URL%  和`process.env.PUBLIC_URL`的形式提供给我们的应用程序。
// 省略尾部斜杠，因为%PUBLIC_PATH%/xyz看起来比%PUBLIC_PATH%xyz。
var publicUrl = ''

// Get environment variables to inject into our app.
// 获取要注入到我们的应用程序中的环境变量。
var env = getClientEnvironment(publicUrl)

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // Include an alternative client for WebpackDevServer. A client's job is to  包括WebpackDevServer的备用客户端。
    // connect to WebpackDevServer by a socket and get notified about changes.   客户端的工作是通过socket和获取通知信息连接到WebpackDevServer，并得到有关更改的通知。
    // When you save a file, the client will either apply hot updates (in case
    // of CSS changes), or refresh the page (in case of JS changes). When you
    // make a syntax error, this client will display a syntax error overlay.
    // Note: instead of the default WebpackDevServer client, we use a custom one
    // to bring better experience for Create React App users. You can replace
    // the line below with these two lines if you prefer the stock client:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    // 保存文件时，客户端将应用热更新（在CSS更改的情况下）或刷新页面（在JS更改的情况下）。
    // 发生语法错误时，此客户端将显示语法错误覆盖。注意：我们不使用默认的WebpackDevServer客户端，而是使用自定义客户端为Create React App用户带来更好的体验。
    // 如果您喜欢stock客户端，可以将下面的行替换为这两行：
    require.resolve('react-dev-utils/webpackHotDevClient'),
    // We ship a few polyfills by default:  默认情况下，我们会发送一些polyfill
    require.resolve('./polyfills'),
    // Finally, this is your app's code:
    paths.appIndexJs
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],
  output: {
    // 一些相关的配置 网上看既可
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.    这允许您为Webpack查找模块的位置设置回退。
    // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.     我们在“paths.js”中读取“NODE\u PATH”环境变量，并在此处传递路径
    // We use `fallback` instead of `root` because we want `node_modules` to "win"
    // if there any conflicts. This matches Node resolution mechanism.    // 我们使用'fallback'而不是'root'，因为我们希望'node_modules'在出现任何冲突时“获胜”。这与节点解析机制相匹配。
    // https://github.com/facebookincubator/create-react-app/issues/253
    fallback: paths.nodePaths,
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    extensions: ['.js', '.json', '.jsx', ''],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web'
    }
  },

  module: {
    // First, run the linter.
    // It's important to do this before Babel processes the JS.
    // 在进行loader 之前 先对js jsx文件做了eslint的检测
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint',
        include: paths.appSrc
      }
    ],
    loaders: [
      // ** ADDING/UPDATING LOADERS **
      // The "url" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list for "url" loader.

      // "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
      // Otherwise, it acts like the "file" loader.
      {
        exclude: [
          /\.html$/,
          // We have to write /\.(js|jsx)(\?.*)?$/ rather than just /\.(js|jsx)$/
          // because you might change the hot reloading server from the custom one
          // to Webpack's built-in webpack-dev-server/client?/, which would not
          // get properly excluded by /\.(js|jsx)$/ because of the query string.
          // Webpack 2 fixes this, but for now we include this hack.
          // https://github.com/facebookincubator/create-react-app/issues/1713
          // 因为您可能会将热重新加载服务器从自定义服务器更改为Webpack的内置Webpack dev server/client？/，
          //但由于查询字符串的原因，/\.（js | jsx）$/无法正确排除它。Webpack 2修复了此问题，但现在我们包括此黑客攻击。
          /\.(js|jsx)(\?.*)?$/,
          /\.css$/,
          /\.json$/,
          /\.svg$/
        ],
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel',
        query: {
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true
        }
      },
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      {
        test: /\.css$/,
        loader: 'style!css?importLoaders=1!postcss'
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json'
      },
      // "file" loader for svg
      {
        test: /\.svg$/,
        loader: 'file',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "url" loader exclusion list.
    ]
  },

  // We use PostCSS for autoprefixing only.
  postcss: function() {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9' // React doesn't support IE8 anyway
        ]
      })
    ]
  },
  plugins: [
    // Makes some environment variables available in index.html.  使一些环境变量在index.html中可用。
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:   public URL在index.html中可用作%public_URL%，例如：
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.    在开发中，这将是一个空字符串。
    // 您可以传递任何键值对，这只是一个示例。(比如 PUBLIC_URL: publicUrl,)  比如 publicUrl 将会由%PUBLIC_URL%代替
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    // Makes some environment variables available to the JS code, for example:    使某些环境变量对JS代码可用，例如：
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use    如果您在路径中键入了错误的大小写，则Watcher无法正常工作，
    // a plugin that prints an error when you attempt to do this.             因此我们使用一个插件，在您尝试执行此操作时会打印错误
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186

    // 如果您需要一个丢失的模块，然后“npm install”，您仍然需要重新启动开发服务器，以便Webpack发现它。此插件使发现自动进行，因此您不必重新启动。
    new WatchMissingNodeModulesPlugin(paths.appNodeModules) // node_modules代码
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
