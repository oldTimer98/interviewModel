### 1、对原型链的理解

javascript 对象里有一个属性叫 prototype，也称作原型，它指向另一个对象或者 null---Object.`__proto__`.Prototype=null，
当我们查找某个属性和方法时，会按照原型链一步一步向上查找，直到找到该属性和方法，或到达原型链顶端即 Object.prototype 为止

目的节省内存----可以继承、共享属性和方法

### 2、map 和 Object 的区别 

1.键的类型 2. 键值对的顺序 3.大小的获取 4.原型链 5.迭代器：

### 3、this 指向

常见有四种指向：默认绑定，隐私绑定，显示绑定（call、apply、bind），new 绑定
<img src="image.png" alt="Alt text" style="zoom:67%;" />

  **特殊的this指向**
1、setTimeout 和 setInterval   --window
2.forEach、find、findIndex、map ---，第二个参数，为空就是window
3.IIFE立即执行函数--window
4、箭头函数 ---

### 4、闭包的作用、原理和使用场景

闭包让你可以在一个内层函数中访问到其外层函数的作用域，闭包其实就是一个可以访问其他函数内部变量的函数。即一个定义在函数内部的函数，或者说闭包是个内嵌函数。

作用：利用闭包实现缓存

闭包产生的本质就是：**当前环境中存在指向父级作用域的引用。**

#### 下面来看看闭包的表现形式及应用场景

1、在定时器、事件监听、Ajax 请求、Web Workers 或者任何异步中，只要使用了回调函数，实际上就是在使用闭包：

2、**作为函数参数传递的形式：**

3、IFE（立即执行函数），创建了闭包，保存了全局作用域（window）和当前函数的作用域，因此可以输出全局的变量：

4、**结果缓存（备忘模式）**

### 5、**正向代理和反向代理的区别**

正向代理和反向代理是两种不同类型的代理服务器，它们在网络通信中扮演不同的角色。

1. 正向代理（Forward Proxy）：
   - 正向代理作为客户端的代理，代表客户端向其他服务器发送请求。客户端需要通过正向代理来访问其他服务器，因为直接访问会受到限制或阻止。
   - 举个例子，当你在公司内部网络中访问互联网时，你可能需要通过公司的正向代理服务器来访问外部网站，因为公司的网络设置了防火墙或者其他安全限制。
2. 反向代理（Reverse Proxy）：
   - 反向代理作为服务器的代理，代表服务器接收客户端的请求并将请求转发到内部的服务器。客户端不知道自己实际正在与哪个服务器通信，因为所有的请求都是发送到反向代理服务器。
   - 举个例子，当你访问一个网站时，你实际上在与反向代理服务器通信，它会将你的请求转发到后端的多个服务器上，然后将结果返回给你。

总的来说，正向代理是代表客户端发出请求，而反向代理是代表服务器接收请求。它们的主要区别在于代理的角色不同，以及它们在网络通信中的位置和功能不同。

### 6、箭头函数和普通函数的区别

### 7、ES6新特性

### 8、promise.all和promise.allSettled的区别

### 9、subString、subStr区别

### 10、symbol作用和使用场景

### 11、JS脚本异步加载

### 12、typeof和intanceof区别

### 13、forEach、map是否可以break

### 14、如何判断数组类型

### 15、操作数组元素的方法有哪些

```
1。Object.prototype.toString.call(obj).slice(8,-1) ---'Array'
2.Array.isArray()
3.obj.__proto__===Array.prototype
4.obj instanceof Array
5.Array.prototype.isPrototypeof(obj)
```

### 16、sort排序算法的本质？

### 17、如何拷贝一个对象？如何实现深浅拷贝

#### 1、浅拷贝

```javascript
1.直接赋值
2。使用Object.assign()
3.扩展运算符
4.手写浅拷贝
```

#### 2、深拷贝

```javascript
1.JSON.stringify()
2.lodash.cloneDeep()
3.手写深拷贝
```

### 18、splice和slice会改变原数组吗？如何删除数组最后一个元素？

```javascript
1.splice(-1,1)
2.slice(0,-1)
3.pop()
4.delete a.length-1
```

### 19、0.1+0.2为什么不等于0.3？

```javascript
1.二进制转换的过程中精度丢失
2.计算的过程中精度丢失

解决：
	1.将数字转化成整数
    2.使用第三方库
    3.使用tofixed
```

### 20、 **== 和 === 的区别**

```javascript

```

### 21、**解释 requestAnimationFrame/requestIdleCallback，分别有什么用**

```javascript

```

#### 

```javascript

```

