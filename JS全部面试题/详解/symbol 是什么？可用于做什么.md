## 基础

`Symbol` 是 ES6 引入的一种新的原子数据类型，与Number、String、Boolean、undefined、null 对标。Symbol 的特点在于它是唯一的，即使我们创建了两个具有相同描述的 Symbol，他们也是不同的，因此，Symbol 的主要作用就是生成一个唯一的标识符。示例：

```javascript
let symbol1 = Symbol();
let symbol2 = Symbol('symbol');

console.log(typeof symbol1); // "symbol"
console.log(symbol1 === symbol2); // false，即使描述符相同，生成的Symbol还是唯一的
```

使用场景：



## 进阶

### Symbol 与元编程

**元编程**就是程序能够对其自身进行操作的一种策略，ES6 引入了一些内置的 Symbol 值，用于实现元编程的。比如这里的 `Symbol.iterator`，这是一个特殊的 Symbol，被用于定义产生一个对象默认遍历器的接口：

```javascript
let obj = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
}

for (let value of obj) {
  console.log(value); // 分别输出 1, 2, 3
}
```

借助这个 `Symbol`，我们可以在任意对象上实现遍历协议，从而实现遍历数据能力。