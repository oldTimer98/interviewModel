function throttle(fn, wait) {
  let curTime = Date.now()
  return function (...args) {
    let ctx = this
    let nowTime = Date.now()
    // 如果两次时间间隔超过了指定时间，则执行函数。
    if (nowTime - curTime >= wait) {
      curTime = Date.now()
      return fn.apply(ctx, args)
    }
  }
}
// 测试用例
function handleScroll() {
  console.log("Scrolled")
}

const throttledHandleScroll = throttle(handleScroll, 1000)

// 模拟滚动事件
// 在 1000 毫秒内多次触发滚动事件，但只会在每隔 1000 毫秒输出一次 'Scrolled'
setInterval(() => {
  throttledHandleScroll()
}, 200)