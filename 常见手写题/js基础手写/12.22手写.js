//  1. 手写 Object.create
function myCreate(obj) {
  if (obj !== null && typeof obj !== 'object') {
    throw new Error('Object.create 的参数必须是一个对象或者null')
  }
  function Temp() {}
  Temp.prototype = obj
  return new Temp()
}
const parent = { x: 1 }
const child = myCreate(parent)

// console.log(child.x) // 1（继承自 parent）
// console.log(Object.getPrototypeOf(child) === parent) // true
// console.log(child.constructor === Object) // true

// 2. 手写 instanceof 方法
function myInstanceof(left, right) {
  if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
    return false
  }
  const proto = right.prototype
  if (typeof proto !== 'object' || proto === null) {
    return false
  }
  let current = left.__proto__
  while (true) {
    if (!current) return false
    if (current === proto) return true
    current = current.__proto__
  }
}

// // 基本测试
// console.log(myInstanceof([], Array)) // true
// console.log(myInstanceof({}, Object)) // true
// console.log(myInstanceof('hello', String)) // false
// console.log(myInstanceof(new String('hi'), String)) // true

// // 自定义类
// class Animal {}
// class Dog extends Animal {}
// const dog = new Dog()

// console.log(myInstanceof(dog, Dog)) // true
// console.log(myInstanceof(dog, Animal)) // true
// console.log(myInstanceof(dog, Object)) // true

// // 特殊情况
// console.log(myInstanceof(null, Object)) // false
// console.log(myInstanceof(undefined, Object)) // false
// console.log(myInstanceof(123, Number)) // false
// console.log(myInstanceof(new Number(123), Number)) // true
// 3. 手写 new 操作符

function myNew(constructor, ...args) {
  if (typeof constructor !== 'function') {
    throw new error('constructor must be a function')
  }
  let obj = {}
  obj.__proto__ = constructor.prototype
  const res = constructor.apply(obj, args)
  if ((typeof res === 'object' && res !== null) || typeof res === 'function') return res
  return obj
}

// // 测试 1：普通构造函数
// function Person(name, age) {
//   this.name = name
//   this.age = age
// }
// Person.prototype.sayHi = function () {
//   console.log(`Hi, I'm ${this.name}`)
// }

// const p1 = myNew(Person, 'Alice', 25)
// console.log(p1.name) // 'Alice'
// p1.sayHi() // 'Hi, I'm Alice'
// console.log(p1 instanceof Person) // true

// // 测试 2：构造函数返回对象 → 应返回该对象
// function Foo() {
//   this.a = 1
//   return { b: 2 }
// }
// const f1 = myNew(Foo)
// console.log(f1.a) // undefined
// console.log(f1.b) // 2

// // 测试 3：构造函数返回原始值 → 忽略，返回新对象
// function Bar() {
//   this.x = 10
//   return 42 // 原始值，被忽略
// }
// const b1 = myNew(Bar)
// console.log(b1.x) // 10

// 4. 手写 Promise

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
class MyPromise {
  constructor(callback) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolveCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = value => {
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        queueMicrotask(() => {
          this.onResolveCallbacks.forEach(fn => fn())
        })
      }
    }

    const reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        queueMicrotask(() => {
          this.onRejectedCallbacks.forEach(fn => fn())
        })
      }
    }

    try {
      callback(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onResolved, onRejected) {
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : reason => {
            throw reason
          }

    const promise2 = new MyPromise((resolve, reject) => {
      const handleCallback = (callback, isFulfilled) => {
        queueMicrotask(() => {
          try {
            const x = callback(isFulfilled ? this.value : this.reason)
            // 调用解析器：处理 x 可能是普通值、Promise、thenable 等
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      if (this.status === FULFILLED) {
        handleCallback(onResolved, true)
      }
      if (this.status === REJECTED) {
        handleCallback(onRejected, false)
      }
      if (this.status === PENDING) {
        this.onResolveCallbacks.push(() => {
          handleCallback(onResolved, true)
        })
        this.onRejectedCallbacks.push(() => {
          handleCallback(onRejected, false)
        })
      }
    })
    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
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
      },
    )
  }

  static resolve(value) {
    if (value instanceof MyPromise) {
      return value
    }
    return new MyPromise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let completed = 0
      const total = promises.length
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          results[index] = value
          completed++
          if (completed === total) {
            resolve(results)
          }
        }, reject)
      })
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject)
      })
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 防止循环引用：不能返回自己
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  let called = false
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          reason => {
            if (called) return
            called = true
            reject(reason)
          },
        )
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
}
// // 基本使用
// new MyPromise((resolve) => {
//   setTimeout(() => resolve('hello'), 100);
// })
// .then(res => {
//   console.log(res); // 'hello'
//   return res + ' world';
// })
// .then(res => {
//   console.log(res); // 'hello world'
// });

// // 错误处理
// new MyPromise((_, reject) => {
//   reject('error!');
// })
// .catch(err => {
//   console.log('caught:', err); // 'caught: error!'
// });

// // 链式调用 + 异步
// MyPromise.resolve(1)
//   .then(x => x + 1)
//   .then(x => new MyPromise(resolve => setTimeout(() => resolve(x * 2), 100)))
//   .then(x => console.log(x)); // 4

// // MyPromise.all
// MyPromise.all([
//   MyPromise.resolve(1),
//   MyPromise.resolve(2),
//   new MyPromise(r => setTimeout(() => r(3), 100))
// ]).then(res => console.log(res)); // [1, 2, 3]
