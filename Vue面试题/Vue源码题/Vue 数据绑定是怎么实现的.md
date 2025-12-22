## 点题收敛

Vue的数据绑定机制是通过数据劫持和发布/订阅模式实现的。当数据发生变化时，会自动更新视图，并通过虚拟DOM对比算法来提高性能。这个机制可以有效地简化开发过程，提高代码的可维护性和可读性。



Vue2.x 是借助 Object.defineProperty() 实现的，而 Vue3.x 是借助 Proxy 实现的。

## Vue2 实现数据绑定

![img](https://cdn.nlark.com/yuque/0/2023/png/311219/1694251532084-18f7ba9b-a833-42c0-8bd1-584b33f9282d.png)

Vue2 是采用**数据劫持结合发布者-订阅者模式**的方式，通过 Object.defineProperty() 来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听[回调](https://link.juejin.cn/?target=https%3A%2F%2Fso.csdn.net%2Fso%2Fsearch%3Fq%3D%E5%9B%9E%E8%B0%83%26spm%3D1001.2101.3001.7020)来渲染视图。

简化版代码：

```javascript
/ 响应式数据处理，构造一个响应式对象
class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  // 遍历对象的每个 已定义 属性，分别执行 defineReactive
  walk(data) {
    if (!data || typeof data !== 'object') {
      return
    }

    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  // 为对象的每个属性重新设置 getter/setter
  defineReactive(obj, key, val) {
    // 每个属性都有单独的 dep 依赖管理
    const dep = new Dep()

    // 通过 defineProperty 进行操作代理定义
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      // 值的读取操作，进行依赖收集
      get() {
        if (Dep.target) {
          dep.depend()
        }
        return val
      },
      // 值的更新操作，触发依赖更新
      set(newVal) {
        if (newVal === val) {
          return
        }
        val = newVal
        dep.notify()
      }
    })
  }
}

// 观察者的构造函数，接收一个表达式和回调函数
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    this.getter = parsePath(expOrFn)
    this.cb = cb
    this.value = this.get()
  }

  // watcher 实例触发值读取时，将依赖收集的目标对象设置成自身，
 	// 通过 call 绑定当前 Vue 实例进行一次函数执行，在运行过程中收集函数中用到的数据
  // 此时会在所有用到数据的 dep 依赖管理中插入该观察者实例
  get() {
    Dep.target = this
    const value = this.getter.call(this.vm, this.vm)
    // 函数执行完毕后将依赖收集目标清空，避免重复收集
    Dep.target = null
    return value
  }

  // dep 依赖更新时会调用，执行回调函数
  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

// 依赖收集管理者的构造函数
class Dep {
  constructor() {
    // 保存所有 watcher 观察者依赖数组
    this.subs = []
  }

  // 插入一个观察者到依赖数组中
  addSub(sub) {
    this.subs.push(sub)
  }

  // 收集依赖，只有此时的依赖目标（watcher 实例）存在时才收集依赖
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target)
    }
  }

  // 发送更新，遍历依赖数组分别执行每个观察者定义好的 update 方法
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

Dep.target = null

// 表达式解析
function parsePath(path) {
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) {
        return
      }
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

这里省略了数组部分，但是 **数组本身的响应式监听** 是通过重写数组方法来实现的，而 **每个数组元素** 则会再次进行 **Observer** 处理（需要数组在定义时就已经声明的数组元素）。

### 具体步骤

1. 需要 observer 的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter 和 getter 这样的话，给这个对象的某个值赋值，就会触发 setter，那么就能监听到了数据变化
2. compile 解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图
3. Watcher 订阅者是 Observer 和 Compile 之间通信的桥梁，主要做的事情是:

1. 在自身实例化时往属性订阅器(dep)里面添加自己
2. 自身必须有一个update() 方法
3. 待属性变动 dep.notice() 通知时，能调用自身的 update() 方法，并触发 Compile 中绑定的回调

1. MVVM 作为数据绑定的入口，整合 Observer、Compile 和 Watche r三者，通过 Observer 来监听自己的 model 数据变化，通过 Compile 来解析编译模板指令，最终利用 Watcher 搭起 Observer 和 Compile 之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。

详细的源码解读：[Vue.js 技术揭秘 - 响应式对象](https://ustbhuangyi.github.io/vue-analysis/v2/reactive/reactive-object.html)

尝试自己手写一个双向数据绑定：[面试题：你能写一个Vue的双向数据绑定吗？](https://juejin.cn/post/6844903589278646285?searchId=20230909173828FED859F438FC8497EA43)

## Vue3 实现数据绑定

虽然 Vue 2 与 Vue 3 实现响应式系统的方式不同，但是他们的核心思想还是一致的，都是通过 **发布-订阅模式** 来实现（因为发布者和观察者之间多了一个 **dependence** 依赖收集者，与传统观察者模式不同）。

碍于 Object.defineProperty 的局限性，Vue 3 采用了全新的 Proxy 对象来实现整个响应式系统基础。

### Vue2 双向数据绑定存在的缺点

- Object.defineProperty 无法监控到数组下标的变化，导致通过数组数组下标添加元素不能实时响应
- Proxy 不仅可以代理对象，还可以代理数组，还可以代理动态增加的属性
- Object.defineProperty 不能对诸如 Map、Set 这样的数据结构进行监听

### 什么是 Proxy ？

Proxy 是 ES6 新增的一个构造函数，用来创建一个 **目标对象的代理对象，拦截对原对象的所有操作；用户可以通过注册相应的拦截方法来实现对象操作时的自定义行为**。

目前 Proxy 支持的拦截方法包含一下内容：

- get(target, propKey, receiver)：拦截对象属性的读取操作；
- set(target, propKey, value, receiver)：拦截对象属性的赋值操作；
- apply(target, thisArg, argArray)：拦截函数的调用操作；
- construct(target, argArray, newTarget)：拦截对象的实例化操作；
- has(target, propKey)：拦截 in 操作符；
- deleteProperty(target, propKey)：拦截 delete 操作符；
- defineProperty(target, propKey, propDesc)：拦截 Object.defineProperty 方法；
- getOwnPropertyDescriptor(target, propKey)：拦截 Object.getOwnPropertyDescriptor 方法；
- getPrototypeOf(target)：拦截 Object.getPrototypeOf 方法；
- setPrototypeOf(target, proto)：拦截 Object.setPrototypeOf 方法；
- isExtensible(target)：拦截 Object.isExtensible 方法；
- preventExtensions(target)：拦截 Object.preventExtensions 方法；
- enumerate(target)：拦截 for...in 循环；
- ownKeys(target)：拦截 Object.getOwnPropertyNames、Object.getOwnPropertySymbols、Object.keys、JSON.stringify 方法。

与 Object,defineProperty 比起来，有非常明显的优势：

- 拦截操作更加多样
- 拦截定义更加直接
- 性能更加高效

在 Vue 中体现最为明显的一点就是：Proxy 代理对象之后不仅可以拦截对象属性的读取、更新、方法调用之外，对整个对象的新增、删除、枚举等也能直接拦截，而 Object.defineProperty 只能针对对象的已知属性进行读取和更新的操作拦截。

但是 **只有通过 proxyObj 进行操作的时候才能通过定义的操作拦截方法进行处理，直接使用原对象则无法触发拦截器**。

这也是 Vue 3 中要求的 reactive 声明的对象修改原对象无法触发视图更新的原因。

并且 Proxy 也只针对 **引用类型数据** 才能进行代理，所以这也是 Vue 的基础数据都需要通过 ref 进行声明的原因，内部会建立一个新对象保存原有的基础数据值。

对于源码的解读：[Vue2与Vue3响应式原理与依赖收集详解](https://juejin.cn/post/7202454684657107005?searchId=20230909174537B2F3E862584B8D96EE8B#heading-5)

### 