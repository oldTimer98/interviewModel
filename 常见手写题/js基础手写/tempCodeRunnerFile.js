function mySetInterval(fn, timeout) {
  const timer = {
    flag: true,
  }
  function interval() {
    if (timer.flag) {
      fn()
      setTimeout(interval, timeout)
    }
  }
  setTimeout(interval, timeout)
  return timer
}

const myTimer = mySetInterval(() => {
  console.log("Hello, World!");
}, 1000);

// 运行 5 秒后停止定时器
setTimeout(() => {
  myTimer.flag = false; // 停止定时器
  console.log("定时器已停止");
}, 5000);