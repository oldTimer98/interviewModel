在最开始学习 JavaScript 时，我一直被灌输 Object 中的 Key 是无序的，不可靠的，而与之相对的是 Map 实例会维护键值对的插入顺序。 

**But，Object 的键值对真的是无序的吗？**实际上在 ES2015 以后，Object.keys 的规则变了： 

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751820370-2a979be1-5c23-44d5-a2ee-5ee2f0d65174.png)

在一些现代的浏览器中，keys 输出顺序是可以预测的！ 

## Key 都为**自然数：**

注意这里的自然数是指正整数或 0，如果是其他类的 Number —— 浮点数或者负数 —— 都会走到下一组类型里，像NaN或者Infinity这种也自然归到下一个类型里，但是像科学记数法这个会稍微特殊一点，感兴趣的同学可以自己试一下。 

总结来说，就是当前的 key 如果是自然数就按照自然数的大小进行升序排序。 



```javascript
const objWithIndices = {
  23: 23,
  '1': 1,
  1000: 1000
};

console.log(Reflect.ownKeys(objWithIndices)); // ["1", "23", "1000"]
console.log(Object.keys(objWithIndices)); // ["1", "23", "1000"]
console.log(Object.getOwnPropertyNames(objWithIndices)); // ["1", "23", "1000"]
```

包括在for-in循环的遍历中，keys也是按照这个顺序执行的。 

## Key 都为 String 

如果 key 是不为自然数的 String（Number 也会转为 String）处理，则按照加入的时间顺序进行排序。 



```javascript
const objWithStrings = {
  "002": "002",
  c: 'c',
  b: "b",
  "001": "001",
}

console.log(Reflect.ownKeys(objWithStrings)); // ["002", "c", "b", "001"]
console.log(Object.keys(objWithStrings));// ["002", "c", "b", "001"]
console.log(Object.getOwnPropertyNames(objWithStrings));// ["002", "c", "b", "001"]
```

## Key 都为symbol 



```javascript
const objWithSymbols = {
  [Symbol("first")]: "first",
  [Symbol("second")]: "second",
  [Symbol("last")]: "last",
}

console.log(Reflect.ownKeys(objWithSymbols));// [Symbol(first), Symbol(second), Symbol(last)]
console.log(Object.keys(objWithSymbols));// [Symbol(first), Symbol(second), Symbol(last)]
console.log(Object.getOwnPropertyNames(objWithSymbols));// [Symbol(first), Symbol(second), Symbol(last)]
```

如果 Key 都为 Symbol，顺序和 String 一样，也是按照添加的顺序进行排序的。 

## 如果是以上类型的相互结合 



```javascript
const objWithStrings = {
  "002": "002",
  [Symbol("first")]: "first",
  c: "c",
  b: "b",
  "100": "100",
  "001": "001",
  [Symbol("second")]: "second",
}

console.log(Reflect.ownKeys(objWithStrings));
// ["100", "002", "c", "b", "001", Symbol(first), Symbol(second)]
```

结果是先按照自然数升序进行排序，然后按照非数字的string的加入时间排序，然后按照symbol的时间顺序进行排序，也就是说他们会先按照上述的分类进行拆分，先按照自然数、非自然数、Symbol的顺序进行排序，然后根据上述三种类型下内部的顺序进行排序。 

## 总结

1. 在es6之前object的键值对是无序的
2. 在es6之后object的键值对按照自然数、非自然数和symbol进行排序，自然数是按照大小升序进行排序，其他两种都是按照插入的时间顺序进行排序。