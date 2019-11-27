var path = require('path')
var fs = require('fs')
var url = require('url')

// Make sure any symlinks in the project folder are resolved:     确保已解析项目文件夹中的所有符号链接：
// https://github.com/facebookincubator/create-react-app/issues/637

// node 里面 fs.realpathSync 文件系统的api=> 返回已解析的路径名。process.cwd()=> Node.js 进程的当前工作目录。
var appDirectory = fs.realpathSync(process.cwd()) // 获取当前工作目录的路径名
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath) // 传入相对路径，拼接当前工作目录 获取其绝对路径
}

// We support resolving modules according to `NODE_PATH`.  我们支持根据节点路径解析模块`
// This lets you use absolute paths in imports inside large monorepos:  这允许您在大型monorepo中的导入中使用绝对路径：
// https://github.com/facebookincubator/create-react-app/issues/253.

// It works similar to `NODE_PATH` in Node itself:          它的工作原理与NODE本身中的“NODE\u PATH”类似
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

// We will export `nodePaths` as an array of absolute paths.   我们将把nodePaths导出为一个绝对路径数组。
// It will then be used by Webpack configs.
// Jest doesn’t need this because it already handles `NODE_PATH` out of the box.  Jest（测试）不需要这个，因为它已经可以处理现成的 NODE_PATH。

// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.              注意，与在Node中不同的是，只有来自“Node_PATH”的*相对*路径才被接受。
// Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.    否则，我们会冒着将Node.js核心模块导入应用程序而不是Webpack垫片的风险。
// https://github.com/facebookincubator/create-react-app/issues/1023#issuecomment-265344421

var nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp)

var envPublicUrl = process.env.PUBLIC_URL
//  ES6 新方法
// includes() ：返回布尔值，表示是否找到了参数字符串。
// startsWith() ：返回布尔值，表示参数字符串是否在源字符串的头部。
// endsWith() ：返回布尔值，表示参数字符串是否在源字符串的尾部。
// 作用是 判断传入path是否有斜线 然后看是否要加入/
function ensureSlash(path, needsSlash) {
  var hasSlash = path.endsWith('/')
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1)
  } else if (!hasSlash && needsSlash) {
    return path + '/'
  } else {
    return path
  }
}

// 获取公共路径  这里的话 .homePage 我也不知道啥意思
function getPublicUrl(appPackageJson) {
  return envPublicUrl || require(appPackageJson).homepage
}

// We use `PUBLIC_URL` environment variable or "homepage" field to infer  我们使用`PUBLIC_URL`环境变量或“homepage”字段来推断提供应用程序的“PUBLIC path”。
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in      Webpack需要知道如何将正确的<script>hrefs放入HTML，
// single-page apps that may serve index.html for nested URLs like /todos/42.     //即使是在单页应用程序中，也可以为/todos/42之类的嵌套URL提供index.HTML。
// We can't use a relative path in HTML because we don't want to load something   我们不能在HTML中使用相对路径，
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.            因为我们不想加载/todos/42/static/js/bundle.7289d.js之类的内容。我们必须知道根源。
function getServedPath(appPackageJson) {
  var publicUrl = getPublicUrl(appPackageJson)
  var servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/')
  return ensureSlash(servedUrl, true)
}

// config after eject: we're in ./config/
// 返回下面路径的绝对路径
module.exports = {
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  nodePaths: nodePaths,
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json'))
}
