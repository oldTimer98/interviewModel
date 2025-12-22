## 基础

- Proxy 用于实现功能代理，我们可以借助 proxy 接口定制一些语言行为，例如获取值、设置值；比较有名的 case 是 Vue3 使用 proxy 替代 Object.defineProperty，性能与功能性都有较大提升
- Reflect 也就是反射，可以说是专门为 proxy 准备的，功能与 Proxy 提供的拦截器一一对应，且诸多行为其实跟直接用原生语法的效果差不多，例如 `Reflect.get(obj, key)`与 `obj.key` 的效果多数情况是一毛一样的



## 进阶

- Proxy 可以拦截很多中对象行为，比较典型的有 get、set、new、delete、has
- Proxy 还支持拦截函数行为，典型：apply、constructor(new)
- 问题：在 Proxy 代理的情况下，目标对象内部的this关键字会指向 Proxy 代理，这会导致很多异常，例如：

```javascript
class User {
  #name = "Guest";

  getName() {
    return this.#name;
  }
}

const user = new User();

const userProxy = new Proxy(user, {});

// 此时，`getName` 的 this 指向代理对象 userProxy
// 但 userProxy 对象并没有 #name 私有属性，导致报错
alert(userProxy.getName()); // Error


// 解决方案：使用 Reflect
user = new Proxy(user, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == 'function' ? value.bind(target) : value;
  }
});
```

- 又或者，对象继承的时候，this 指向也会有问题

```javascript
let user = {
  _name: "Guest",
  get name() {
    return this._name;
  }
};

let userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    // 这里的 target 指向 user；
    // user 的 get name 内部的 this 依然指向 user
    return target[prop]; // (*) target = user
  }
});

// 理解一下这个链路：
// admin.name => admin.__proto__.name => user.get name 函数 => user._name
let admin = {
  __proto__: userProxy,
  _name: "Admin"
};

// Expected: Admin
alert(admin.name); // outputs: Guest (?!?)

// 解决方案
let userProxy = new Proxy(user, {
  get(target, prop, receiver) { // receiver = admin
    // 这才是
    return Reflect.get(target, prop, receiver); // (*)
  }
});
```

- 问题：无法 polyfill，可能存在兼容性问题
- 问题：benchmark 测出来性能不太好，比不上 defineProperty 和直接调用

- Reflect 可以理解为是 Proxy 的补充：

- Proxy 部分方法要求返回 true/flase 来表示操作是否成功，那刚好就可以复用 Reflect 对应的方法了
- Reflect 能修正 proxy 代理后 this 指向错误的问题
- 之前的诸多元编程接口都定义在 Object 上，历史问题导致这些接口越来越多越杂，所以干脆都挪到 reflect 新接口(定义了13中标准行为)上，可以预期后续新增的接口也都会放在这

- Proxy 是一种功能非常强大的元编程接口，我们可以借此实现：数据监控、数据校验、类 decorator 功能、行为监控、Promise 改造、数据埋点



## 内部方法 & 内部插槽

- 从 ES 规范角度看，Proxy 拦截的是对象的 internal method 调用，也就是引擎在执行这些 internal method 之前就被转移到 proxy 对应的方法上；这些 internal method(如 [[GET]]、[[SET]] )无法直接调用，但可以通过对应的行为or Reflect 触发
- 其次，ES 规范还定义了所谓 Internal Slot (内部插槽)的概念，用于存储对象内部状态，比如 Map 对象的数值就会存放在 `[[MapData]]` 插槽中，一些方法如 `Map.set`就依赖于这些插槽，逻辑如 `this.[[MapData]]`，问题是用了 proxy 代理之后 this 会指向 proxy，而proxy没有这个插槽，就会导致错误，此时就必须重新绑定 this：

```javascript
let map = new Map();

let proxy = new Proxy(map, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == 'function' ? value.bind(target) : value;
  }
});

proxy.set('test', 1);
alert(proxy.get('test')); // 1 (works!)
```

- 这两个特性都跟元编程相关，也是一门大学问，此外还有 defineProperty 、seal、freeze 等等，可扩展学习