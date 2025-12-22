// 2、实现寄生组合继承
// 定义一个父类
function Parent(name) {
  this.name = name
}
Parent.prototype.sayName = function () {
  console.log(this.name)
}

// 定义一个子类,通过调用其父类的构造函数，实现属性的继承
function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}
// 这一行创建了一个新的对象，该对象的原型指向了父类 Parent 的原型对象。这样做的目的是让子类 Child 的原型链能够访问到父类 Parent 的原型上的属性和方法
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child // 这一行将子类 Child 的原型对象的构造函数指向了子类自身，这样在创建子类实例时就能正确地调用子类的构造函数。

// 在子类的原型上添加子类自己的方法；
Child.prototype.sayAge = function () {
  console.log(this.age)
}
// 测试
var child1 = new Child("Tom", 18)
child1.sayAge()
child1.sayName()

// 3.instanceof的原理
function myInstanceOf(left, right) {
  let proto = Object.getPrototypeOf(left) // 获取左边对象的原型
  let prototype = right.prototype
  while (true) {
    if (!proto) return false
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}
// 4.new操作符的原理

function myNew() {
  const constructor = [...arguments][0]
  if (typeof constructor !== "function") return
  const obj = Object.create(constructor.prototype)
  const res = constructor.apply(obj, [...arguments].slice(1))
  if (res && (typeof res !== "object" || typeof res === "function")) return res
  return obj
}
function Fn(obj) {
  this.obj = obj
}
let obj = myNew(Fn, "222")
console.log(obj)

// this指向问题
const obj1 = {
  text: 1,
  fn: function () {
    return this.text
  },
}

const obj2 = {
  text: 2,
  fn: function () {
    return obj1.fn()
  },
}

const obj3 = {
  text: 3,
  fn: function () {
    var fn = obj1.fn
    return fn()
  },
  // fn:obj1.fn 这样就会打印3
}

console.log(obj1.fn())
console.log(obj2.fn())
console.log(obj3.fn())

let a = {}
let fn = function () {
  console.log(this)
}
fn.bind().bind(a)()

// 缓存函数（备忘模式）
function memorize(fn) {
  const cache = {}
  function memorized(...args) {
    const key = JSON.stringify(args)
    if (cache[key] !== undefined) {
      return { result: cache[key], cache }
    } else {
      const result = fn.apply(fn, args)
      cache[key] = result
      return { result, cache }
    }
  }
  memorized.cache = cache // 将缓存对象作为属性添加到返回的函数上
  return memorized
}

function add(a) {
  return a + 1
}

const adder = memorize(add)

console.log(adder(1)) // 输出: { result: 2, cache: { '[1]': 2 } }
console.log(adder(1)) // 输出: { result: 2, cache: { '[1]': 2 } }
console.log(adder(2)) // 输出: { result: 3, cache: { '[1]': 2, '[2]': 3 } }
console.log(adder(3)) // 输出: { result: 4, cache: { '[1]': 2, '[2]': 3, '[3]': 4 } }

// call的实现原理
Function.prototype.myCall = function (context, ...args) {
  if (typeof this !== "function") return
  context = context || window
  const fn = Symbol("fn")
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}
// 测试代码
function greet(name) {
  return `Hello, ${name}! I'm ${this.role}.`
}
const person = {
  role: "developer",
}
const result = greet.myCall(person, "Alice")
console.log(result) // 期望输出: "Hello, Alice! I'm developer."
// apply的实现原理
Function.prototype.myApply = function (context, args) {
  if (typeof this !== "function") return
  context = context || window
  const fn = Symbol("fn")
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}
function greet(...args) {
  return `Hello, ${args[0]}! I'm ${this.role}.`
}
const person1 = {
  role: "developer",
}
const result1 = greet.myApply(person1, ["Alice"])
console.log(result1) // 期望输出: "Hello, Alice! I'm developer."

// bind 的实现原理

Function.prototype.myBind = function (context, ...args1) {
  if (typeof this !== "function") return
  const fn = this
  return function (...args2) {
    const allArgs = [...args1, ...args2]
    if (new.target) {
      return new fn(...allArgs)
    } else {
      return fn.apply(context, allArgs)
    }
  }
}
function greet(greeting, punctuation) {
  return `${greeting} ${this.name}${punctuation}`
}

const person2 = { name: "Alice" }

const boundFunc = greet.myBind(person2, "Hello")
console.log(boundFunc("!")) // 输出：'Hello Alice!'

const newObj = new boundFunc("!!!")
console.log(newObj) // 输出：{ name: 'Alice' }
const newObj1 = new (greet.bind(person2, "Hello"))("111")
console.log(newObj1)

// 浅拷贝

let aaa1 = 1
let ccc = 3
let bbb1 = aaa1
aaa1 = ccc

console.log("bbb1", bbb1)

// 手写浅拷贝

function shallowCopy(obj) {
  if (!obj || typeof obj !== "object") return
  const newObj = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[key] = object[key]
    }
  }
  return newObj
}

// 手写深拷贝

function deepCopy(obj) {
  if (!obj || typeof obj !== "object") return
  const newObj = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const el = object[key]
      newObj[key] = typeof el === "object" ? deepCopy(el) : el
    }
  }
  return newObj
}

// 完美深拷贝

function cloneForce(x) {
  const uniqueList = []
  let root = {}
  const loopList = [
    {
      parent: root,
      key: undefined,
      data: x,
    },
  ]
  const find = (arr, item) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].source === item) {
        return arr[i]
      }
    }
    return null
  }
  while (loopList.length) {
    const node = loopList.pop()
    const parent = node.parent
    const key = node.key
    const data = node.data
    let res = parent
    // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
    if (typeof key !== "undefined") {
      res = parent[key] = {}
    }
    let uniqueData = find(uniqueList, data)

    if (uniqueData) {
      parent[key] = uniqueData.target
      continue
    }
    uniqueList.push({
      source: data,
      target: res,
    })
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (typeof data[k] === "object") {
          loopList.push({
            parent: res,
            key: k,
            data: data[k],
          })
        } else {
          res[k] = data[k]
        }
      }
    }
  }
  return root
}

// 防抖的实现

function debounce(fn, wait) {
  let timer = null
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

// 测试用例
function handleInput(text, text2) {
  console.log("Input changed:", text, text2)
}

const debouncedHandleInput = debounce(handleInput, 300)

// 模拟输入事件
debouncedHandleInput("First input", "我是测试文本")
debouncedHandleInput("Second input", "我是测试文本")
debouncedHandleInput("third input", "我是测试文本")
// 300 毫秒后只会输出 'Input changed: Second input'

// 节流的实现

function throttle(fn, wait) {
  let timer = null
  return function (...args) {
    const ctx = this
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(ctx, args)
        timer = null
      }, wait)
    }
  }
}
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
