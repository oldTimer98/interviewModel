对于多数编程语言，最基本的功能就是**能够存储变量当中的值、并且允许我们对这个变量的值进行访问和修改**。那么有了变量之后，应该把它放在哪里、程序如何找到它们？是否需要提前约定好一套存储变量、访问变量的规则？答案是肯定的，这套规则就是**作用域**。



说到作用域那就不得不先说一说编译原理（由于编译原理是一个比较底层的内容，这里只简单介绍，后面会有一篇文章专门介绍JS编译原理）。



JavaScript 引擎进行编译的步骤和传统的编译语言非常相似，在传统的编译语言中，程序中的代码在执行之后会经历三个步骤：词法分析、语法分析、代码生成：

1. **词法分析**：这个阶段会将源代码拆成最小的、不可再分的词法单元（token）。比如代码 var name = 'hello'；通常会被分解成 var 、name、=、hello、; 这五个词法单元。代码中的空格在 JavaScript 中是被直接忽略的。
2. **语法分析**：这个过程是将上一步生成的 token 数据，根据语法规则转为 AST。如果源码符合语法规则，这一步就会顺利完成。如果源码存在语法错误，这一步就会终止，并抛出一个“语法错误”。
3. **代码生成**：这一步就是将AST转化为可执行代码，简单来说就是将 var name = 'hello'; 的AST转化为一组机器指令，用来创建一个 name 变量（需要给name分配内存），并将一个值储存在 name 中。



比起那些编译过程只有三个步骤的语言的编译器，JavaScript 引擎要复杂的多，这里不再细说。总之，任何JavaScript代码片段在执行前都要进行编译，因此在 JS 引擎眼里，var name = 'hello'; 语句包含了两个声明：

- var name （编译时处理）
- name = 'hello' （运行时处理）



你可能会问，JS 不是不存在编译阶段的“动态语言”吗？事实上，JS 也是有编译阶段的，它和传统语言的区别在于，JS 不会早早地把编译工作做完，而是一边编译一边执行。简单来说，所有的 JS 代码片段在执行之前都会被编译，只是这个编译的过程非常短暂（可能就只有几微妙、或者更短的时间），紧接着这段代码就会被执行。



在编译阶段和执行阶段阶段的过程如下：

- **编译阶段：**编译器会找遍当前作用域，看看是不是已经有一个叫 name 的变量。如果有，那么就忽略 var name 这个声明，继续编译下去；如果没有，则在当前作用域里新增一个 name。然后，编译器会为引擎生成运行时所需要的代码，程序就进入了执行阶段。
- **执行阶段：**JS 引擎在执行代码的时候，仍然会查找当前作用域，看看是不是有一个叫 name 的变量。如果能找到，就给它赋值。如果找不到，就会从当前作用域里向上层作用域逐级查找。如果最终仍然找不到 name 变量，引擎就会抛出一个异常。



这里，JS引擎的**查找过程**就是作用域链，作用域指的是**变量能够被访问到的范围。**在 JavaScript 中，作用域也分为好几种，ES6 之前只有全局作用域和函数作用域两种。ES6 出现之后，又新增了块级作用域，下面这来看看这几个概念。

## 全局作用域

在编程语言中，变量一般会分为**全局变量和局部变量**。在 JavaScript 中，全局变量是挂载在 window 对象下的变量，所以在网页中的任何位置都可以使用并且访问到这个全局变量。下面来看一下全局作用域：

```typescript
var globalName = 'global';
function getName() { 
  console.log(globalName) // global
  var name = 'inner'
  console.log(name) // inner
} 
getName();
console.log(name); 
console.log(globalName); //global
```

可以看到，globalName 变量在任何地方都是可以被访问到的，所以它就是全局变量。而在 getName 函数中作为局部变量的 name 变量是不具备这种能力的。



在 JavaScript 中，所有**没有经过定义而直接被赋值的变量默认就是一个全局变量**，比如下面代码中 setName 函数里面的 vName：

```typescript
function setName(){ 
  vName = 'setName';
}
setName();
console.log(vName); // setName
console.log(window.vName) // setName
```

可以发现，全局变量是拥有全局的作用域，无论在何处都可以使用它，在浏览器控制台输入 window.vName 时，就可以访问到 window 上的全局变量。当然全局作用域有相应的缺点，当定义很多全局变量时，可能会引起变量命名的冲突，所以在定义变量时应该注意作用域的问题。

## 函数作用域

在 JavaScript 中，函数中定义的变量叫作函数变量，这种变量只能在函数内部才能访问到，所以它的作用域也就是函数的内部，称为函数作用域：

```typescript
function getName () {
  var name = 'inner';
  console.log(name); //inner
}
getName();
console.log(name);
```

可以看到，name 变量是在 getName 函数中进行定义的，所以 name 是一个局部的变量，它的作用域就在 getName 函数里，也称作函数作用域。



除了这个函数内部，其他地方都是不能访问到它的。同时，当这个函数被执行完之后，这个局部变量也相应会被销毁。所以会看到在 getName 函数外面的 name 是访问不到的。

## 块级作用域

ES6 中新增了块级作用域，最直接的表现就是新增的 let 和 const 关键词，使用这两个关键词定义的变量只能在块级作用域中被访问，有“暂时性死区”的特点，也就是说这个变量在定义之前是不能被使用的。



说到暂时性死区，还要从“变量提升”说起，来看下面代码：

```typescript
function foo() { 
  console.log(bar) 
  var bar = 3 
} 
foo()
```

上面代码会输出：undefined，原因是变量bar在函数内进行了提升。相当于：

```typescript
function foo() { 
  var bar 
  console.log(bar) 
  bar = 3 
} 
foo()
```

但在使用 let声明时，会报错：

```typescript
function foo() { 
  console.log(bar) 
  let bar = 3 
} 
foo() // Uncaught ReferenceError: bar is not defined。
```

使用 let 或 const 声明变量，会针对这个变量形成一个封闭的块级作用域，在这个块级作用域当中，如果在声明变量前访问该变量，就会报 referenceError 错误；如果在声明变量后访问，则可以正常获取变量值：

```typescript
function foo() { 
  let bar = 3 
  console.log(bar) 
} 
foo()
```

这段代码正常输出 3。因此在相应花括号形成的作用域中，存在一个“死区”，起始于函数开头，终止于相关变量声明的一行。在这个范围内无法访问 let 或 const 声明的变量。



说完暂时性死区，下面来看看块级作用域。在 JavaScript 编码过程中， if 语句及 for 语句后面 {} 这里面所包括的就是块级作用域：

```typescript
console.log(a) //a is not defined
if(true){
  let a = '123'；
  console.log(a)； // 123
}
console.log(a) //a is not defined
```

可以看到，变量 a 是在 if 语句{} 中由 let 关键词进行定义的变量，所以它的作用域是 if 语句括号中的那部分，而在外面进行访问 a 变量是会报错的，因为这里不是它的作用域。所以在 if 代码块的前后输出 a 这个变量的结果，控制台会显示 a 并没有定义。