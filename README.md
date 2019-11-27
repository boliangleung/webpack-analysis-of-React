### 关于 React 中 Webpack 的配置解读

- npm run eject 抛出 webpack 详细的配置
- ./config/jest 测试工具的代码编辑
- env.js 获取 NODE-ENV 和 REACT*APP*\*环境变量，并准备通过 Webpack 配置中的 DefinePlugin 将它们注入到应用程序中。
- path.js 一些路径的 resolve 后的集成抛出
- webpack.config.dev.js 开发环境 webpack 配置
- webpack.config.prod.js 生成环境的 webpack 配置
- 对于./scriptes 的 build.js 和 start.js 配置打包前的一些配置

### 个人观点

#### React webpack 解析 待优化

- 1.解析 css 的 Plugin 可以换成 mini-css-extract-plugin
- 2.可以使用 webpack 推荐异步加载模块的方法(魔法注释) 提高项目性能 还需要配置一些 option 请看详情
  npm install --save-dev @babel/plugin-syntax-dynamic-import(babel 官网)
- 3.例如 你每个 JS 页面 都要写 import React from 'react' xx 对于一些经常用得 import
  我们可以使用 webpack 推荐的垫片写法 new ProvidePlugin 可以配置多个参数 页面代码简洁很多
- 4. 看项目需求 是否要使用 PWA (react 没用)
- 5.可以使用 DllPlugin 插件。 因为 react 的页面 几乎都要用到 from 'react' 等等常用的 react 库 我们可以编辑一个 webpack.dll.js 把 这些第三方的库(react)
- 提前打包好。当我们再次打包的时候，我们就不会从 node_module 里打包这些第三方的库，这不仅提高了开发时候的效率，上线之后 我们的 main.js 文件也会小，
  这些第三方的库也利用到了浏览器的缓存效果
- 6.对于 devtool 的设置:官方推荐 开发环境用 cheap-module-leval-soure-map 生产环境 cheap-module-soure-map

#### 优点：配置的很详细

- 1.loader 的话 加上了一个 preloader 可以让 js jsx 的代码 在进行 loader 解析前，对代码进行 eslint 的检查

#### 详细用法和解释，请看文件配置

#### 此配置说明是给我那些想了解 React 的 webpack 朋友去学的

#### 如有不误，请谅解。或者提供您宝贵的意见

#### 联系我 786981510@qq.com
