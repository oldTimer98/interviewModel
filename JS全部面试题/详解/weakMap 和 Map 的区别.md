关键在于强引用与弱引用的区别；同样的逻辑也使用与 set vs weakset

## 基础：

- map 的键是强引用，只要键不释放就会一直占着内存，不被GC；weakmap 的键(注意只是键)是弱引用 —— 不会计入垃圾回收机制

- 注意：键是弱引用，值不是！但键被释放后，对应的值也没有其它引用的话，值也会被释放

- map 的键值可以是任意的数据类型：基础类型、对象、函数等；weakmap 的键只能是非 null 的对象引用
- 由于 key 随时会被回收，所以 weakmap 的key 不可枚举，相应地也就不能获取 size 等，它能做的事情也就只有 has/get/set/delete 四种操作；map 相对比较丰富，has/get/set/delete 之外，支持 entries/size/foreach 等
- map 能轻易转化为数组；weakmap 做不到

## 进阶

弱引用，是指不能确保其引用的[对象](https://zh.m.wikipedia.org/wiki/对象_(计算机科学))不会被[垃圾回收器](https://zh.m.wikipedia.org/wiki/垃圾回收器)回收的引用，这是一个计算机基础概念，在许多语言(java, python 等)都有相关实现，与 GC 强相关。

为什么会有 map、weakmap 类型？

- map：本身是一种非常常用的数据结构 —— 字典，可以用于快速索引信息等；过去通常用 object 实现，但 obj 只能用字符串作为key，有很大限制，所以出现 map，支持任意类型作为 key；

- 适用于：

- 需要用 string 意外的类型存储键值对时
- 需要频繁增删键值对时 —— 比单纯用 object 性能更好

- 问题：键会占用对象引用，容易导致内存泄露

- weakmap：不会影响key对象本身的释放，能一定程度上规避内存泄露问题

- 适用于：容易出现内存泄露的场景

- dom 节点的缓存
- 数据缓存
- 可以纯粹用对象作为 key，且不需要遍历的场景

- 问题：功能较薄弱；随时会被回收，不可依赖

- 类似的，还有 [WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef)，也是基于相似的逻辑提出的 proposal，有兴趣的同学也可以看一看