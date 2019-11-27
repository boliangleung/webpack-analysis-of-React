if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  // 拒绝跟踪防止了一个常见的问题，即React由于错误而进入不一致的状态，但它被promise所吞没，用户不知道是什么导致React未来的不稳定行为。
  require('promise/lib/rejection-tracking').enable() //去node_module对应的文件找plyfill 解析
  window.Promise = require('promise/lib/es6-extensions.js')
}

// fetch() polyfill for making API calls.   fetch()用于进行API调用的polyfill。
require('whatwg-fetch')

// Object.assign() is commonly used with React.  assign（）通常与React一起使用。
// It will use the native implementation if it's present and isn't buggy.  如果存在并且没有错误，它将使用本机实现。
Object.assign = require('object-assign')
