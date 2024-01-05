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

function memorize(fn) {
  const cache = {}
  return function (...args) {
    const key = JSON.stringify(args)
    // console.log('cache',cache);
    return cache[key] || (cache[key] = fn.apply(fn, args))
  }
}

function add(a) {
  console.log('a',a);
  return a + 1
}

const adder = memorize(add)

adder(1) // 输出: 2    当前: cache: { '[1]': 2 }
adder(1) // 输出: 2    当前: cache: { '[1]': 2 }
adder(2) // 输出: 3    当前: cache: { '[1]': 2, '[2]': 3 }
adder(3) // 输出：5
