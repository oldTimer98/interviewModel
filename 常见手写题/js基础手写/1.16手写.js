class MyPromise {
  constructor(callback) {
    this.status = "pending"
    this.value = undefined
    this.reason = undefined
    this.onResolveCallback = []
    this.onRejectCallback = []
    const resolve = value => {
      if (value instanceof MyPromise) {
        return this.then(resolve, reject)
      }
      if (this.status === "pending") {
        this.status = "resolved"
        this.value = value
        this.onResolveCallback.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status === "pending") {
        this.status = "rejected"
        this.reason = reason
        this.onRejectCallback.forEach(fn => fn())
      }
    }
    try {
      callback(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  then(onResolved, onRejected) {
    onResolved = typeof onResolved === "function" ? onResolved : value => value
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : reason => {
            throw reason
          }
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === "resolved") {
        try {
          const x = onResolved(this.value)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      if (this.status === "rejected") {
        try {
          const x = onRejected(this.reason)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      }

      if (this.status === "pending") {
        this.onResolveCallback.push(() => {
          try {
            const x = onResolved(this.value)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        })
        this.onRejectCallback.push(() => {
          try {
            const x = onRejected(this.reason)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        })
      } else {
        this.onResolveCallback = []
        this.onRejectCallback = []
      }
    })

    return promise2
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

  catch(callback) {
    return this.then(null, callback)
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
    if (!Array.isArray(promises)) {
      throw new TypeError("promises must be an array")
    }
    return new MyPromise((resolve, reject) => {
      const result = []
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(value => {
            result[index] = value
          })
          .catch(error => {
            reject(error)
          })
          .finally(() => {
            if (result.length === promises.length) {
              resolve(result)
            }
          })
      })
    })
  }
  allsettled(promises) {
    if (!Array.isArray(promises)) {
      throw new TypeError("promises must be an array")
    }
    return new MyPromise((resolve, reject) => {
      const result = []
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(value => {
            result[index] = {
              status: "resolved",
              value,
            }
          })
          .catch(reason => {
            result[index] = {
              status: "rejected",
              reason,
            }
          })
          .finally(() => {
            if (result.length === promises.length) {
              resolve(result)
            }
          })
      })
    })
  }
  race(promises) {
    if (!Array.isArray(promises)) {
      throw new TypeError("promises must be an array")
    }
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise)
          .then(value => {
            resolve(value)
          })
          .catch(reason => {
            reject(reason)
          })
      })
    })
  }
}

const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("成功")
  }, 1000)
})
// promise.then(1).then(value => {
//   console.log("value", value)
// })
promise
  .then(value => {
    console.log("2", value)
    return "第一次"
  })
  .then(value => {
    console.log("3", value)
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        resolve("第二次处理结果")
      }, 1000)
    }).then(result => {
      console.log("result", result)
      return result // 返回新的MyPromise实例的结果
    })
  })
  .then(value => {
    console.log(value)
    throw new Error("抛出异常")
  })
  .catch(error => {
    console.log(error)
  })

let url = "xxx.com"
let xhr = new XMLHttpRequest()
xhr.open("GET", url, true)
xhr.onreadystatechange = function () {
  if (this.readyState !== 4) return
  if (this.status === 200) {
    handle(this.responseText)
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

function sendJson() {
  return new Promise((resolve, reject) => {
    let url = "xxx.com"
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return
      if (this.status === 200) {
        resolve(this.responseText)
      } else {
        reject(this.statusText)
      }
    }
    xhr.onerror = function () {
      reject(this.statusText)
    }
    xhr.responseType = "json"
    xhr.setRequestHeader("Accept", "application/json")
    xhr.send(null)
  })
}
