// 手写call

Function.prototype.myCall = function (ctx, ...args) {
  if (typeof this !== "function") return
  ctx = ctx || window
  const fn = Symbol()
  ctx[fn] = this
  ctx[fn](...args)
  delete ctx[fn]
}
Function.prototype.myApply = function (ctx, args) {
  if (typeof this !== "function") return
  ctx = ctx || window
  const fn = Symbol()
  ctx[fn] = this
  ctx[fn](...args)
  delete ctx[fn]
}
Function.prototype.myBind = function (ctx, ...args1) {
  if (typeof this !== "function") return
  const fn = this
  return function (...args2) {
    const allArgs = [...args1, ...args2]
    if (new.target) {
      // this instanceof fn  判断是否是new 构造函数调用
      return new fn(...allArgs)
    } else {
      return fn.apply(ctx, allArgs)
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

// 1.原型链继承 2.构造函数继承  3.组合继承  4.原型式继承 5.寄生式继承 6.寄生式组合继承 7.class的extends
function Person(name) {
  this.name = name
}
Person.prototype.sayName = function () {
  console.log("this.name", this.name)
}

function Child(name, age) {
  Person.call(this, name)
  this.age = age
}

Child.prototype = Object.create(Person.prototype)
Child.prototype.constructor = Child

Child.prototype.sayAge = function () {
  console.log("this.age", this.age)
}

const child1 = new Child("Tom", 18)
child1.sayAge()
child1.sayName()

function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left)
  let prototype = right.prototype
  while (true) {
    if (!proto) return false
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}

function myNew(ctx, ...args) {
  if (typeof ctx !== "function") return
  let obj = {}
  obj.prototype = Object.create(ctx.prototype)
  const res = ctx.apply(this, args)
  if (res && (typeof res !== "object" || typeof res === "function")) return res
  return obj
}

function memorize(fn) {
  const cache = {}
  function foo(args) {
    const key = JSON.stringify(args)
    let result = cache[key]
    if (!result) {
      cache[key] = args
      result = fn(args)
    }
    return { cache, result }
  }
  foo.cache = cache
  return foo
}

function add(a) {
  return a + 1
}

const added = memorize(add)
console.log("", added(1))
console.log("", added(2))
console.log("", added(3))
console.log("", added(4))
