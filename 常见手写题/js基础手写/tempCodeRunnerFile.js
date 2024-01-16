class MyPromise {
  constructor(callback) {
    this.status = "pending"
    // 成功的值
    this.value = undefined
    // 失败的值
    this.reason = undefined
    // 成功的函数
    this.onResolveCallbacks = []
    // 失败的函数
    this.onRejectCallbacks = []

    const resolve = value => {
      if (this.status === "pending") {
        this.status = "resolved"
        this.value = value
        this.onResolveCallbacks.forEach(cb => cb())
      }
    }
    const reject = reason => {
      if (this.status === "pending") {
        this.status = "rejected"
        this.reason = reason
        this.onRejectCallbacks.forEach(cb => cb())
      }
    }
    callback(resolve, reject)
  }
  then(OnResolved, OnRejected) {
    OnResolved = typeof OnResolved === "function" ? OnResolved : value => value
    OnRejected =
      typeof OnRejected === "function"
        ? OnRejected
        : reason => {
            throw reason
          }
    console.log("", OnResolved, OnRejected)
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === "resolved") {
        try {
          const x = OnResolved(this.value)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      } else if (this.status === "rejected") {
        try {
          const x = OnRejected(this.reason)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      if (this.status === "pending") {
        this.onResolveCallbacks.push(() => {
          try {
            const x = OnResolved(this.value)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        })
        this.onRejectCallbacks.push(() => {
          try {
            const x = OnRejected(this.reason)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        })
      } else {
        // 执行完所有回调函数之后，清空回调数组
        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []
      }
    })
    return promise2
  }
  catch(OnRejected) {
    console.log("OnRejected", OnRejected)
    return this.then(null, OnRejected)
  }
}

// 测试代码
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("成功")
  }, 1000)
})
promise.then(1).then(value => {
  console.log("value", value)
})