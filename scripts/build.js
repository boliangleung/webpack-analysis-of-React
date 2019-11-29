// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true })

var chalk = require('chalk')
var fs = require('fs-extra')
var path = require('path')
var url = require('url')
var webpack = require('webpack')
var config = require('../config/webpack.config.prod')
var paths = require('../config/paths')
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles') // start.js又说
var FileSizeReporter = require('react-dev-utils/FileSizeReporter') // 捕获传递的内的JS和CSS资产大小buildFolder。保存结果值以在构建后进行比较。
var measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild //在打包前的体积
var printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild // 打包后的体积

var useYarn = fs.existsSync(paths.yarnLockFile) // 是否有使用yarn

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

// First, read the current file sizes in build directory.  首先，读取生成目录中的当前文件大小。
// This lets us display how much they changed later.      这让我们可以显示他们后来改变了多少。
measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
  // Remove all content but keep the directory so that      删除所有内容，但保留目录以便
  // if you're in it, you don't end up in Trash     如果你在里面，你就不会被扔进垃圾桶

  // fs-extra模块是系统fs模块的扩展，提供了更多便利的 API，并继承了fs模块的 API
  // 4个api  1.copy 2.emptyDir(清空目录)  3. ensureFile 创建文件   4. ensureDir 创建目录
  fs.emptyDirSync(paths.appBuild) // appBuild 打包后的文件夹  功能和cleanWepackPlugin相似

  // Start the webpack build
  build(previousFileSizes)

  // Merge with the public folder
  copyPublicFolder()
})

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary))
  console.log()
  errors.forEach(err => {
    console.log(err.message || err)
    console.log()
  })
}

// Create the production build and print the deployment instructions.  创建生产生成并打印部署说明。
function build(previousFileSizes) {
  console.log('Creating an optimized production build...')
  webpack(config).run((err, stats) => {
    if (err) {
      printErrors('Failed to compile.', [err])
      process.exit(1)
    }

    if (stats.compilation.errors.length) {
      printErrors('Failed to compile.', stats.compilation.errors)
      process.exit(1)
    }

    if (process.env.CI && stats.compilation.warnings.length) {
      printErrors(
        'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
        stats.compilation.warnings
      )
      process.exit(1)
    }

    console.log(chalk.green('Compiled successfully.'))
    console.log()

    console.log('File sizes after gzip:')
    console.log()
    printFileSizesAfterBuild(stats, previousFileSizes)
    console.log()

    var appPackage = require(paths.appPackageJson)
    var publicUrl = paths.publicUrl
    var publicPath = config.output.publicPath
    var publicPathname = url.parse(publicPath).pathname
    if (publicUrl && publicUrl.indexOf('.github.io/') !== -1) {
      // "homepage": "http://user.github.io/project"
      console.log(
        'The project was built assuming it is hosted at ' +
          chalk.green(publicPathname) +
          '.'
      )
      console.log(
        'You can control this with the ' +
          chalk.green('homepage') +
          ' field in your ' +
          chalk.cyan('package.json') +
          '.'
      )
      console.log()
      console.log(
        'The ' + chalk.cyan('build') + ' folder is ready to be deployed.'
      )
      console.log('To publish it at ' + chalk.green(publicUrl) + ', run:')
      // If script deploy has been added to package.json, skip the instructions
      if (typeof appPackage.scripts.deploy === 'undefined') {
        console.log()
        if (useYarn) {
          console.log('  ' + chalk.cyan('yarn') + ' add --dev gh-pages')
        } else {
          console.log('  ' + chalk.cyan('npm') + ' install --save-dev gh-pages')
        }
        console.log()
        console.log(
          'Add the following script in your ' + chalk.cyan('package.json') + '.'
        )
        console.log()
        console.log('    ' + chalk.dim('// ...'))
        console.log('    ' + chalk.yellow('"scripts"') + ': {')
        console.log('      ' + chalk.dim('// ...'))
        console.log(
          '      ' +
            chalk.yellow('"predeploy"') +
            ': ' +
            chalk.yellow('"npm run build",')
        )
        console.log(
          '      ' +
            chalk.yellow('"deploy"') +
            ': ' +
            chalk.yellow('"gh-pages -d build"')
        )
        console.log('    }')
        console.log()
        console.log('Then run:')
      }
      console.log()
      console.log('  ' + chalk.cyan(useYarn ? 'yarn' : 'npm') + ' run deploy')
      console.log()
    } else if (publicPath !== '/') {
      // "homepage": "http://mywebsite.com/project"
      console.log(
        'The project was built assuming it is hosted at ' +
          chalk.green(publicPath) +
          '.'
      )
      console.log(
        'You can control this with the ' +
          chalk.green('homepage') +
          ' field in your ' +
          chalk.cyan('package.json') +
          '.'
      )
      console.log()
      console.log(
        'The ' + chalk.cyan('build') + ' folder is ready to be deployed.'
      )
      console.log()
    } else {
      if (publicUrl) {
        // "homepage": "http://mywebsite.com"
        console.log(
          'The project was built assuming it is hosted at ' +
            chalk.green(publicUrl) +
            '.'
        )
        console.log(
          'You can control this with the ' +
            chalk.green('homepage') +
            ' field in your ' +
            chalk.cyan('package.json') +
            '.'
        )
        console.log()
      } else {
        // no homepage
        console.log(
          'The project was built assuming it is hosted at the server root.'
        )
        console.log(
          'To override this, specify the ' +
            chalk.green('homepage') +
            ' in your ' +
            chalk.cyan('package.json') +
            '.'
        )
        console.log('For example, add this to build it for GitHub Pages:')
        console.log()
        console.log(
          '  ' +
            chalk.green('"homepage"') +
            chalk.cyan(': ') +
            chalk.green('"http://myname.github.io/myapp"') +
            chalk.cyan(',')
        )
        console.log()
      }
      //  cwd // 获取当前工作目录的路径名
      var build = path.relative(process.cwd(), paths.appBuild)
      console.log(
        'The ' + chalk.cyan(build) + ' folder is ready to be deployed.'
      )
      console.log('You may serve it with a static server:')
      console.log()
      if (useYarn) {
        console.log(`  ${chalk.cyan('yarn')} global add serve`)
      } else {
        console.log(`  ${chalk.cyan('npm')} install -g serve`)
      }
      console.log(`  ${chalk.cyan('serve')} -s build`)
      console.log()
    }
  })
}

function copyPublicFolder() {
  // 代表同步拷贝
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml
  })
}
