// 1、寄生组合式继承
function Person(name) {
  this.name = name
}
Person.prototype.getName = function () {
  console.log("this.name", this.name)
}

function Child(name, age) {
  Person.call(this, name)
  this.age = age
}

Child.prototype = Object.create(Person.prototype)
Child.prototype.constructor = Child

Child.prototype.getAge = function () {
  console.log("this.age", this.age)
}

const child1 = new Child("Tom", 18)
child1.getAge()
child1.getName()
// 2、instanceof的原理

function myInstanceof(left, right) {
  // 1、left 是对象，right是构造函数 '1' myInstanceOf String
  let prototype = Object.getPrototypeOf(left)
  let proto = right.prototype
  while (true) {
    if (!proto) return false
    if (prototype === proto) return true
    proto = Object.getPrototypeOf(proto)
  }
}

// 3、new 的原理  fn,...

function myNew(...args) {
  const constructor = [...arguments][0]
  if (typeof constructor !== "function") return
  const obj = {}
  obj.prototype = constructor.prototype
  const res = constructor.apply(this, [...arguments].slice(1))
  if (res && (typeof res === "object" || typeof res === "function")) return res
  return obj
}

// 4、备忘模式（缓存函数）

function memorize(fn) {
  let cache = {} // [1]:2, [2]:3, [3]:4
  function fn1(...args) {
    // 1,2,3
    const key = JSON.stringify(args)
    let result
    if (!cache[key]) {
      result = fn.apply(this, args)
      cache[key] = result
      return { result, cache }
    } else {
      return { result, cache }
    }
  }
  fn1.cache = cache

  return fn1
}

function add(a) {
  return a + 1
}

const added = new memorize(add)

console.log("added(", added(1))
console.log("added(", added(2))
console.log("added(", added(3))

function throttle(fn, wait) {
  let curTime = Date.now()
  return function (...args) {
    let ctx = this
    let nowTime = Date.now()
    if (nowTime - curTime >= wait) {
      fn.apply(ctx, args)
      curTime = Date.now()
    }
  }
}
function throttle(fn, wait) {
  let timer
  return function (...args) {
    let ctx = this
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(ctx, args)
        timer = null
      }, wait)
    }
  }
}
function debounce(fn, wait) {
  let timer
  return function (...args) {
    let ctx = this
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(ctx, args)
    }, wait)
  }
}

