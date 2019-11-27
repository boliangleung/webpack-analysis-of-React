// process 全局对象 定义环境为开发环境
process.env.NODE_ENV = 'development'
// process.env.PORT = '8086'
//http://npm.taobao.org/package/@classflow/react-dev-utils  react-dev-utils 介绍

// Load environment variables from .env file. Suppress warnings using silent   从.env文件加载环境变量。使用沉默抑制警告
// if this file is missing. dotenv will never modify any environment variables   如果这个文件丢失了。dotenv永远不会修改任何环境变量
// that have already been set.   // 它已经被配置了
// https://github.com/motdotla/dotenv
// Dotenv是一个零依赖模块，可将环境变量从.env文件加载到中process.env。将配置与代码分开存储在环境中是基于“十二要素应用程序”方法的。
require('dotenv').config({ silent: true })

var chalk = require('chalk') // chalk 这个包是为了使输出不再单调, 添加文字背景什么的, 改变字体颜色什么的,
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var historyApiFallback = require('connect-history-api-fallback') // 中间件，用于通过指定的索引页代理请求，这对于使用HTML5历史记录API的单页应用程序很有用。
// 单页面应用程序(SPA)通常使用一个web浏览器可以访问的索引文件，比如index.html，然后，在HTML5 History API的帮助下（react - router就是基于History API实现的），
// 借助JavaScript处理应用程序中的导航。当用户单击刷新按钮或直接通过输入地址的方式访问页面时，会出现找不到页面的问题，因为这两种方式都绕开了History API，而我们的请求又找不到后端对应的路由，页面返回404错误。
// connect - history - api - fallback中间件很好的解决了这个问题。具体来说，每当出现符合以下条件的请求时，它将把请求定位到你指定的索引文件(默认为 / index.html) 。
// 请求是Get请求
// 请求的Content - Type类型是text / html类型
// 不是直接的文件请求，即所请求的路径不包含.(点)字符
// 不匹配option参数中提供的模式

var httpProxyMiddleware = require('http-proxy-middleware') // 用于把请求代理转发到其他服务器的中间件。
var detect = require('detect-port') // 端口检测器的Node.js实现
var clearConsole = require('react-dev-utils/clearConsole') //清理console
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
// 确保所有传递的文件都存在。
// 文件名应该是绝对的。
// 如果找不到文件，则输出警告消息并返回false。
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages') // 格式化webpack信息 从webpack stats对象中提取并整理警告和错误消息。
var getProcessForPort = require('react-dev-utils/getProcessForPort') // 获取处理端口  在上查找当前正在运行的进程port。返回包含名称和目录的字符串
var openBrowser = require('react-dev-utils/openBrowser') //打开浏览器 尝试使用给定的URL打开浏览器。
var prompt = require('react-dev-utils/prompt') // 此功能向用户显示控制台提示。
var fs = require('fs') // node核心模块 文件系统模块
var config = require('../config/webpack.config.dev')
var paths = require('../config/paths')

var useYarn = fs.existsSync(paths.yarnLockFile) // 如果路径存在，则返回 true，否则返回 false。
var cli = useYarn ? 'yarn' : 'npm'
var isInteractive = process.stdout.isTTY // 判断 Node.js 是否在 TTY(终端) 上下文中运行的首选方法是检查 process.stdout.isTTY 属性的值是否为 true：
//process.stdout 属性返回连接到 stdout(fd 1) 的流。 它是一个 net.Socket 流（也就是双工流），除非 fd 1 指向一个文件，在这种情况下它是一个可写流。

// Warn and crash if required files are missing  如果缺少所需的文件，则发出警告并崩溃
// 确保 index.html 和index.js文件都存在 否则退出Node 进程
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

// Tools like Cloud9 rely on this. 像Cloud9这样的工具依赖于此
var DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
var compiler
var handleCompile

// You can safely remove this after ejecting.   弹出后可以安全地删除此项。
// We only use this block for testing of Create React App itself:  我们只使用此块测试Create React App本身
var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1) //是否是冒烟测试。 process.argv 属性返回一个数组，其中包含当启动 Node.js 进程时传入的命令行参数。
if (isSmokeTest) {
  handleCompile = function(err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1)
    } else {
      process.exit(0)
    }
  }
}

function setupCompiler(host, port, protocol) {
  // "Compiler" is a low-level interface to Webpack.  Compiler是Webpack的低级接口
  // It lets us listen to some events and provide our own custom messages. 它允许我们监听一些事件并提供我们自己的自定义消息
  compiler = webpack(config, handleCompile)

  // "invalid" event fires when you have changed a file, and Webpack is    当您更改了一个无效文件，并且Webpack是
  // recompiling a bundle. WebpackDevServer takes care to pause serving the  重新编译包。WebpackDevServer注意暂停服务
  // bundle, so if you refresh, it'll wait instead of serving the old one.   包，所以如果你刷新，它会等待而不是服务旧的。
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.   “invalid”是“bundle invalidated”的缩写，并不表示有任何错误。
  compiler.plugin('invalid', function() {
    if (isInteractive) {
      clearConsole()
    }
    console.log('Compiling...')
  })

  var isFirstCompile = true

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', function(stats) {
    if (isInteractive) {
      clearConsole()
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    var messages = formatWebpackMessages(stats.toJson({}, true))
    var isSuccessful = !messages.errors.length && !messages.warnings.length
    var showInstructions = isSuccessful && (isInteractive || isFirstCompile)

    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'))
    }

    if (showInstructions) {
      console.log()
      console.log('The app is running at:')
      console.log()
      console.log('  ' + chalk.cyan(protocol + '://' + host + ':' + port + '/'))
      console.log()
      console.log('Note that the development build is not optimized.')
      console.log(
        'To create a production build, use ' +
          chalk.cyan(cli + ' run build') +
          '.'
      )
      console.log()
      isFirstCompile = false
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      console.log(chalk.red('Failed to compile.'))
      console.log()
      messages.errors.forEach(message => {
        console.log(message)
        console.log()
      })
      return
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.'))
      console.log()
      messages.warnings.forEach(message => {
        console.log(message)
        console.log()
      })
      // Teach some ESLint tricks.
      console.log('You may use special comments to disable some warnings.')
      console.log(
        'Use ' +
          chalk.yellow('// eslint-disable-next-line') +
          ' to ignore the next line.'
      )
      console.log(
        'Use ' +
          chalk.yellow('/* eslint-disable */') +
          ' to ignore all warnings in a file.'
      )
    }
  })
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
  return function(err, req, res) {
    var host = req.headers && req.headers.host
    console.log(
      chalk.red('Proxy error:') +
        ' Could not proxy request ' +
        chalk.cyan(req.url) +
        ' from ' +
        chalk.cyan(host) +
        ' to ' +
        chalk.cyan(proxy) +
        '.'
    )
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
        chalk.cyan(err.code) +
        ').'
    )
    console.log()

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
      res.writeHead(500)
    }
    res.end(
      'Proxy error: Could not proxy request ' +
        req.url +
        ' from ' +
        host +
        ' to ' +
        proxy +
        ' (' +
        err.code +
        ').'
    )
  }
}

function addMiddleware(devServer) {
  // `proxy` lets you to specify a fallback server during development.
  // Every unrecognized request will be forwarded to it.
  var proxy = require(paths.appPackageJson).proxy
  devServer.use(
    historyApiFallback({
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebookincubator/create-react-app/issues/387.
      disableDotRule: true,
      // For single page apps, we generally want to fallback to /index.html.
      // However we also want to respect `proxy` for API calls.
      // So if `proxy` is specified, we need to decide which fallback to use.
      // We use a heuristic: if request `accept`s text/html, we pick /index.html.
      // Modern browsers include text/html into `accept` header when navigating.
      // However API calls like `fetch()` won’t generally accept text/html.
      // If this heuristic doesn’t work well for you, don’t use `proxy`.
      htmlAcceptHeaders: proxy ? ['text/html'] : ['text/html', '*/*']
    })
  )
  if (proxy) {
    if (typeof proxy !== 'string') {
      console.log(
        chalk.red('When specified, "proxy" in package.json must be a string.')
      )
      console.log(
        chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".')
      )
      console.log(
        chalk.red(
          'Either remove "proxy" from package.json, or make it a string.'
        )
      )
      process.exit(1)
    }

    // Otherwise, if proxy is specified, we will let it handle any request.
    // There are a few exceptions which we won't send to the proxy:
    // - /index.html (served as HTML5 history API fallback)
    // - /*.hot-update.json (WebpackDevServer uses this too for hot reloading)
    // - /sockjs-node/* (WebpackDevServer uses this for hot reloading)
    // Tip: use https://jex.im/regulex/ to visualize the regex
    var mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/

    // Pass the scope regex both to Express and to the middleware for proxying
    // of both HTTP and WebSockets to work without false positives.
    var hpm = httpProxyMiddleware(pathname => mayProxy.test(pathname), {
      target: proxy,
      logLevel: 'silent',
      onProxyReq: function(proxyReq) {
        // Browers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', proxy)
        }
      },
      onError: onProxyError(proxy),
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true
    })
    devServer.use(mayProxy, hpm)

    // Listen for the websocket 'upgrade' event and upgrade the connection.
    // If this is not done, httpProxyMiddleware will not try to upgrade until
    // an initial plain HTTP request is made.
    devServer.listeningApp.on('upgrade', hpm.upgrade)
  }

  // Finally, by now we have certainly resolved the URL.
  // It may be /index.html, so let the dev server try serving it again.
  devServer.use(devServer.middleware)
}

function runDevServer(host, port, protocol) {
  var devServer = new WebpackDevServer(compiler, {
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // By default WebpackDevServer serves physical files from current directory
    // in addition to all the virtual build products that it serves from memory.
    // This is confusing because those files won’t automatically be available in
    // production build folder unless we copy them. However, copying the whole
    // project directory is dangerous because we may expose sensitive files.
    // Instead, we establish a convention that only files in `public` directory
    // get served. Our build script will copy `public` into the `build` folder.
    // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
    // Note that we only recommend to use `public` folder as an escape hatch
    // for files like `favicon.ico`, `manifest.json`, and libraries that are
    // for some reason broken when imported through Webpack. If you just want to
    // use an image, put it in `src` and `import` it from JavaScript instead.
    contentBase: paths.appPublic,
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: config.output.publicPath,
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.plugin` calls above.
    quiet: true,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebookincubator/create-react-app/issues/293
    watchOptions: {
      ignored: /node_modules/
    },
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === 'https',
    host: host
  })

  // Our custom middleware proxies requests to /index.html or a remote API.
  addMiddleware(devServer)

  // Launch WebpackDevServer.
  devServer.listen(port, err => {
    if (err) {
      return console.log(err)
    }

    if (isInteractive) {
      clearConsole()
    }
    console.log(chalk.cyan('Starting the development server...'))
    console.log()

    openBrowser(protocol + '://' + host + ':' + port + '/')
  })
}

function run(port) {
  var protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
  var host = process.env.HOST || 'localhost'
  setupCompiler(host, port, protocol)
  runDevServer(host, port, protocol)
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port)
    return
  }

  if (isInteractive) {
    clearConsole()
    var existingProcess = getProcessForPort(DEFAULT_PORT)
    var question =
      chalk.yellow(
        'Something is already running on port ' +
          DEFAULT_PORT +
          '.' +
          (existingProcess ? ' Probably:\n  ' + existingProcess : '')
      ) + '\n\nWould you like to run the app on another port instead?'

    prompt(question, true).then(shouldChangePort => {
      if (shouldChangePort) {
        run(port)
      }
    })
  } else {
    console.log(
      chalk.red('Something is already running on port ' + DEFAULT_PORT + '.')
    )
  }
})
