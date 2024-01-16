// 1. 手写 Object.create
function myCreate(obj) {
  function F() {}
  F.prototype = obj
  return new F()
}
// 2. 手写 instanceof 方法
function myInstanceof(left, right) {
  if (typeof right !== "function") return false
  let proto = Object.getPrototypeOf(left)
  let prototype = right.prototype
  while (true) {
    if (!proto) return false
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}
// 3. 手写 new 操作符
function myNew(ctx, ...args) {
  if (typeof ctx !== "function") return
  let obj = {}
  obj.prototype = Object.create(ctx.prototype)
  const res = ctx.apply(this, args)
  if (res && (typeof res !== "object" || typeof res !== "function")) return res
  return obj
}
// 4. 手写 Promise
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
      if (value instanceof MyPromise) {
        return value.then(resolve, reject)
      }
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
  resolve(value) {
    return new MyPromise((resolve, reject) => {
      resolve(value)
    })
  }
  reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }
  finally(callback) {
    return this.then(
      value => {
        return MyPromise.resolve(callback()).then(() => value)
      },
      reason => {
        return MyPromise.resolve(callback()).then(() => {
          throw reason
        })
      }
    )
  }
  all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        throw new TypeError(`argument must be a array`)
      }
      let arr = []
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(res => {
            arr[index] = res
            // 只有都请求成功了，才算成功
            if (Object.keys(arr).length === promises.length) {
              resolve(arr)
            }
          })
          .catch(err => {
            // 一个失败就算失败
            reject(err)
          })
      })
    })
  }
  allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      let arr = []
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(res => {
            // 成功的
            arr[index] = {
              status: "fulfilled",
              value: res,
            }
          })
          .catch(err => {
            // 失败的
            arr[index] = {
              status: "rejected",
              reason: err,
            }
          })
          .finally(() => {
            // 所有请求都完成，那么resolve
            if (Object.keys(arr).length === promises.length) {
              resolve(arr)
            }
          })
      })
    })
  }
  race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise)
          .then(res => {
            // 成功的立马返回
            resolve(res)
          })
          .catch(err => {
            // 失败的立马返回
            reject(err)
          })
      })
    })
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
// promise
//   .then(value => {
//     console.log("2", value)
//     return "第一次"
//   })
//   .then(value => {
//     console.log("3", value)
//     return new MyPromise((resolve, reject) => {
//       setTimeout(() => {
//         resolve("第二次处理结果")
//       }, 1000)
//     }).then(result => {
//       console.log("result", result)
//       return result // 返回新的MyPromise实例的结果
//     })
//   })
//   .then(value => {
//     console.log(value)
//     throw new Error("抛出异常")
//   })
//   .catch(error => {
//     console.log(error)
//   })

// 对AJAX的理解，实现一个AJAX请求
const url = "xxx.com"
let xhr = new XMLHttpRequest()
xhr.open("GET", url, true)
xhr.onreadystatechange = function () {
  if (this.readyState !== 4) return
  if (this.status === 200) {
    handle(this.response)
  } else {
    console.error(this.statusText)
  }
}
xhr.onerror = function () {
  console.error(this.statusText)
}

xhr.responseType = "json"
xhr.setRequestHeader("Accept", "application/json")
xhr.send(null)
// promise 封装实现：
function getJSON(url) {
  // 创建一个 promise 对象
  let promise = new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return
      // 当请求成功或失败时，改变 promise 的状态
      if (this.status === 200) {
        resolve(this.response)
      } else {
        reject(new Error(this.statusText))
      }
    }
    xhr.onerror = function () {
      reject(new Error(this.statusText))
    }
    xhr.responseType = "json"
    xhr.setRequestHeader("Accept", "application/json")
    xhr.send(null)
  })
  return promise
}
