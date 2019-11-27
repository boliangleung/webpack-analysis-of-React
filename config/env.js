//获取NODE-ENV和REACT_APP_*环境变量，并准备通过Webpack配置中的DefinePlugin将它们注入到应用程序中。
var REACT_APP = /^REACT_APP_/i

function getClientEnvironment(publicUrl) {
  var raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key]
        return env
      },
      {
        // Useful for determining whether we’re running in production mode.  有助于确定我们是否在生产模式下运行。
        // Most importantly, it switches React into the correct mode.     最重要的是，它会切换到正确的模式
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Useful for resolving the correct path to static assets in `public`.  有助于在'public'中解析静态资产的正确路径`
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        // 这个只能用作逃生舱。通常，您会将图像放入“src”并在代码中“导入”它们以获取它们的路径。
        PUBLIC_URL: publicUrl
      }
    )
  // Stringify all values so we can feed into Webpack DefinePlugin     将所有值串起来，以便我们可以输入到Webpack DefinePlugin
  var stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {})
  }

  return { raw, stringified }
}

module.exports = getClientEnvironment
