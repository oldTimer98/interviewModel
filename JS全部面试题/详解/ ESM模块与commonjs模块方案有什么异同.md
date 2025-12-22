## 视频讲解： 

此处为语雀视频卡片，点击链接查看：[ESM 模块与 commonjs 模块方案有什么异同.mp4](https://www.yuque.com/u1598738/zqco83/tuy44ntdhopftp4z#uh7pB)

## 基础：

- **ESM**：是 ECMAScript 2015（也称为 ES6）提出的一种模块化方案。在浏览器中，你可以通过 import 和 export 关键字来使用 ESM。并且，大部分现代浏览器都原生地支持 ESM。
- **CommonJS**：是 Node.js 默认的模块化方案。你可以使用 require 来加载模块，使用 `module.exports` 来导出模块。

两者都用于实现模块加载，区别主要体现在如下方面：

- 语法：

- CommonJS 使用 require(<module-path>) 导入模块，并使用 module.exports 导出模块

```
// 导出模块 module.exports = {  add: function(a, b) {    return a + b;  },  subtract: function(a, b) {    return a - b;  } }; // 导入模块 const {add, subtract} = require('./module'); console.log(add(5, 5)); // 10 console.log(subtract(10, 5)); // 5
```

- ES Module 使用 import 导入模块，并使用 `export` 导出模块。例如：

```
// 导出模块 export function add(a, b) {  return a + b; }; export function subtract(a, b) {  return a - b; }; // 导入模块 import {add, subtract} from './module.mjs'; console.log(add(5, 5)); // 10 console.log(subtract(10, 5)); // 5
```

- 加载机制

- CommonJS的加载机制是同步的，即：在加载和解析模块时，JavaScript 会停止代码的执行直到文件被加载完成。这对于服务器端的 Node.js 应用来说是可以接受的，因为文件都存储在本地硬盘，读取速度快。然而，对于运行在浏览器的代码，这将导致执行阻塞，降低性能。
- 相反，ESM 的加载机制是异步的，模块的导入、解析和执行是在**解析阶段**就已经完成的。这意味着浏览器可以并行请求多个模块，然后在所有模块都加载完毕后，再一起执行。这种方式非常适合浏览器环境，因为这样就不用因等待文件加载而阻塞代码执行，从而提高性能。

- 顶层作用域以及运行环境：

- CommonJS在每个模块的顶层作用域中，有许多预定义的变量，如 `__filename`, `__dirname`, 和 `NODE_PATH`。而 ESM 没有这些变量。
- CommonJS 是 Node.js 所有版本都支持的模块系统，而 ESM 需要 Node.js v12 或更高版本，并且在浏览器中也有支持。
- 在 CommonJS 模块中，`this` 指向当前模块的 `exports` 对象；但是在 ESM 中，`this` 是 `undefined`。

- 文件扩展名:

- Node.js 默认将.js和.ts当作CommonJS模块处理。
- CommonJS 使用 `.cjs` 扩展名编写 JavaScript，并使用 .cts 扩展名编写 TypeScript。
- ESM 使用 `.mjs` 扩展名编写 JavaScript，并使用 .mts 扩展名编写 TypeScript。

- tree-shaking 支持

- CJS 不支持 tree-shaking：因为 cjs 需要运行起来之后，才知道有哪些依赖；
- ESM (ES Module) 可以支持 Tree Shaking，主要原因在于其静态的结构。在 ES Module 中，导入（import）和导出（export）语句在编译阶段就确定下来了，也就是说模块之间的依赖关系在这一阶段就已经明确了。这种特性使得构建工具如 Webpack 或 Rollup 可以轻松地在编译阶段检测出哪些代码被使用，哪些未被使用，从而实现所谓的 "dead code elimination"，删除未被使用的代码。



## 进阶

### 导出方式

在 ES6 Module（ESM） 中，我们**导出的是一个引用，而不是一个复制的副本**。这就意味着，当我们导入一个值，并且改变这个值的时候，实际上我们改变的是这个值本身，而不仅仅是它的副本，举个例子：

```javascript
// file a.mjs
export let a = 1;

setInterval(()=>{
    a+=1;
    console.log('a 中的 a:', a)
},1000)

// file b.js
import { a } from './a.mjs';

setInterval(() => {
    console.log('b 中的 a:', a)
}, 1000);
```

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1700400304648-43d69df3-104b-4feb-948e-b66b78b8cd1d.png)

执行上述代码，你会发现 b 文件中的 a 值与 a 文件保持一致，这是因为，ESM 的导入和导出都是动态绑定的，也源模块值的任何变化都会反映在导入的模块中。

相比之下，CommonJS（CJS）的导出方式也是导出一个引用。但需要注意的是，CJS 导出的是 `module.exports` 对象的一个引用。如果你 `require` 一个 CJS 模块，你得到的是那个 exports 对象的一个引用，并且在你修改这个 exports 对象的时候，你是在原来的对象上进行修改的，而不是在它的副本上，例如：

```javascript
// c.js
let value = 1;
module.exports = value;

setInterval(() => {
  module.exports = value += 1;
  console.log("c 中的 value", value);
}, 1000);

// d.js
const c = require("./c");

setInterval(() => {
  console.log("d 中的 c", c);
}, 1000);
```

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1700399468279-fa98aeb5-f5f8-4828-983e-7332ebf206a9.png)

示例整体逻辑跟上述 ESM 示例差不多，但 c 文件内部定时更新的 `module.exports`值并不会映射到下游模块，这意味着，当模块被多次 require，其导出的内容也可能会被改变，取决于是否有其他地方修改了这个对象。



总结来说，**ESM 和 CJS 在导出时都是使用的引用，而非复制值，从而使得导出的内容能够在不同模块间共享(很多同学这里理解错了)**。然而，两者在处理对导出内容的修改上表现略有不同，ESM 允许直接修改导入值(动态关联的副本)，而 CJS 则只允许修改导出对象的属性，而无法修改 `module.exports` 本身。这些区别主要源于两者在设计上的不同，ESM 是静态的导入导出，而 CJS 则是动态的。



### 深入 ESM 模块执行机制

CJS 的执行逻辑比较简单，可以理解 js 引擎每次遇到 `require` 函数时，立即读入、解释、执行导入文件，取得导出值。

而 ESM 则略显复杂，执行过程主要划分为三个阶段：**解析，链接和求值**。

1. **解析阶段**：在解析阶段中，JavaScript 引擎会读取源文件，并找出所有的 import 声明。然后它会依次解析这些源文件路径，并找出**递归地找出所有依赖的模块**。解析阶段结束后，JavaScript 引擎将会知道模块之间的依赖关系。
2. **链接阶段**：在链接阶段中，JavaScript 引擎会创建所有模块作用域，并分配内存空间给所有的导入和导出的变量。然后，引擎会把导出的变量关联(**注意是动态关联**)到它们在其他模块中的引用。
3. **求值阶段**：在求值阶段中，JavaScript 引擎会按照解析阶段确定的依赖关系，**深度优先地对执行模块代码**。注意这里说的深度优先意味着如果模块A依赖于模块B，而模块B又依赖于模块C，那么首先会执行模块C，然后是模块B，最后才是模块A。这是因为模块A可能需要用到模块B提供的功能，而模块B又可能需要用到模块C提供的功能，所以需要先执行模块C，再执行模块B，最后执行模块A

每个模块文件只会被执行一次，不论它被导入多少次。执行结果会被缓存，后续对同一模块的导入会直接使用缓存的结果。

另外，需要特别注意 ESM 对模块文件的导入是**异步的**，但整个导入和导出过程（解析、链接和求值阶段）是同步的，例如：

```javascript
// moduleA.js
console.log('moduleA start')
import { foo } from './moduleB.js'
console.log('moduleA: ', foo)
console.log('moduleA end')

// moduleB.js
console.log('moduleB start')
export const foo = 'foo'
console.log('moduleB end')

// 结果输出
// moduleB start
// moduleB end
// moduleA start
// moduleA: foo
// moduleA end
```

这里说的异步体现在浏览器解析到 `import` 语句，不会阻塞代码而是并行发出模块请求(require 会出现阻塞)；而同步则体现在资源加载回来之后，再开始做链接求职阶段。



### 理解 ESM Tree-shaking 原理

webpack/rollup 等打包工具都某种程度上支持 Tree-shaking，它们的底层逻辑也都比较相似，大致可划分为四个步骤：

1. **生成依赖关系图**：首先，**使用ESM的静态导入和导出功能**，打包工具会在编译阶段解析模块的依赖关系，生成一个依赖关系图。
2. **标记未使用的代码**：依赖关系图创建完成后，打包工具会遍历依赖图中的所有导出项。对于未被其他模块引用的导出项，打包工具将其标记为未使用。
3. **删除未使用的代码**：最后，打包工具通過其内部的优化工具，例如：uglify、terser等，会删除那些已经被标记为未使用的代码。
4. **生成最终的打包文件**：通过以上步骤，我们已经成功地移除了未使用的代码，后续继续走构建工具的 generation 过程生成最终代码即可。

这是 Tree-Shaking 最基本的工作原理，可以看出这个过程对 ESM 的依赖比较重。在实践中，不同的打包工具可能会有一些额外的优化技巧和注意事项，不过这并不是本文重点，先忽略。



### ESM 的优势

综上，ESM 方案在多数时候表现更好，性能更佳，安全性、稳定性更强，体现在：

1. **静态分析和优化**：由于 ESM 的 import 和 export 声明均在编译阶段（而非执行阶段）解析，因此更适合于静态分析。例如，这使得诸如 Tree Shaking（在打包过程中删除未使用的代码）这样的优化变得可能。
2. **实时绑定**：ESM 支持实时绑定：当导出项发生变化时，所有导入相应模块的地方都能获取到最新的值，这能确保模块值“唯一真实”，确保不会被错误更改；
3. **更好的安全性**：在 ESM 中，导出的变量是只读的，外部不能修改。这意味着一旦模块的输出被导入，就不能被改变(除非原始模块中发生了变更)，有助于保护模块内部的逻辑不被外部修改。
4. **默认导出**：ESM 支持默认导出，可以更灵活地处理模块的导出和导入。
5. **更好的兼容性**：由于 ESM 是 ECMAScript 标准的一部分，因此在**最新的浏览器和 Node.js 环境中**都能得到良好支持。
6. **更有利于重构**：基于 ESM 的静态特性，我们完全可以通过代码静态分析方式找到模块导入导出的具体使用情况，在下次重构时(例如文件重命名、导出结构变化)更容易找到所有关联改动点，做出变更。