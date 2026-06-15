## 1. JavaScript有哪些数据类型，它们的区别？

**记忆口诀：「七原始一引用，栈存原始堆存对象，Symbol 唯一 BigInt 大整数，typeof 看类型别混算」**

**一句话回答：** JavaScript 有 **8 种数据类型**，其中 **7 种原始类型**（Undefined、Null、Boolean、Number、String、Symbol、BigInt）存储在栈中、按值传递；**1 种引用类型** Object（含 Array、Function、Date 等）存储在堆中、变量存的是引用地址。

### 8 种数据类型一览

| 分类 | 类型 | 说明 | 存储位置 | 默认值 |
| --- | --- | --- | --- | --- |
| 原始类型 | Undefined | 未定义/未赋值 | 栈 | undefined |
| 原始类型 | Null | 空值/空对象指针 | 栈 | null |
| 原始类型 | Boolean | 布尔值 true/false | 栈 | false |
| 原始类型 | Number | 双精度浮点数（含 NaN、Infinity） | 栈 | — |
| 原始类型 | String | 字符串（不可变） | 栈 | — |
| 原始类型 | Symbol | ES6 唯一标识符 | 栈 | — |
| 原始类型 | BigInt | ES2020 任意精度整数 | 栈 | — |
| 引用类型 | Object | 对象（含 Array、Function、Date、RegExp 等） | 堆 | — |

### 原始类型 vs 引用类型

| 对比维度 | 原始类型 | 引用类型 |
| --- | --- | --- |
| 存储 | 栈内存，存实际值 | 堆内存存对象，栈存引用地址 |
| 赋值/传参 | 按值复制，互不影响 | 按引用传递，指向同一对象 |
| 是否可变 | 不可变（immutable） | 可变（mutable） |
| typeof 结果 | 除 null 外较准确 | 统一返回 `"object"`（Function 除外） |
| 比较 | 比较值 | 默认比较引用地址 |

### 重点展开

**Symbol 的特殊用法：**

```js
// 每次 Symbol() 都唯一
const s1 = Symbol('id');
const s2 = Symbol('id');
console.log(s1 === s2); // false

// Symbol.for() 使用全局注册表，同名可复用
const a = Symbol.for('app');
const b = Symbol.for('app');
console.log(a === b); // true
```

**BigInt 注意事项：**

```js
const big = 123n;
const num = 123;

// BigInt 不能与 Number 混合运算
// console.log(big + num); // TypeError

// 需要显式转换
console.log(big + BigInt(num)); // 246n
console.log(Number(big) + num); // 246
```

**引用类型的「按引用传递」：**

```js
const obj1 = { name: 'Tom' };
const obj2 = obj1;
obj2.name = 'Jerry';
console.log(obj1.name); // 'Jerry' — 同一堆对象

const obj3 = { ...obj1 }; // 浅拷贝，新引用
obj3.name = 'Alice';
console.log(obj1.name); // 'Jerry' — 不受影响
```

### 面试追问点

- **为什么 typeof null 是 `"object"`？** 历史遗留 bug，见第 5 题。
- **Function 是对象吗？** 是，`typeof function(){}` 返回 `"function"`，但 Function 本质是 Object 的子类型。
- **原始类型真的存在栈上吗？** 引擎实现层面，短生命周期的小值可能在栈，长字符串等也可能在堆；面试中「栈/堆」是概念模型。

---

## 2. 数据类型检测的方式有哪些

**记忆口诀：「typeof 看基本，instanceof 看原型，constructor 可伪造，toString 最准确」**

**一句话回答：** 常用四种：`typeof`（基本类型）、`instanceof`（引用类型/原型链）、`constructor`（可被修改）、`Object.prototype.toString.call()`（最准确、可区分所有内置类型）。

### 四种方式对比

| 方式 | 原理 | 优点 | 缺点/陷阱 |
| --- | --- | --- | --- |
| typeof | 检测底层类型标签 | 简单快速 | null→object；数组/对象都是 object |
| instanceof | 沿 `__proto__` 链查找 | 适合自定义类 | 跨 iframe 失效；基本类型无效 |
| constructor | 读 `.constructor` | 直观 | 可被改写；跨 iframe 不可靠 |
| Object.prototype.toString.call() | 读 `[[Class]]` 内部属性 | 最准确 | 写法稍长 |

### 代码示例

```js
// 1. typeof
console.log(typeof 42);           // "number"
console.log(typeof 'hello');      // "string"
console.log(typeof true);         // "boolean"
console.log(typeof undefined);    // "undefined"
console.log(typeof Symbol());     // "symbol"
console.log(typeof 10n);          // "bigint"
console.log(typeof function(){}); // "function" ← 特殊
console.log(typeof null);         // "object"   ← 历史 bug
console.log(typeof {});           // "object"
console.log(typeof []);           // "object"   ← 无法区分数组

// 2. instanceof
console.log([] instanceof Array);       // true
console.log({} instanceof Object);      // true
console.log(function(){} instanceof Function); // true
// console.log('abc' instanceof String); // false（原始类型无效）

// 3. constructor
console.log([].constructor === Array);   // true
console.log({}.constructor === Object);  // true
// 可被篡改：
const arr = [];
arr.constructor = Object;
console.log(arr.constructor === Array); // false ← 不可靠

// 4. Object.prototype.toString.call() — 推荐
const type = (val) => Object.prototype.toString.call(val);

console.log(type(null));       // "[object Null]"
console.log(type(undefined));  // "[object Undefined]"
console.log(type([]));         // "[object Array]"
console.log(type({}));         // "[object Object]"
console.log(type(function(){})); // "[object Function]"
console.log(type(new Date())); // "[object Date]"
```

### 封装通用类型检测函数

```js
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType([]));        // "array"
console.log(getType(null));      // "null"
console.log(getType(new Map())); // "map"
```

### 面试追问点

- **为什么不用 `Array.isArray()` 以外的方案判数组？** `instanceof` 跨 iframe 时原型链不同会失效；`constructor` 可被修改。
- **`Object.prototype.toString` 为什么准确？** 它读取对象内部的 `[[Class]]`/`Symbol.toStringTag`，不受原型链篡改影响（除非显式改 `Symbol.toStringTag`）。

---

## 3. 判断数组的方式有哪些

**记忆口诀：「isArray 最推荐，toString 最通用，instanceof 同域可用，原型链法了解即可」**

**一句话回答：** 推荐 `Array.isArray()`；备选 `Object.prototype.toString.call()`；`instanceof Array` 在同域可用但跨 iframe 失效；还有 `__proto__`、`Array.prototype.isPrototypeOf()` 等了解即可。

### 判断方式对比

| 方式 | 写法 | 可靠性 | 说明 |
| --- | --- | --- | --- |
| Array.isArray() | `Array.isArray(arr)` | ⭐⭐⭐ 推荐 | ES5 标准，任何环境 |
| toString | `Object.prototype.toString.call(arr) === '[object Array]'` | ⭐⭐⭐ | 通用准确 |
| instanceof | `arr instanceof Array` | ⭐⭐ 同域可用 | 跨 iframe/多窗口失效 |
| __proto__ | `arr.__proto__ === Array.prototype` | ⭐ 不推荐 | 可被 Proxy 影响，已废弃写法 |
| isPrototypeOf | `Array.prototype.isPrototypeOf(arr)` | ⭐⭐ | 等价于原型链判断 |

### 代码示例

```js
const arr = [1, 2, 3];
const fakeArr = { '0': 1, length: 1 }; // 类数组，不是真数组

// ✅ 推荐
console.log(Array.isArray(arr));      // true
console.log(Array.isArray(fakeArr));  // false

// ✅ 通用
console.log(Object.prototype.toString.call(arr) === '[object Array]'); // true

// ⚠️ 同域可用
console.log(arr instanceof Array); // true

// ⚠️ 了解即可
console.log(arr.__proto__ === Array.prototype); // true
console.log(Array.prototype.isPrototypeOf(arr)); // true
```

### 类数组 vs 真数组

```js
// 类数组：有 length 和索引，但没有数组方法
const arrayLike = { 0: 'a', 1: 'b', length: 2 };

// 转为真数组
const realArr = Array.from(arrayLike);
console.log(Array.isArray(realArr)); // true
```

### 面试追问点

- **为什么 `instanceof` 跨 iframe 失效？** 不同 iframe 有独立的 `Array` 构造函数，原型链不同。
- **Array.isArray 的实现原理？** 本质也是检查 `[[Class]]` 或内部标记，规范保证对 Proxy 等也有效。

---

## 4. null和undefined区别

**记忆口诀：「undefined 未定义，null 故意空，typeof null 是 object，== 相等 === 不等」**

**一句话回答：** `undefined` 表示变量**未定义/声明未赋值**；`null` 表示**故意为空**的空对象指针；`typeof null` 是 `"object"`（历史 bug）；`null == undefined` 为 true，但 `===` 为 false。

### 核心对比

| 对比项 | undefined | null |
| --- | --- | --- |
| 含义 | 未定义、未赋值 | 主动赋值的「空」 |
| typeof | `"undefined"` | `"object"`（历史 bug） |
| 转数字 | NaN | 0 |
| 转布尔 | false | false |
| == 比较 | `null == undefined` → true | 同上 |
| === 比较 | `null === undefined` → false | 类型不同 |
| 典型场景 | 变量声明未赋值、函数无返回值、缺少参数 | 清空对象引用、DOM 查找不到 |

### 代码示例

```js
let a;
console.log(a); // undefined — 声明未赋值

function fn(x) {
  console.log(x); // undefined — 缺少参数
}
fn();

function noReturn() {}
console.log(noReturn()); // undefined — 无 return

// null：主动赋空
let user = { name: 'Tom' };
user = null; // 释放引用，表示「暂无用户」

document.getElementById('notExist'); // null — DOM 未找到
```

### undefined 不是保留字

```js
// undefined 可被覆盖（严格模式下会报错，非严格模式危险）
// window.undefined = 1; // 不推荐

// 安全获取 undefined 的写法
const UNDEFINED = void 0;
console.log(UNDEFINED); // undefined
```

### 使用建议

- 需要表示「空对象引用」时用 `null`
- 判断空值时推荐：`value == null`（同时覆盖 null 和 undefined）
- 严格区分时用 `=== null` 或 `=== undefined`

### 面试追问点

- **为什么 null 转数字是 0？** 历史设计，`ToNumber(null)` 规范定义为 0。
- **函数参数不传 vs 传 undefined 有区别吗？** 通常无区别；但配合 `arguments.length` 或默认参数时可区分。

---

## 5. typeof null 的结果是什么，为什么？

**记忆口诀：「typeof null 是 object，二进制前三位全是零，function 有 Call 返回 function」**

**一句话回答：** `typeof null` 的结果是 `"object"`，这是 **JavaScript 第一版的遗留 bug**——底层用二进制前三位标识类型，`000` 代表对象，而 `null` 在内存中全为 0，被误判为对象。

### 原因解析

| 值 | typeof 结果 | 原因 |
| --- | --- | --- |
| null | `"object"` | 底层表示为全 0，前三位 `000` 与对象类型码相同 |
| function | `"function"` | 函数有 `[[Call]]` 内部方法，typeof 单独识别 |
| 普通对象 | `"object"` | 正常对象类型码 |
| 数组 | `"object"` | 数组本质是对象，typeof 不单独区分 |

### 历史背景

早期 JavaScript 用 **32 位单元**存储值，其中 **1-3 位存类型标签**：

```
000 → object
001 → int
010 → double
100 → string
110 → boolean
```

`null` 被设计为 **空对象指针**，机器码为全 0，类型标签也是 `000`，因此 `typeof` 返回 `"object"`。规范为了兼容现有代码，一直未修复。

### function 为何特殊

```js
console.log(typeof function(){});  // "function"
console.log(typeof class A {});    // "function" — class 也是函数对象

// 函数是可调用对象，内部有 [[Call]] 属性
// typeof 算法对 callable 对象返回 "function"
```

### 正确判断 null

```js
const value = null;

console.log(typeof value);           // "object" ← 不可靠
console.log(value === null);         // true ← 推荐
console.log(Object.is(value, null)); // true
```

### 面试追问点

- **能修复这个 bug 吗？** 理论上可以，但会破坏大量依赖 `typeof null === 'object'` 的旧代码，TC39 选择保持现状。
- **typeof 的完整算法？** 先判断是否 undefined/null，再判断是否函数（有 [[Call]] 或 [[Construct]]），再按内部类型标签返回。

---

## 6. instanceof 操作符的实现原理及实现

**记忆口诀：「左值 proto 链，右值 prototype，链上找到就 true，Object.create(null) 全 false」**

**一句话回答：** `instanceof` 判断**左值的原型链**上是否存在**右值构造函数的 prototype**；本质是递归查找 `__proto__`（即 `[[Prototype]]`）。

### 原理步骤

```
1. 取右值 constructor.prototype（即右值的 prototype 属性）
2. 取左值的 __proto__（即 [[Prototype]]）
3. 沿左值原型链逐级向上查找
4. 找到相同引用 → true；到 null 仍未找到 → false
```

### 手写 myInstanceof

```js
function myInstanceof(left, right) {
  // 基本类型直接 false
  if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
    return false;
  }

  let proto = Object.getPrototypeOf(left);
  const prototype = right.prototype;

  while (proto !== null) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

// 测试
console.log(myInstanceof([], Array));         // true
console.log(myInstanceof({}, Array));         // false
console.log(myInstanceof({}, Object));        // true
console.log(myInstanceof(function(){}, Function)); // true
```

### 特殊情况

```js
// Object.create(null) 无原型链
const bare = Object.create(null);
console.log(bare instanceof Object); // false

// 跨 iframe 问题
// iframeA 的 Array !== iframeB 的 Array
// iframeA 中 [] instanceof iframeB.Array → false

// Symbol.hasInstance 可自定义 instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}
console.log([] instanceof MyArray); // true
```

### typeof vs instanceof

| 对比 | typeof | instanceof |
| --- | --- | --- |
| 适用 | 基本类型 | 引用类型/自定义类 |
| 原理 | 类型标签 | 原型链查找 |
| 数组 | 返回 object | 可正确识别 |
| 跨 iframe | 不受影响 | 可能失效 |

### 面试追问点

- **箭头函数能用 instanceof 吗？** 箭头函数无 `prototype`，不能作为 instanceof 右值（会报错）；作为左值时正常走原型链。
- **原始类型的包装对象？** `new String('a') instanceof String` 为 true，但 `'a' instanceof String` 为 false。

---

## 7. 为什么0.1+0.2 !== 0.3，如何让其相等

**记忆口诀：「IEEE 754 双精度，二进制无限循环被截断，EPSILON 比误差，整数算最稳」**

**一句话回答：** JavaScript 数字采用 **IEEE 754 双精度 64 位浮点数**，`0.1` 和 `0.2` 在二进制中是**无限循环小数**，存储时被截断产生精度误差，相加结果不等于 `0.3`。

### IEEE 754 双精度结构

| 部分 | 位数 | 作用 |
| --- | --- | --- |
| 符号位 | 1 位 | 正负 |
| 指数位 | 11 位 | 范围约 ±10^308 |
| 尾数位 | 52 位 | 有效精度约 15-17 位十进制 |

```
0.1 的二进制：0.0001100110011001100110011001100110011001100110011...（无限循环）
0.2 的二进制：0.001100110011001100110011001100110011001100110011...（无限循环）
```

存储时尾数截断 → 产生微小误差 → 累加后暴露。

### 验证

```js
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);   // false
console.log(0.1 + 0.2 - 0.3);     // 5.551115123125783e-17
```

### 解决方案

**1. Number.EPSILON 误差范围比较（推荐）**

```js
function isEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
console.log(isEqual(0.1 + 0.2, 0.3)); // true
```

**2. 转为整数计算**

```js
function add(a, b) {
  const factor = Math.pow(10, Math.max(
    (a.toString().split('.')[1] || '').length,
    (b.toString().split('.')[1] || '').length
  ));
  return (a * factor + b * factor) / factor;
}
console.log(add(0.1, 0.2) === 0.3); // true（有限小数场景）
```

**3. toFixed 转字符串（注意返回字符串）**

```js
console.log((0.1 + 0.2).toFixed(1) === '0.3'); // true
console.log(parseFloat((0.1 + 0.2).toFixed(10)) === 0.3); // true
```

**4. 高精度库（金融/科学计算）**

```js
// 使用 decimal.js / big.js / bignumber.js
// import Big from 'big.js';
// console.log(new Big(0.1).plus(0.2).eq(0.3)); // true
```

### 面试追问点

- **所有小数都有问题吗？** 0.5（1/2）等能精确表示的二进制小数没问题；1/3、0.1 等不行。
- **BigInt 能解决吗？** BigInt 是整数，需把金额转为「分」等单位用整数运算，不能直接替代浮点。

---

## 8. typeof NaN 的结果是什么？

**记忆口诀：「NaN 是 Number 家族，typeof 返回 number，NaN 不等于 NaN，isNaN 来判断」**

**一句话回答：** `typeof NaN` 的结果是 `"number"`。NaN（Not a Number）是 IEEE 754 定义的**特殊数值**，属于 Number 类型，且是**唯一不等于自身**的值。

### 核心特性

| 特性 | 说明 |
| --- | --- |
| typeof NaN | `"number"` |
| NaN === NaN | false |
| NaN == NaN | false |
| Object.is(NaN, NaN) | true |
| 产生方式 | 0/0、Infinity/Infinity、Number('abc') 等 |

### 代码示例

```js
console.log(typeof NaN);        // "number"
console.log(NaN === NaN);       // false
console.log(NaN == NaN);        // false
console.log(Object.is(NaN, NaN)); // true

// NaN 的产生
console.log(0 / 0);              // NaN
console.log(Number('hello'));    // NaN
console.log(parseInt('abc'));    // NaN
console.log(Math.sqrt(-1));      // NaN（非严格模式下）
console.log(undefined + 1);      // NaN
```

### 正确判断 NaN

```js
// ✅ 推荐
console.log(Number.isNaN(NaN));       // true
console.log(Number.isNaN('hello'));   // false

// ⚠️ 全局 isNaN 会先转数字
console.log(isNaN(NaN));              // true
console.log(isNaN('hello'));          // true ← 不精确

// ✅ 经典技巧：利用 NaN !== NaN
function myIsNaN(value) {
  return value !== value;
}
console.log(myIsNaN(NaN)); // true
```

### 面试追问点

- **NaN 在排序中的行为？** `[3, NaN, 1].sort()` 中 NaN 被视为 0 或排到最后，结果因引擎略有差异。
- **JSON 中的 NaN？** `JSON.stringify(NaN)` 返回 `"null"`。

---

## 9. isNaN 和 Number.isNaN 函数的区别？

**记忆口诀：「isNaN 先转数字再判，Number.isNaN 先判类型再判 NaN，后者更精准」**

**一句话回答：** 全局 `isNaN()` 会**先将参数转为数字**再判断，导致 `'hello'` 等也被判为 NaN；`Number.isNaN()` **不做类型转换**，只有值本身为 number 类型且为 NaN 时才返回 true。

### 对比表

| 对比项 | isNaN() | Number.isNaN() |
| --- | --- | --- |
| 类型转换 | 先 ToNumber 再判断 | 不转换 |
| isNaN('hello') | true（'hello'→NaN） | false |
| isNaN(undefined) | true | false |
| isNaN({}) | true（{}→NaN） | false |
| isNaN(NaN) | true | true |
| isNaN('123') | false | false |
| ES 版本 | ES1 | ES6 |
| 推荐度 | 不推荐 | ✅ 推荐 |

### 代码示例

```js
// 全局 isNaN — 有隐式转换
console.log(isNaN(NaN));        // true
console.log(isNaN('hello'));  // true  ← 陷阱！
console.log(isNaN(undefined));  // true  ← 陷阱！
console.log(isNaN({}));         // true  ← 陷阱！
console.log(isNaN('123'));      // false
console.log(isNaN(''));         // false（'' → 0）

// Number.isNaN — 严格判断
console.log(Number.isNaN(NaN));        // true
console.log(Number.isNaN('hello'));    // false ✅
console.log(Number.isNaN(undefined));  // false ✅
console.log(Number.isNaN({}));         // false ✅
console.log(Number.isNaN(Number('x'))); // true
```

### isNaN 的内部逻辑（简化）

```js
// isNaN(x) 等价于：
function legacyIsNaN(x) {
  x = Number(x); // 先转数字
  return x !== x; // NaN 不等于自身
}
```

### 面试追问点

- **什么时候还用 isNaN？** 几乎不用；需要「是否为有效数字」时用 `Number.isFinite()` 或 `!Number.isNaN(Number(x))`。
- **Number 上还有哪些类似方法？** `Number.isFinite()`、`Number.isInteger()`、`Number.isSafeInteger()`。

---

## 10. == 操作符的强制类型转换规则

**记忆口诀：「null undefined 是一家，boolean 先变 number，string 遇 number 转数字，object 先 ToPrimitive」**

**一句话回答：** `==` 在比较前会对两侧做**隐式类型转换**，核心规则：null/undefined 互等；boolean 转 number；string 与 number 比较时 string 转 number；object 先转基本类型（ToPrimitive）。

### 规则优先级（简化流程）

```
1. 类型相同 → 直接比较（含 +0/-0 相等、NaN 不等）
2. null == undefined → true（且不等于其他任何值）
3. 一方是 number，一方是 string → string 转 number
4. 一方是 boolean → boolean 转 number（true→1, false→0）
5. 一方是 object → object 转基本类型（ToPrimitive）
6. 其余情况 → false
```

### 常见转换对照

| 表达式 | 结果 | 原因 |
| --- | --- | --- |
| `null == undefined` | true | 特殊规则 |
| `null == 0` | false | null 只等于 undefined |
| `undefined == 0` | false | 同上 |
| `true == 1` | true | boolean → number |
| `false == 0` | true | boolean → number |
| `'123' == 123` | true | string → number |
| `'' == 0` | true | '' → 0 |
| `'abc' == NaN` | false | NaN 不等于任何值 |
| `[1] == 1` | true | [1]→'1'→1 |
| `[] == 0` | true | []→''→0 |
| `[] == ![]` | true | ![]→false→0，[]→''→0 |

### 代码示例

```js
// null / undefined
console.log(null == undefined);  // true
console.log(null == 0);          // false

// boolean
console.log(true == 1);          // true
console.log(false == '0');       // true

// string & number
console.log('42' == 42);         // true
console.log('' == 0);            // true

// object → primitive
console.log([1, 2] == '1,2');   // true（数组 toString）
console.log({ valueOf: () => 1 } == 1); // true
```

### 面试建议

**永远优先使用 `===`**，只在明确需要兼容 null/undefined 时用 `value == null`。

### 面试追问点

- **`[] == ![]` 为什么 true？** `![]` → false → 0；`[]` → `''` → 0；0 == 0 → true。
- **ToPrimitive 顺序？** 默认先 `valueOf` 再 `toString`；Date 例外，先 `toString`。

---

## 11. 其他值到字符串的转换规则

**记忆口诀：「null 变 null 串，undefined 变 undefined 串，对象调 toString，Symbol 只能显式转」**

**一句话回答：** 转字符串遵循 `ToString` 抽象操作：null→`"null"`，undefined→`"undefined"`，boolean→`"true"`/`"false"`，number 直接转，Symbol **只能显式转换**（隐式会报错），object 调用 `toString()`。

### 转换规则表

| 类型 | 转换结果 | 说明 |
| --- | --- | --- |
| undefined | `"undefined"` | |
| null | `"null"` | |
| boolean | `"true"` / `"false"` | |
| number | 数字字符串 | NaN→`"NaN"`，Infinity→`"Infinity"` |
| string | 原样返回 | |
| symbol | TypeError | 不能隐式转字符串 |
| object | 先 ToPrimitive(string) 再 ToString | 优先调 toString |

### 代码示例

```js
// 基本类型
console.log(String(null));       // "null"
console.log(String(undefined));  // "undefined"
console.log(String(true));       // "true"
console.log(String(42));         // "42"
console.log(String(NaN));        // "NaN"

// Symbol 必须显式
const sym = Symbol('id');
console.log(String(sym));        // "Symbol(id)" ✅
console.log(sym.toString());     // "Symbol(id)" ✅
// console.log(sym + '');        // TypeError ❌

// 对象
console.log(String({}));                    // "[object Object]"
console.log(String([1, 2, 3]));           // "1,2,3"
console.log(String({ toString: () => 'hi' })); // "hi"

// 模板字符串中的隐式转换
console.log(`value: ${123}`);    // "value: 123"
console.log(`sym: ${sym}`);      // "sym: Symbol(id)" — 模板字符串允许
```

### object 的 ToPrimitive（string _hint）

```
1. 调用 obj.toString()
2. 若未得到 string，调用 obj.valueOf()
3. 仍不行则 TypeError
```

### 面试追问点

- **数组 toString 的规则？** 对每项 ToString 后用逗号连接；`[1, [2, 3]]` → `"1,2,3"`。
- **`{} + []` 的结果？** 取决于上下文，`{}` 可能被解析为空代码块；`([] + {})` → `"[object Object]"`。

---

## 12. 其他值到数字值的转换规则

**记忆口诀：「undefined 变 NaN，null 变零，true 是一 false 零，Symbol 报错，对象先 Primitive」**

**一句话回答：** `ToNumber` 规则：undefined→NaN，null→0，true→1/false→0，string 用 `Number()` 规则解析，Symbol→TypeError，object 先 ToPrimitive（优先 valueOf）再转数字。

### 转换规则表

| 类型 | 转换结果 |
| --- | --- |
| undefined | NaN |
| null | 0 |
| true | 1 |
| false | 0 |
| string | 见下方解析规则 |
| number | 原样 |
| symbol | TypeError |
| object | ToPrimitive(number) → ToNumber |

### 字符串转数字

| 字符串 | 结果 |
| --- | --- |
| `''` / `'   '` | 0 |
| `'123'` | 123 |
| `'12.34'` | 12.34 |
| `'0xFF'` | 255（十六进制） |
| `'hello'` | NaN |
| `'123abc'` | NaN |

### 代码示例

```js
console.log(Number(undefined)); // NaN
console.log(Number(null));      // 0
console.log(Number(true));      // 1
console.log(Number(false));     // 0
console.log(Number(''));         // 0
console.log(Number('  42  '));  // 42
console.log(Number('abc'));     // NaN

// Symbol
// console.log(Number(Symbol())); // TypeError

// 对象 — 先 valueOf 再 toString
const obj = {
  valueOf() { return 42; },
  toString() { return '99'; }
};
console.log(Number(obj)); // 42（valueOf 优先）

const obj2 = {
  toString() { return '99'; }
};
console.log(Number(obj2)); // 99
```

### 一元 + 运算符

```js
// +x 等价于 ToNumber(x)
console.log(+'123');    // 123
console.log(+true);     // 1
console.log(+null);     // 0
console.log(+undefined); // NaN
```

### 面试追问点

- **parseInt vs Number？** `parseInt('123px')` → 123（解析前缀）；`Number('123px')` → NaN（完整解析）。
- **空数组转数字？** `[].valueOf()` 返回 `[]`（对象），再 `[].toString()` → `''` → 0。

---

## 13. 其他值到布尔类型的值的转换规则

**记忆口诀：「六大假值要记牢：undefined null false 零 NaN 空串，其余全是真值」**

**一句话回答：** 假值（falsy）只有 **6 个**：`undefined`、`null`、`false`、`+0`/`-0`、`NaN`、`""`；**其余全是真值**，包括 `{}`、`[]`、`'0'`、`'false'` 等。

### 6 个假值

| 假值 | 说明 |
| --- | --- |
| undefined | 未定义 |
| null | 空值 |
| false | 布尔假 |
| 0 / -0 | 零（+0 === -0） |
| NaN | 非数字 |
| "" | 空字符串 |

### 容易误判的「真值」

| 值 | Boolean() | 说明 |
| --- | --- | --- |
| `{}` | true | 空对象是真值 |
| `[]` | true | 空数组是真值 |
| `'0'` | true | 非空字符串 |
| `'false'` | true | 字符串 "false" |
| `function(){}` | true | 函数 |
| `new Boolean(false)` | true | 包装对象是真值！ |

### 代码示例

```js
// 假值
[undefined, null, false, 0, -0, NaN, ''].forEach(v => {
  console.log(Boolean(v)); // 全部 false
});

// 真值
console.log(Boolean({}));          // true
console.log(Boolean([]));          // true
console.log(Boolean('0'));         // true
console.log(Boolean('false'));     // true
console.log(Boolean(new Boolean(false))); // true ← 包装对象！

// 实际应用
function greet(name) {
  // 不推荐：if (name) 会把 '' 和 0 都过滤
  // 推荐：显式判断
  if (name !== undefined && name !== null) {
    console.log(`Hello, ${name}`);
  }
}
```

### 包装对象的陷阱

```js
// new Boolean(false) 是对象，永远为 true
if (new Boolean(false)) {
  console.log('进入了！'); // 会执行
}

// 正确判断
if (Boolean(false) === false) {
  console.log('false 本体');
}
```

### 面试追问点

- **document.all 的特殊性？** HTML 规范中 `document.all` 在布尔上下文被当作 undefined（已废弃的怪异行为）。
- **[] 为什么是 true 但 [] == false？** `Boolean([])` → true；但 `[] == false` 时 [] 先转 primitive → '' → 0，false → 0，所以相等。

---

## 14. Object.is() 与比较操作符 "==="、"==" 的区别

**记忆口诀：「== 会转换，=== 不转换但有坑，Object.is 修正负零和 NaN」**

**一句话回答：** `==` 有隐式类型转换；`===` 不转换但 `+0 === -0` 为 true 且 `NaN !== NaN`；`Object.is()` 与 `===` 几乎相同，但修正了 **+0/-0** 和 **NaN** 两个边界情况。

### 三者对比

| 比较式 | == | === | Object.is |
| --- | --- | --- | --- |
| `1 == '1'` | true | false | false |
| `null == undefined` | true | false | false |
| `NaN == NaN` | false | false | **true** |
| `+0 === -0` | true | **true** | **false** |
| `+0 == -0` | true | true | false |
| 类型不同 | 尝试转换 | false | false |

### 代码示例

```js
// ==
console.log(1 == '1');           // true
console.log(null == undefined);  // true

// ===
console.log(1 === '1');          // false
console.log(NaN === NaN);        // false
console.log(+0 === -0);          // true

// Object.is
console.log(Object.is(NaN, NaN));  // true ✅
console.log(Object.is(+0, -0));    // false ✅
console.log(Object.is(1, '1'));    // false
console.log(Object.is(null, undefined)); // false
```

### Object.is 的实现（简化）

```js
function myObjectIs(a, b) {
  if (a === b) {
    // 修正 +0/-0
    return a !== 0 || 1 / a === 1 / b;
  }
  // 修正 NaN
  return a !== a && b !== b;
}

console.log(myObjectIs(NaN, NaN)); // true
console.log(myObjectIs(+0, -0));   // false
```

### 使用场景

| 场景 | 推荐 |
| --- | --- |
| 日常比较 | `===` |
| 需要区分 +0/-0 | `Object.is()` |
| 需要 NaN 相等 | `Object.is()` 或 `Number.isNaN()` |
| 兼容 null/undefined | `value == null` |

### 面试追问点

- **Object.is 和 SameValue 算法？** `Object.is` 实现 SameValue 算法；`===` 实现 Strict Equality Comparison；区别就在 +0/-0 和 NaN。
- **React 为什么用 Object.is？** `Object.is` 用于比较 state/props 是否变化，能正确处理 NaN 和 +0/-0。

---

## 15. JavaScript 中如何进行隐式类型转换

**记忆口诀：「ToPrimitive 分 hint，number 先 valueOf，string 先 toString，加号有串就拼接」**

**一句话回答：** 隐式转换由 **`ToPrimitive`、`ToNumber`、`ToString`、`ToBoolean`** 等抽象操作驱动；核心入口是 **`ToPrimitive`**（按 hint 决定 valueOf/toString 顺序），算术运算倾向转数字，`+` 有字符串则拼接。

### ToPrimitive 流程

| hint | 顺序 | 典型场景 |
| --- | --- | --- |
| number（default） | valueOf → toString | `+obj`、`*obj`、`<` 比较 |
| string | toString → valueOf | `` `${obj}` ``、String(obj) |
| Date 例外 | toString → valueOf | 无论 hint |

```
ToPrimitive(obj, hint):
  1. 若 obj 是基本类型，直接返回
  2. 调用 obj[Symbol.toPrimitive](hint)，若有
  3. 按 hint 顺序调用 valueOf / toString
  4. 得到非 object 则返回，否则 TypeError
```

### + 运算符的特殊规则

```js
// 若任一操作数是 string → 字符串拼接
console.log('1' + 2);     // "12"
console.log(1 + '2');     // "12"
console.log([] + 1);      // "1"  ([] → "")

// 否则转数字
console.log(1 + 2);       // 3
console.log(true + 1);    // 2
console.log([] + []);     // ""   ("" + "")
console.log([] + {});     // "[object Object]"
```

### 其他运算符

```js
// 算术运算符（除 + 外）→ ToNumber
console.log('5' - 2);     // 3
console.log('5' * '2');   // 10
console.log(true + true); // 2

// 比较运算符 → ToNumber（若都不是 string 或可比较）
console.log('10' > 5);    // true
console.log(null >= 0);   // true（null→0）

// 逻辑运算符 → ToBoolean
console.log(!!'');        // false
console.log(0 || 'default'); // "default"
console.log('' ?? 'fallback'); // ""（?? 不转换，只判 null/undefined）
```

### 自定义转换

```js
const obj = {
  valueOf() { return 42; },
  toString() { return 'hello'; },
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 100;
    if (hint === 'string') return 'world';
    return 'default';
  }
};

console.log(+obj);        // 100
console.log(`${obj}`);    // "world"
console.log(obj + 1);     // 101
```

### 面试追问点

- **`{} + []` 和 `[] + {}`？** 前者可能被解析为 `{}` 空块 + `+[]`；后者 `"[object Object]"`。
- **?? 和 || 的区别？** `||` 对 falsy 触发；`??` 只对 null/undefined 触发，不做类型转换。

---

## 16. let、const、var的区别

**记忆口诀：「var 函数作用域可提升可重声明，let const 块级有 TDZ，const 必须赋初值不可改绑」**

**一句话回答：** `var` 是**函数作用域**、会提升、可重复声明、全局挂载 window；`let`/`const` 是**块级作用域**、有暂时性死区（TDZ）、不可重复声明；`const` 必须初始化且不能重新赋值（对象属性可改）。

### 三者对比

| 特性 | var | let | const |
| --- | --- | --- | --- |
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 提升，初始化为 undefined | 提升但处于 TDZ | 提升但处于 TDZ |
| 重复声明 | ✅ 允许 | ❌ 报错 | ❌ 报错 |
| 重新赋值 | ✅ | ✅ | ❌（绑定不可改） |
| 必须初始化 | ❌ | ❌ | ✅ |
| 全局属性 | 挂载 window | 不挂载 | 不挂载 |
| for 循环 | 共享同一变量 | 每轮新绑定 | 每轮新绑定 |

### 代码示例

```js
// var — 函数作用域
function testVar() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 — 可访问
}

// let/const — 块级作用域
{
  let a = 1;
  const b = 2;
  // var c = 3; // 同上，块内有效
}
// console.log(a); // ReferenceError

// 变量提升差异
console.log(varHoist);   // undefined（提升并初始化）
var varHoist = 10;

// console.log(letHoist); // ReferenceError — TDZ
let letHoist = 20;

// const 必须初始化
// const NO_INIT; // SyntaxError

// const 不能重新赋值，但对象属性可变
const obj = { name: 'Tom' };
obj.name = 'Jerry'; // ✅
// obj = {};        // ❌ TypeError
```

### 暂时性死区（TDZ）

```js
let x = 1;
{
  // TDZ 开始
  // console.log(x); // ReferenceError — 块内 x 已声明但未初始化
  let x = 2;        // TDZ 结束
  console.log(x);   // 2
}
```

### for 循环经典题

```js
// var — 共享变量
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 100); // 3, 3, 3
}

// let — 每轮新绑定
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 100); // 0, 1, 2
}
```

### 面试追问点

- **为什么要有 TDZ？** 让 `let/const` 在声明前访问直接报错，避免 var 提升带来的混乱。
- **const 真的「常量」吗？** 保证的是**绑定**不变（内存地址），堆上对象内容仍可变。

---

## 17. const对象的属性可以修改吗

**记忆口诀：「const 锁地址不锁内容，改属性可以改指向不行，freeze 冻一层递归才深冻」**

**一句话回答：** **可以修改**。`const` 保证的是变量**指向的内存地址不变**（绑定不可变），对象属性存储在堆中，通过引用仍可修改；若要完全冻结用 `Object.freeze()`（默认只冻结一层）。

### 原理说明

```js
const person = { name: 'Tom', age: 20 };

// ✅ 修改属性 — 可以
person.name = 'Jerry';
person.age = 21;
console.log(person); // { name: 'Jerry', age: 21 }

// ✅ 添加/删除属性 — 可以
person.city = 'Beijing';
delete person.age;

// ❌ 重新赋值 — 不可以
// person = {}; // TypeError: Assignment to constant variable
```

### const vs Object.freeze

| 对比 | const | Object.freeze() |
| --- | --- | --- |
| 限制对象 | 变量不能重新赋值 | 对象不能增删改 |
| 属性修改 | ✅ 可以 | ❌ 不可以 |
| 嵌套对象 | 嵌套层不受 const 保护 | 嵌套层默认可改（浅冻结） |
| 严格模式 | — | 修改会静默失败或报错 |

### Object.freeze 示例

```js
const frozen = Object.freeze({ name: 'Tom', info: { age: 20 } });

// frozen.name = 'Jerry';     // 严格模式下 TypeError
// frozen.newKey = 'x';       // 无效
frozen.info.age = 21;         // ✅ 浅冻结，嵌套仍可改

// 深冻结需递归
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(key => {
    if (obj[key] !== null && typeof obj[key] === 'object') {
      deepFreeze(obj[key]);
    }
  });
  return obj;
}
```

### 相关 API

```js
Object.isFrozen(obj);    // 是否冻结
Object.seal(obj);        // 密封：可改不可增删
Object.isSealed(obj);
Object.preventExtensions(obj); // 禁止扩展新属性
```

### 面试追问点

- **const 存的什么？** 原始类型存值本身；引用类型存堆地址，地址不可变但堆内容可变。
- **freeze 后还能改原型吗？** `Object.freeze` 只影响对象自身属性，不影响原型链。

---

## 18. 如果new一个箭头函数的会怎么样

**记忆口诀：「箭头函数没有 Construct，new 箭头必报 TypeError，没有 prototype 不能当构造」**

**一句话回答：** 会抛出 **`TypeError`**。箭头函数没有 `[[Construct]]` 内部方法和 **`prototype` 属性**，不能作为构造函数使用。

### 原因

| 普通函数 | 箭头函数 |
| --- | --- |
| 有 `[[Construct]]` | ❌ 无 |
| 有 `prototype` 属性 | ❌ 无 |
| 可以 `new Func()` | ❌ 报错 |
| 有自己的 `this` | `this` 继承外层 |

### 代码示例

```js
const Arrow = () => {
  this.name = 'test';
};

// TypeError: Arrow is not a constructor
// const instance = new Arrow();

// 验证无 prototype
console.log(Arrow.prototype); // undefined

// 普通函数可以
function Person(name) {
  this.name = name;
}
const p = new Person('Tom');
console.log(p.name); // 'Tom'
console.log(Person.prototype); // { constructor: f }
```

### new 操作对箭头函数失败的过程

```
1. 创建新对象
2. 试图将新对象的 __proto__ 链接到 Arrow.prototype
3. Arrow.prototype 是 undefined → 无法作为构造函数
4. 引擎抛出 TypeError
```

### 面试追问点

- **箭头函数能 bind 吗？** 可以调用 `bind()`，但 bind 返回的仍是箭头函数，且 `this` 仍不可改。
- **class 和箭头函数？** class 本质是构造函数，`new Class()` 正常；class 中箭头函数作为实例方法，`this` 绑定实例。

---

## 19. 箭头函数与普通函数的区别

**记忆口诀：「this 定义时绑定，无 arguments 无 prototype，不能 new 不能用 yield，五不同记心间」**

**一句话回答：** 箭头函数与普通函数有 **5 大区别**：(1) `this` 词法绑定、定义时确定；(2) 没有 `arguments`；(3) 没有 `prototype`；(4) 不能 `new`；(5) 不能用作 Generator（无 yield）。

### 五大区别对比

| 区别 | 普通函数 | 箭头函数 |
| --- | --- | --- |
| this | 运行时动态绑定 | 词法绑定，继承外层 |
| arguments | 有 | 无（可用 rest 参数） |
| prototype | 有 | 无 |
| new | 可以 | TypeError |
| Generator | 可以（function*） | 不可以 |

### 1. this 绑定

```js
const obj = {
  name: 'Tom',
  regular: function() {
    console.log(this.name); // 'Tom'
  },
  arrow: () => {
    console.log(this.name); // undefined（继承外层，如 window/undefined）
  }
};
obj.regular();
obj.arrow();
```

### 2. 没有 arguments

```js
function regular() {
  console.log(arguments); // 类数组对象
}
regular(1, 2, 3);

const arrow = (...args) => {
  console.log(args); // 真数组 [1, 2, 3]
};
arrow(1, 2, 3);
```

### 3. 没有 prototype

```js
function Foo() {}
console.log(Foo.prototype); // { constructor: f }

const Bar = () => {};
console.log(Bar.prototype); // undefined
```

### 4. 不能 new

```js
// new (() => {}) → TypeError
```

### 5. 不能用作 Generator

```js
// function* gen() { yield 1; } ✅
// const gen = *() => { yield 1; }; ❌ SyntaxError
```

### 适用场景

| 适合箭头函数 | 适合普通函数 |
| --- | --- |
| 回调、定时器 | 对象方法（需 this） |
| 数组 map/filter | 构造函数 |
| 需要继承外层 this | 需要 arguments |
| 事件处理器（不需 this 指 DOM） | Generator 函数 |

### 面试追问点

- **箭头函数能做对象方法吗？** 可以但通常不合适，因为 `this` 不指向对象本身。
- **箭头函数的 name 属性？** 有，如 `const fn = () => {}` 的 name 是 `'fn'`。

---

## 20. 箭头函数的this指向哪里

**记忆口诀：「箭头 this 看外层，第一个普通函数定，call apply bind 全无效」**

**一句话回答：** 箭头函数的 `this` **继承自外层第一个普通函数（或全局）的词法作用域**，在**定义时确定**，**运行时不可改变**；`call`、`apply`、`bind` 均无法修改箭头函数的 `this`。

### this 查找规则

```
箭头函数自身无 this
  → 找外层最近非箭头函数的 this
    → 若外层也是箭头，继续向外
      → 直到全局（浏览器 window，严格模式 undefined）
```

### 代码示例

```js
function outer() {
  return () => {
    console.log(this); // 继承 outer 的 this
  };
}
outer.call({ id: 1 })(); // { id: 1 }

// call/apply/bind 无法改变
const arrow = () => console.log(this);
const bound = arrow.bind({ name: 'Tom' });
bound(); // 仍指向定义时的外层 this，不是 { name: 'Tom' }
```

### 常见场景

```js
// ❌ 不适合做对象方法
const obj = {
  name: 'Tom',
  greet: () => {
    console.log(this.name); // undefined
  }
};

// ✅ 适合回调
function Timer() {
  this.seconds = 0;
  setInterval(() => {
    this.seconds++; // this 指向 Timer 实例
    console.log(this.seconds);
  }, 1000);
}
new Timer();

// React class 组件中
class App extends React.Component {
  handleClick = () => {
    console.log(this); // 组件实例
  };
}
```

### 对比表

| 方式 | 能否改变箭头函数 this |
| --- | --- |
| call | ❌ |
| apply | ❌ |
| bind | ❌ |
| 重新定义外层 this | ✅（改变的是外层函数的 this） |

### 面试追问点

- **嵌套箭头函数？** 逐层向外找，直到第一个非箭头函数。
- **DOM 事件中的箭头函数？** `this` 不是触发事件的元素，而是外层 this；需要元素引用时用 `event.currentTarget` 或普通函数。

---

## 21. Proxy 可以实现什么功能

**记忆口诀：「Proxy 拦对象，十三种 trap，Vue3 响应式靠它，Reflect 配着用」**

**一句话回答：** `Proxy` 是 ES6 的**代理对象**，通过 **13 种 trap**（get/set/has/deleteProperty 等）拦截对目标对象的操作；Vue 3 响应式核心基于 Proxy；通常配合 `Reflect` 使用，相比 `Object.defineProperty` 可监听新增/删除/数组索引。

### 13 种拦截操作（常用）

| trap | 拦截操作 | 典型用途 |
| --- | --- | --- |
| get | 属性读取 | 响应式依赖收集 |
| set | 属性设置 | 触发更新 |
| has | in 操作符 | 隐藏属性 |
| deleteProperty | delete 操作 | 响应式删除 |
| apply | 函数调用 | 函数代理 |
| construct | new 操作 | 构造函数代理 |
| getPrototypeOf | Object.getPrototypeOf | 原型保护 |
| setPrototypeOf | Object.setPrototypeOf | 原型保护 |
| ownKeys | Object.keys 等 | 控制枚举 |
| defineProperty | Object.defineProperty | 属性定义拦截 |
| getOwnPropertyDescriptor | 读取属性描述符 | — |
| preventExtensions | Object.preventExtensions | — |
| isExtensible | Object.isExtensible | — |

### 基础示例

```js
const target = { name: 'Tom', age: 20 };

const proxy = new Proxy(target, {
  get(obj, prop, receiver) {
    console.log(`读取 ${prop}`);
    return Reflect.get(obj, prop, receiver);
  },
  set(obj, prop, value, receiver) {
    console.log(`设置 ${prop} = ${value}`);
    return Reflect.set(obj, prop, value, receiver);
  }
});

proxy.name;       // 读取 name → 'Tom'
proxy.city = 'BJ'; // 设置 city = BJ ✅ 新增属性也能拦截
```

### 简易响应式实现

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      const result = Reflect.get(target, key, receiver);
      return typeof result === 'object' ? reactive(result) : result;
    },
    set(target, key, value, receiver) {
      const old = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (old !== value) trigger(target, key); // 触发更新
      return result;
    }
  });
}
```

### Proxy vs Object.defineProperty

| 对比 | Proxy | Object.defineProperty |
| --- | --- | --- |
| 监听新增属性 | ✅ | ❌（需递归预定义） |
| 监听删除属性 | ✅ | ❌ |
| 监听数组索引 | ✅ | ❌（需重写方法） |
| 性能 | 懒代理 | 初始化递归遍历 |
| 兼容性 | ES6+ | ES5 |
| 直接修改原对象 | 代理层隔离 | 直接劫持 |

### 其他应用场景

- **数据校验**：set 时检查类型/范围
- **负索引数组**：get 拦截 `-1` 返回最后一项
- **私有属性**：配合 WeakMap 隐藏真正数据
- **API Mock / 日志**：统一记录访问

### 面试追问点

- **Proxy 能代理基本类型吗？** 不能，目标必须是 object 或 function。
- **Reflect 的作用？** 提供与 trap 一一对应的默认行为，保证 `this` 正确且返回值规范。

---

## 22. 对 rest 参数的理解

**记忆口诀：「三点收集剩余参数，真数组放末尾，替代 arguments 更干净」**

**一句话回答：** Rest 参数（`...args`）用 **`...` 语法收集函数剩余参数为真数组**，必须放在**参数列表最后一位**；可替代 `arguments`；也可用于解构赋值的剩余收集。

### 核心特性

| 特性 | 说明 |
| --- | --- |
| 语法 | `function fn(a, b, ...rest) {}` |
| 类型 | 真 Array，可直接 map/filter |
| 位置 | 必须是最后一个形参 |
| 替代 | 替代 `arguments` 对象 |
| 解构 | `[first, ...rest] = arr` |

### 代码示例

```js
// 收集剩余参数
function sum(first, ...rest) {
  console.log(rest);        // 真数组
  console.log(Array.isArray(rest)); // true
  return rest.reduce((a, b) => a + b, first);
}
console.log(sum(1, 2, 3, 4)); // 10

// 替代 arguments
function oldWay() {
  const args = Array.from(arguments); // 类数组转数组
}
function newWay(...args) {
  args.map(x => x * 2); // 直接当数组用
}

// 解构中的 rest
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

const { name, ...others } = { name: 'Tom', age: 20, city: 'BJ' };
console.log(others); // { age: 20, city: 'BJ' }
```

### rest vs spread

| 概念 | 角色 | 示例 |
| --- | --- | --- |
| rest 参数 | 收集多个值 → 数组 | `fn(...args)` 形参 |
| spread 展开 | 展开数组 → 多个值 | `fn(...arr)` 实参/数组字面量 |

```js
const nums = [1, 2, 3];
console.log(Math.max(...nums)); // spread 展开实参
function collect(...all) { return all; } // rest 收集
```

### 注意事项

```js
// ❌ rest 不在最后
// function bad(...rest, last) {} // SyntaxError

// 箭头函数没有 arguments，rest 是唯一选择
const arrow = (...args) => console.log(args);
```

### 面试追问点

- **rest 和 arguments 区别？** rest 是真数组；arguments 是类数组、包含所有参数（含已命名的）；箭头函数无 arguments。
- **解构 rest 的限制？** 必须是最后一个模式，如 `[a, ...rest, b]` 非法。

---

## 23. ES6中模板语法与字符串处理

**记忆口诀：「反引号模板字，${} 插值多行写，标签模板能加工，includes starts ends 新方法」**

**一句话回答：** ES6 **模板字面量**（反引号 `` ` ``）支持 **`${}` 插值**、**多行字符串**、**标签模板**；字符串新增 `includes`、`startsWith`、`endsWith`、`repeat`、`padStart`、`padEnd` 等方法。

### 模板字面量特性

| 特性 | 说明 | 示例 |
| --- | --- | --- |
| 插值 | `${expression}` 嵌入表达式 | `` `1+2=${1+2}` `` |
| 多行 | 保留换行，无需 `\n` | `` `line1\nline2` `` |
| 嵌套 | 模板内可嵌套模板 | `` `${cond ? `a` : `b`}` `` |
| 标签模板 | 函数加工模板 | `` tag`hello ${name}` `` |

### 代码示例

```js
// 插值
const name = 'Tom';
const msg = `Hello, ${name}!`;
console.log(msg); // "Hello, Tom!"

// 多行
const html = `
  <div>
    <p>${name}</p>
  </div>
`;

// 表达式
console.log(`Sum: ${1 + 2}`);           // "Sum: 3"
console.log(`Upper: ${'abc'.toUpperCase()}`); // "Upper: ABC"

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<em>${values[i]}</em>` : '');
  }, '');
}
console.log(highlight`Name: ${name}, Age: ${20}`);
// "Name: <em>Tom</em>, Age: <em>20</em>"
```

### ES6 字符串新方法

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| includes | 是否包含子串 | `'hello'.includes('ell')` → true |
| startsWith | 是否以子串开头 | `'hello'.startsWith('he')` → true |
| endsWith | 是否以子串结尾 | `'hello'.endsWith('lo')` → true |
| repeat | 重复 n 次 | `'ab'.repeat(3)` → `'ababab'` |
| padStart | 头部填充至长度 | `'5'.padStart(3, '0')` → `'005'` |
| padEnd | 尾部填充至长度 | `'5'.padEnd(3, '0')` → `'500'` |

```js
// includes 可指定起始位置
'hello'.includes('l', 3); // false（从索引 3 开始找）

// pad 常用于格式化
String(42).padStart(5, '0'); // "00042"

// repeat 负数为 RangeError
// 'a'.repeat(-1); // RangeError
```

### 与旧写法对比

```js
// ES5 拼接
var old = 'Hello, ' + name + '!\nYou are ' + age + ' years old.';

// ES6 模板
const modern = `Hello, ${name}!
You are ${age} years old.`;
```

### 面试追问点

- **标签模板的应用？** styled-components、i18n 安全转义、SQL 参数化防注入。
- **模板字面量中的 this？** 插值表达式中的 `this` 遵循正常词法作用域。

---

## 24. new操作符的实现原理

**记忆口诀：「new 四步走：创对象、链原型、绑 this 执行、返对象看构造」**

**一句话回答：** `new` 执行四步：(1) 创建空对象；(2) 将对象 `__proto__` 链接到构造函数 `prototype`；(3) 执行构造函数并绑定 `this` 到新对象；(4) 若构造函数返回对象则用返回值，否则返回新对象。

### 四步流程

```
1. const obj = {}（或 Object.create(Constructor.prototype)）
2. obj.__proto__ = Constructor.prototype
3. const result = Constructor.apply(obj, args)
4. return (result !== null && typeof result === 'object') ? result : obj
```

### 手写 new

```js
function myNew(Constructor, ...args) {
  // 1 & 2：创建对象并链接原型
  const obj = Object.create(Constructor.prototype);

  // 3：执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);

  // 4：根据返回值决定返回对象
  return (result !== null && typeof result === 'object') ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const p = myNew(Person, 'Tom', 20);
console.log(p.name);           // 'Tom'
console.log(p instanceof Person); // true
p.sayHi();                     // "Hi, I'm Tom"
```

### 构造函数返回对象的特殊情况

```js
function Special() {
  this.name = 'instance';
  return { custom: 'object' }; // 返回对象 → 覆盖默认实例
}

const s = new Special();
console.log(s); // { custom: 'object' }，不是 Special 实例

function Normal() {
  this.name = 'instance';
  return 'ignored'; // 返回基本类型 → 忽略，仍返回 this
}
console.log(new Normal()); // Normal { name: 'instance' }

function ReturnNull() {
  return null; // null 不是 object → 仍返回 this
}
console.log(new ReturnNull()); // ReturnNull {}
```

### new 过程中 this 的绑定

```js
function Foo() {
  console.log(this instanceof Foo); // true
}
new Foo();

// 不用 new 调用 → this 可能是 window/undefined
// Foo(); // false 或报错（严格模式）
```

### 面试追问点

- **Object.create(null) 做第一步？** 可以创建无原型对象，但 new 标准行为是链接 Constructor.prototype。
- **箭头函数为什么不能 new？** 无 [[Construct]] 和 prototype，见第 18 题。

---

## 25. map和Object的区别

**记忆口诀：「Map 键任意类型有 size 有序迭代，Object 键字符串 Symbol 靠手动数键」**

**一句话回答：** `Map` 的键可以是**任意类型**，有 **`size` 属性**，按**插入顺序**迭代；`Object` 的键只能是 **String/Symbol**，无内置 size，顺序较复杂但现代引擎也大致按插入顺序。

### 核心对比

| 对比项 | Map | Object |
| --- | --- | --- |
| 键的类型 | 任意（含对象、函数） | String / Symbol |
| 键的顺序 | 严格插入顺序 | 整数键升序 + 字符串键插入序 + Symbol |
| 大小 | `map.size` | 需手动 `Object.keys().length` |
| 迭代 | 直接 `for...of`、`.keys()` | `Object.keys/entries/values` |
| 原型 | 无默认键，干净 | 有原型链，默认非 `null` |
| 性能 | 频繁增删更优 | 少量固定属性更轻 |
| 序列化 | 不直接 JSON.stringify | 可直接 JSON 序列化 |
| 创建 | `new Map()` | 字面量 `{}` 或 `Object.create(null)` |

### 代码示例

```js
// Map — 任意类型作键
const map = new Map();
const objKey = { id: 1 };
map.set(objKey, 'value for object key');
map.set(42, 'number key');
map.set(true, 'boolean key');
console.log(map.get(objKey)); // 'value for object key'
console.log(map.size);        // 3

// Object — 键会被 ToString
const obj = {};
obj[objKey] = 'value'; // 键变成 "[object Object]"
obj[42] = 'number';    // 键变成 "42"
console.log(Object.keys(obj)); // ["42", "[object Object]"]

// Map 迭代
for (const [key, value] of map) {
  console.log(key, value);
}

// Object 迭代
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```

### 使用场景

| 选 Map | 选 Object |
| --- | --- |
| 键是非字符串类型 | 固定结构的数据记录 |
| 频繁增删键值对 | 需要 JSON 序列化 |
| 需要准确 size | 作为 DTO/配置对象 |
| 缓存/字典/索引 | 需要原型方法 |

### 面试追问点

- **Map 的键比较？** 使用 SameValueZero（类似 `===`，但 NaN 等于 NaN）。
- **WeakMap vs Map？** 见第 26 题；Object 的键若用对象，实际是字符串化的键。

---

## 26. map和weakMap的区别

**记忆口诀：「WeakMap 键只对象，弱引用 GC 收，不可遍历无 size，DOM 私有数据用」**

**一句话回答：** `WeakMap` 的键**只能是对象**，键是**弱引用**（不阻止 GC 回收）；**不可遍历**、**无 size**；适合存储 DOM 节点关联数据、对象私有属性等不应阻止垃圾回收的场景。

### Map vs WeakMap 对比

| 对比项 | Map | WeakMap |
| --- | --- | --- |
| 键的类型 | 任意 | 只能是 Object |
| 键的引用 | 强引用 | 弱引用（可被 GC） |
| 值 | 任意 | 任意 |
| size | 有 | ❌ 无 |
| 遍历 | ✅ for...of、keys 等 | ❌ 不可遍历 |
| GC | 键不回收则 Map 不释放 | 键无其他引用时可被回收 |
| 常用场景 | 通用字典/缓存 | DOM 数据、私有属性 |

### 代码示例

```js
// WeakMap 基础
const wm = new WeakMap();
let obj = { name: 'Tom' };

wm.set(obj, 'private data');
console.log(wm.get(obj)); // 'private data'
console.log(wm.has(obj)); // true

// 弱引用 — obj 置 null 后，GC 可回收
obj = null;
// wm 中的条目会随 GC 消失（无法直接观测）

// ❌ WeakMap 键不能是基本类型
// wm.set('key', 'value'); // TypeError

// ❌ 不可遍历
// wm.size;           // undefined
// for (const x of wm) {} // TypeError
```

### 典型应用：私有数据

```js
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name, secret: 'hidden' });
  }
  getName() {
    return privateData.get(this).name;
  }
}

const user = new User('Tom');
console.log(user.getName()); // 'Tom'
// 外部无法直接访问 privateData 中的 secret
```

### 典型应用：DOM 节点关联

```js
const domData = new WeakMap();

function bindData(element, data) {
  domData.set(element, data);
}

function getData(element) {
  return domData.get(element);
}

const btn = document.querySelector('button');
bindData(btn, { clickCount: 0 });

// DOM 节点被移除且无引用时，WeakMap 条目自动 GC
```

### 弱引用原理

```
强引用（Map）：Map → 键对象 ← 其他引用
  → 即使外部不用，Map 仍持有，对象不回收

弱引用（WeakMap）：WeakMap ⇢ 键对象 ← 其他引用
  → 外部无引用时，GC 回收键对象，WeakMap 条目自动消失
```

### 面试追问点

- **WeakSet 呢？** 类似 WeakMap，成员只能是对象、弱引用、不可遍历，用于标记对象集合。
- **WeakMap 能用来做缓存吗？** 适合「对象存在则缓存，对象销毁则自动清理」；不适合需要遍历或知道 size 的场景。


## 27. JavaScript脚本延迟加载的方式有哪些？

**记忆口诀：「defer 解析完按序执行，async 加载完立即执行，动态 DOM 最灵活，底部放置最保底」**

**一句话回答：** JavaScript 延迟加载的核心目标是**不阻塞 HTML 解析和首屏渲染**，常见方式有 `defer`、`async`、动态创建 script、setTimeout 延迟，以及将脚本放在文档底部。

### 五种方式对比

| 方式 | 加载时机 | 执行时机 | 执行顺序 | 是否阻塞解析 |
| --- | --- | --- | --- | --- |
| `defer` | 与 HTML 并行下载 | DOM 解析完成后、DOMContentLoaded 前 | 按文档顺序 | 不阻塞 |
| `async` | 与 HTML 并行下载 | 下载完成立即执行 | 不保证顺序 | 执行时可能阻塞 |
| 动态创建 DOM | 自定义（如 DOMContentLoaded 后） | 插入 DOM 时 | 可控 | 不阻塞（取决于插入时机） |
| `setTimeout` 延迟 | 定时器触发后 | 定时器到期后 | 可控 | 不阻塞 |
| 底部放置 | HTML 解析到该位置 | 解析到后立即加载执行 | 按文档顺序 | 会阻塞后续解析 |

### 1. defer 属性

```html
<script defer src="app.js"></script>
```

- 脚本**异步下载**，但**延迟到 HTML 解析完毕**后再执行
- 多个 `defer` 脚本**按在文档中的顺序**依次执行
- 适合依赖 DOM 结构、且脚本之间有顺序依赖的场景（如 jQuery + 插件）

### 2. async 属性

```html
<script async src="analytics.js"></script>
```

- 脚本**异步下载**，**下载完立即执行**，不等待 HTML 解析完成
- 多个 `async` 脚本**执行顺序不可预测**
- 适合独立第三方脚本（统计、广告），彼此无依赖

### 3. 动态创建 DOM

```js
function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.onload = () => callback && callback();
  document.body.appendChild(script);
}

// 等 DOM 就绪后再加载
document.addEventListener('DOMContentLoaded', () => {
  loadScript('/js/app.js', () => console.log('loaded'));
});
```

- 完全可控：决定**何时创建、加载哪个脚本**
- 常用于按需加载、路由懒加载、条件加载

### 4. setTimeout 延迟

```js
window.addEventListener('load', () => {
  setTimeout(() => {
    const script = document.createElement('script');
    script.src = '/js/non-critical.js';
    document.body.appendChild(script);
  }, 2000);
});
```

- 利用 `load` 事件 + 定时器，进一步推迟非关键脚本
- 适合低优先级、可延后的功能（如客服浮窗）

### 5. 脚本放文档底部

```html
<body>
  <div id="app"></div>
  <!-- 放在 body 末尾，HTML 先解析完再加载 JS -->
  <script src="app.js"></script>
</body>
```

- 最传统、最兼容的方案
- 缺点：所有脚本仍串行下载，无法利用并行下载优势

### defer vs async 速记

```
defer = 下载并行 + 执行延后 + 保顺序  →  业务主脚本
async = 下载并行 + 执行立即 + 乱顺序  →  独立第三方脚本
```

### 面试追问点

- **为什么 `<script>` 默认会阻塞？** 因为 JS 可能通过 `document.write` 修改 DOM，浏览器必须等脚本下载并执行完才能继续解析。
- **defer 和 DOMContentLoaded 谁先？** 规范上 `defer` 脚本在 `DOMContentLoaded` 之前执行；若页面无 defer 脚本，则 DOMContentLoaded 更早触发。
- **现代最佳实践？** 关键脚本用 `defer` 或 ES Module（`<script type="module">` 默认 defer）；非关键脚本用 `async` 或动态 import。

---

## 28. JavaScript 类数组对象的定义？

**记忆口诀：「有 length 有索引，没有数组方法；arguments、NodeList、字符串，转真数组三件套」**

**一句话回答：** 类数组对象是**拥有 `length` 属性和按索引访问元素能力，但不具备数组原型方法**的对象，需要通过转换才能调用 `map`、`forEach` 等数组方法。

### 类数组 vs 真数组

| 对比项 | 类数组对象 | 真数组 |
| --- | --- | --- |
| `length` 属性 | ✅ 有 | ✅ 有 |
| 数字索引访问 | ✅ 有 | ✅ 有 |
| `Array.isArray()` | ❌ false | ✅ true |
| 原型链 | `Object.prototype` | `Array.prototype` |
| 数组方法（map/filter 等） | ❌ 不可用 | ✅ 可用 |
| `for...of` 遍历 | 部分可以（需 iterable） | ✅ 可以 |

### 常见的类数组对象

**1. `arguments` 对象**

```js
function sum() {
  console.log(arguments); // { '0': 1, '1': 2, '2': 3, length: 3 }
  console.log(Array.isArray(arguments)); // false
}
sum(1, 2, 3);
```

**2. DOM 集合**

```js
const divs = document.querySelectorAll('div'); // NodeList
const items = document.getElementsByClassName('item'); // HTMLCollection（Live 集合）
console.log(divs.length); // 可以按索引访问 divs[0]
console.log(typeof divs.map); // undefined
```

**3. 字符串**

```js
const str = 'hello';
console.log(str.length); // 5
console.log(str[0]);     // 'h'
console.log(Array.isArray(str)); // false
```

**4. 手动构造的类数组**

```js
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
```

### 类数组转真数组的四种方式

```js
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };

// 方式1：Array.from（推荐，ES6）
Array.from(arrayLike); // ['a', 'b', 'c']

// 方式2：展开运算符（需 iterable 或先转数组）
[...Array.from(arrayLike)];

// 方式3：Array.prototype.slice.call
Array.prototype.slice.call(arrayLike); // ['a', 'b', 'c']

// 方式4：Array.prototype.concat.apply
Array.prototype.concat.apply([], arrayLike); // ['a', 'b', 'c']
```

### 各转换方式对比

| 方法 | ES 版本 | 能否处理 Set/Map | 备注 |
| --- | --- | --- | --- |
| `Array.from()` | ES6 | ✅ | 最推荐，支持映射函数 |
| `[...spread]` | ES6 | ✅（需 iterable） | 简洁，但纯类数组需先满足 iterable |
| `slice.call()` | ES3 | ❌ | 经典兼容写法 |
| `concat.apply()` | ES3 | ❌ | 较少使用 |

### 面试追问点

- **HTMLCollection 和 NodeList 的区别？** HTMLCollection 是**Live 集合**（DOM 变化时自动更新），NodeList 通常是**Static 集合**（`querySelectorAll` 返回的）。
- **为什么不用 `Array.prototype.slice = (arr) => ...` 全局污染？** 应使用 `call/apply` 借用方法，避免修改原型。
- **`Array.from` 的第二个参数？** 可传映射函数，相当于 `[...arr].map(fn)`：`Array.from(arrayLike, x => x.toUpperCase())`。

---

## 29. 为什么函数的 arguments 参数是类数组而不是数组？如何遍历类数组?

**记忆口诀：「arguments 是 Arguments 对象，有 length 有 callee，没数组方法；for 循环、Array.from、展开运算符三法遍历」**

**一句话回答：** `arguments` 是函数内部的**类数组对象**（非数组），设计上为了兼容早期 JS 且避免与数组方法冲突；遍历可通过 `for` 循环、`Array.from`、展开运算符，或借用数组方法实现。

### 为什么不是数组？

| 原因 | 说明 |
| --- | --- |
| 历史设计 | ES3 时代尚无 Array 方法，`arguments` 作为函数内部专用对象存在 |
| 性能考虑 | 每次函数调用动态创建，若为标准数组会继承大量原型方法，开销更大 |
| 语义不同 | `arguments` 反映**实参列表**，长度随调用变化，与数组语义有差异 |
| 特殊属性 | 拥有 `callee`（严格模式下不可用）、与形参存在映射关系 |

### arguments 对象特性

```js
function foo(a, b) {
  console.log(arguments.length);  // 实参个数
  console.log(arguments[0]);      // 第一个实参
  console.log(arguments.callee);  // 当前函数自身（非严格模式）
  console.log(arguments === a);   // 形参与 arguments 映射（非严格模式）
}

foo(1, 2, 3);
// arguments: { '0': 1, '1': 2, '2': 3, length: 3 }
// 注意：第三个参数 3 在 arguments 中，但没有对应形参 b 之外的映射
```

> **注意：** 严格模式下 `arguments.callee` 不可访问；箭头函数**没有**自己的 `arguments`，继承外层作用域的。

### 如何遍历类数组

**方法一：for 循环（最基础）**

```js
function foo() {
  for (let i = 0; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
}
```

**方法二：Array.from 转数组后遍历**

```js
function foo() {
  const args = Array.from(arguments);
  args.forEach(arg => console.log(arg));
}
```

**方法三：展开运算符**

```js
function foo() {
  const args = [...arguments];
  args.forEach(arg => console.log(arg));
}
```

**方法四：借用数组方法（call/apply）**

```js
function foo() {
  Array.prototype.forEach.call(arguments, arg => console.log(arg));
}
```

### 现代替代方案：Rest 参数

```js
// ES6 推荐写法，直接得到真数组
function foo(...args) {
  args.forEach(arg => console.log(arg));
  console.log(Array.isArray(args)); // true
}
```

### 面试追问点

- **箭头函数有 arguments 吗？** 没有，箭头函数不绑定 `arguments`，需用 rest 参数 `...args`。
- **严格模式下形参与 arguments 的关系？** 不再同步映射，修改形参不影响 `arguments`。
- **为什么不推荐用 arguments.callee？** 严格模式禁用；且递归应使用函数名或命名函数表达式，避免 callee 的性能和优化问题。

---

## 30. 什么是 DOM 和 BOM？

**记忆口诀：「DOM 管文档内容（document），BOM 管浏览器窗口（window）；DOM 是 BOM 的子集」**

**一句话回答：** **DOM**（Document Object Model）是操作**文档内容**的 API，根对象是 `document`；**BOM**（Browser Object Model）是操作**浏览器窗口和环境**的 API，根对象是 `window`，DOM 是 BOM 的一部分。

### DOM vs BOM 对比

| 对比项 | DOM | BOM |
| --- | --- | --- |
| 全称 | Document Object Model | Browser Object Model |
| 操作对象 | HTML/XML 文档 | 浏览器窗口 |
| 根对象 | `document` | `window` |
| 标准化 | W3C 标准 | 无统一标准，各浏览器实现 |
| 典型 API | 元素增删改查、事件 | 导航、定时器、对话框、屏幕信息 |
| 关系 | BOM 的子集 | 包含 DOM |

### DOM 核心概念

DOM 将 HTML 文档解析为**树形结构**，每个节点都是对象，可通过 JS 操作：

```js
// DOM 常见操作入口
document.getElementById('app');
document.querySelector('.title');
document.createElement('div');
element.addEventListener('click', handler);
```

**DOM 树结构：**

```
Document
  └── html
       ├── head
       │    └── title
       └── body
            └── div#app
                 └── p
```

### BOM 核心对象

```js
window.location.href;    // 当前 URL
window.navigator.userAgent; // 浏览器信息
window.history.back();   // 历史记录
window.screen.width;   // 屏幕宽度
window.alert('hello'); // 弹窗
window.setTimeout(fn, 1000); // 定时器
```

### 层级关系

```
window（BOM 顶层，也是全局对象）
  ├── document（DOM 根节点）
  ├── location
  ├── navigator
  ├── history
  ├── screen
  ├── localStorage / sessionStorage
  └── setTimeout / setInterval / ...
```

```js
console.log(window.document === document); // true
console.log(window === window.window);   // true

// 全局变量是 window 的属性
var a = 1;
console.log(window.a); // 1
```

### 面试追问点

- **DOM 是标准吗？** 是的，由 W3C 制定；BOM 没有统一标准，但 `window` 及其子对象的 API 已被事实标准化。
- **Node.js 有 DOM/BOM 吗？** 没有原生 DOM/BOM，但可通过 jsdom 等库模拟。
- **document 和 window 的区别？** `window` 代表浏览器窗口和全局环境；`document` 代表窗口中加载的 HTML 文档，是 `window` 的一个属性。

---

## 31. 对AJAX的理解，实现一个AJAX请求

**记忆口诀：「AJAX 异步通信不刷新，XHR 四步走：创建 open 监听 send；readyState 0-4 记清楚」**

**一句话回答：** AJAX（Asynchronous JavaScript And XML）是一种**无需刷新整个页面**即可与服务器交换数据并更新部分页面的技术，浏览器端主要通过 `XMLHttpRequest` 对象实现。

### AJAX 核心流程

| 步骤 | 操作 | 说明 |
| --- | --- | --- |
| 1 | `new XMLHttpRequest()` | 创建请求对象 |
| 2 | `xhr.open(method, url, async)` | 初始化请求（方法、地址、是否异步） |
| 3 | 设置 `onreadystatechange` / 事件监听 | 监听状态变化 |
| 4 | `xhr.send(data)` | 发送请求 |

### readyState 状态码

| readyState | 状态 | 含义 |
| --- | --- | --- |
| 0 | UNSENT | 已创建，未调用 open |
| 1 | OPENED | 已调用 open |
| 2 | HEADERS_RECEIVED | 已收到响应头 |
| 3 | LOADING | 正在下载响应体 |
| 4 | DONE | 请求完成 |

### 原生 AJAX 实现

```js
const SERVER_URL = '/api/user';

function ajaxGet(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      console.log('成功:', data);
    } else {
      console.error('失败:', xhr.statusText);
    }
  };

  xhr.onerror = function () {
    console.error('网络错误');
  };

  xhr.responseType = 'json'; // 可选，自动解析 JSON
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(null);
}

ajaxGet(SERVER_URL);
```

### Promise 封装版

```js
function request(url, options = {}) {
  const { method = 'GET', data = null, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = 'json';

    Object.entries(headers).forEach(([key, val]) => {
      xhr.setRequestHeader(key, val);
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network Error'));
    xhr.send(data ? JSON.stringify(data) : null);
  });
}

// 使用
request('/api/user')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### 面试追问点

- **AJAX 的缺点？** 回调地狱、XHR API 繁琐、跨域需 CORS 或 JSONP、无原生请求取消（XHR2 有 abort）。
- **同源策略是什么？** 协议、域名、端口三者相同才为同源；跨域请求需服务端 CORS 响应头。
- **现代替代方案？** `fetch` API、axios 库，基于 Promise，API 更简洁。

---

## 32. JavaScript为什么要进行变量提升，它导致了什么问题？

**记忆口诀：「编译预解析提 var 和函数声明，为性能也为容错；let const 有 TDZ，覆盖和泄漏是隐患」**

**一句话回答：** 变量提升是 JS 引擎在**执行前预编译阶段**将 `var` 声明和函数声明「提升」到作用域顶部的机制，目的是**提高性能和容错性**，但会导致变量覆盖、暂时性困惑等问题；`let/const` 虽有提升但存在 TDZ 限制。

### 什么是变量提升

```js
console.log(a); // undefined（不是 ReferenceError）
var a = 1;

foo(); // 'hello'（函数声明整体提升）
function foo() { console.log('hello'); }
```

**本质：** JS 执行分**编译（创建执行上下文）**和**执行**两阶段。编译阶段会在作用域中注册变量和函数，var 初始化为 `undefined`，函数声明则完整提升。

### 提升规则对比

| 声明方式 | 是否提升 | 提升内容 | 声明前访问 |
| --- | --- | --- | --- |
| `var` | ✅ | 变量名，值 undefined | 得到 undefined |
| 函数声明 | ✅ | 整个函数 | 可正常调用 |
| `let` | ✅（声明感知） | 变量名，未初始化 | ReferenceError（TDZ） |
| `const` | ✅（声明感知） | 变量名，未初始化 | ReferenceError（TDZ） |
| 函数表达式 | 仅 var 部分 | 同 var | 同 var |

### 为什么要变量提升

**1. 提高性能**

- 编译阶段一次性完成词法分析、作用域注册、函数预编译
- 执行阶段可直接分配栈空间，无需重复解析
- 函数体会被压缩（去注释、空白），执行更快

**2. 提高容错性**

```js
a = 1;
var a;
console.log(a); // 1 — 若没提升，第一行就报错
```

复杂项目中可能先使用后声明，提升机制让代码仍能运行。

### 导致的问题

**问题1：变量覆盖 / 意外 undefined**

```js
var tmp = new Date();

function fn() {
  console.log(tmp); // undefined，不是外层 Date
  if (false) {
    var tmp = 'hello world'; // var 提升到函数顶部
  }
}
fn();
```

**问题2：循环变量泄漏到全局**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出 3 3 3（i 提升到全局，循环结束后 i === 3）
```

**问题3：函数声明提升覆盖**

```js
foo(); // 'second'
function foo() { console.log('first'); }
function foo() { console.log('second'); }
// 同名函数声明，后者覆盖前者
```

**问题4：let/const 的暂时性死区（TDZ）**

```js
console.log(bar); // ReferenceError
let bar = 3;
// 从块级作用域开始到 let 声明之间，bar 处于 TDZ
```

### 编译 vs 执行示意

```
源代码
  ↓ 编译阶段（创建执行上下文）
  → 注册 var → undefined
  → 注册函数声明 → 完整函数
  → 注册 let/const → 未初始化（TDZ）
  ↓ 执行阶段
  → 逐行赋值、调用
```

### 面试追问点

- **let 有提升吗？** 有，称为「声明提升」或「暂时性死区前的绑定」，但赋值不提升，TDZ 内访问报错。
- **函数表达式会提升吗？** `var fn = function(){}` 只提升 `fn` 变量（undefined），函数体不提升。
- **如何避免 var 的问题？** 使用 `let/const`、避免在块内用 `var`、循环闭包用 `let` 或 IIFE。

---

## 33. ES6模块与CommonJS模块有什么异同？

**记忆口诀：「ESM 编译静态，CJS 运行动态；ESM 输出引用，CJS 输出拷贝；Tree-shaking 只有 ESM」**

**一句话回答：** ESM（`import/export`）在**编译时**静态确定依赖，输出**值引用**，支持 Tree-shaking；CommonJS（`require/module.exports`）在**运行时**动态加载，输出**值拷贝**，同步加载。

### 核心对比表

| 对比维度 | ESM (import/export) | CommonJS (require/module.exports) |
| --- | --- | --- |
| 加载时机 | **编译时**静态分析 | **运行时**动态加载 |
| 加载方式 | 异步（浏览器）/ 同步（Node） | 同步（本地文件） |
| 输出形式 | 值的**实时绑定（引用）** | 值的**浅拷贝** |
| 能否修改导出 | ❌ 只读绑定 | ✅ 可修改（不影响已 require 的） |
| Tree-shaking | ✅ 支持 | ❌ 不支持 |
| 循环引用 | 通过 live binding 处理 | 可能拿到未完成导出的值 |
| this 指向 | `undefined` | 当前模块对象 |
| 条件加载 | ❌ 必须顶层 | ✅ `if` 内 require |
| 动态路径 | ❌ 静态路径 | ✅ 变量作路径 |

### ESM 示例

```js
// math.js
export const count = 1;
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { count, add } from './math.js';
console.log(add(1, 2)); // 3
```

### CommonJS 示例

```js
// math.js
let count = 1;
function add(a, b) { return a + b; }
module.exports = { count, add };

// app.js
const { count, add } = require('./math');
console.log(add(1, 2)); // 3
```

### 值引用 vs 值拷贝

```js
// CommonJS — 拷贝
// counter.js
let count = 1;
module.exports = { count };

// app.js
const { count } = require('./counter');
count = 2; // 修改的是本地拷贝，不影响原模块

// ESM — 引用
// counter.js
export let count = 1;

// app.js
import { count } from './counter.js';
// count = 2; // SyntaxError，不能修改导入的绑定
// 但 counter.js 中 count++ 后，app.js 读到的是新值
```

### ESM 执行三阶段

1. **解析（Parsing）**：静态分析 import/export，建立依赖图
2. **链接（Linking）**：创建模块作用域，建立导入导出绑定
3. **求值（Evaluation）**：按依赖深度优先执行，每模块只执行一次

### Tree-shaking 原理

- ESM 的静态结构让打包工具（Webpack/Rollup）能在编译期标记未使用的导出
- CJS 需运行后才知道依赖关系，无法可靠删除 dead code

### 面试追问点

- **Node.js 支持 ESM 吗？** 支持，`.mjs` 扩展名或 `package.json` 中 `"type": "module"`。
- **ESM 中没有 `__dirname`？** 需通过 `import.meta.url` + `fileURLToPath` 获取。
- **能否混用？** 可以但不推荐；CJS 中可用动态 `import()` 加载 ESM。

---

## 34. 常见的DOM操作有哪些

**记忆口诀：「查 get/query，增 create/append，删 remove，改 innerHTML/attribute/style」**

**一句话回答：** DOM 操作分为四大类：**查询**（获取元素）、**创建/增加**（插入节点）、**删除**（移除节点）、**修改**（内容、属性、样式）。

### DOM 操作分类总览

| 类别 | 常用 API | 说明 |
| --- | --- | --- |
| 查询 | `getElementById`、`querySelector`、`querySelectorAll` | 获取 DOM 节点 |
| 创建/增加 | `createElement`、`appendChild`、`insertBefore` | 创建并插入节点 |
| 删除 | `removeChild`、`remove()` | 移除节点 |
| 修改 | `innerHTML`、`textContent`、`setAttribute`、`style` | 改内容/属性/样式 |

### 1. DOM 节点查询

```js
// 按 id（返回单个元素）
const app = document.getElementById('app');

// 按标签名（返回 HTMLCollection，Live 集合）
const ps = document.getElementsByTagName('p');

// 按类名（返回 HTMLCollection）
const items = document.getElementsByClassName('item');

// CSS 选择器（推荐）
const first = document.querySelector('.title');       // 第一个匹配
const all = document.querySelectorAll('.item');       // 所有匹配（NodeList）
```

### 2. DOM 节点创建与插入

```js
// 创建元素
const span = document.createElement('span');
span.textContent = 'hello world';
span.className = 'tag';

// 追加到末尾
document.getElementById('container').appendChild(span);

// 插入到指定元素之前
const title = document.getElementById('title');
document.getElementById('container').insertBefore(span, title);

// ES5+ 便捷方法
parent.append(span, 'text node');           // 末尾追加
parent.prepend(span);                       // 开头插入
target.before(newNode);                     // 目标之前
target.after(newNode);                      // 目标之后
target.replaceWith(newNode);                // 替换目标
```

### 3. DOM 节点删除

```js
// 方式1：父节点 removeChild
const parent = document.getElementById('container');
const child = document.getElementById('title');
parent.removeChild(child);

// 方式2：节点自身 remove（现代浏览器）
document.getElementById('title').remove();
```

### 4. DOM 节点修改

```js
const el = document.getElementById('content');

// 修改内容
el.innerHTML = '<strong>加粗</strong>';  // 解析 HTML（有 XSS 风险）
el.textContent = '纯文本';              // 不解析 HTML，更安全

// 修改属性
el.setAttribute('data-id', '123');
el.getAttribute('data-id');
el.removeAttribute('data-id');

// 修改样式
el.style.color = 'red';
el.style.fontSize = '16px';
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('active');
```

### 5. 节点位置交换

```js
const container = document.getElementById('container');
const title = document.getElementById('title');
const content = document.getElementById('content');

// 将 content 移到 title 前面
container.insertBefore(content, title);
```

### 查询 API 对比

| API | 返回类型 | 是否 Live | 性能 | 推荐度 |
| --- | --- | --- | --- | --- |
| `getElementById` | Element | - | 快 | ⭐⭐⭐ |
| `getElementsByClassName` | HTMLCollection | ✅ Live | 中 | ⭐⭐ |
| `querySelector` | Element / null | - | 中 | ⭐⭐⭐ |
| `querySelectorAll` | NodeList | ❌ Static | 中 | ⭐⭐⭐ |

### 面试追问点

- **innerHTML vs textContent？** `innerHTML` 解析 HTML 标签，有 XSS 风险；`textContent` 只设纯文本，更安全。
- **DocumentFragment 的作用？** 批量 DOM 操作先放入 DocumentFragment，再一次性插入，减少回流重绘。
- **什么是回流和重绘？** 修改布局触发回流（Reflow），只改外观触发重绘（Repaint）；回流代价更高。

---

## 35. for...in和for...of的区别

**记忆口诀：「in 拿 key（键名），of 拿 value（键值）；in 爬原型链，of 需 iterable」**

**一句话回答：** `for...in` 遍历对象的**可枚举键名**（含原型链），适合对象；`for...of` 遍历 **iterable 对象的值**，适合数组、Map、Set、字符串等。

### 核心对比

| 对比项 | for...in | for...of |
| --- | --- | --- |
| 遍历内容 | 键名（key） | 值（value） |
| 适用对象 | 普通对象 | 实现了 iterable 的对象 |
| 是否遍历原型链 | ✅ 会 | ❌ 不会 |
| 数组遍历 | 返回索引字符串 | 返回元素值 |
| 能否 break/continue | ✅ | ✅ |
| 推荐用于数组 | ❌ 不推荐 | ✅ 推荐 |

### for...in 示例

```js
const obj = { a: 1, b: 2, c: 3 };

for (const key in obj) {
  console.log(key, obj[key]);
}
// a 1, b 2, c 3

// 数组用 for...in 的问题
const arr = [10, 20, 30];
arr.custom = 'extra';

for (const key in arr) {
  console.log(key); // '0', '1', '2', 'custom' — 包含非索引属性
}
```

### for...of 示例

```js
const arr = [10, 20, 30];
for (const value of arr) {
  console.log(value); // 10, 20, 30
}

const str = 'hello';
for (const char of str) {
  console.log(char); // h, e, l, l, o
}

const map = new Map([['a', 1], ['b', 2]]);
for (const [key, val] of map) {
  console.log(key, val); // a 1, b 2
}
```

### 遍历对象时的选择

```js
const obj = { x: 1, y: 2 };

// ❌ 普通对象不能直接 for...of
// for (const v of obj) {} // TypeError

// ✅ 对象用 for...in + hasOwnProperty
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key, obj[key]);
  }
}

// ✅ 或 Object.keys/values/entries + for...of
for (const key of Object.keys(obj)) {
  console.log(key, obj[key]);
}
```

### 可迭代协议（Iterable）

`for...of` 要求对象实现 `Symbol.iterator` 方法，返回 iterator 对象（含 `next()` 方法）：

```js
// 内置 iterable：Array、String、Map、Set、arguments、NodeList
const set = new Set([1, 2, 3]);
for (const val of set) {
  console.log(val);
}
```

### 面试追问点

- **for...in 为什么不适合数组？** 遍历顺序不保证、会遍历原型链属性、索引是字符串。
- **Object.keys vs for...in？** `Object.keys` 只返回**自有可枚举**属性，不含原型链。
- **forEach vs for...of？** `for...of` 可用 `break/continue/return`；`forEach` 不行。

---

## 36. 如何使用for...of遍历对象

**记忆口诀：「对象默认不 iterable，手动加 Symbol.iterator，或 keys/values/entries 配合 of」**

**一句话回答：** 普通对象默认没有 `Symbol.iterator`，不能直接 `for...of`；可通过**手动实现迭代器**、**Object.keys/values/entries()** 或**生成器函数**三种方式遍历。

### 为什么不能直接 for...of

```js
const obj = { a: 1, b: 2, c: 3 };
for (const val of obj) {} // TypeError: obj is not iterable
```

对象不是 iterable，缺少 `[Symbol.iterator]` 方法。

### 方案对比

| 方案 | 适用场景 | 遍历内容 | 复杂度 |
| --- | --- | --- | --- |
| `Object.keys/values/entries` + for...of | 最常用 | key / value / [key,value] | 低 |
| 手动实现 `[Symbol.iterator]` | 自定义迭代逻辑 | 自定义 | 中 |
| 生成器函数 `function*` | 灵活、可读性好 | 自定义 | 中 |
| 类数组对象转数组 | `{0:'a', length:1}` | 值 | 低 |

### 方案一：Object.keys / values / entries（推荐）

```js
const obj = { a: 1, b: 2, c: 3 };

// 遍历键名
for (const key of Object.keys(obj)) {
  console.log(key, obj[key]); // a 1, b 2, c 3
}

// 遍历值
for (const value of Object.values(obj)) {
  console.log(value); // 1, 2, 3
}

// 同时遍历键值
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value); // a 1, b 2, c 3
}
```

### 方案二：手动添加 Symbol.iterator

```js
const obj = { a: 1, b: 2, c: 3 };

obj[Symbol.iterator] = function () {
  const keys = Object.keys(this);
  let index = 0;
  const self = this;

  return {
    next() {
      if (index < keys.length) {
        return { value: self[keys[index++]], done: false };
      }
      return { value: undefined, done: true };
    }
  };
};

for (const val of obj) {
  console.log(val); // 1, 2, 3
}
```

### 方案三：生成器函数

```js
const obj = { a: 1, b: 2, c: 3 };

obj[Symbol.iterator] = function* () {
  const keys = Object.keys(this);
  for (const key of keys) {
    yield [key, this[key]];
  }
};

for (const [key, value] of obj) {
  console.log(key, value); // a 1, b 2, c 3
}
```

### 方案四：类数组对象先转数组

```js
const arrayLike = { 0: 'one', 1: 'two', length: 2 };

for (const val of Array.from(arrayLike)) {
  console.log(val); // one, two
}
```

### 迭代器协议回顾

```js
// 任何 iterable 必须实现：
obj[Symbol.iterator] = function () {
  return {
    next() {
      // 返回 { value: any, done: boolean }
      // done === true 时迭代结束
    }
  };
};
```

### 面试追问点

- **Object.keys 会遍历原型链吗？** 不会，只返回**自有可枚举**属性。
- **Map 可以直接 for...of 吗？** 可以，Map 原生实现了 iterable，遍历 `[key, value]` 对。
- **Reflect.ownKeys vs Object.keys？** `Reflect.ownKeys` 还包含 Symbol 键和不可枚举属性。

---

## 37. ajax、axios、fetch的区别

**记忆口诀：「AJAX 是思想，XHR 是实现；fetch 原生 Promise 替代 XHR；axios 是封装最佳实践」**

**一句话回答：** AJAX 是一种**异步通信思想**，XHR 是其经典实现；`fetch` 是浏览器**原生 Promise API**；`axios` 是基于 Promise 的**第三方 HTTP 客户端**，功能更完善。

### 三者关系

```
AJAX（概念/思想）
  ├── XMLHttpRequest（传统原生实现）
  ├── fetch（现代原生 API，WHATWG 标准）
  └── axios（第三方封装，底层用 XHR/fetch）
```

### 核心对比表

| 对比项 | AJAX (XHR) | fetch | axios |
| --- | --- | --- | --- |
| 定位 | 思想 + XHR 实现 | 浏览器原生 API | 第三方库 |
| 基于 | 事件回调 | Promise | Promise |
| 语法 | 繁琐 | 简洁 | 最简洁 |
| 请求/响应拦截 | ❌ | ❌ | ✅ |
| 自动 JSON 转换 | ❌ 手动 | ❌ 手动 `.json()` | ✅ |
| 取消请求 | `xhr.abort()` | `AbortController` | `CancelToken`/AbortController |
| 超时控制 | `xhr.timeout` | 需手动实现 | ✅ 内置 |
| 进度监听 | ✅ | ❌ | ✅（浏览器端） |
| 错误处理 | 需判断 status | 404/500 不 reject | 4xx/5xx 可 reject |
| Node.js | ❌ | ✅（18+ 原生） | ✅ |
| credentials | `withCredentials` | `credentials` 选项 | 配置项 |

### fetch 示例

```js
fetch('/api/user', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'same-origin', // omit | same-origin | include
  signal: abortController.signal
})
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// 取消请求
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal });
controller.abort();
```

### axios 示例

```js
const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
});

// 请求拦截
instance.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截
instance.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err)
);

const data = await instance.get('/user');
```

### fetch 的坑

```js
// 1. 404/500 不会 reject，需手动判断
fetch('/404').then(res => {
  if (!res.ok) throw new Error(res.status);
});

// 2. 默认不带 cookie（跨域），需设置 credentials
fetch(url, { credentials: 'include' });

// 3. 不支持超时，需 AbortController + setTimeout 组合
function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
}
```

### 面试追问点

- **fetch 是 ES6 的吗？** 不是，它是 **WHATWG Fetch API**，不属于 ECMAScript 规范。
- **axios 底层用什么？** 浏览器端用 XHR，Node.js 端用 http 模块。
- **什么时候选 fetch vs axios？** 简单请求用 fetch；需要拦截器、超时、自动 JSON、取消等工程化能力用 axios。

---

## 38. 数组的遍历方法有哪些

**记忆口诀：「for 家族基础遍历，高阶方法 map/filter/reduce 做转换，some/every/find 做判断」**

**一句话回答：** 数组遍历分为**传统循环**（for、for...of、for...in）和**高阶方法**（forEach、map、filter、reduce、some、every、find 等），大多数高阶方法**不改变原数组**。

### 遍历方法总览

| 方法 | 返回值 | 改变原数组 | 能否 break | 用途 |
| --- | --- | :---: | :---: | --- |
| `for` | - | - | ✅ | 最灵活的基础循环 |
| `for...of` | - | - | ✅ | 遍历元素值 |
| `for...in` | - | - | ✅ | ❌ 不推荐用于数组 |
| `forEach` | `undefined` | ❌ | ❌ | 执行副作用 |
| `map` | 新数组 | ❌ | ❌ | 映射转换 |
| `filter` | 新数组 | ❌ | ❌ | 条件筛选 |
| `reduce` | 累计值 | ❌ | ❌ | 归约聚合 |
| `some` | `boolean` | ❌ | ✅ | 是否存在满足条件的 |
| `every` | `boolean` | ❌ | ✅ | 是否全部满足条件 |
| `find` | 元素/undefined | ❌ | ✅ | 找第一个匹配元素 |
| `findIndex` | 索引/-1 | ❌ | ✅ | 找第一个匹配索引 |
| `sort` | 原数组（排序后） | ✅ | ❌ | 排序 |

### 代码示例

```js
const arr = [1, 2, 3, 4, 5];

// forEach — 副作用，无返回值
arr.forEach(item => console.log(item * 2));

// map — 映射为新数组
const doubled = arr.map(item => item * 2); // [2, 4, 6, 8, 10]

// filter — 筛选
const evens = arr.filter(item => item % 2 === 0); // [2, 4]

// reduce — 归约
const sum = arr.reduce((acc, cur) => acc + cur, 0); // 15

// some / every — 布尔判断
arr.some(item => item > 4);  // true
arr.every(item => item > 0); // true

// find / findIndex
arr.find(item => item > 3);      // 4
arr.findIndex(item => item > 3); // 3

// for...of
for (const item of arr) {
  if (item === 3) break;
  console.log(item);
}
```

### 会改变原数组的方法（非遍历但常一起考）

| 方法 | 作用 |
| --- | --- |
| `push/pop/shift/unshift` | 增删元素 |
| `splice` | 增删改 |
| `sort/reverse` | 排序/反转 |
| `fill/copyWithin` | 填充/复制 |

### 选择指南

```
需要新数组     → map / filter
需要聚合结果   → reduce
需要判断存在   → some / every / find
只需副作用     → forEach
需要提前退出   → for / for...of / some / every / find
```

### 面试追问点

- **forEach 能用 return 跳出吗？** 不能，`return` 只跳出当前回调，相当于 `continue`。
- **map 和 forEach 性能？** 差异极小，按语义选择即可。
- **reduce 能做什么？** 求和、扁平化、分组、管道函数、实现 map/filter 等。

---

## 39. forEach和map方法有什么区别

**记忆口诀：「forEach 无返回做副作用，map 返新数组做转换；都不能 break，map 能链式」**

**一句话回答：** `forEach` **无返回值**（`undefined`），用于执行副作用；`map` **返回新数组**，用于数据映射转换；两者都**不改变原数组**，都**不能用 break 跳出**。

### 核心对比

| 对比项 | forEach | map |
| --- | --- | --- |
| 返回值 | `undefined` | 新数组（等长） |
| 是否改变原数组 | ❌ 不直接改变 | ❌ 不改变 |
| 用途 | 遍历执行副作用 | 数据映射/转换 |
| 链式调用 | ❌ | ✅ |
| break/return 跳出 | ❌ | ❌ |
| 回调参数 | (item, index, array) | (item, index, array) |
| 跳过元素 | ❌ 不能（无 continue） | ❌ 不能 |

### 代码对比

```js
const arr = [1, 2, 3];

// forEach — 副作用，返回 undefined
const result1 = arr.forEach(item => console.log(item * 2));
console.log(result1); // undefined

// map — 转换，返回新数组
const result2 = arr.map(item => item * 2);
console.log(result2); // [2, 4, 6]
console.log(arr);     // [1, 2, 3] 原数组不变
```

### 典型使用场景

```js
// forEach — DOM 操作、打印日志、发送请求
users.forEach(user => {
  renderUserCard(user);
});

// map — 数据转换、提取字段、格式化
const names = users.map(user => user.name);
const html = items.map(item => `<li>${item}</li>`).join('');
```

### map 链式调用

```js
const result = [1, 2, 3, 4, 5]
  .map(n => n * 2)       // [2, 4, 6, 8, 10]
  .filter(n => n > 5)    // [6, 8, 10]
  .reduce((sum, n) => sum + n, 0); // 24

// forEach 无法链式，因为返回 undefined
```

### 常见误区

```js
// ❌ 错误：用 forEach 收集结果
const result = [];
[1, 2, 3].forEach(n => result.push(n * 2)); // 应直接用 map

// ❌ 错误：用 map 但不使用返回值
[1, 2, 3].map(n => console.log(n)); // 应使用 forEach

// ❌ 错误：试图用 return 跳出
[1, 2, 3].forEach(n => {
  if (n === 2) return; // 只跳过本次回调，不会停止整个循环
  console.log(n);
});
// 输出 1, 3（2 被跳过但循环继续）
```

### 面试追问点

- **能用 forEach 实现 map 吗？** 可以，需外部数组 push，但没有 map 简洁。
- **空数组调用？** 两者都不执行回调，map 返回 `[]`，forEach 返回 `undefined`。
- **需要提前退出用什么？** `for`、`for...of`、`some`（找到即停）、`every`（不满足即停）。

---

## 40. 对原型、原型链的理解

**记忆口诀：「函数有 prototype，对象有 __proto__，链条向上找，null 是终点」**

**一句话回答：** 每个**函数**有 `prototype`（显式原型），每个**对象**有 `__proto__`（隐式原型，即 `[[Prototype]]`）；访问属性时沿 `__proto__` 向上查找的链路就是**原型链**，终点是 `null`。

### 核心概念

| 概念 | 归属 | 说明 |
| --- | --- | --- |
| `prototype` | 函数 | 显式原型，指向原型对象，供实例共享属性和方法 |
| `__proto__` | 对象 | 隐式原型（`[[Prototype]]`），指向创建它的构造函数的 prototype |
| 原型链 | 对象 | 属性查找链路，沿 `__proto__` 向上直到 `null` |
| `constructor` | 原型对象 | 默认指向关联的构造函数 |

### 原型关系图

```
实例 p ──__proto__──→ Person.prototype ──__proto__──→ Object.prototype ──__proto__──→ null
                          ↑
                    Person.prototype
                          ↑
                    Person (构造函数)
```

### 代码示例

```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  console.log(`Hi, I'm ${this.name}`);
};

const p = new Person('Alice');

// 原型关系验证
console.log(p.__proto__ === Person.prototype);           // true
console.log(Person.prototype.constructor === Person);    // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null);         // true

p.sayHi(); // Hi, I'm Alice — 自身没有 sayHi，沿原型链找到
```

### 属性查找机制

```js
const p = new Person('Alice');
p.name;    // 1. 自身属性 → 找到 'Alice'
p.sayHi;   // 2. Person.prototype → 找到函数
p.toString; // 3. Object.prototype → 找到方法
p.notExist; // 4. null → undefined
```

查找顺序：**自身 → 一层原型 → ... → Object.prototype → null**

### 原型的作用

1. **实现继承**：子类 prototype 指向父类实例或原型
2. **方法共享**：所有实例共享 prototype 上的方法，节省内存
3. **扩展内置类型**（不推荐）：`Array.prototype.myMethod = fn`

### 标准 API

```js
// 推荐用标准 API 代替 __proto__
Object.getPrototypeOf(p);        // 获取原型
Object.setPrototypeOf(obj, proto); // 设置原型
p instanceof Person;             // 检测原型链
```

### 面试追问点

- **__proto__ 和 [[Prototype]] 的关系？** 同一概念，`__proto__` 是访问 `[[Prototype]]` 的遗留方式，标准 API 是 `Object.getPrototypeOf`。
- **所有对象都有原型吗？** `Object.create(null)` 创建的对象没有原型。
- **Function 的特殊性？** `Function.__proto__ === Function.prototype`，`Function.prototype` 也是对象，其 `__proto__` 指向 `Object.prototype`。

---

## 41. 原型修改、重写

**记忆口诀：「改 prototype 添方法，constructor 还在；重写 prototype 整对象换，constructor 要补回」**

**一句话回答：** **修改** prototype（添加属性/方法）不影响 `constructor` 指向；**重写** prototype（整个对象替换）会导致 `constructor` 指向 `Object`，需手动修复。

### 修改 vs 重写

| 操作 | 方式 | constructor 指向 | 已有实例影响 |
| --- | --- | --- | --- |
| 修改 prototype | 添加属性/方法 | ✅ 不变 | 新添加的可访问 |
| 重写 prototype | 整个对象赋值 | ❌ 变为 Object | 旧实例仍指向旧 prototype |

### 修改 prototype（安全）

```js
function Person(name) {
  this.name = name;
}

// 修改：在现有 prototype 上添加方法
Person.prototype.getName = function () {
  return this.name;
};

const p = new Person('hello');
console.log(p.__proto__ === Person.prototype);              // true
console.log(p.__proto__ === p.constructor.prototype);       // true
console.log(p.constructor === Person);                      // true
```

### 重写 prototype（constructor 丢失）

```js
function Person(name) {
  this.name = name;
}

// 重写：整个替换 prototype 对象
Person.prototype = {
  getName: function () {
    return this.name;
  }
};

const p = new Person('hello');
console.log(p.__proto__ === Person.prototype);              // true
console.log(p.__proto__ === p.constructor.prototype);       // false ⚠️
console.log(p.constructor === Person);                      // false ⚠️
console.log(p.constructor === Object);                      // true ⚠️
```

**原因：** 新 prototype 对象是 `Object` 字面量创建的，其 `constructor` 默认指向 `Object`。

### 修复 constructor

```js
Person.prototype = {
  getName: function () {
    return this.name;
  },
  constructor: Person  // 手动补回
};

const p = new Person('hello');
console.log(p.constructor === Person);                      // true
console.log(p.__proto__ === p.constructor.prototype);       // true
```

### 重写对已有实例的影响

```js
function Person(name) { this.name = name; }
Person.prototype.sayHi = function () { console.log('old'); };

const p1 = new Person('A');
p1.sayHi(); // 'old'

// 重写 prototype
Person.prototype = { sayHi() { console.log('new'); } };

const p2 = new Person('B');
p1.sayHi(); // 'old' — p1 仍指向旧 prototype
p2.sayHi(); // 'new' — p2 指向新 prototype
```

### 最佳实践

```js
// 推荐：逐个添加，而非整体替换
Person.prototype.getName = function () { return this.name; };
Person.prototype.getAge = function () { return this.age; };

// 或使用 Object.assign 保留 constructor
Person.prototype = Object.assign(Person.prototype, {
  getName() { return this.name; }
});
```

### 面试追问点

- **为什么重写后 instanceof 仍有效？** `instanceof` 检查的是 `prototype` 是否在实例的原型链上，与 `constructor` 无关。
- **Object.create 实现继承？** `Child.prototype = Object.create(Parent.prototype)` 比直接赋值更安全，保留原型链。
- **能否修改内置原型？** 技术上可以但不推荐，可能与其他库冲突。

---

## 42. 原型链指向

**记忆口诀：「p 指向 Person.prototype，Person.prototype 指向 Object.prototype，Object.prototype 指向 null」**

**一句话回答：** 实例的原型链：`p.__proto__ → Person.prototype → Object.prototype → null`；构造函数自身也是对象：`Person.__proto__ → Function.prototype → Object.prototype → null`。

### 完整原型链

```js
function Person(name) {
  this.name = name;
}
const p = new Person('Tom');

// 实例层面
p.__proto__ === Person.prototype;                    // true
Person.prototype.__proto__ === Object.prototype;     // true
Object.prototype.__proto__ === null;                 // true

// 构造函数层面
Person.__proto__ === Function.prototype;           // true
Function.prototype.__proto__ === Object.prototype;   // true

// constructor 关系
p.constructor === Person;                            // true
Person.prototype.constructor === Person;             // true
Person.constructor === Function;                     // true
```

### 原型链图解

```
                    null
                     ↑
            Object.prototype
              ↑           ↑
    Person.prototype   Function.prototype
              ↑           ↑
         Person ──────→ Function
              ↑
              p (实例)
```

### 逐层验证

```js
// 从实例向上
p.__proto__;                              // Person.prototype
p.__proto__.__proto__;                    // Object.prototype
p.__proto__.__proto__.__proto__;          // null

// 通过 constructor 绕回
p.__proto__.constructor;                  // Person
p.__proto__.constructor.prototype;        // Person.prototype
p.__proto__.constructor.prototype.__proto__; // Object.prototype

// Function 的特殊性
Function.__proto__ === Function.prototype; // true（Function 指向自身原型）
Object.__proto__ === Function.prototype;   // true（Object 也是函数）
```

### Function 与 Object 的特殊关系

```js
// 所有函数（包括 Function 自身）的原型链终点都是 null
Function.__proto__ === Function.prototype;  // Function 的隐式原型是 Function.prototype
Function.prototype.__proto__ === Object.prototype;

// Object 是 Function 的实例
Object.__proto__ === Function.prototype;
typeof Object; // 'function'

// Function 也是 Object 的实例
Function.__proto__.__proto__ === Object.prototype;
```

### 面试追问点

- **为什么 Function.__proto__ === Function.prototype？** 因为 Function 是自身类型的实例，这是规范的特殊设计。
- **new Person() 做了什么？** 创建空对象 → 对象 `__proto__` 指向 Person.prototype → 执行 Person 函数（this 绑定新对象）→ 返回对象。
- **Object.create(null) 的原型链？** 直接到 null，无 Object.prototype，适合纯字典使用。

---

## 43. 原型链的终点是什么？如何打印出原型链的终点？

**记忆口诀：「终点是 null，Object.prototype.__proto__ === null；打印或循环 __proto__ 直到 null」**

**一句话回答：** 原型链的终点是 **`null`**，即 `Object.prototype.__proto__ === null`；可通过直接打印或循环遍历 `__proto__` 验证。

### 为什么是 null

```js
Object.prototype.__proto__ === null; // true
```

- 所有普通对象最终都继承自 `Object.prototype`
- `Object.prototype` 是原型链的**最后一环**，它的 `[[Prototype]]` 为 `null`
- `null` 表示「没有更上层原型」，属性查找到此停止，返回 `undefined`

### 打印终点

```js
// 方式1：直接打印
console.log(Object.prototype.__proto__); // null

// 方式2：循环遍历整条原型链
function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  while (current !== null) {
    chain.push(current);
    current = Object.getPrototypeOf(current);
  }
  chain.push(null); // 终点
  return chain;
}

const p = { name: 'test' };
console.log(getPrototypeChain(p));
// [{ name: 'test' }, Object.prototype, null]
```

### 完整验证

```js
function Person() {}
const p = new Person();

let proto = p;
const chain = [];
while (proto) {
  chain.push(proto.constructor?.name || 'Unknown');
  proto = Object.getPrototypeOf(proto);
}
chain.push('null (终点)');
console.log(chain.join(' → '));
// Person → Object → null (终点)
```

### 特殊对象的原型链终点

| 对象 | 原型链 |
| --- | --- |
| 普通对象 `{}` | → Object.prototype → null |
| 数组 `[]` | → Array.prototype → Object.prototype → null |
| 函数 `function(){}` | → Function.prototype → Object.prototype → null |
| `Object.create(null)` | → null（直接终点） |

### 面试追问点

- **null vs undefined 作为终点？** 规范明确终点是 `null`；找不到属性返回 `undefined`，两者不同。
- **hasOwnProperty 和原型链的关系？** `hasOwnProperty` 定义在 `Object.prototype` 上，通过原型链访问，但只检查**自有**属性。
- **如何检测原型链是否包含某对象？** `obj instanceof Constructor` 或 `Constructor.prototype.isPrototypeOf(obj)`。

---

## 44. 如何获得对象非原型链上的属性？

**记忆口诀：「hasOwnProperty 判自有，Object.keys 取可枚举，for...in 配合 hasOwn 过滤」**

**一句话回答：** 使用 `hasOwnProperty()` 判断是否为**自有属性**；`Object.keys()`/`Object.getOwnPropertyNames()` 获取自有属性；`for...in` 需配合 `hasOwnProperty` 过滤原型链属性。

### 自有属性 vs 原型链属性

```js
function Person() {}
Person.prototype.greet = function () {};

const p = new Person();
p.name = 'Tom';

p.name;    // 自有属性
p.greet;   // 原型链属性（Person.prototype 上）
p.toString; // 原型链属性（Object.prototype 上）
```

### 方法对比

| 方法 | 返回内容 | 含原型链 | 含不可枚举 | 含 Symbol |
| --- | --- | :---: | :---: | :---: |
| `obj.hasOwnProperty(key)` | boolean | ❌ | - | - |
| `Object.keys(obj)` | 自有可枚举键数组 | ❌ | ❌ | ❌ |
| `Object.getOwnPropertyNames(obj)` | 自有键数组 | ❌ | ✅ | ❌ |
| `Object.getOwnPropertySymbols(obj)` | 自有 Symbol 键 | ❌ | - | ✅ |
| `Reflect.ownKeys(obj)` | 全部自有键 | ❌ | ✅ | ✅ |
| `for...in` | 可枚举键（含原型链） | ✅ | ❌ | ❌ |

### hasOwnProperty 用法

```js
const obj = { a: 1, b: 2 };

obj.hasOwnProperty('a');           // true
obj.hasOwnProperty('toString');    // false（在 Object.prototype 上）

// 安全写法（防止 obj 没有 hasOwnProperty 方法）
Object.prototype.hasOwnProperty.call(obj, 'a'); // true
// 或 ES2022+
Object.hasOwn(obj, 'a'); // true
```

### Object.keys 获取自有属性

```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {};

const p = new Person('Tom');

Object.keys(p);                    // ['name']
Object.getOwnPropertyNames(p);     // ['name']
```

### for...in 配合过滤

```js
function iterateOwnProperties(obj) {
  const result = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result.push(`${key}: ${obj[key]}`);
    }
  }
  return result;
}

const obj = { a: 1, b: 2 };
Object.prototype.shared = 'proto'; // 模拟原型链属性

iterateOwnProperties(obj); // ['a: 1', 'b: 2'] — 不含 shared
```

### 遍历方式推荐

```js
const obj = { x: 1, y: 2 };

// 只要自有可枚举属性
Object.keys(obj).forEach(key => console.log(key, obj[key]));

// 自有可枚举 + 不可枚举
Object.getOwnPropertyNames(obj);

// 包含 Symbol 键
Reflect.ownKeys(obj);

// 只要值
Object.values(obj);

// 键值对
Object.entries(obj);
```

### 面试追问点

- **Object.keys 顺序？** ES2015+ 规定：整数键升序 → 字符串键按创建顺序 → Symbol 键按创建顺序。
- **hasOwnProperty 能被覆盖吗？** 可以，所以推荐 `Object.hasOwn()` 或 `Object.prototype.hasOwnProperty.call()`。
- **如何只获取原型链上的属性？** 没有直接 API，需 `for...in` 配合 `!hasOwnProperty` 过滤。

---

## 45. 对闭包的理解

**记忆口诀：「内函数引外变量，执行完了不销毁；私有变量靠闭包，防抖节流都在用」**

**一句话回答：** 闭包是**函数能够记住并访问其词法作用域**的机制，即使函数在其定义作用域外执行；常用于**数据私有化、模块化、防抖节流、缓存**，缺点是可能导致**内存泄漏**。

### 闭包定义

> 一个函数与其周围状态（词法环境）的引用捆绑在一起，就是闭包。

```js
function outer() {
  const count = 0; // 外层变量
  function inner() {
    console.log(count); // 内层函数访问外层变量 → 闭包
  }
  return inner;
}

const fn = outer();
fn(); // 0 — outer 已执行完，但 count 仍可访问
```

### 闭包形成条件

1. 函数嵌套（内层引用外层变量）
2. 内层函数被**外部引用**（return、赋值、回调）
3. 外层函数已执行完毕，但内层仍持有外层词法环境的引用

### 核心用途

| 用途 | 说明 | 示例 |
| --- | --- | --- |
| 数据私有化 | 外部无法直接访问内部变量 | 计数器、模块模式 |
| 防抖/节流 | 闭包保存 timer 状态 | 搜索框、滚动事件 |
| 缓存（memoize） | 闭包保存计算结果 | 斐波那契、API 缓存 |
| 回调/异步 | 回调函数记住创建时的环境 | setTimeout、事件监听 |
| 柯里化 | 逐步收集参数 | 函数式编程 |

### 数据私有化

```js
function createCounter() {
  let count = 0; // 私有变量
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.count;         // undefined — 无法直接访问
```

### 防抖 debounce

```js
function debounce(fn, delay) {
  let timer = null; // 闭包变量
  return function (...args) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

const search = debounce(function (query) {
  console.log('搜索:', query);
}, 300);

// 连续输入只触发最后一次
search('a');
search('ab');
search('abc'); // 300ms 后只执行这一次
```

### 节流 throttle

```js
function throttle(fn, delay) {
  let lastTime = 0; // 闭包变量
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener('scroll', throttle(() => {
  console.log('scroll handled');
}, 200));
```

### 缓存 memoize

```js
function memoize(fn) {
  const cache = {}; // 闭包缓存
  return function (...args) {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

const memoFib = memoize(function fib(n) {
  if (n <= 1) return n;
  return memoFib(n - 1) + memoFib(n - 2);
});
```

### 闭包的经典坑：循环 + var

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出 5 个 6

// 解决1：let（块级作用域，每次循环新 i）
for (let i = 1; i <= 5; i++) {
  setTimeout(() => console.log(i), 0);
}

// 解决2：IIFE 创建闭包
for (var i = 1; i <= 5; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}

// 解决3：setTimeout 第三参数
for (var i = 1; i <= 5; i++) {
  setTimeout((j) => console.log(j), 0, i);
}
```

### 缺点：内存泄漏

```js
function leak() {
  const bigData = new Array(1000000).fill('data');
  return function () {
    console.log(bigData.length); // bigData 无法被 GC
  };
}
const hold = leak(); // 只要 hold 存在，bigData 就不会释放
```

**避免方式：** 不再使用时置 `null`、WeakMap 替代强引用、避免在闭包中保存大对象。

### 面试追问点

- **闭包的本质？** 当前环境持有对外层词法环境的引用。
- **所有回调都是闭包吗？** 不一定，只有引用了外层变量的回调才是。
- **闭包与作用域链的关系？** 闭包是作用域链的必然结果，内层函数的外部环境引用就是作用域链的一环。

---

## 46. 对作用域、作用域链的理解

**记忆口诀：「作用域管变量可见范围，链式向上找；词法作用域编译定，全局函数块级三种域」**

**一句话回答：** **作用域**是变量可被访问的范围规则；**作用域链**是当前作用域到全局作用域的层级查找链路；JS 采用**词法作用域**（定义时确定，非调用时）。

### 三种作用域

| 作用域类型 | 创建时机 | 关键字 | 特点 |
| --- | --- | --- | --- |
| 全局作用域 | 程序启动 | var/function | 挂载到 globalThis/window |
| 函数作用域 | 函数调用 | var/function | 函数内变量外部不可访问 |
| 块级作用域 | 块执行 | let/const | if/for/{} 内有效 |

### 作用域示例

```js
var globalVar = 'global';

function outer() {
  var outerVar = 'outer';

  function inner() {
    var innerVar = 'inner';
    console.log(globalVar);  // 'global' — 沿作用域链向上
    console.log(outerVar);   // 'outer'
    console.log(innerVar);   // 'inner'
  }
  inner();
}

outer();
// console.log(outerVar); // ReferenceError
```

### 块级作用域

```js
if (true) {
  let blockVar = 'block';
  const PI = 3.14;
  var funcVar = 'leaked'; // var 无块级作用域
}
// console.log(blockVar); // ReferenceError
console.log(funcVar);     // 'leaked' — var 泄漏到外层
```

### 词法作用域 vs 动态作用域

| 类型 | 确定时机 | JS 是否采用 | 说明 |
| --- | --- | --- | --- |
| 词法作用域 | **定义时** | ✅ | 由代码书写位置决定 |
| 动态作用域 | **调用时** | ❌ | 由调用栈决定（JS 没有） |

```js
var value = 1;
function print() {
  console.log(value);
}
function show() {
  var value = 2;
  print(); // 1，不是 2 — 词法作用域，print 定义在全局
}
show();
```

### 作用域链查找过程

```
inner 作用域 → outer 作用域 → 全局作用域 → 找不到则 ReferenceError
```

```js
function foo() {
  console.log(a); // 查找顺序：foo 作用域 → 全局 → ReferenceError
  var a = 1;
}
```

### 编译阶段 vs 执行阶段

**编译阶段（创建执行上下文）：**
- 词法分析 → 语法分析 → 生成 AST
- 注册变量和函数声明（var 提升为 undefined，函数完整提升）

**执行阶段：**
- 逐行执行，赋值、函数调用
- 访问变量时沿作用域链查找

```js
// var name = 'hello' 分两步：
// 编译：var name（注册变量，undefined）
// 执行：name = 'hello'（赋值）
```

### 暂时性死区（TDZ）

```js
function foo() {
  console.log(bar); // ReferenceError — TDZ
  let bar = 3;
}

// TDZ 范围：块级作用域开始到 let/const 声明语句
{
  // TDZ 开始
  // console.log(x); // ReferenceError
  let x = 1; // TDZ 结束
}
```

### 隐式全局变量

```js
function setName() {
  vName = 'global'; // 未声明，隐式成为全局变量
}
setName();
console.log(window.vName); // 'global' — 严格模式下 ReferenceError
```

### 面试追问点

- **作用域和执行上下文的关系？** 作用域是静态概念（代码结构），执行上下文是运行时概念（调用时的环境）。
- **let 有变量提升吗？** 有声明提升，但存在 TDZ，声明前不可访问。
- **with 语句影响作用域链吗？** 会，with 会在作用域链前端添加对象，但严格模式禁用，不推荐使用。

---

## 47. 对执行上下文的理解

**记忆口诀：「全局函数 eval 三种上下文，栈底全局栈顶当前，创建阶段绑 this + 词法 + 变量，执行阶段赋值跑代码」**

**一句话回答：** 执行上下文是 JS 代码**运行时的环境抽象**，分为全局、函数、eval 三种；JS 引擎用**调用栈**管理，每个上下文创建时绑定 `this`、词法环境、变量环境，然后执行代码。

### 三种执行上下文

| 类型 | 触发时机 | 数量 | 特点 |
| --- | --- | --- | --- |
| 全局执行上下文 | 程序开始 | 1 个 | 创建 globalThis，this 指向全局对象 |
| 函数执行上下文 | 函数调用 | 多个 | 含 arguments、this、参数 |
| eval 执行上下文 | eval 执行 | 不定 | 不推荐，性能和安全问题 |

### 调用栈（Call Stack）

```js
let a = 'Hello';
function first() {
  console.log('Inside first');
  second();
  console.log('Again inside first');
}
function second() {
  console.log('Inside second');
}
first();

// 调用栈变化：
// [全局] → [全局, first] → [全局, first, second]
// → [全局, first] → [全局] → []
```

```
执行顺序：
1. 全局上下文入栈
2. first() 调用 → first 上下文入栈
3. second() 调用 → second 上下文入栈
4. second 执行完 → 出栈
5. first 执行完 → 出栈
6. 全局执行完 → 出栈
```

### 执行上下文的生命周期

**1. 创建阶段（Creation Phase）**

| 组件 | 内容 |
| --- | --- |
| this 绑定 | 全局 → globalThis；函数 → 取决于调用方式 |
| 词法环境（Lexical Environment） | 存储 let/const/函数声明的绑定 |
| 变量环境（Variable Environment） | 存储 var 声明的绑定 |

**2. 执行阶段（Execution Phase）**

- 变量赋值
- 逐行执行代码
- 函数调用（创建新的执行上下文）

### 创建阶段详解

```js
function foo(a, b) {
  var c = 1;
  let d = 2;
  function bar() {}
}

// foo 执行上下文创建阶段：
// this → 取决于调用方式
// 词法环境 → a(参数), b(参数), d(undefined), bar(函数)
// 变量环境 → c(undefined)
// arguments → 实参列表
```

### 全局 vs 函数上下文

| 组件 | 全局上下文 | 函数上下文 |
| --- | --- | --- |
| 变量声明 | var、function | var、function |
| 词法环境 | let、const | let、const |
| this | globalThis | 取决于调用 |
| arguments | ❌ | ✅ |
| 参数 | ❌ | ✅ |

### 执行上下文与作用域链

- 每个执行上下文都有关联的**词法环境**
- 词法环境包含**外部环境引用**（outer），构成作用域链
- 作用域链在**函数定义时**确定（词法作用域）

```js
var x = 10;
function outer() {
  var x = 20;
  function inner() {
    console.log(x); // 20 — 作用域链：inner → outer → global
  }
  inner();
}
outer();
```

### 面试追问点

- **执行上下文和作用域的区别？** 执行上下文是运行时环境（栈中的帧），作用域是静态的代码结构规则。
- **词法环境和变量环境为什么分开？** ES6 前只有 var；引入 let/const 后需要 TDZ 机制，词法环境处理块级绑定，变量环境处理 var。
- **递归会导致栈溢出吗？** 会，调用栈有大小限制，深度递归会 `Maximum call stack size exceeded`。

---

## 48. call() 和 apply() 的区别？

**记忆口诀：「call 和 apply 都改 this 立即执行，call 逐个传参，apply 数组传参 — apply 的 A 就是 Array」**

**一句话回答：** `call` 和 `apply` 都用于**改变函数 this 指向并立即执行**，区别仅在于传参方式：`call` **逐个传参**，`apply` **数组传参**。

### 核心对比

| 对比项 | call | apply |
| --- | --- | --- |
| 语法 | `fn.call(thisArg, arg1, arg2, ...)` | `fn.apply(thisArg, [arg1, arg2, ...])` |
| 参数形式 | 参数列表（逐个） | 数组或类数组 |
| 立即执行 | ✅ | ✅ |
| 改变 this | ✅ | ✅ |
| 返回值 | 函数执行结果 | 函数执行结果 |

### 代码示例

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

// call — 逐个传参
greet.call(person, 'Hello', '!');    // Hello, Alice!

// apply — 数组传参
greet.apply(person, ['Hi', '~']);    // Hi, Alice~

// 参数数组可动态构建
const args = ['Hey', '...'];
greet.apply(person, args);           // Hey, Alice...
```

### 常见应用场景

**1. 借用数组方法处理类数组**

```js
function sum() {
  const args = Array.prototype.slice.call(arguments);
  return args.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6
```

**2. 继承中调用父构造函数**

```js
function Parent(name) {
  this.name = name;
}
function Child(name, age) {
  Parent.call(this, name); // 借用 Parent 的 this
  this.age = age;
}
```

**3. 求数组最大/最小值**

```js
const nums = [5, 2, 8, 1, 9];
Math.max.apply(null, nums); // 9
// ES6 替代：Math.max(...nums)
```

### call vs apply vs bind

| 方法 | 是否立即执行 | 参数形式 | 返回值 |
| --- | --- | --- | --- |
| call | ✅ 立即 | 逐个 | 函数结果 |
| apply | ✅ 立即 | 数组 | 函数结果 |
| bind | ❌ 返回新函数 | 逐个 | 新函数 |

### 记忆技巧

```
call → C → Copy 逐个复制参数
apply → A → Array 数组传参
bind → B → Bind 绑定返回新函数
```

### 面试追问点

- **不传 thisArg 会怎样？** 非严格模式下 this 指向 globalThis；严格模式下为 `undefined`。
- **箭头函数能用 call/apply 吗？** 不能改变 this，箭头函数的 this 在定义时绑定。
- **apply 第二个参数可以是类数组吗？** 可以，只要是类数组（有 length 和索引）即可。

---

## 49. 实现call、apply 及 bind 函数

**记忆口诀：「call/apply 临时挂载 context 执行再删除；bind 返回新函数，new 时 this 指实例，维护原型链」**

**一句话回答：** 手写 `call/apply` 的核心是将函数**临时作为 context 的方法**执行；手写 `bind` 需**返回新函数**，并处理 `new` 调用时的 this 指向和原型链维护。

### 实现思路

**call/apply：**
1. 判断调用者是否为函数
2. context 不存在则指向 globalThis
3. 用 Symbol 将函数临时挂载到 context
4. 执行函数并传参
5. 删除临时属性，返回结果

**bind：**
1. 返回一个新函数
2. 支持柯里化（预设参数 + 调用时参数合并）
3. `new` 调用时 this 指向新实例，而非绑定的 context
4. 维护原型链（`new bound()` 能访问原函数 prototype 上的方法）

### 手写 myCall

```js
Function.prototype.myCall = function (context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('not a function');
  }
  context = context ?? globalThis;
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  const result = context[fnKey](...args);
  delete context[fnKey];
  return result;
};
```

### 手写 myApply

```js
Function.prototype.myApply = function (context, args) {
  if (typeof this !== 'function') {
    throw new TypeError('not a function');
  }
  context = context ?? globalThis;
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  const result = args ? context[fnKey](...args) : context[fnKey]();
  delete context[fnKey];
  return result;
};
```

### 手写 myBind

```js
Function.prototype.myBind = function (context, ...args1) {
  if (typeof this !== 'function') {
    throw new TypeError('not a function');
  }
  const fn = this;

  const bound = function (...args2) {
    const allArgs = [...args1, ...args2];
    // new 调用时 this 指向新实例，否则指向 context
    return fn.apply(
      new.target ? this : context,
      allArgs
    );
  };

  // 维护原型链：new bound() 的实例能访问 fn.prototype 上的方法
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }

  return bound;
};
```

### 测试用例

```js
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };

// myCall 测试
greet.myCall(person, 'Hello', '!'); // 'Hello, Alice!'

// myApply 测试
greet.myApply(person, ['Hi', '~']); // 'Hi, Alice~'

// myBind 测试
const boundGreet = greet.myBind(person, 'Hey');
boundGreet('?'); // 'Hey, Alice?'

// new 调用测试
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  return `Hi, ${this.name}`;
};

const BoundPerson = Person.myBind({ name: 'ignored' });
const p = new BoundPerson('Bob');
console.log(p.name);    // 'Bob'
console.log(p.sayHi()); // 'Hi, Bob'
console.log(p instanceof Person); // true
```

### 为什么用 Symbol

- 避免覆盖 context 上已有的属性名
- 执行后立即 delete，不污染 context

### bind 的 new 调用处理

```js
// 普通调用：this → context（绑定的对象）
boundFn();

// new 调用：this → 新创建的实例
const instance = new boundFn();
// fn 内部的 this 指向 instance，而非 context
```

### 面试追问点

- **为什么 bind 返回的函数不能当构造函数？** 标准 bind 可以，`new bound()` 时绑定的 this 被忽略，this 指向新实例。
- **bind 的柯里化原理？** 预设参数 `args1` 保存在闭包中，调用时再与 `args2` 合并。
- **Symbol 可以用普通属性名吗？** 可以，但可能覆盖原有属性，Symbol 更安全。

---

## 50. 异步编程的实现方式？

**记忆口诀：「回调→Promise→Generator→Async，演进四步走；越来越像同步写，维护越来越容易」**

**一句话回答：** JavaScript 异步编程经历了**回调函数 → Promise → Generator → async/await** 四个阶段，逐步解决了回调地狱、错误处理、可读性等问题。

### 四种方式对比

| 方式 | 出现时间 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 回调函数 | ES3 | 简单直接 | 回调地狱、错误处理困难 |
| Promise | ES6 | 链式调用、统一错误处理 | then 链过长时语义不清 |
| Generator | ES6 | 可暂停/恢复、同步写法 | 需自动执行器（co） |
| async/await | ES7 | 同步写法、自动执行 | 本质是 Promise 语法糖 |

### 1. 回调函数

```js
function fetchData(url, callback) {
  setTimeout(() => {
    callback(null, { data: 'result' });
  }, 1000);
}

fetchData('/api', (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

**回调地狱：**

```js
getData(1, (err, a) => {
  getData(a, (err, b) => {
    getData(b, (err, c) => {
      getData(c, (err, d) => {
        // 嵌套越来越深...
      });
    });
  });
});
```

### 2. Promise

```js
function fetchData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({ data: 'result' }), 1000);
  });
}

fetchData('/api/1')
  .then(res => fetchData('/api/2'))
  .then(res => fetchData('/api/3'))
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### 3. Generator + co

```js
function* fetchGen() {
  const a = yield fetchData('/api/1');
  const b = yield fetchData('/api/2');
  const c = yield fetchData('/api/3');
  return c;
}

// 需要自动执行器
function co(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();
    function next(val) {
      const result = g.next(val);
      if (result.done) return resolve(result.value);
      Promise.resolve(result.value).then(next, reject);
    }
    next();
  });
}

co(fetchGen).then(console.log);
```

### 4. async/await

```js
async function fetchAll() {
  try {
    const a = await fetchData('/api/1');
    const b = await fetchData('/api/2');
    const c = await fetchData('/api/3');
    return c;
  } catch (err) {
    console.error(err);
  }
}

fetchAll().then(console.log);
```

### 演进路线

```
回调地狱          Promise 链         Generator+co       async/await
  │                 │                   │                  │
  嵌套深           链式 .then          yield 暂停         await 等待
  难维护           统一 catch          需执行器           自动执行
  错误分散         语义稍弱            较复杂             最直观
```

### 其他异步方案

| 方案 | 说明 |
| --- | --- |
| 事件监听 | `addEventListener`、EventEmitter |
| 发布订阅 | 解耦生产者消费者 |
| Web Worker | 多线程，postMessage 通信 |
| RxJS | 响应式编程，Observable 流 |

### 面试追问点

- **async/await 是 Generator 的语法糖吗？** 是的，内置自动执行器，await 相当于 yield + Promise。
- **Promise 和回调的本质区别？** Promise 是**状态机**，状态确定后不可变；回调是**控制反转**，逻辑分散。
- **如何选择？** 简单场景用 Promise；复杂异步流程用 async/await；流式数据用 RxJS。

---

## 51. setTimeout、Promise、Async/Await 的区别

**记忆口诀：「setTimeout 宏任务排队，Promise then 微任务优先，async/await 是 Promise 语法糖」**

**一句话回答：** `setTimeout` 回调是**宏任务**；Promise 的 `then` 回调是**微任务**；`async/await` 是 Promise 的**语法糖**，await 后的代码相当于 `then` 回调。

### 执行顺序对比

**setTimeout（宏任务）**

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
// 输出：1 → 3 → 2
```

**Promise（微任务）**

```js
console.log('1');
Promise.resolve().then(() => console.log('2'));
console.log('3');
// 输出：1 → 3 → 2
```

**混合执行**

```js
console.log('script start');

setTimeout(() => console.log('setTimeout'), 0);

Promise.resolve()
  .then(() => console.log('promise1'))
  .then(() => console.log('promise2'));

console.log('script end');

// 输出：
// script start → script end → promise1 → promise2 → setTimeout
```

### 宏任务 vs 微任务

| 类型 | 常见来源 | 优先级 |
| --- | --- | --- |
| 宏任务（Macro Task） | script、setTimeout、setInterval、I/O、UI rendering | 低 |
| 微任务（Micro Task） | Promise.then/catch/finally、MutationObserver、queueMicrotask | 高 |

**事件循环规则：**
1. 执行一个宏任务（如 script 整体）
2. 执行过程中产生的微任务**全部清空**
3. 渲染（如果需要）
4. 取下一个宏任务，重复

### Promise 执行细节

```js
console.log('start');

const p = new Promise(resolve => {
  console.log('promise executor'); // 同步执行
  resolve();
  console.log('promise end');      // 同步执行
});

p.then(() => console.log('then callback')); // 微任务

console.log('end');

// start → promise executor → promise end → end → then callback
```

- Promise **构造函数内代码同步执行**
- `then/catch/finally` 回调是**微任务**，在当前宏任务结束后、下一个宏任务前执行

### async/await 执行细节

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end'); // 相当于 Promise.then 微任务
}

async function async2() {
  console.log('async2');
}

console.log('script start');
async1();
console.log('script end');

// script start → async1 start → async2 → script end → async1 end
```

**await 原理：**
- `await` 后面的代码相当于放在 `Promise.then` 中
- `await` 之前的代码同步执行
- `async` 函数返回 Promise

```js
async function foo() {
  return 1;
}
console.log(foo()); // Promise { 1 }
foo().then(v => console.log(v)); // 1
```

### 复杂示例

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

new Promise(resolve => {
  console.log('3');
  resolve();
}).then(() => {
  console.log('4');
  new Promise(r => {
    r();
  }).then(() => console.log('5'));
});

console.log('6');

// 1 → 3 → 6 → 4 → 5 → 2
```

### 面试追问点

- **微任务能产生新的微任务吗？** 能，且在当前轮次全部执行完才进入下一个宏任务。
- **setTimeout(fn, 0) 真的是 0ms 吗？** HTML5 规定最小 4ms（嵌套超过 5 层时），且作为宏任务排队。
- **async 函数没有 await 呢？** 全部同步执行，返回 resolved 的 Promise。

---

## 52. 对Promise的理解

**记忆口诀：「三状态 pending/fulfilled/rejected 不可逆，then 链式调，catch 兜底接，构造函数同步跑 then 异步排」**

**一句话回答：** Promise 是异步编程的解决方案，代表一个**未来才会知道结果**的操作；有三种状态且**不可逆**；通过 `then` 链式调用解决回调地狱；构造函数**同步执行**，`then` 回调是**微任务**。

### 三种状态

| 状态 | 含义 | 可转换到 |
| --- | --- | --- |
| Pending（进行中） | 初始状态 | Fulfilled / Rejected |
| Fulfilled（已成功） | 操作成功完成 | ❌ 不可变 |
| Rejected（已失败） | 操作失败 | ❌ 不可变 |

```js
// 状态一旦改变，永久固定
const p = new Promise((resolve, reject) => {
  resolve('success');
  reject('fail'); // 无效，状态已是 fulfilled
});
```

### Promise 核心特点

| 特点 | 说明 |
| --- | --- |
| 状态不受外界影响 | 只有异步操作的结果能决定状态 |
| 状态不可逆 | pending → fulfilled 或 pending → rejected，单向 |
| 链式调用 | then 返回新 Promise，支持链式 |
| 错误冒泡 | 错误沿链传递到最近的 catch |
| 值穿透 | then 中 return 非 Promise 值会传递给下一个 then |

### 基本用法

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve({ data: 'result' });
    } else {
      reject(new Error('failed'));
    }
  }, 1000);
});

promise
  .then(res => {
    console.log('成功:', res);
    return res.data;
  })
  .then(data => console.log('数据:', data))
  .catch(err => console.error('失败:', err))
  .finally(() => console.log('无论成败都执行'));
```

### 同步 vs 异步

```js
console.log('1');

new Promise(resolve => {
  console.log('2'); // 同步 — executor 立即执行
  resolve();
}).then(() => {
  console.log('3'); // 异步 — 微任务
});

console.log('4');

// 1 → 2 → 4 → 3
```

### 静态方法

| 方法 | 说明 |
| --- | --- |
| `Promise.resolve(val)` | 返回 fulfilled 的 Promise |
| `Promise.reject(err)` | 返回 rejected 的 Promise |
| `Promise.all([p1,p2])` | 全部成功才成功，一个失败即失败 |
| `Promise.race([p1,p2])` | 第一个 settled 的结果 |
| `Promise.allSettled([p1,p2])` | 等全部 settled，返回状态数组 |
| `Promise.any([p1,p2])` | 第一个 fulfilled 的结果 |

```js
Promise.resolve(42).then(v => console.log(v)); // 42

Promise.all([
  fetch('/api/a'),
  fetch('/api/b')
]).then(([a, b]) => console.log(a, b));

Promise.race([
  fetch('/api'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 5000)
  )
]);
```

### Promise 的缺点

| 缺点 | 说明 |
| --- | --- |
| 无法取消 | 一旦创建就执行，无原生 cancel |
| 错误静默 | 不设 catch，错误不会抛到外层 |
| pending 不可知 | 无法得知当前进展 |
| 需要回调 | then/catch 仍是回调，async/await 更直观 |

### 解决回调地狱

```js
// 回调地狱
step1(data => {
  step2(data, result => {
    step3(result, final => { /* ... */ });
  });
});

// Promise 链
step1()
  .then(data => step2(data))
  .then(result => step3(result))
  .then(final => { /* ... */ })
  .catch(err => console.error(err));
```

### 手写简易 Promise 框架

```js
class MyPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.state = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state !== MyPromise.PENDING) return;
      this.state = MyPromise.FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach(fn => fn());
    };

    const reject = (reason) => {
      if (this.state !== MyPromise.PENDING) return;
      this.state = MyPromise.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach(fn => fn());
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

    const promise2 = new MyPromise((resolve, reject) => {
      const handle = (callback, value) => {
        queueMicrotask(() => {
          try {
            const result = callback(value);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };

      if (this.state === MyPromise.FULFILLED) {
        handle(onFulfilled, this.value);
      } else if (this.state === MyPromise.REJECTED) {
        handle(onRejected, this.reason);
      } else {
        this.onFulfilledCallbacks.push(() => handle(onFulfilled, this.value));
        this.onRejectedCallbacks.push(() => handle(onRejected, this.reason));
      }
    });

    return promise2;
  }
}
```

### 面试追问点

- **Promise 和 Deferred 的区别？** Promise 是最终结果；Deferred 是控制 Promise 状态的对象（jQuery Deferred）。
- **then 返回什么？** 返回**新的 Promise**，实现链式调用。
- **Promise 错误为什么需要 catch？** 未捕获的 rejection 在浏览器控制台报 Unhandled Promise Rejection，Node.js 可能进程退出。


## 53. Promise的基本用法

**记忆口诀：「new 创 Promise，resolve 成功 reject 失败，then 链式 catch 兜底 finally 收尾，状态不可逆只变一次」**

**一句话回答：** Promise 是异步编程的一种解决方案，通过 `new Promise((resolve, reject) => {})` 创建，用 `resolve/reject` 改变状态，再用 `.then()/.catch()/.finally()` 链式处理结果。

### Promise 三种状态

| 状态 | 含义 | 可转换方向 |
| --- | --- | --- |
| pending（待定） | 初始状态，既未成功也未失败 | → fulfilled 或 rejected |
| fulfilled（已兑现） | 操作成功完成 | 不可逆 |
| rejected（已拒绝） | 操作失败 | 不可逆 |

**状态一旦改变就不可逆**，只能从 pending → fulfilled 或 pending → rejected。

### 基本用法

```js
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('操作成功'); // pending → fulfilled
    } else {
      reject(new Error('操作失败')); // pending → rejected
    }
  }, 1000);
});

promise
  .then((value) => {
    console.log('成功:', value);
    return value + '!'; // 返回值传给下一个 then
  })
  .then((value) => {
    console.log('链式:', value); // '操作成功!'
  })
  .catch((err) => {
    console.log('失败:', err.message);
  })
  .finally(() => {
    console.log('无论成败都执行');
  });
```

### 快捷创建方法

| 方法 | 作用 | 等价写法 |
| --- | --- | --- |
| `Promise.resolve(value)` | 创建 fulfilled 状态的 Promise | `new Promise(r => r(value))` |
| `Promise.reject(reason)` | 创建 rejected 状态的 Promise | `new Promise((_, r) => r(reason))` |

```js
Promise.resolve(42).then(v => console.log(v)); // 42

Promise.reject('出错了').catch(e => console.log(e)); // '出错了'
```

### 链式调用传值规则

| 返回值类型 | 下一个 then 收到 |
| --- | --- |
| 普通值 | 直接作为参数 |
| Promise 实例 | 等待该 Promise 决议后的值 |
| throw 错误 | 跳转到最近的 catch |
| 无 return | undefined |

```js
Promise.resolve(1)
  .then(v => v + 1)           // 返回 2
  .then(v => Promise.resolve(v * 3)) // 返回 Promise，then 会等待
  .then(v => console.log(v))  // 6
  .then(() => { throw new Error('链中出错'); })
  .catch(err => console.log(err.message)); // '链中出错'
```

### 面试追问点

- **then 返回的是新 Promise 还是原 Promise？** 每次 `.then()` 都返回**全新的 Promise 实例**，所以才能链式调用。
- **resolve 后再 reject 有效吗？** 无效，状态已锁定，后续 resolve/reject 被忽略。
- **Promise 构造函数里的代码是同步还是异步？** executor 函数**同步执行**，只有 then/catch 回调是异步（微任务）。

---

## 54. Promise解决了什么问题

**记忆口诀：「回调地狱三层嵌，Promise 链式平铺展，catch 统一捕错误，取消进度仍无解」**

**一句话回答：** Promise 主要解决**回调地狱**问题——嵌套深、可读性差、错误处理困难；通过链式调用扁平化异步逻辑，并用 `.catch()` 统一捕获错误。

### 回调地狱的问题

```js
// ❌ 回调地狱：嵌套深、难维护、错误处理散乱
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        // 四层嵌套，每层都要单独处理错误
      }, handleError);
    }, handleError);
  }, handleError);
}, handleError);
```

| 回调地狱痛点 | 具体表现 |
| --- | --- |
| 嵌套过深 | 多层回调形成「金字塔」，代码横向扩展困难 |
| 可读性差 | 执行顺序从上到下，但逻辑从左到右，不符合思维习惯 |
| 错误处理困难 | 每层都要传 error callback，容易遗漏 |
| 信任问题 | 控制反转，无法确定回调被调用几次、传什么参数 |

### Promise 如何解决

```js
// ✅ Promise 链式调用：扁平化、顺序清晰
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .then(d => console.log(d))
  .catch(err => console.log('统一错误处理:', err)); // 一处捕获所有环节错误
```

### Promise vs 回调对比

| 对比维度 | 回调函数 | Promise |
| --- | --- | --- |
| 代码结构 | 嵌套回调 | 链式扁平 |
| 错误处理 | 每层单独处理 | `.catch()` 统一捕获 |
| 组合多个异步 | 手动协调，复杂 | `Promise.all/race` 等 |
| 可读性 | 差 | 较好 |
| 可取消 | 可实现 | 原生不支持取消 |
| 进度反馈 | 可实现 | 原生不支持进度 |

### Promise 的局限

```js
// 1. 无法取消 — 一旦创建就会执行
const p = fetch('/api/data'); // 无法原生 abort（需 AbortController 配合）

// 2. 无法获取进度 — 没有内置 onProgress
// 3. 错误需主动 catch，否则 unhandledrejection
p.then(data => process(data)); // 若 reject 且未 catch → 控制台警告
```

### 面试追问点

- **Promise 能完全消灭回调吗？** 不能，executor 里仍可能有回调；Promise 是更好的**组织方式**，底层 I/O 仍依赖回调。
- **和 async/await 什么关系？** async/await 是 Promise 的语法糖，本质仍是 Promise。

---

## 55. Promise.all和Promise.race的区别的使用场景

**记忆口诀：「all 全成才成功，race 谁先谁赢，allSettled 全汇总，any 一个成就行」**

**一句话回答：** `Promise.all` 等**全部成功**才成功，适合并行请求；`Promise.race` 取**最先 settled** 的结果，适合超时控制；此外还有 `allSettled`（全部汇总）和 `any`（第一个成功）。

### 四个静态方法对比

| 方法 | 成功条件 | 失败条件 | 返回值 | 典型场景 |
| --- | --- | --- | --- | --- |
| Promise.all | 全部 fulfilled | 任意一个 rejected | 结果数组 | 并行请求多个接口 |
| Promise.race | 第一个 settled | 第一个 settled | 第一个结果 | 超时控制、竞速 |
| Promise.allSettled | 始终 fulfilled | 不会 rejected | 状态数组 | 批量操作需知道每个结果 |
| Promise.any | 任意一个 fulfilled | 全部 rejected | 第一个成功值 | 多源降级、镜像请求 |

### Promise.all 示例

```js
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = new Promise(resolve => setTimeout(() => resolve(3), 1000));

Promise.all([p1, p2, p3]).then(results => {
  console.log(results); // [1, 2, 3] — 顺序与传入一致
});

// 一个失败则整体失败
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => console.log(err)); // 'error'
```

### Promise.race 示例

```js
// 超时控制
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('请求超时')), ms)
  );
}

Promise.race([
  fetch('/api/data'),
  timeout(5000)
])
  .then(res => res.json())
  .catch(err => console.log(err.message));
```

### 手写 Promise.all

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'));
    }
    const len = promises.length;
    if (len === 0) return resolve([]);

    const results = new Array(len);
    let count = 0;

    promises.forEach((p, index) => {
      // Promise.resolve 兼容非 Promise 值
      Promise.resolve(p).then(
        (value) => {
          results[index] = value; // 按索引保存，保证顺序
          count++;
          if (count === len) resolve(results);
        },
        (reason) => reject(reason) // 任一失败立即 reject
      );
    });
  });
}
```

### 手写 Promise.race

```js
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'));
    }
    promises.forEach(p => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
}
```

### 面试追问点

- **空数组 Promise.all([]) 返回什么？** 立即 resolve 空数组 `[]`。
- **Promise.race 空数组？** 永远 pending，没有任何 Promise 来 settle。
- **all 中某个 Promise 永久 pending？** 整体也会永久 pending。

---

## 56. 对async/await 的理解

**记忆口诀：「async 返 Promise，await 等结果，Generator 加自动执行器，异步代码写同步」**

**一句话回答：** async/await 是 **Generator + 自动执行器** 的语法糖；`async` 函数返回 Promise，`await` 暂停函数执行等待 Promise 决议，让异步代码以同步风格书写。

### 本质关系

```
async/await  ≈  Generator + co 自动执行器
async function ≈  function* + 自动 next()
await          ≈  yield + 自动处理 Promise
```

### 基本用法

```js
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data; // 等价于 return Promise.resolve(data)
}

// 调用方式与 Promise 相同
fetchUser(1).then(user => console.log(user));
```

### async 函数特性

| 特性 | 说明 |
| --- | --- |
| 返回值 | 总是 Promise（非 Promise 值会被 `Promise.resolve` 包装） |
| await | 只能在 async 函数内使用（顶层 await 需 ES Module） |
| 错误 | 未捕获的异常会变成 rejected Promise |
| 执行 | 遇到 await 暂停，await 后的代码相当于 `.then` 回调 |

```js
async function demo() {
  return 42;
}
console.log(demo()); // Promise { 42 }

async function errorDemo() {
  throw new Error('出错了');
}
errorDemo().catch(e => console.log(e.message)); // '出错了'
```

### 与 Generator 对比

```js
// Generator 需要手动/自动执行器
function* gen() {
  const a = yield Promise.resolve(1);
  const b = yield Promise.resolve(2);
  return a + b;
}

// async/await 自动执行
async function auto() {
  const a = await Promise.resolve(1);
  const b = await Promise.resolve(2);
  return a + b;
}
```

### 面试追问点

- **await 后面的代码何时执行？** 当前 await 的 Promise resolve/reject 后，作为**微任务**执行。
- **多个 await 串行 vs Promise.all 并行？** 多个 await 串行等待；需要并行应用 `Promise.all`。

---

## 57. await 到底在等啥？

**记忆口诀：「await 等表达式，Promise 等决议，非 Promise 直接返，后面代码进微任务」**

**一句话回答：** `await` 等待的是**右侧表达式的结果**——如果是 Promise 就等它 resolve/reject 后的值；如果不是 Promise 则直接返回值；`await` 后面的代码相当于 `.then` 回调，进入微任务队列。

### await 等待规则

| 右侧表达式 | await 的结果 | 后续行为 |
| --- | --- | --- |
| Promise（fulfilled） | resolve 的值 | 继续执行 await 后代码 |
| Promise（rejected） | 抛出 rejection 原因 | 可用 try/catch 捕获 |
| 非 Promise 值 | 直接返回该值 | 继续执行 |
| thenable 对象 | 按 Promise 处理 | 调用 .then 等待 |

```js
async function demo() {
  console.log('1');

  const a = await 42;           // 非 Promise，直接得到 42
  console.log('2', a);

  const b = await Promise.resolve('hello'); // 等 Promise resolve
  console.log('3', b);

  // await 后面的代码 = .then 回调（微任务）
  console.log('4');
}

demo();
console.log('5');

// 输出顺序：1 → 5 → 2 → 3 → 4
// 解释：await 前的代码同步执行，await 让出线程，await 后代码进微任务
```

### 等价 Promise 写法

```js
async function foo() {
  const result = await somePromise;
  doSomething(result);
}

// 等价于
function foo() {
  return somePromise.then(result => {
    doSomething(result);
  });
}
```

### thenable 对象

```js
// 有 .then 方法的对象会被当作 Promise 处理
const thenable = {
  then(resolve) {
    resolve('thenable value');
  }
};

async function test() {
  const val = await thenable;
  console.log(val); // 'thenable value'
}
```

### 面试追问点

- **await 会阻塞 JS 主线程吗？** **不会**。只是暂停当前 async 函数的执行，主线程继续跑其他任务。
- **await 0 和 await Promise.resolve(0) 有区别吗？** `await 0` 直接得到 0，不会进微任务；`await Promise.resolve(0)` 后面的代码会进微任务。

---

## 58. async/await的优势

**记忆口诀：「同步风格易读，try catch 捕错，断点调试友好，条件循环更简单」**

**一句话回答：** async/await 相比 Promise 链，具有**代码可读性好**（同步风格）、**错误处理简单**（try/catch）、**调试友好**（断点可逐步执行）、**条件/循环逻辑更自然**等优势。

### async/await vs Promise 链对比

| 对比维度 | Promise 链 | async/await |
| --- | --- | --- |
| 代码风格 | `.then()` 链式 | 同步写法 |
| 可读性 | 复杂逻辑时链较长 | 更接近同步思维 |
| 错误处理 | `.catch()` 或每步处理 | `try/catch` 统一捕获 |
| 调试 | 断点难跟踪异步链 | 可在 await 处正常断点 |
| 条件分支 | 嵌套 then 或包装 Promise | 直接 if/else |
| 循环 | 需 reduce/recursion | 直接 for/while + await |
| 返回值 | 天然 Promise | 需 async 包装 |

### 可读性对比

```js
// Promise 链
function getUserPosts(userId) {
  return getUser(userId)
    .then(user => getPosts(user.id))
    .then(posts => getComments(posts[0].id))
    .then(comments => ({ user, posts, comments })); // user 作用域问题
}

// async/await — 更清晰
async function getUserPosts(userId) {
  const user = await getUser(userId);
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);
  return { user, posts, comments };
}
```

### 条件与循环

```js
// 条件判断 — async/await 更自然
async function fetchData(useCache) {
  if (useCache) {
    const cached = await getCache();
    if (cached) return cached;
  }
  return await fetchFromServer();
}

// 循环 — 串行请求
async function fetchAll(urls) {
  const results = [];
  for (const url of urls) {
    results.push(await fetch(url)); // 逐个等待
  }
  return results;
}
```

### 调试优势

在 async 函数中，`await` 处设置断点后，调试器可以**逐步执行**每一行，变量在作用域内可见；Promise 链中 `.then` 回调是独立函数，变量追踪和断点体验较差。

### 面试追问点

- **async/await 一定比 Promise 好吗？** 简单链式用 Promise 更轻；复杂流程、需要并行组合时 async/await 更清晰。
- **await 在循环里串行会影响性能吗？** 会，应改用 `Promise.all` 并行。

---

## 59. async/await 如何捕获异常

**记忆口诀：「try catch 最常用，catch 链式也能捕，to 包装返数组，未捕 rejection 要监听」**

**一句话回答：** 捕获 async/await 异常有三种方式：**try/catch**（最常用）、**.catch() 链式**、**包装函数 to()** 返回 `[err, data]`；未捕获的 rejection 会触发 `unhandledrejection` 事件。

### 三种捕获方式

| 方式 | 写法 | 适用场景 |
| --- | --- | --- |
| try/catch | async 函数内包裹 await | 最常用，逻辑清晰 |
| .catch() | 调用 async 函数后链式 catch | 不想改函数内部结构 |
| to() 包装 | 返回 `[err, data]` 元组 | Go 风格，避免 try/catch |

### 方式一：try/catch

```js
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('请求失败:', err.message);
    return null; // 或重新 throw
  }
}
```

### 方式二：.catch() 链式

```js
async function fetchData() {
  const res = await fetch('/api/data');
  return res.json();
}

fetchData()
  .then(data => console.log(data))
  .catch(err => console.error('捕获:', err.message));
```

### 方式三：to() 包装函数

```js
function to(promise) {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null]);
}

async function main() {
  const [err, data] = await to(fetch('/api/data').then(r => r.json()));
  if (err) {
    console.error('出错:', err);
    return;
  }
  console.log('数据:', data);
}
```

### 错误传播

```js
async function step1() {
  throw new Error('step1 失败');
}

async function step2() {
  await step1(); // 错误会向上传播
}

step2().catch(err => console.log(err.message)); // 'step1 失败'
```

### unhandledrejection

```js
// 未捕获的 Promise rejection
async function dangerous() {
  throw new Error('未捕获');
}
dangerous(); // 控制台：UnhandledPromiseRejectionWarning

// 全局监听（生产环境建议加上）
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 rejection:', event.reason);
  event.preventDefault(); // 阻止默认报错
});
```

### 面试追问点

- **try/catch 能捕获 then 里的错误吗？** 不能，then 回调是独立微任务，需在 then 内单独 catch 或用 `.catch()`。
- **await 非 Promise 的 throw 能被 catch 吗？** 不能，只有 await Promise reject 或同步 throw 才能被同一 try/catch 捕获。

---

## 60. 什么是回调函数？回调函数有什么缺点？如何解决回调地狱问题？

**记忆口诀：「函数当参数传，嵌套深难维护，错误散乱信任险，Promise async 来解」**

**一句话回答：** 回调函数是把**函数作为参数**传给另一个函数，在适当时机被调用；缺点是嵌套深、难维护、错误处理散乱、存在控制反转的信任问题；解决方案是 **Promise / async-await / Generator**。

### 什么是回调函数

```js
// 同步回调
[1, 2, 3].forEach(function(item) {
  console.log(item);
});

// 异步回调
setTimeout(function() {
  console.log('1 秒后执行');
}, 1000);

// 事件回调
button.addEventListener('click', function() {
  console.log('被点击');
});
```

### 回调的缺点

| 缺点 | 说明 | 示例 |
| --- | --- | --- |
| 回调地狱 | 多层嵌套，代码横向膨胀 | 异步 A→B→C 各套一层 |
| 难以维护 | 逻辑分散在嵌套层级中 | 修改中间环节牵一发动全身 |
| 错误处理散乱 | 每层需单独 error callback | 容易遗漏某层错误处理 |
| 控制反转 | 把执行权交给第三方 | 不确定被调用几次、传什么参数 |
| 难以组合 | 多个异步结果合并复杂 | 需手动计数或嵌套 |

```js
// 控制反转问题：回调可能被多次调用或永不调用
function fetchData(callback) {
  // 如果这里调用两次 callback，调用方可能出问题
  callback(null, data);
  callback(null, data); // 危险！
}
```

### 回调地狱示例

```js
step1(function(err, r1) {
  if (err) return handle(err);
  step2(r1, function(err, r2) {
    if (err) return handle(err);
    step3(r2, function(err, r3) {
      if (err) return handle(err);
      // ... 继续嵌套
    });
  });
});
```

### 解决方案

```js
// 1. Promise 链式
step1()
  .then(r1 => step2(r1))
  .then(r2 => step3(r2))
  .catch(handle);

// 2. async/await
async function run() {
  try {
    const r1 = await step1();
    const r2 = await step2(r1);
    const r3 = await step3(r2);
  } catch (err) {
    handle(err);
  }
}

// 3. Generator + co（了解）
function* gen() {
  const r1 = yield step1();
  const r2 = yield step2(r1);
  yield step3(r2);
}
```

### 面试追问点

- **回调函数是 bad 吗？** 不是，简单场景回调很自然；问题是**多层嵌套**时的组织方式。
- **Node.js 错误优先回调 `(err, data) => {}` 怎么过渡到 Promise？** `util.promisify` 或手动包装。

---

## 61. setTimeout、setInterval、requestAnimationFrame 各有什么特点？

**记忆口诀：「timeout 一次延时，interval 重复执行，rAF 帧前动画，隐藏页 rAF 暂停」**

**一句话回答：** `setTimeout` 是一次性延时执行；`setInterval` 是固定间隔重复执行（可能跳帧/堆积）；`requestAnimationFrame` 由浏览器在每帧渲染前调用（约 16.7ms@60fps），页面不可见时会暂停。

### 三者对比

| 特性 | setTimeout | setInterval | requestAnimationFrame |
| --- | --- | --- | --- |
| 执行次数 | 一次 | 重复 | 每帧一次（循环调用） |
| 最小间隔 | HTML5 规定嵌套 5 层后最小 4ms | 同左，且不保证精确 | 跟随屏幕刷新率（~16.7ms） |
| 计时基准 | 宏任务，受事件循环影响 | 宏任务，可能堆积 | 与渲染管线同步 |
| 页面隐藏 | 仍执行（可能被节流） | 仍执行 | **暂停** |
| 典型场景 | 延迟操作、防抖 | 轮询（不推荐动画） | 流畅动画 |
| 清除方法 | clearTimeout | clearInterval | cancelAnimationFrame |

### setTimeout

```js
const timerId = setTimeout(() => {
  console.log('2 秒后执行一次');
}, 2000);

clearTimeout(timerId); // 取消

// 注意：实际延迟 ≥ 设定值（宏任务排队）
console.log('同步代码先执行');
```

### setInterval 的问题

```js
// ❌ 问题：回调执行时间 > 间隔时，任务会堆积
setInterval(() => {
  heavyTask(); // 假设耗时 200ms
}, 100); // 间隔 100ms → 回调堆积

// ✅ 推荐：递归 setTimeout，等上次完成再调度下次
function loop() {
  heavyTask();
  setTimeout(loop, 100);
}
loop();
```

### requestAnimationFrame

```js
let start = null;
function animate(timestamp) {
  if (!start) start = timestamp;
  const progress = timestamp - start;

  element.style.transform = `translateX(${progress * 0.1}px)`;

  if (progress < 2000) {
    requestAnimationFrame(animate); // 下一帧继续
  }
}
requestAnimationFrame(animate);
```

### 面试追问点

- **setTimeout(fn, 0) 是立即执行吗？** 不是，是放入宏任务队列，等当前同步代码和微任务执行完后才执行。
- **为什么动画推荐 rAF 而非 setInterval？** rAF 与浏览器重绘同步，避免掉帧；页面不可见时自动暂停，节省资源。

---

## 62. 对象创建的方式有哪些？

**记忆口诀：「字面量最简单，new Object 少用，构造函数加 prototype，create 指定原型，class 语法糖，工厂函数灵活」**

**一句话回答：** JavaScript 创建对象的方式有：**字面量 `{}`**、**`new Object()`**、**构造函数**、**`Object.create()`**、**ES6 class**、**工厂函数**等，各有适用场景。

### 创建方式对比

| 方式 | 写法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 字面量 | `{ name: 'Tom' }` | 简洁直观 | 无法批量创建同类对象 |
| new Object() | `new Object(); obj.name = 'Tom'` | 标准方式 | 繁琐，等价字面量 |
| 构造函数 | `new Person('Tom')` | 批量创建、有类型 | 每个实例方法重复创建（未优化时） |
| Object.create() | `Object.create(proto)` | 精确控制原型 | 需额外初始化属性 |
| ES6 class | `new Person('Tom')` | 语法清晰、支持继承 | 本质仍是原型 |
| 工厂函数 | `createPerson('Tom')` | 灵活、无 new | 无法识别类型、方法重复 |

### 代码示例

```js
// 1. 字面量
const obj1 = { name: 'Tom', age: 18 };

// 2. new Object()
const obj2 = new Object();
obj2.name = 'Tom';

// 3. 构造函数
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};
const obj3 = new Person('Tom');

// 4. Object.create()
const proto = { greet() { console.log('hello'); } };
const obj4 = Object.create(proto);
obj4.name = 'Tom';

// 5. ES6 class
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}
const obj5 = new Animal('Cat');

// 6. 工厂函数
function createPerson(name, age) {
  return {
    name,
    age,
    introduce() {
      console.log(`I'm ${name}, ${age} years old`);
    }
  };
}
const obj6 = createPerson('Tom', 18);
```

### 面试追问点

- **字面量和 new Object() 有区别吗？** 功能等价，字面量是语法糖。
- **Object.create(null) 有什么用？** 创建**无原型**的纯净对象，适合当作字典/Map 使用，避免原型链污染。

---

## 63. 对象继承的方式有哪些？

**记忆口诀：「原型链共享引用，构造借属性不借方法，组合调两次父构造，寄生组合 Object.create 最优，class extends 最终方案」**

**一句话回答：** JavaScript 继承方式有 **原型链继承、构造函数继承、组合继承、原型式继承、寄生式继承、寄生组合式继承（推荐）、ES6 class extends** 共 7 种，现代开发推荐 **寄生组合继承** 或 **class extends**。

### 七种继承方式对比

| 方式 | 核心思路 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 原型链 | `Child.prototype = new Parent()` | 方法可复用 | 引用类型共享；不能传参 |
| 构造函数 | `Parent.call(this)` | 可传参；属性不共享 | 无法继承原型方法 |
| 组合继承 | 原型链 + 构造函数 | 属性+方法都继承 | 调用两次父构造；原型多余属性 |
| 原型式 | `Object.create(parent)` | 简单对象继承 | 引用类型共享 |
| 寄生式 | 原型式 + 增强对象 | 灵活增强 | 方法无法复用 |
| 寄生组合 | `Object.create(Parent.prototype)` | 只调一次父构造 | 写法稍复杂 |
| class extends | `class Child extends Parent` | 语法清晰 | 本质仍是寄生组合 |

### 1. 原型链继承

```js
function Parent() {
  this.name = 'parent';
  this.hobbies = ['reading'];
}
Parent.prototype.getName = function() { return this.name; };

function Child() {}
Child.prototype = new Parent(); // 共享父实例属性

const c1 = new Child();
const c2 = new Child();
c1.hobbies.push('swim');
console.log(c2.hobbies); // ['reading', 'swim'] ← 引用共享问题
```

### 2. 构造函数继承

```js
function Parent(name) {
  this.name = name;
}
Parent.prototype.getName = function() { return this.name; };

function Child(name) {
  Parent.call(this, name); // 借用构造函数
}
const c = new Child('Tom');
console.log(c.name);       // 'Tom'
// console.log(c.getName()); // 报错，无法访问原型方法
```

### 3. 组合继承

```js
function Parent(name) {
  this.name = name;
  this.colors = ['red'];
}
Parent.prototype.getName = function() { return this.name; };

function Child(name, age) {
  Parent.call(this, name); // 第二次调用 Parent
  this.age = age;
}
Child.prototype = new Parent(); // 第一次调用 Parent
Child.prototype.constructor = Child;
```

### 6. 寄生组合式继承（推荐）

```js
function inheritPrototype(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype); // 不调用 Parent 构造函数
  Child.prototype.constructor = Child;
}

function Parent(name) {
  this.name = name;
  this.colors = ['red'];
}
Parent.prototype.getName = function() { return this.name; };

function Child(name, age) {
  Parent.call(this, name); // 只调用一次
  this.age = age;
}
inheritPrototype(Child, Parent);

const c1 = new Child('Tom', 18);
const c2 = new Child('Jerry', 20);
c1.colors.push('blue');
console.log(c2.colors);    // ['red'] — 属性不共享
console.log(c1.getName()); // 'Tom' — 方法可复用
```

### 7. ES6 class extends

```js
class Parent {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name); // 必须先调用 super
    this.age = age;
  }
}

const c = new Child('Tom', 18);
console.log(c.getName()); // 'Tom'
```

### 面试追问点

- **为什么寄生组合最优？** 只调用一次父构造函数，原型链正确，属性不共享，方法复用。
- **class extends 和寄生组合的关系？** Babel 编译 class extends 本质上就是寄生组合继承。

---

## 64. 浏览器的垃圾回收机制

**记忆口诀：「标记清除是主流，引用计数有环漏，V8 分代新生代老生代，Scavenge 复制标记整理，增量标记减卡顿」**

**一句话回答：** 浏览器主流使用**标记-清除**算法，从 GC Roots 出发标记可达对象后清除不可达对象；V8 采用**分代回收**——新生代用 Scavenge 复制算法，老生代用标记-清除/标记-整理，并通过**增量标记**减少全停顿。

### 垃圾回收算法对比

| 算法 | 核心思路 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 标记-清除 | 从 GC Roots 标记可达对象，清除未标记 | 实现简单 | 产生内存碎片 |
| 引用计数 | 引用数为零即回收 | 即时回收 | **循环引用无法回收** |
| 复制算法 | 存活对象复制到另一空间，翻转角色 | 无碎片、回收快 | 浪费一半空间 |
| 标记-整理 | 标记后将存活对象移到一端 | 无碎片 | 整理耗时 |

### GC Roots

GC 从一组根对象出发遍历引用链，能到达的是**活动对象**，不能到达的是**垃圾**：

- 全局对象（window / global）
- 当前调用栈中的局部变量
- DOM 树中的节点
- 闭包引用的变量

### V8 分代回收

| 代 | 特点 | 算法 | 空间 |
| --- | --- | --- | --- |
| 新生代 | 生命周期短，占堆 1-8% | Scavenge（from/to 复制） | 1-8 MB |
| 老生代 | 生命周期长，占堆 92%+ | 标记-清除 + 标记-整理 | 大 |

```js
// 对象晋升：新生代经历两次 Scavenge 仍存活 → 移入老生代
// 或新生代空间不足时，较大对象直接进入老生代
```

### Scavenge 算法（新生代）

```
From 空间（使用中）          To 空间（空闲）
┌─────────────┐            ┌─────────────┐
│  A → B → C  │  复制存活  │  A'  B'  C' │
│  (D 死亡)   │  ────────→ │             │
└─────────────┘            └─────────────┘
         角色翻转：To 变为新的 From
```

### 增量标记

老生代标记阶段可能耗时较长，V8 将标记过程**拆分为多个小步骤**，穿插在 JavaScript 执行之间，避免长时间阻塞主线程（全停顿 STW）。

### 面试追问点

- **为什么引用计数被淘汰？** 循环引用 `{ a: objB, b: objA }` 互相引用，计数永不为零。
- **WeakMap/WeakSet 和 GC 的关系？** 键是弱引用，不阻止 GC 回收键对象。

---

## 65. 哪些情况会导致内存泄漏

**记忆口诀：「全局变量意外挂，定时监听忘清除，闭包过度引大对象，DOM 脱离仍引用，console 开发留引用」**

**一句话回答：** 常见内存泄漏场景包括：**意外创建的全局变量**、**未清除的定时器/事件监听器**、**闭包过度引用**、**脱离 DOM 的引用**、**console.log 保留引用**等，导致对象无法被 GC 回收。

### 内存泄漏场景一览

| 场景 | 原因 | 解决方案 |
| --- | --- | --- |
| 意外全局变量 | 未声明直接赋值 | 使用 strict mode；避免隐式全局 |
|  forgotten 定时器 | setInterval 未 clear | 组件销毁时 clearTimeout/clearInterval |
|  forgotten 监听器 | addEventListener 未 remove | 销毁时 removeEventListener |
| 闭包过度引用 | 闭包持有大对象/ DOM | 用完置 null；缩小闭包引用范围 |
| 脱离 DOM 引用 | JS 仍引用已移除的 DOM | 移除 DOM 时同步解除 JS 引用 |
| console.log | 开发者工具保留对象引用 | 生产环境移除 debug 日志 |
| 未清理的 Map/Set | 对象作键但未删除 | 不用时 delete 或 WeakMap |

### 代码示例

```js
// 1. 意外全局变量
function leak() {
  // name = 'leak'; // 非严格模式 → window.name
  window.name = 'leak'; // 显式全局
}

// 2. 定时器未清除
const timer = setInterval(() => {
  const data = fetchLargeData(); // 闭包引用 data
}, 1000);
// 页面卸载时：clearInterval(timer);

// 3. 闭包过度引用
function createHandler() {
  const hugeData = new Array(1000000).fill('x');
  return function() {
    console.log(hugeData.length); // hugeData 无法被回收
  };
}

// 4. 脱离 DOM 的引用
let detachedElement = document.getElementById('btn');
document.body.removeChild(detachedElement);
// detachedElement 仍被 JS 引用 → 内存泄漏
detachedElement = null; // 解除引用

// 5. 事件监听器
element.addEventListener('click', handler);
// 移除元素前应先：element.removeEventListener('click', handler);
```

### 如何检测内存泄漏

- Chrome DevTools → Memory → Heap Snapshot 对比
- Performance → Memory 勾选，观察内存是否持续增长
- `performance.memory`（Chrome 专有，仅参考）

### 面试追问点

- **闭包一定导致内存泄漏吗？** 不一定，只有闭包**不必要地持有**大对象/DOM 时才泄漏。
- **WeakMap 为什么适合缓存？** 键是弱引用，对象无其他引用时 GC 可自动回收。

---

## 66. 请说一说this指向

**记忆口诀：「箭头看定义，new 看实例，显式 call apply bind，隐式看调用，默认 window 或 undefined」**

**一句话回答：** `this` 的指向由**调用方式**决定，优先级为：**箭头函数（定义时绑定）> new 绑定 > 显式绑定（call/apply/bind）> 隐式绑定（对象调用）> 默认绑定（window/undefined）**。

### this 绑定规则优先级

| 优先级 | 规则 | this 指向 |
| --- | --- | --- |
| 1（最高） | 箭头函数 | 定义时外层作用域的 this（词法绑定） |
| 2 | new 绑定 | 新创建的实例对象 |
| 3 | 显式绑定 | call/apply/bind 指定的对象 |
| 4 | 隐式绑定 | 调用该函数的对象 |
| 5（最低） | 默认绑定 | 非严格模式 window；严格模式 undefined |

### 各种绑定示例

```js
// 默认绑定
function show() {
  console.log(this); // 浏览器非严格：window
}
show();

// 隐式绑定
const obj = {
  name: 'Tom',
  getName() { return this.name; }
};
console.log(obj.getName()); // 'Tom'

// 隐式丢失
const fn = obj.getName;
console.log(fn()); // undefined（严格模式）或 window.name

// 显式绑定
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}
greet.call({ name: 'Tom' }, 'Hi');   // 'Hi, Tom'
greet.apply({ name: 'Jerry' }, ['Hello']); // 'Hello, Jerry'
const bound = greet.bind({ name: 'Alice' });
bound('Hey'); // 'Hey, Alice'

// new 绑定
function Person(name) {
  this.name = name;
}
const p = new Person('Tom');
console.log(p.name); // 'Tom'

// 箭头函数 — 无自己的 this
const arrowObj = {
  name: 'Tom',
  getName: () => this.name, // this 是外层（可能是 window）
  getNameCorrect() {
    const inner = () => this.name; // this 继承 getNameCorrect 的 this
    return inner();
  }
};
console.log(arrowObj.getNameCorrect()); // 'Tom'
```

### 特殊场景

```js
// setTimeout 回调 — 默认绑定
setTimeout(function() {
  console.log(this); // window（非严格）
}, 0);

// DOM 事件 — 隐式绑定（this 是触发元素）
button.addEventListener('click', function() {
  console.log(this); // <button>
});

// 箭头函数作事件回调 — this 是定义处的外层
button.addEventListener('click', () => {
  console.log(this); // 外层作用域的 this
});
```

### 面试追问点

- **箭头函数能用作构造函数吗？** 不能，没有 [[Construct]] 和 prototype。
- **bind 返回的函数能 new 吗？** 可以，new 时 this 绑定到新实例，bind 传入的 this 被忽略。

---

## 67. 深拷贝和浅拷贝的区别？如何实现深拷贝？

**记忆口诀：「浅拷只复制第一层，JSON 快但有局限，递归 WeakMap 解循环，structuredClone 原生最省心」**

**一句话回答：** **浅拷贝**只复制第一层，嵌套对象仍共享引用；**深拷贝**递归复制所有层级。实现方式有 `JSON.parse(JSON.stringify)`（有局限）、递归 + WeakMap（处理循环引用）、`structuredClone()`（原生推荐）。

### 浅拷贝 vs 深拷贝

| 对比项 | 浅拷贝 | 深拷贝 |
| --- | --- | --- |
| 复制深度 | 仅第一层 | 所有层级 |
| 嵌套对象 | 共享引用 | 完全独立 |
| 性能 | 快 | 慢 |
| 典型方法 | Object.assign、展开运算符、slice | 递归、structuredClone |

### 浅拷贝实现

```js
const original = { a: 1, b: { c: 2 } };

// Object.assign
const copy1 = Object.assign({}, original);

// 展开运算符
const copy2 = { ...original };

// 数组
const arr = [1, [2, 3]];
const arrCopy = arr.slice(); // 或 [...arr]

copy1.b.c = 999;
console.log(original.b.c); // 999 — 嵌套对象仍共享
```

### 方式一：JSON 序列化（有局限）

```js
const obj = { a: 1, b: { c: 2 }, d: [1, 2] };
const deep = JSON.parse(JSON.stringify(obj));

// ❌ 不支持：undefined、Symbol、Function、Date（变字符串）、RegExp、循环引用
const limited = {
  fn: () => {},
  date: new Date(),
  undef: undefined,
  sym: Symbol('s')
};
JSON.parse(JSON.stringify(limited));
// { date: "2024-01-01T..." } — fn/undef/sym 丢失
```

### 方式二：递归 + WeakMap（推荐手写）

```js
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;

  // 处理循环引用
  if (map.has(obj)) return map.get(obj);

  // 处理 Date
  if (obj instanceof Date) return new Date(obj);

  // 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj);

  // 处理数组和对象
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);

  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], map);
  }
  return clone;
}

// 循环引用测试
const circular = { a: 1 };
circular.self = circular;
const cloned = deepClone(circular);
console.log(cloned.self === cloned); // true
```

### 方式三：structuredClone（原生 API）

```js
const obj = {
  a: 1,
  b: { c: 2 },
  d: new Date(),
  e: new Map([['key', 'value']]),
  f: new Set([1, 2, 3])
};

const deep = structuredClone(obj);
deep.b.c = 999;
console.log(obj.b.c); // 2 — 完全独立

// 不支持：Function、DOM 节点、某些 Symbol
```

### 面试追问点

- **Object.assign 是深拷贝吗？** 不是，只浅拷贝第一层。
- **WeakMap 为什么用 WeakMap 不用 Map 处理循环引用？** WeakMap 键是弱引用，clone 完成后原对象可被 GC，Map 会导致内存泄漏。

---

## 68. 什么是防抖和节流？如何实现？

**记忆口诀：「防抖等停下再做，节流固定频率做，搜索用防抖，滚动用节流」**

**一句话回答：** **防抖（debounce）** 是事件停止触发 n 秒后才执行，适合搜索输入；**节流（throttle）** 是 n 秒内只执行一次，适合滚动/resize 等高频事件。

### 防抖 vs 节流

| 对比项 | 防抖 debounce | 节流 throttle |
| --- | --- | --- |
| 核心思想 | 最后一次触发后延迟 n 秒执行 | 固定间隔内只执行一次 |
| 执行时机 | 停止触发后才执行 | 持续触发时按频率执行 |
| 类比 | 电梯等人：最后一人进来后等几秒关门 | 地铁闸机：每人通过间隔固定时间 |
| 典型场景 | 搜索框输入、表单校验 | 滚动加载、按钮防重复点击 |

### 防抖实现

```js
function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function (...args) {
    const context = this;
    if (timer) clearTimeout(timer);

    if (immediate && !timer) {
      fn.apply(context, args); // 首次立即执行
    }

    timer = setTimeout(() => {
      if (!immediate) fn.apply(context, args);
      timer = null;
    }, delay);
  };
}

// 使用
const search = debounce(function(keyword) {
  console.log('搜索:', keyword);
}, 500);

input.addEventListener('input', (e) => search(e.target.value));
```

### 节流实现

```js
// 时间戳版 — 首次立即执行
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 定时器版 — 停止触发后还会执行一次
function throttleTimer(fn, delay) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

// 使用时间戳 + 定时器结合版（更完善）
function throttleBoth(fn, delay) {
  let timer = null;
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

### 面试追问点

- **防抖 leading 和 trailing 区别？** leading 是首次触发立即执行；trailing 是停止触发后执行（默认）。
- **Vue/React 中怎么用？** 可用 lodash 的 `debounce/throttle`，或在 hooks 中封装。

---

## 69. Promise.allSettled 和 Promise.any 是什么？

**记忆口诀：「allSettled 全结束才汇总，any 一个成功就成功，全失败抛 AggregateError」**

**一句话回答：** `Promise.allSettled`（ES2020）等所有 Promise 完成后返回结果数组（含 status/value/reason）；`Promise.any`（ES2021）返回第一个 fulfilled 的值，全部 rejected 则抛出 `AggregateError`。

### 四个静态方法完整对比

| 方法 | 成功条件 | 失败条件 | 返回状态 | 返回值 |
| --- | --- | --- | --- | --- |
| Promise.all | 全部 fulfilled | 任一 rejected | 同输入 | 结果数组 / 第一个 reason |
| Promise.race | 第一个 settled | 第一个 settled | 同第一个 | 第一个结果 |
| Promise.allSettled | 始终 fulfilled | 不会 rejected | 始终 fulfilled | `{status, value/reason}[]` |
| Promise.any | 任一 fulfilled | 全部 rejected | 同条件 | 第一个 value / AggregateError |

### Promise.allSettled

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected',  reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});

// 使用场景：批量请求，需知道每个的结果
async function batchFetch(urls) {
  const results = await Promise.allSettled(urls.map(url => fetch(url)));
  return results.map((r, i) => ({
    url: urls[i],
    ok: r.status === 'fulfilled',
    data: r.status === 'fulfilled' ? r.value : r.reason
  }));
}
```

### Promise.any

```js
Promise.any([
  Promise.reject('err1'),
  Promise.resolve('success'),
  Promise.reject('err2')
]).then(value => {
  console.log(value); // 'success' — 中间的 reject 被忽略
});

Promise.any([
  Promise.reject('err1'),
  Promise.reject('err2')
]).catch(err => {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors); // ['err1', 'err2']
});
```

### allSettled vs all

| 对比 | Promise.all | Promise.allSettled |
| --- | --- | --- |
| 一个失败 | 立即 rejected | 继续等其他完成 |
| 返回值 | 只有成功的值数组 | 每个都有 status |
| 适用 | 全部必须成功 | 允许部分失败 |

### any vs race

| 对比 | Promise.race | Promise.any |
| --- | --- | --- |
| 关注 | 第一个 settled（成功或失败） | 第一个 fulfilled |
| 全失败 | 返回第一个 rejected | 抛 AggregateError |
| 适用 | 超时控制 | 多源降级 |

### 面试追问点

- **手写 allSettled？** 用 `Promise.all` + 包装每个 promise 捕获错误返回 `{status, value/reason}`。
- **any 的空数组？** 立即 rejected，AggregateError。

---

## 70. forEach 和 map 能否跳出循环？

**记忆口诀：「forEach map 不能 break，return 只跳过当次，要跳出用 for 或 some every」**

**一句话回答：** `forEach` 和 `map` **都不能**用 `break/continue` 跳出循环；`return` 只能跳过**当前这一次**迭代；要跳出循环应使用 `for/for...of + break`，或 `some()/every()` 提前终止。

### 为什么不能 break？

`forEach` 和 `map` 的回调是**普通函数调用**，`break/continue` 只能用于 `for/while/switch` 等语句块，在回调中使用会报 **SyntaxError**。

```js
const arr = [1, 2, 3, 4, 5];

// ❌ SyntaxError: Illegal break statement
// arr.forEach(item => {
//   if (item === 3) break;
// });

// return 只是跳过当前迭代（类似 continue）
arr.forEach(item => {
  if (item === 3) return;
  console.log(item); // 1, 2, 4, 5
});

// map 同理
const result = arr.map(item => {
  if (item === 3) return; // 该位置为 undefined
  return item * 2;
});
console.log(result); // [2, 4, undefined, 8, 10]
```

### 跳出循环的替代方案

| 方式 | 能否 break | 能否 continue | 说明 |
| --- | --- | --- | --- |
| for / while | ✅ | ✅ | 最灵活 |
| for...of | ✅ | ✅ | 可遍历 iterable |
| forEach | ❌ | return 跳过当次 | 无法终止 |
| map | ❌ | return 跳过当次 | 无法终止 |
| some | ✅（return true） | — | 找到即停 |
| every | ✅（return false） | — | 不满足即停 |
| find / findIndex | ✅（内部实现） | — | 找到即停 |

```js
// for...of + break
for (const item of arr) {
  if (item === 3) break;
  console.log(item); // 1, 2
}

// some — 找到满足条件的就停止
arr.some(item => {
  console.log(item);
  return item === 3; // 到 3 时终止
});

// every — 遇到不满足就停止
arr.every(item => {
  console.log(item);
  return item < 3; // 到 3 时终止
});
```

### 不推荐：try/catch + throw

```js
// 可行但不推荐，影响性能和可读性
try {
  arr.forEach(item => {
    if (item === 3) throw new Error('break');
    console.log(item);
  });
} catch (e) {
  if (e.message !== 'break') throw e;
}
```

### 面试追问点

- **for...in 和 for...of 区别？** for...in 遍历键（含原型链）；for...of 遍历值（需 iterable）。
- **map 里 return 和不写 return 区别？** 不写 return 该位置为 undefined；都无法终止循环。

---

## 71. splice 和 slice 的区别？哪些数组方法会改变原数组？

**记忆口诀：「splice 改原数组能增删替，slice 截取返新数组，push pop shift unshift sort reverse 也改原数组」**

**一句话回答：** `splice(start, deleteCount, ...items)` **改变原数组**，可删除/插入/替换；`slice(start, end)` **不改变原数组**，返回截取的新数组。

### splice vs slice

| 对比项 | splice | slice |
| --- | --- | --- |
| 是否改变原数组 | ✅ 是 | ❌ 否 |
| 参数 | (start, deleteCount, ...items) | (start, end) |
| 返回值 | 被删除元素的数组 | 截取的新数组 |
| 负数索引 | 从末尾计算 | 从末尾计算 |
| 用途 | 增删改 | 截取/copy |

```js
const arr1 = [1, 2, 3, 4, 5];

// splice — 从索引 2 删除 1 个，插入 99
const removed = arr1.splice(2, 1, 99);
console.log(arr1);    // [1, 2, 99, 4, 5] — 原数组改变
console.log(removed); // [3]

const arr2 = [1, 2, 3, 4, 5];

// slice — 截取 [1, 3)
const sliced = arr2.slice(1, 3);
console.log(arr2);    // [1, 2, 3, 4, 5] — 原数组不变
console.log(sliced);  // [2, 3]

// 负索引
[1, 2, 3, 4, 5].slice(-2);    // [4, 5]
[1, 2, 3, 4, 5].splice(-2, 1); // 删除倒数第二个
```

### 会改变原数组的方法

| 方法 | 作用 |
| --- | --- |
| push(...items) | 末尾添加 |
| pop() | 末尾删除 |
| shift() | 首位删除 |
| unshift(...items) | 首位添加 |
| splice() | 任意位置增删改 |
| sort(compareFn) | 排序 |
| reverse() | 反转 |
| fill(value, start, end) | 填充 |
| copyWithin(target, start, end) | 内部复制 |

### 不改变原数组的方法

| 方法 | 作用 |
| --- | --- |
| slice(start, end) | 截取 |
| concat(...items) | 合并 |
| map / filter / reduce | 迭代产生新数组 |
| flat / flatMap | 扁平化 |
| [...arr] / Array.from() | 浅拷贝 |

### 面试追问点

- **sort 不传比较函数的行为？** 元素转字符串按 UTF-16 码点排序，`[10, 2, 1].sort()` → `[1, 10, 2]`。
- **splice 只传 start？** 从 start 删到末尾。

---

## 72. Array.sort() 的底层排序算法是什么？

**记忆口诀：「V8 用 TimSort，小数组插入排序，大数组归并，稳定排序看 compare 返回值」**

**一句话回答：** V8 引擎中 `Array.sort()` 使用 **TimSort** 算法（源自 Python），小数组（长度 ≤ 10）用**插入排序**，大数组用**归并排序**；TimSort 是**稳定排序**，比较函数应返回负值/0/正值。

### 排序算法策略

| 数组规模 | 算法 | 原因 |
| --- | --- | --- |
| length ≤ 10 | 插入排序 | 小数组开销低，常数因子小 |
| length > 10 | TimSort | 利用已有有序子序列（run），综合效率高 |

### TimSort 核心思想

TimSort = **归并排序** + **插入排序** 的混合：

1. 将数组分成多个**已有序的子序列（run）**
2. 短 run 用插入排序扩展至最小 run 长度（通常 32-64）
3. 用**归并**合并各 run，类似归并排序但更高效

### 稳定性

**稳定排序**：相等元素的相对顺序在排序后不变。

```js
const items = [
  { name: 'A', score: 80 },
  { name: 'B', score: 90 },
  { name: 'C', score: 80 }
];

items.sort((a, b) => a.score - b.score);
// score 相同时，A 仍在 C 前面 — 稳定
```

### compare 函数返回值

| 返回值 | 含义 |
| --- | --- |
| < 0（负数） | a 排在 b 前面 |
| = 0 | 相对顺序不变 |
| > 0（正数） | a 排在 b 后面 |

```js
// 数字升序
[3, 1, 4, 1, 5].sort((a, b) => a - b); // [1, 1, 3, 4, 5]

// 数字降序
[3, 1, 4].sort((a, b) => b - a); // [4, 3, 1]

// 对象排序
users.sort((a, b) => a.age - b.age);

// 字符串排序（localeCompare）
names.sort((a, b) => a.localeCompare(b, 'zh-CN'));
```

### 不传 compareFn 的陷阱

```js
[10, 2, 1].sort();           // [1, 10, 2] — 按字符串比较！
[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10] — 正确
```

### 面试追问点

- **TimSort 时间复杂度？** 最好 O(n)，平均/最坏 O(n log n)。
- **sort 是 in-place 吗？** 是，直接修改原数组并返回同一引用。

---

## 73. 什么是事件冒泡和事件捕获？

**记忆口诀：「捕获从上到下，目标先触发，冒泡从下到上，stopPropagation 阻传播，委托靠冒泡」**

**一句话回答：** 事件流分三阶段：**捕获阶段**（从 window 向下到目标）→ **目标阶段** → **冒泡阶段**（从目标向上到 window）；`addEventListener` 第三参数 `true` 为捕获；`stopPropagation()` 阻止传播，`preventDefault()` 阻止默认行为；**事件委托**利用冒泡机制。

### 事件流三阶段

```
捕获阶段：window → document → html → body → ... → 目标
目标阶段：到达目标元素
冒泡阶段：目标 → ... → body → html → document → window
```

### 代码示例

```html
<div id="outer">
  <div id="inner">
    <button id="btn">点击</button>
  </div>
</div>
```

```js
const outer = document.getElementById('outer');
const inner = document.getElementById('inner');
const btn = document.getElementById('btn');

// 捕获
outer.addEventListener('click', () => console.log('outer 捕获'), true);
inner.addEventListener('click', () => console.log('inner 捕获'), true);

// 冒泡
outer.addEventListener('click', () => console.log('outer 冒泡'));
inner.addEventListener('click', () => console.log('inner 冒泡'));
btn.addEventListener('click', () => console.log('btn 目标'));

// 点击 btn 输出顺序：
// outer 捕获 → inner 捕获 → btn 目标 → inner 冒泡 → outer 冒泡
```

### 常用 API 对比

| API | 作用 |
| --- | --- |
| event.stopPropagation() | 阻止事件继续传播（捕获/冒泡） |
| event.stopImmediatePropagation() | 阻止传播 + 同元素其他监听器 |
| event.preventDefault() | 阻止默认行为（如 a 标签跳转） |
| event.target | 实际触发事件的元素 |
| event.currentTarget | 当前绑定监听器的元素 |

### 事件委托

```js
// 利用冒泡，在父元素统一处理子元素事件
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('点击了:', e.target.textContent);
  }
});

// 优点：减少监听器数量、动态添加的子元素自动生效
```

### 面试追问点

- **所有事件都冒泡吗？** 不是，`focus/blur/load` 等不冒泡（可用 focusin/focusout 替代）。
- **stopPropagation 和 preventDefault 区别？** 前者阻止传播，后者阻止默认行为，互不影响。

---

## 74. requestAnimationFrame 和 requestIdleCallback 的区别？

**记忆口诀：「rAF 帧前高优先做动画，rIC 空闲低优先做杂活，React Fiber 用 idle 调度」**

**一句话回答：** `requestAnimationFrame` 在**每帧渲染前**调用（高优先级，约 16.7ms），用于动画；`requestIdleCallback` 在**浏览器空闲时**调用（低优先级），用于非紧急任务，可设超时；React Fiber 早期用 rIC 做任务调度。

### 两者对比

| 对比项 | requestAnimationFrame | requestIdleCallback |
| --- | --- | --- |
| 调用时机 | 每帧渲染前 | 浏览器空闲时 |
| 优先级 | 高（与渲染同步） | 低（不影响关键渲染） |
| 频率 | ~60fps（16.7ms） | 不固定，取决于空闲程度 |
| 页面隐藏 | 暂停 | 通常不执行 |
| 典型用途 | 动画、视觉更新 | 日志上报、预加载、分片计算 |
| 浏览器支持 | 所有现代浏览器 | 较新浏览器（Safari 支持较晚） |
| 取消方法 | cancelAnimationFrame | cancelIdleCallback |

### requestAnimationFrame

```js
function animate() {
  // 更新动画状态
  element.style.transform = `translateX(${position}px)`;
  position += 2;

  if (position < 500) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

### requestIdleCallback

```js
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() — 当前帧剩余空闲时间（ms）
  // deadline.didTimeout — 是否因超时强制执行

  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift();
    task();
  }

  if (tasks.length > 0) {
    requestIdleCallback(processTasks); // 还有任务，继续调度
  }
}, { timeout: 2000 }); // 最多等 2 秒，超时强制执行
```

### React Fiber 调度

React Fiber 架构将渲染工作拆分为小单元，利用 **requestIdleCallback**（后改为 MessageChannel 模拟）在浏览器空闲时分片执行，避免长时间阻塞主线程，实现**可中断的渲染**。

### 面试追问点

- **rAF 一定 16.7ms 执行一次吗？** 不一定，跟随屏幕刷新率（120Hz 约 8.3ms），且受主线程阻塞影响。
- **rIC 的 timeout 参数作用？** 超过 timeout 仍无空闲时，强制执行任务，避免饥饿。

---

## 75. 前端模块化机制（IIFE/CJS/AMD/CMD/UMD/ESM）

**记忆口诀：「IIFE 隔离作用域，CJS 同步 require，AMD 异步 define，CMD 延迟 SeaJS，UMD 兼容全局，ESM 静态 import 标准」**

**一句话回答：** 前端模块化经历了 **IIFE（作用域隔离）→ CJS（Node 同步 require）→ AMD（浏览器异步 define）→ CMD（SeaJS 延迟执行）→ UMD（兼容 CJS+AMD+全局）→ ESM（静态 import/export 标准）** 的演进。

### 模块化方案对比

| 方案 | 环境 | 加载方式 | 语法 | 特点 |
| --- | --- | --- | --- | --- |
| IIFE | 浏览器 | 立即执行 | `(function(){})()` | 隔离作用域，无依赖管理 |
| CJS | Node.js | **同步** require | `require/module.exports` | 运行时加载，值拷贝 |
| AMD | 浏览器 | **异步** require | `define/require` | RequireJS，依赖前置 |
| CMD | 浏览器 | 异步 | `define(factory)` | SeaJS，依赖延迟 |
| UMD | 通用 | 自适应 | 包装函数 | 兼容 CJS+AMD+全局变量 |
| ESM | 标准 | 静态分析 | `import/export` | 编译时确定依赖，Tree Shaking |

### IIFE

```js
(function (global) {
  const privateVar = 'secret';
  global.myModule = {
    getPrivate() { return privateVar; }
  };
})(window);
```

### CommonJS（Node.js）

```js
// math.js
module.exports = {
  add: (a, b) => a + b
};

// app.js
const math = require('./math');
console.log(math.add(1, 2)); // 3

// 特点：同步加载、运行时确定、值拷贝（基本类型）/ 引用拷贝（对象）
```

### AMD（RequireJS）

```js
// 定义模块 — 依赖前置
define(['jquery', './utils'], function($, utils) {
  return {
    init() { /* ... */ }
  };
});

// 使用模块
require(['./myModule'], function(myModule) {
  myModule.init();
});
```

### CMD（SeaJS）

```js
// 依赖延迟 — 就近依赖
define(function(require, exports, module) {
  exports.add = function(a, b) { return a + b; };

  // 用时才 require
  const utils = require('./utils');
});
```

### UMD

```js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['dep'], factory);           // AMD
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('dep')); // CJS
  } else {
    root.myLib = factory(root.dep);     // 全局变量
  }
}(typeof self !== 'undefined' ? self : this, function(dep) {
  return { /* ... */ };
}));
```

### ESM（ES Module）

```js
// math.js
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { add } from './math.js';

// 特点：静态分析、编译时加载、严格模式、Tree Shaking、循环引用支持更好
```

### CJS vs ESM

| 对比项 | CommonJS | ES Module |
| --- | --- | --- |
| 加载时机 | 运行时 | 编译时 |
| 输出 | 值的拷贝 | 值的引用（live binding） |
| 语法 | require / module.exports | import / export |
| Tree Shaking | 不支持 | 支持 |
| this 指向 | module.exports | undefined |

### 面试追问点

- **ESM 为什么能 Tree Shaking？** 静态 import/export 在编译时可确定依赖关系，未使用的 export 可安全删除。
- **CJS 和 ESM 能互引吗？** Node.js 支持有限互操作，动态 `import()` 可引入 ESM。

---

## 76. substring 和 substr 的区别？

**记忆口诀：「substring 两索引不含 end，substr 起始加长度已废弃，slice 支持负索引更灵活」**

**一句话回答：** `substring(start, end)` 两个参数都是**索引**，不含 end，负值当 0；`substr(start, length)` 第二参数是**长度**，start 可为负；`substr` 已废弃，推荐用 `substring` 或 `slice`；`slice` 还支持负索引。

### 三者对比

| 方法 | 参数含义 | 负值处理 | 状态 |
| --- | --- | --- | --- |
| substring(start, end) | 起始索引, 结束索引（不含） | 当作 0 | 标准 |
| substr(start, length) | 起始索引, 截取长度 | start 可为负 | **已废弃** |
| slice(start, end) | 起始索引, 结束索引（不含） | 从末尾计算 | 标准（推荐） |

```js
const str = 'Hello World';

// substring — 两个索引
str.substring(0, 5);   // 'Hello'
str.substring(5, 0);   // 'Hello' — 自动交换 start/end
str.substring(-3, 5);  // 'Hello' — 负值当 0

// substr — 起始 + 长度（已废弃）
str.substr(0, 5);    // 'Hello'
str.substr(6);       // 'World'
str.substr(-5);      // 'World' — 从倒数第 5 个开始

// slice — 最灵活
str.slice(0, 5);     // 'Hello'
str.slice(6);        // 'World'
str.slice(-5);       // 'World' — 负索引从末尾算
str.slice(0, -6);    // 'Hello'
```

### 边界行为差异

| 场景 | substring | slice |
| --- | --- | --- |
| start > end | 自动交换 | 返回空字符串 |
| 负索引 | 当作 0 | 从末尾计算 |
| 超出范围 | 自动截断 | 自动截断 |

```js
'hello'.substring(3, 1); // 'el' — 交换为 (1,3)
'hello'.slice(3, 1);     // '' — 不交换，空串
```

### 面试追问点

- **为什么 substr 被废弃？** 参数语义（长度 vs 索引）容易与 substring/slice 混淆。
- **实际开发推荐？** 优先 `slice`，支持负索引，行为与数组 slice 一致。

---

## 77. ES6 新特性汇总

**记忆口诀：「let const 块级作用域，解构模板箭头函数，Symbol Set Map Weak，Promise Generator async，class 模块化 Proxy Reflect」**

**一句话回答：** ES6（ES2015）引入 **let/const、解构赋值、模板字符串、箭头函数、默认参数、rest/展开运算符、Symbol、Set/Map/WeakSet/WeakMap、Promise、Generator、class、模块化（import/export）、Proxy/Reflect、for...of/Iterator** 等重要特性，是 JavaScript 最重大的一次更新。

### ES6 特性分类一览

| 分类 | 特性 | 说明 |
| --- | --- | --- |
| 变量声明 | let / const | 块级作用域，const 不可重新赋值 |
| 解构 | 数组/对象解构 | `const {a, b} = obj` |
| 字符串 | 模板字符串 | `` `Hello ${name}` `` |
| 函数 | 箭头函数 | 无 own this，无 arguments |
| 函数 | 默认参数 | `function fn(x = 1) {}` |
| 函数 | rest 参数 | `function fn(...args) {}` |
| 运算符 | 展开运算符 | `[...arr]`、`{...obj}` |
| 数据类型 | Symbol | 唯一标识符 |
| 数据结构 | Set / Map | 集合 / 键值对 |
| 数据结构 | WeakSet / WeakMap | 弱引用集合 |
| 异步 | Promise | 异步编程解决方案 |
| 异步 | Generator | 可暂停的函数 |
| 异步 | async / await | Promise 语法糖（ES2017） |
| 面向对象 | class | 类语法糖 |
| 模块化 | import / export | ES Module |
| 元编程 | Proxy / Reflect | 拦截/反射对象操作 |
| 迭代 | for...of / Iterator | 统一迭代协议 |

### 核心特性代码示例

```js
// 1. let / const — 块级作用域 + 暂时性死区
{
  let a = 1;
  const b = 2;
  // b = 3; // TypeError
}

// 2. 解构赋值
const [x, y, ...rest] = [1, 2, 3, 4];
const { name, age = 18 } = { name: 'Tom' };

// 3. 模板字符串
const greeting = `Hello, ${name}!`;

// 4. 箭头函数
const double = n => n * 2;
const sum = (a, b) => a + b;

// 5. 默认参数 + rest
function createUser(name, role = 'user', ...tags) {
  return { name, role, tags };
}

// 6. 展开运算符
const merged = { ...obj1, ...obj2 };
const combined = [...arr1, ...arr2];

// 7. Symbol
const id = Symbol('id');
const obj = { [id]: 123 };

// 8. Set / Map
const set = new Set([1, 2, 2, 3]); // {1, 2, 3}
const map = new Map([['key', 'value']]);

// 9. Promise
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data));

// 10. class
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} speaks`); }
}
class Dog extends Animal {
  speak() { console.log(`${this.name} barks`); }
}

// 11. 模块化
// export const PI = 3.14;
// import { PI } from './math.js';

// 12. Proxy
const proxy = new Proxy(target, {
  get(target, key) { return key in target ? target[key] : '默认值'; }
});

// 13. for...of
for (const item of [1, 2, 3]) {
  console.log(item);
}
```

### ES6+ 后续重要补充（了解）

| 版本 | 重要特性 |
| --- | --- |
| ES2016 | Array.includes、** 指数运算符 |
| ES2017 | async/await、Object.values/entries |
| ES2018 | 展开运算符支持对象、Rest/Spread properties |
| ES2019 | Array.flat/flatMap、Object.fromEntries |
| ES2020 | Optional Chaining `?.`、Nullish Coalescing `??`、BigInt、Promise.allSettled |
| ES2021 | Promise.any、逻辑赋值 `&&=` `\|\|=`、`??=` |
| ES2022 | class 私有字段 `#`、Top-level await、Array.at() |

### 面试追问点

- **let/const 有变量提升吗？** 有暂时性死区（TDZ），声明前访问报 ReferenceError。
- **箭头函数和普通函数核心区别？** 无 own this/arguments/new.target，不能作构造函数。
- **Proxy 常用场景？** Vue 3 响应式、数据校验、日志拦截。

---
