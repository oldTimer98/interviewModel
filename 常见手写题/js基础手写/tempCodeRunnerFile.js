class MyPromise {
  constructor(callback) {
    this.status = "pending"
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallback = []
    this.onRejectedCallback = []

    const resolve = value => {
      if (value instanceof MyPromise) {
        return value.then(resolve, reject)
      }
      if (this.status === "pending") {
        this.status = "resolved"
        this.value = value
        this.onResolvedCallback.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status === "pending") {
        this.status = "rejected"
        this.reason = reason
        this.onRejectedCallback.forEach(fn => fn())
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
      } else if (this.status === "rejected") {
        try {
          const x = onRejected(this.reason)
          resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      if (this.status === "pending") {
        this.onResolvedCallback.push(() => {
          try {
            const x = onResolved(this.value)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        })
        this.onRejectedCallback.push(() => {
          try {
            const x = onRejected(this.reason)
            resolve(x)
          } catch (error) {
            reject(error)
          }
        })
      } else {
        this.onResolvedCallback = []
        this.onRejectedCallback = []
      }
    })
    return promise2
  }
  catch(callback) {
    return this.then(null, callback)
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
