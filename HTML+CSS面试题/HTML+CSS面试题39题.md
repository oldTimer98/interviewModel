## 1.说一下 web worker

**一句话回答：** Web Worker 是浏览器提供的**多线程**方案，让 JS 可以在后台线程执行耗时任务，不阻塞主线程的 UI 渲染。

**核心要点：**

- **独立线程**：Worker 运行在独立的全局上下文中，不能直接操作 DOM
- **通信方式**：主线程与 Worker 通过 `postMessage` 发送消息，`onmessage` 接收消息（数据是深拷贝的）
- **适用场景**：大数据计算、图片处理、文件解析等 CPU 密集型任务

**使用三步：**

1. 创建 Worker 文件：`worker.js`（里面写耗时逻辑）
2. 主线程创建实例：`const worker = new Worker('worker.js')`
3. 通过 `postMessage / onmessage` 双向通信

## 2.行内元素有哪些？块级元素有哪些？ 空(void)元素有那些？

- **行内元素有：a b span img input select strong；**
- **块级元素有：div ul ol li dl dt dd h1 h2 h3 h4 h5 h6 p；**

**空元素，即没有内容的HTML元素。空元素是在开始标签中关闭的，也就是空元素没有闭合标签：**

- **常见的有：`<br>`、`<hr>`、`<img>`、`<input>`、`<link>`、`<meta>`；**
- **鲜见的有：`<area>`、`<base>`、`<col>`、`<colgroup>`、`<command>`、`<embed>`、`<keygen>`、`<param>`、`<source>`、`<track>`、`<wbr>`。**

## 3. CSS选择器及其优先级

| **选择器**     | **格式**      | **优先级权重** |
| -------------- | ------------- | -------------- |
| id选择器       | #id           | 100            |
| 类选择器       | .classname    | 10             |
| 属性选择器     | a[ref=“eee”]  | 10             |
| 伪类选择器     | li:last-child | 10             |
| 标签选择器     | div           | 1              |
| 伪元素选择器   | li:after      | 1              |
| 相邻兄弟选择器 | h1+p          | 0              |
| 子选择器       | ul>li         | 0              |
| 后代选择器     | li a          | 0              |
| 通配符选择器   | *             | 0              |

**对于选择器的优先级：**

- **标签选择器、伪元素选择器：1**
- **类选择器、伪类选择器、属性选择器：10**
- **id 选择器：100**
- **内联样式：1000**

**注意事项：**

- **!important声明的样式的优先级最高；**
- **如果优先级相同，则最后出现的样式生效；**
- **继承得到的样式的优先级最低；**
- **通用选择器（\*）、子选择器（>）和相邻同胞选择器（+）并不在这四个等级中，所以它们的权值都为 0 ；**
- **样式表的来源不同时，优先级顺序为：内联样式 > 内部样式 > 外部样式 > 浏览器用户自定义样式 > 浏览器默认样式。**



## 4.display的属性值及其作用

| **属性值**   |                          **作用**                          |
| ------------ | :--------------------------------------------------------: |
| none         |             元素不显示，并且会从文档流中移除。             |
| block        |    块类型。默认宽度为父元素宽度，可设置宽高，换行显示。    |
| inline       | 行内元素类型。默认宽度为内容宽度，不可设置宽高，同行显示。 |
| inline-block |        默认宽度为内容宽度，可以设置宽高，同行显示。        |
| list-item    |         像块类型元素一样显示，并添加样式列表标记。         |
| table        |                此元素会作为块级表格来显示。                |
| inherit      |           规定应该从父元素继承display属性的值。            |
| flex         |                          flex布局                          |

## 5.display的block、inline和inline-block的区别

**（1）**block：会独占一行，多个元素会另起一行，可以设置width、height、margin和padding属性；

**（2）**inline：元素不会独占一行，设置width、height属性无效。但可以设置水平方向的margin和padding属性，不能设置垂直方向的padding和margin；

**（3）**inline-block：将对象设置为inline对象，但对象的内容作为block对象呈现，之后的内联对象会被排列在同一行内。

**对于行内元素和块级元素，其特点如下：**

**（1）行内元素**

- **设置宽高无效；**
- **可以设置水平方向的margin和padding属性，不能设置垂直方向的padding和margin；**
- **不会自动换行；**

**（2）块级元素**

- **可以设置宽高；**
- **设置margin和padding都有效；**
- **可以自动换行；**
- **多个块状，默认排列从上到下。**

## 6. 隐藏元素的方法有哪些

**记忆口诀：「display隐身不占位，visibility隐身占位不响应，opacity透明占位能点击」**

| 方法 | 占据空间 | 响应事件 | 触发重排 | 子元素可恢复 |
| --- | :---: | :---: | :---: | :---: |
| `display: none` | ❌ | ❌ | ✅ | ❌ |
| `visibility: hidden` | ✅ | ❌ | ❌（仅重绘） | ✅（设visible） |
| `opacity: 0` | ✅ | ✅ | ❌ | ❌ |
| `position: absolute` 移出可视区 | ❌ | ❌ | - | - |
| `z-index: 负值` | ✅ | ❌ | ❌ | - |
| `clip-path` | ✅ | ❌ | ❌ | - |
| `transform: scale(0,0)` | ✅ | ❌ | ❌ | - |

**面试最常问的三个：**

- **`display: none`**：元素彻底从渲染树消失，不占位置、不响应事件，改变它会触发重排（reflow），性能开销最大。子元素也跟着一起消失，无法单独恢复。
- **`visibility: hidden`**：元素还在渲染树里，占着位置但看不见、不能点击。它是继承属性，所以子元素可以通过设置 `visibility: visible` 单独显示出来。只触发重绘（repaint），性能好一些。
- **`opacity: 0`**：元素完全透明但还在，占位置而且**还能响应点击事件**。常用于做淡入淡出动画。

## 7. link和@import的区别

**两者都是外部引用CSS的方式，它们的区别如下：**

- **link是XHTML标签，除了加载CSS外，还可以定义RSS等其他事务；@import属于CSS范畴，只能加载CSS。**
- **link引用CSS时，在页面载入时同时加载；@import需要页面网页完全载入以后加载。**
- **link是XHTML标签，无兼容问题；@import是在CSS2.1提出的，低版本的浏览器不支持。**
- **link支持使用Javascript控制DOM去改变样式；而@import不支持。**

## 8. display:none 与 visibility:hidden 的区别（深入版）

**这是第6题的深入追问，面试官经常连着问。重点区分这两个最常用的隐藏方式：**

| 对比维度 | `display: none` | `visibility: hidden` |
| --- | --- | --- |
| 渲染树 | 完全从渲染树消失 | 仍在渲染树中，占据空间 |
| 继承性 | 非继承，子元素无法单独恢复显示 | 继承属性，子元素可设 `visible` 恢复 |
| 性能影响 | 触发**重排**（reflow） | 仅触发**重绘**（repaint） |
| 读屏器 | 不会被读取 | 会被读取 |
| 过渡动画 | 不支持 transition | 支持 transition |

**面试速答：**

display:none 是「真消失」——不占位、不可交互、子元素也跟着没了，而且切换显示隐藏会触发重排（性能开销大）。

visibility:hidden 是「隐身」——占着位置但看不见，子元素可以通过设 `visibility: visible` 单独恢复。只触发重绘，性能开销小。另外它支持 `transition` 过渡动画，而 display 不支持。

> **追问技巧：** 如果面试官继续问「那 opacity: 0 呢？」——它和 visibility 一样占位，但**能响应点击事件**，而且支持动画。适合做淡入淡出效果。

## 9. 伪元素和伪类的区别和作用？

**记忆要点：伪类选状态（一个冒号 `:`），伪元素造内容（两个冒号 `::`）**

**伪类（pseudo-class）**：给已有元素添加某种"状态"，不产生新元素。就是元素在某个条件下的样式，比如鼠标悬停、第一个子元素等。

```css
a:hover { color: #FF00FF; }
p:first-child { color: red; }
```

**伪元素（pseudo-element）**：在元素的前后插入"虚拟的元素"，这些元素不存在于 HTML 源码中，但在页面上可以看到。常用来做装饰性内容、图标、清除浮动等。

```css
p::before { content: "第一章："; }
p::after { content: "Hot!"; }
p::first-line { background: red; }
p::first-letter { font-size: 30px; }
```

**总结：** 伪类改变的是元素的**状态**（hover、active、first-child），伪元素改变的是元素的**内容**（在前后插入东西）。CSS3 规范建议伪类用单冒号 `:`，伪元素用双冒号 `::` 来区分，但浏览器兼容单冒号写法。

## 10. 对盒模型的理解

**记忆口诀：「标准只算content，IE把border padding都算进去」**

盒模型由外到内四层：**margin → border → padding → content**

| 盒模型 | width/height 包含 | box-sizing 值 | 说明 |
| --- | --- | --- | --- |
| 标准盒模型 | 仅 content | `content-box`（默认） | 设 width=200px，加 padding/border 后实际更宽 |
| IE盒模型 | content + padding + border | `border-box` | 设 width=200px，就是最终宽度，padding/border 往里挤 |

> **实际开发中推荐用 `border-box`**，因为它更直观——你设多宽就是多宽，不用手动减去 padding 和 border。很多 CSS reset 会全局设置 `* { box-sizing: border-box; }`。

## 11. 对 CSS Sprites 的理解

**一句话：** CSS Sprites（精灵图/雪碧图），就是把页面上多个小图标合并成一张大图，然后通过 `background-image`、`background-position`、`background-repeat` 的组合来定位显示对应的图标区域。

**优点：**

- 最大的好处是**减少 HTTP 请求数**，把多次图片请求合并成一次，页面加载更快
- 合并后的图片总体积通常比多张小图加起来更小（因为减少了每张图的头部信息开销）

**缺点：**

- **制作麻烦**：需要用 Photoshop 等工具把多张图有序合并，还要留好间距防止背景露出
- **定位麻烦**：每个小图标都要精确测量 `background-position`
- **维护麻烦**：改一个小图标就要改整张大图，牵一发动全身；在高分辨率/自适应页面中如果背景不够宽，容易出现背景断裂

> **补充：** 现在项目中更常用 iconfont（字体图标）或 SVG sprite 来代替传统 CSS Sprites，但面试中还是会问到这个概念和原理。

## 12. CSS预处理器/后处理器是什么？为什么要使用它们？

**记忆：预处理器是「写之前」增强 CSS，后处理器是「写之后」优化 CSS**

**预处理器（如 Sass/Less/Stylus）：** 用来预编译 CSS，给 CSS 加上变量、嵌套、mixin、函数、循环等编程能力。写出来的代码更简洁、复用性更强，最终编译成普通 CSS。对编写和开发 UI 组件非常方便。

常见的预处理器有：**Sass（Scss）、Less、Stylus** 等。

**后处理器（如 PostCSS）：** 对已经写好的 CSS 做后期处理，根据 CSS 规范让样式更加有效。目前最常做的是给 CSS 属性**自动添加浏览器私有前缀**（`-webkit-`、`-moz-` 等），解决跨浏览器兼容性问题。Autoprefixer 就是 PostCSS 最常用的插件。

**为什么要用？**

- **结构清晰，便于扩展**：变量和嵌套让样式层级一目了然
- **复用性强**：mixin 可以把常用样式封装起来，避免重复代码
- **解决兼容问题**：自动添加前缀，不用手写各种 `-webkit-`、`-moz-`
- **兼容旧项目**：完美兼容普通 CSS 语法，可以逐步引入老项目

## 13. display:inline-block 什么时候会显示间隙？

**原因：** 使用 `inline-block` 时，HTML 标签之间的换行/空格会被渲染为一个空白字符，导致元素之间出现间隙。

**三种情况和解决方法：**

- **标签之间有空格/换行**：删除 HTML 中的空格，或者把标签写在同一行
- **margin 导致的间隙**：给元素设置 `margin` 负值来抵消
- **字体导致的间隙**：给父元素设置 `font-size: 0`，再在子元素上恢复字体大小（最常用的方案）

## 14. 单行、多行文本溢出隐藏

**记忆：单行三件套（overflow + ellipsis + nowrap），多行加 webkit 两件套**

**单行文本溢出**（必须三个属性同时设置才能生效）：

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

**多行文本溢出**（在单行基础上额外加 webkit 属性）：

```css
overflow: hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 3;        /* 控制显示的行数 */
```

> **注意：** 多行方案用到的 `-webkit-` 前缀属性，只在 WebKit 内核浏览器（Chrome、Safari）中有效。如果需要兼容其他浏览器，通常需要 JS 配合来截断文本。

## 15. 如何判断元素是否到达可视区域

**常见场景：** 图片懒加载（Lazy Load）——当图片滚动到可视区域时才加载。

**方法一：传统计算（offsetTop）**

判断公式：`元素距顶部距离 < 视口高度 + 已滚动距离`

```js
img.offsetTop < window.innerHeight + document.documentElement.scrollTop
```

**方法二：IntersectionObserver（推荐，现代方案）**

浏览器原生 API，性能更好，不需要监听 scroll 事件：

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 元素进入可视区域，加载图片
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
});
observer.observe(imgElement);
```

**方法三：getBoundingClientRect()**

`el.getBoundingClientRect().top < window.innerHeight` 也可以判断元素是否在视口内。

## 16. z-index属性在什么情况下会失效

**通常 z-index 的使用是在有两个重叠的标签，在一定的情况下控制其中一个在另一个的上方或者下方出现。z-index值越大就越是在上层。z-index元素的position属性需要是relative，absolute或是fixed。**

**z-index属性在下列情况下会失效：**

- **父元素position为relative时，子元素的z-index失效。解决：父元素position改为absolute或static；**
- **元素没有设置position属性为非static属性。解决：设置该元素的position属性为relative，absolute或是fixed中的一种；**
- **元素在设置z-index的同时还设置了float浮动。解决：float去除，改为display：inline-block；**



## 17. 两栏布局的实现

总结：

> /* 第一种 左边元素固定并浮动，右边设置margin-left（margin-left设置为左边的宽度） */

> /* 第二种触发BFC ，左边元素固定并浮动，右overflow：hidden */

> /* 第三种利用绝对定位 */  margin-left

> /* 第四种利用绝对定位 */  left

> /* 第五种 flex布局 */

```css
.left{
     width: 100px;
     height: 200px;
     background: red;
     float: left;
 }
 .right{
     height: 300px;
     background: blue;
     overflow: hidden;
 }
```

- **利用flex布局，将左边元素设置为固定宽度200px，将右边的元素设置为flex:1。**

```css
.outer {
  display: flex;
  height: 100px;
}
.left {
  width: 200px;
  background: tomato;
}
.right {
  flex: 1;
  background: gold;
}
```

- **利用绝对定位，将父级元素设置为相对定位。左边元素设置为absolute定位，并且宽度设置为200px。将右边元素的margin-left的值设置为200px。**

```css
.outer {
  position: relative;
  height: 100px;
}
.left {
  position: absolute;
  width: 200px;
  height: 100px;
  background: tomato;
}
.right {
  margin-left: 200px;
  background: gold;
}
```

- **利用绝对定位，将父级元素设置为相对定位。左边元素宽度设置为200px，右边元素设置为绝对定位，左边定位为200px，其余方向定位为0。**

```css
.outer {
  position: relative;
  height: 100px;
}
.left {
  width: 200px;
  background: tomato;
}
.right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 200px;
  background: gold;
}
```

## 18. 三栏布局的实现

总结：

> /* 第一种利用浮动，记住中间一栏必须放在最后 */

> /* 第二种利用绝对定位 */left  中间使用margin-left，margin-right  right

> /* 第三种方式 使用flex */ 中间一栏设置flex：1

> /* 第四种方式 使用calc */ 原理也是flex布局，中间一栏设置 width：calc（100% - 200px）

> /* 第五种圣杯布局，也可以叫做双飞翼布局 */ 中间一栏放在最上面

**三栏布局一般指的是页面中一共有三栏，左右两栏宽度固定，中间自适应的布局，三栏布局的具体实现：**

- **利用绝对定位，左右两栏设置为绝对定位，中间设置对应方向大小的margin的值。**

```css
.outer {
  position: relative;
  height: 100px;
}

.left {
  position: absolute;
  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  margin-left: 100px;
  margin-right: 200px;
  height: 100px;
  background: lightgreen;
}
```

- **利用flex布局，左右两栏设置固定大小，中间一栏设置为flex:1。**

```css
.outer {
  display: flex;
  height: 100px;
}

.left {
  width: 100px;
  background: tomato;
}

.right {
  width: 100px;
  background: gold;
}

.center {
  flex: 1;
  background: lightgreen;
}
```

- **利用浮动，左右两栏设置固定大小，并设置对应方向的浮动。中间一栏设置左右两个方向的margin值，注意这种方式，中间一栏必须放到最后：**

```css
.outer {
  height: 100px;
}

.left {
  float: left;
  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  float: right;
  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  height: 100px;
  margin-left: 100px;
  margin-right: 200px;
  background: lightgreen;
}
```

- **圣杯布局，利用浮动和负边距来实现。父级元素设置左右的 padding，三列均设置向左浮动，中间一列放在最前面，宽度设置为父级元素的宽度，因此后面两列都被挤到了下一行，通过设置 margin 负值将其移动到上一行，再利用相对定位，定位到两边。**

```css
.outer {
  height: 100px;
  padding-left: 100px;
  padding-right: 200px;
}

.left {
  position: relative;
  left: -100px;

  float: left;
  margin-left: -100%;

  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  position: relative;
  left: 200px;

  float: right;
  margin-left: -200px;

  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  float: left;

  width: 100%;
  height: 100px;
  background: lightgreen;
}
```

- **双飞翼布局，双飞翼布局相对于圣杯布局来说，左右位置的保留是通过中间列的 margin 值来实现的，而不是通过父元素的 padding 来实现的。本质上来说，也是通过浮动和外边距负值来实现的。**

```css
.outer {
  height: 100px;
}

.left {
  float: left;
  margin-left: -100%;

  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  float: left;
  margin-left: -200px;

  width: 200px;
  height: 100px;
  background: gold;
}

.wrapper {
  float: left;

  width: 100%;
  height: 100px;
  background: lightgreen;
}

.center {
  margin-left: 100px;
  margin-right: 200px;
  height: 100px;
}
```

## 19.水平垂直居中的实现

**记忆口诀：「定宽高用margin，不定宽高用transform，万能方案用flex」**

### 一、已知宽高

**方法1：absolute + margin负值**

```css
.child {
  position: absolute;
  top: 50%; left: 50%;
  width: 200px; height: 200px;
  margin-top: -100px;
  margin-left: -100px;
}
```

**方法2：absolute + margin:auto（四方向拉满）**

```css
.child {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto;
  width: 200px; height: 200px;
}
```

**方法3：absolute + calc**

```css
.child {
  position: absolute;
  top: calc(50% - 100px);
  left: calc(50% - 100px);
  width: 200px; height: 200px;
}
```

### 二、未知宽高（更常用）

**方法4：absolute + transform（推荐）**

```css
.child {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
```

**方法5：flex布局（最推荐，移动端首选）**

```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**方法6：grid布局**

```css
.parent { display: grid; }
.child { align-self: center; justify-self: center; }
```

## 20. 对Flex布局的理解及其使用场景

**Flex是FlexibleBox的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。任何一个容器都可以指定为Flex布局。行内元素也可以使用Flex布局。注意，设为Flex布局以后，子元素的float、clear和vertical-align属性将失效。采用Flex布局的元素，称为Flex容器（flex container），简称"容器"。它的所有子元素自动成为容器成员，称为Flex项目（flex item），简称"项目"。容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis），项目默认沿水平主轴排列。**

**以下6个属性设置在容器上：**

- **flex-direction属性决定主轴的方向（即项目的排列方向）。**
- **flex-wrap属性定义，如果一条轴线排不下，如何换行。**
- **flex-flow属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap。**
- **justify-content属性定义了项目在主轴上的对齐方式。**
- **align-items属性定义项目在交叉轴上如何对齐。**
- **align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。**

**以下6个属性设置在项目上：**

- **order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。**
- **flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。**
- **flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。**
- **flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。**
- **flex属性是flex-grow，flex-shrink和flex-basis的简写，默认值为0 1 auto。**
- **align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。**

**面试速答：**

Flex 就是「弹性盒子布局」，设置 `display: flex` 后，容器有两根轴（主轴 + 交叉轴）。可以用 `flex-direction` 指定主轴方向，用 `justify-content` 指定主轴上的对齐方式，用 `align-items` 指定交叉轴上的对齐方式，用 `flex-wrap` 规定一行排不下时的换行方式。对于子项目，可以用 `order` 指定排列顺序，用 `flex-grow` 指定有剩余空间时的放大比例，用 `flex-shrink` 指定空间不足时的缩小比例。

面试中最常用的 4 个属性：

- **`flex-direction`**：决定主轴方向（row/column）
- **`justify-content`**：主轴对齐（center/space-between/space-around 等）
- **`align-items`**：交叉轴对齐（center/stretch/flex-start 等）
- **`flex: 1`**：子元素自动撑满剩余空间（等同于 `flex-grow:1; flex-shrink:1; flex-basis:0%`）

> 注意：设了 flex 后，子元素的 `float`、`clear`、`vertical-align` 都会失效。

## 21. 为什么需要清除浮动？清除浮动的方式

**浮动的定义：** **非IE浏览器下，容器不设高度且子元素浮动时，容器高度不能被内容撑开。 此时，内容会溢出到容器外面而影响布局。这种现象被称为浮动（溢出）。**

**浮动的工作原理：**

- **浮动元素脱离文档流，不占据空间（引起“高度塌陷”现象）**
- **浮动元素碰到包含它的边框或者其他浮动元素的边框停留**

**浮动元素可以左右移动，直到遇到另一个浮动元素或者遇到它外边缘的包含框。浮动框不属于文档流中的普通流，当元素浮动之后，不会影响块级元素的布局，只会影响内联元素布局。此时文档流中的普通流就会表现得该浮动框不存在一样的布局模式。当包含框的高度小于浮动框的时候，此时就会出现“高度塌陷”。**

**浮动元素引起的问题？**

- **父元素的高度无法被撑开，影响与父元素同级的元素**
- **与浮动元素同级的非浮动元素会跟随其后**
- **若浮动的元素不是第一个元素，则该元素之前的元素也要浮动，否则会影响页面的显示结构**

**清除浮动的方式如下：**

- **给父级div定义** **height属性**
- **最后一个浮动元素之后添加一个空的div标签，并添加** **clear:both样式**
- **包含浮动元素的父级标签添加** **overflow:hidden或者** **overflow:auto**
- **使用 :after 伪元素。**

```css
// 在style标签内加上
.clear::after{
      content: '';
      clear: both;
      display: block;
}
```

## 22. 对BFC的理解，如何创建BFC

**一句话：** BFC（Block Formatting Context）就是一个**独立的布局结界**，里面的元素怎么折腾都不会影响外面。

**记忆口诀——触发 BFC 五种方式：「根浮绝，行溢flex」**

| 触发条件 | 口诀 | 示例 |
| --- | --- | --- |
| 根元素 | 根 | `<html>` |
| float 不为 none | 浮 | `float: left` |
| position 为 absolute/fixed | 绝 | `position: absolute` |
| display 为 inline-block/flex/grid 等 | 行flex | `display: flex` |
| overflow 不为 visible | 溢 | `overflow: hidden`（最常用） |

**BFC 能解决的三大问题：**

1. **margin 重叠** → 把两个元素放到不同的 BFC 里
2. **高度塌陷**（子元素浮动导致父元素高度为0） → 父元素触发 BFC（如 `overflow: hidden`）
3. **自适应两栏布局** → 左边浮动，右边触发 BFC

```css
.left  { width: 100px; height: 200px; float: left; }
.right { height: 300px; overflow: hidden; /* 触发BFC，不与浮动重叠 */ }
```

## 23. 什么是margin重叠问题？如何解决？

**问题描述：**

**两个块级元素的上外边距和下外边距可能会合并（折叠）为一个外边距，其大小会取其中外边距值大的那个，这种行为就是外边距折叠。需要注意的是，浮动的元素和绝对定位这种脱离文档流的元素的外边距不会折叠。重叠只会出现在垂直方向。**

**计算原则：**

**折叠合并后外边距的计算原则如下：**

- **如果两者都是正数，那么就取最大者**
- **如果是一正一负，就会正值减去负值的绝对值**
- **两个都是负值时，用0减去两个中绝对值大的那个**

**解决办法：**

**对于折叠的情况，主要有两种：兄弟之间重叠和父子之间重叠**

**（1）兄弟之间重叠**

- **底部元素变为行内盒子：display: inline-block**
- **底部元素设置浮动：float**
- **底部元素的position的值为** **absolute/fixed**

**（2）父子之间重叠**

- **父元素加入：overflow: hidden**
- **父元素添加透明边框：border:1px solid transparent**
- **子元素变为行内盒子：display: inline-block**
- **子元素加入浮动属性或定位**

## 24. position的属性有哪些，区别是什么

**position有以下属性值：**

| **属性值** |                           **概述**                           |
| ---------- | :----------------------------------------------------------: |
| absolute   | 生成绝对定位的元素，相对于static定位以外的一个父元素进行定位。元素的位置通过left、top、right、bottom属性进行规定。 |
| relative   | 生成相对定位的元素，相对于其原来的位置进行定位。元素的位置通过left、top、right、bottom属性进行规定。 |
| fixed      | 生成绝对定位的元素，指定元素相对于屏幕视⼝（viewport）的位置来指定元素位置。元素的位置在屏幕滚动时不会改变，⽐如回到顶部的按钮⼀般都是⽤此定位⽅式。 |
| static     | 默认值，没有定位，元素出现在正常的文档流中，会忽略 top, bottom, left, right 或者 z-index 声明，块级元素从上往下纵向排布，⾏级元素从左向右排列。 |
| inherit    |               规定从父元素继承position属性的值               |

**前面三者的定位方式如下：**

**relative：元素的定位永远是相对于元素自身位置的，和其他元素没关系，也不会影响其他元素。**

**fixed：元素的定位是相对于 window （或者 iframe）边界的，和其他元素没有关系。但是它具有破坏性，会导致其他元素位置的变化。**

**absolute：元素的定位相对于前两者要复杂许多。如果为 absolute 设置了 top、left，浏览器会根据什么去确定它的纵向和横向的偏移量呢？答案是浏览器会递归查找该元素的所有父元素，如果找到一个设置了** **position:relative/absolute/fixed**的元素，就以该元素为基准定位，如果没找到，就以浏览器边界定位。如下两个图所示：

## 25. display、float、position的关系

**记忆：就是一个优先级判断链，position > float > display**

判断顺序如下（像 if-else 链）：

1. **先看 display 是不是 none** → 是的话 position 和 float 的值都不影响元素的表现，元素直接不显示
2. **再看 position 是不是 absolute/fixed** → 是的话 float 自动失效，display 的值会被强制调整为 table 或 block（具体转换取决于初始值）
3. **如果 position 不是 absolute/fixed，再看 float 是不是非 none** → 是的话 display 也会被调整。注意如果 position 是 relative 且有 float，relative 是相对于浮动后的最终位置来定位的
4. **如果 float 也是 none** → 看是不是根元素，如果是根元素则 display 可能会被调整；如果不是根元素，display 就保持你设置的值

**面试速答：** 可以理解为一个优先级机制——`position: absolute/fixed` 优先级最高，有它在 float 就没用了，display 也要被调整；其次是 float，有浮动时 display 会被调整；最后才是 display 本身。

## 26、CSS 怎么实现三角形？

**原理：** CSS 绘制三角形主要用到 border 属性。平时给盒子设置很窄的边框，可能误以为边框是矩形的，但实际上 border 的四条边在交汇处是**斜切**的（像四个三角形拼成一个正方形）。所以把元素宽高设为 0，只给一条边上色、其余边设 `transparent`，就能得到一个三角形。

先看四边都有颜色时的效果：

```css
div {
    width: 0;
    height: 0;
    border: 100px solid;
    border-color: orange blue red green;
}
```

可以看到四条边各是一个三角形。利用这个特性来绘制单个三角形：

**朝下三角（border-top 有色）：**

```css
div {
    width: 0;
    height: 0;
    border-top: 50px solid red;
    border-right: 50px solid transparent;
    border-left: 50px solid transparent;
}
```

**朝上三角（border-bottom 有色）：**

```css
div {
    width: 0;
    height: 0;
    border-bottom: 50px solid red;
    border-right: 50px solid transparent;
    border-left: 50px solid transparent;
}
```

**朝右三角（border-left 有色）：**

```css
div {
    width: 0;
    height: 0;
    border-left: 50px solid red;
    border-top: 50px solid transparent;
    border-bottom: 50px solid transparent;
}
```

**直角三角形（只设相邻两条边）：**

```css
div {
    width: 0;
    height: 0;
    border-top: 100px solid red;
    border-right: 100px solid transparent;
}
```

**记忆规则：** 哪条边有颜色，三角形就指向**对面**方向。调整各边 border 宽度的比例可以改变三角形的角度。

## 27. 实现一个扇形

**用CSS实现扇形的思路和三角形基本一致，就是多了一个圆角的样式，实现一个90°的扇形：**

```css
div{
    border: 100px solid transparent;
    width: 0;
    height: 0;
    border-radius: 100px;
    border-top-color: red;
}
```

## 28. 实现一个宽高自适应的正方形

**核心思路：** 让高度和宽度保持一致。关键知识点是 `padding/margin` 的百分比值是相对于**父元素的宽度**计算的（不是高度！）。

- **方法1：vw 单位（最直观）**

```css
.square {
  width: 10%;
  height: 10vw;
  background: tomato;
}
```

- **方法2：padding-top 百分比（利用 padding 百分比相对父元素宽度的特性）**

```css
.square {
  width: 20%;
  height: 0;
  padding-top: 20%;
  background: orange;
}
```

- **方法3：伪元素 margin-top（同样利用百分比相对父宽的特性）**

```css
.square {
  width: 30%;
  overflow: hidden;
  background: yellow;
}
.square::after {
  content: '';
  display: block;
  margin-top: 100%;
}
```

## 29. 画一条0.5px的线

- **采用transform: scale()的方式，该方法用来定义元素的2D 缩放转换：**

```css
transform: scale(0.5,0.5);
```

- **采用meta viewport的方式**

```css
<meta name="viewport" content="width=device-width, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5"/>
```

**这样就能缩放到原来的0.5倍，如果是1px那么就会变成0.5px。viewport只针对于移动端，只在移动端上才能看到效果**

## 30. 设置小于12px的字体

**问题：** Chrome 浏览器有最小字体限制（中文默认最小 12px），设置比 12px 更小的字号会无效，还是显示 12px。

**解决方法（推荐 transform）：**

- **`transform: scale()`（最常用）：** 先设置一个较大的字号，然后用 `transform: scale(0.8)` 等缩小。注意 `scale` 缩小的是整个元素，所以行内元素要先转成 `display: inline-block` 或 `block`。

```css
.small-text {
  font-size: 12px;
  transform: scale(0.83);   /* 12 × 0.83 ≈ 10px */
  display: inline-block;
  transform-origin: left top;
}
```

- **`-webkit-text-size-adjust: none`**：早期方案，加了这个属性字体大小就不受 12px 限制了。但 Chrome 27 版本之后已经不再支持这个属性，所以现在基本不用了。
- **切图**：如果内容固定不变，可以把小于 12px 的文字内容切出来做成图片，兼容性没问题但灵活性差。

## 31. 如何解决 1px 问题？

**问题本质：** 在 Retina（高清）屏上，CSS 的 1px 实际占了 2 个甚至 3 个物理像素，看起来比设计稿粗。我们想要的是 1 个物理像素的细线。

**三种方案对比：**

| 方案 | 原理 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 伪元素 + scale（推荐） | 用 ::after 做 200% 大小的边框，再 scale(0.5) 缩回来 | 兼容性好 | 代码多 |
| viewport 缩放 | 整个页面按 devicePixelRatio 缩放 | 简单粗暴 | 文字图片都被缩小 |
| 直接用小数 | `border: 0.5px` | 代码简单 | 安卓不兼容 |

**推荐方案代码（伪元素 + scale）：**

```css
.border-1px {
    position: relative;
}
.border-1px::after {
    content: "";
    position: absolute;
    top: 0; left: 0;
    width: 200%;
    height: 200%;
    transform: scale(0.5);
    transform-origin: left top;
    box-sizing: border-box;
    border: 1px solid #333;
    pointer-events: none;
}
```

**思路说明：** 伪元素方案的核心是"先放大后缩小"——在目标元素后面追加一个 `::after` 伪元素，用 `absolute` 铺满目标元素，把宽高都设为目标元素的 200%，border 设 1px，然后用 `transform: scale(0.5)` 缩回原始大小。这样伪元素的宽高正好和目标元素对齐，而 border 也缩小为了 0.5px，间接实现了 1 个物理像素的效果。

**viewport 缩放方案：** 通过 JS 动态设置 `<meta viewport>` 的 `initial-scale` 为 `1 / devicePixelRatio`，把整个页面缩放。这样 1px 就等于 1 个物理像素了。但副作用很大，文字、图片等所有内容都会被无差别缩小，需要额外处理。

```js
const scale = 1 / window.devicePixelRatio;
metaEl.setAttribute('content', `width=device-width,user-scalable=no,initial-scale=${scale},maximum-scale=${scale},minimum-scale=${scale}`);
```

**面试速答：** 1px 问题是 Retina 屏 CSS 像素和物理像素不一致导致的。最常用的解决方案是伪元素放大2倍再 `scale(0.5)` 缩回来，兼容性好。

## 32.CSS 中可继承与不可继承属性有哪些？

**记忆口诀：「字文可见能继承，盒定背浮不继承」**

**可继承属性（子元素自动继承父元素的样式）：**

- **字体相关**：font、font-size、font-weight、font-family
- **文本相关**：color、text-align、line-height、text-indent、word-spacing
- **可见性**：visibility
- **列表样式**：list-style、list-style-type

**不可继承属性（子元素需要自己显式设置）：**

- **盒模型**：width、height、margin、padding、border
- **定位**：position、top、right、bottom、left、z-index
- **背景**：background、background-color、background-image
- **布局**：display、float、clear、overflow

> **注意**：margin 和 padding 是**不可继承**的。虽然视觉上子元素看起来受父元素间距影响，但那是布局效果，不是继承。

## 33.line-height: 100% 和 line-height: 1 有什么不一样？

**关键区别在于继承方式不同：**

- **`line-height: 1`**（纯数字）：子元素继承的是**这个数字本身**，然后各自根据自己的 `font-size` 计算行高。比如父元素 `font-size: 16px`、子元素 `font-size: 20px`，子元素的行高就是 `20px × 1 = 20px`。
- **`line-height: 100%`**（百分比）：先根据**父元素**的 `font-size` 计算出具体值，然后子元素继承的是**计算后的绝对值**。同样的例子，子元素继承到的行高是 `16px`（父元素的 font-size × 100%），而不是 20px。

> **结论：推荐用数字（如 `line-height: 1.5`）而不是百分比**，因为数字写法每个子元素会根据自己的字号重新计算，不容易出现行高不协调的问题。

## 34.如果在伪元素中不写 content 会发生什么

如果在伪元素中不写 content，那么该伪元素将不会被渲染或显示在页面上。content 属性是伪元素的必需属性，它定义了伪元素的内容。

## 35.flex: shrink 和 flex-grow 的默认值是多少？它们的作用是什么？flex: 1 表示什么？

flex: shrink 的默认值是 1，flex-grow 的默认值是 0。

- flex-shrink 定义了项目在空间不足时的收缩能力，如果父容器的空间不足，它会根据 flex-shrink 的比例进行收缩，默认情况下等比例收缩。
- flex-grow 定义了项目在空间有剩余时的扩展能力，如果父容器有多余的空间，它会根据 flex-grow 的比例进行扩展，默认情况下不进行扩展。

除了auto (1 1 auto) 和 none (0 0 auto)这两个快捷值外，还有以下设置方式：
当 flex 取值为一个非负数字，则该数字为 flex-grow 值，flex-shrink 取 1，flex-basis 取 0%，如下是等同的：

```css
.item {flex: 1;}
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

当 flex 取值为 0 时，对应的三个值分别为 0 1 0%

```css
.item {flex: 0;}
.item {
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

当 flex 取值为一个长度或百分比，则视为 flex-basis 值，flex-grow 取 1，flex-shrink 取 1，有如下等同情况（注意 0% 是一个百分比而不是一个非负数字）

```css
.item-1 {flex: 0%;}
.item-1 {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}

.item-2 {flex: 24px;}
.item-2 {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 24px;
}
```

当 flex 取值为两个非负数字，则分别视为 flex-grow 和 flex-shrink 的值，flex-basis 取 0%，如下是等同的：

```css
.item {flex: 2 3;}
.item {
  flex-grow: 2;
  flex-shrink: 3;
  flex-basis: 0%;
}
```

## 36.如何快速选取同一批兄弟元素的偶数序号元素。

这里本质是考察各种 CSS 选择器。这里需要使用 even 关键字。

```css
/* 从 1 开始计数，选取偶数序号的兄弟元素 */
:nth-child(even) {
  /* 添加样式 */
}
```

除此之外，你需要尽可能的了解其他 CSS 选择器，以达到快速选择各种不同的选择器。
可以尝试挑战这个 -- https://flukeout.github.io/#。

## 37.CSS 中是否存在父选择器？其背后的原因是什么？

1. 伪类选择器 :focus-within:

   1. 这个属性有点类似 Javascript 的事件冒泡，从可获焦元素开始一直冒泡到根元素 html，都可以接收触发 :focus-within 事件，类似下面这个简单的例子这样：
   2. 子元素的 :focus 状态触发，可以同时触发所有父元素的 :focus-within 伪类，以此变相实现父选择器的功能。当然，这种方法限制还是很大的。

2. 伪类选择器 :has()

   1. :has 伪类接受一个选择器组作为参数，该参数相对于该元素的 [:scope](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:scope) 至少匹配一个元素。
   2. 我们通过 div:has(.g-test-has) 选择器，意思是，选择 div 下存在 class 为 .g-test-has 的 div 元素。
      注意，这里选择的不是 :has() 内包裹的选择器选中的元素，而是使用 :has() 伪类的宿主元素被选中。

   > 在之前，是没有父选择器的！这个问题的答案和“为何CSS相邻兄弟选择器只支持后面的元素，而不支持前面的兄弟元素？”是一样的。
   > 浏览器解析HTML文档，是从前往后，由外及里的。所以，我们时常会看到页面先出现头部然后主体内容再出现的加载情况。
   > 但是，如果CSS支持了父选择器，那就必须要页面所有子元素加载完毕才能渲染HTML文档，因为所谓“父选择器”，就是后代元素影响祖先元素，如果后代元素还没加载处理，如何影响祖先元素的样式？于是，网页渲染呈现速度就会大大减慢，浏览器会出现长时间的白板。加载多少 HTML 就可以渲染多少 HTML，在网速不是很快的时候，就显得尤为的必要。如果支持父选择器，则整个文档不能有阻塞，页面的可访问性则要大大降低。

## 38.说一下宫格布局？

> div{
>   display: grid;/*指定一个容器采用网格布局。*/
>   display: inline-grid;/*该元素内部采用网格布局*/
> }

默认情况下，容器元素都是块级元素，但也可以设成行内元素。

**注意：**

设为网格布局以后，容器子元素（项目）的float、display: inline-block、display: table-cell、vertical-align和column-*等设置都将失效。

**一、容器属性（写在父级容器中）（以3x3的网格举例）**

1.设置列columns 行的高度rows

> ​     grid-template-columns: 100px 100px 100px;
>
> ​      grid-template-rows: 100px 100px 100px;

2.repeat repeat()函数  1:重复值  2：重复模式

​    参数1：重复次数 参数2：像素值

> ​    grid-template-columns: repeat(2,100px 200px);
>
> ​      grid-template-rows: repeat(2,100px 200px);

3.fr 关键字 通过关键字划分比例

> ​    grid-template-rows: repeat(2,1fr 2fr);
>
> ​      grid-template-columns: repeat(2,1fr 2fr);

4.auto-fit 自动填充每一行 或 每一列

> grid-template-columns: repeat(auto-fit,120px);

5.minmax(最小值 最大值)函数

> grid-template-columns: 1fr minmax(200px 1fr) 1fr;
>
> grid-template-rows: repeat(3, 1fr);

6.auto关键字 自动适应窗口大小（没有最大最小值）

> grid-template-columns: 100px auto 100px;

7. grid-template-columns 网格线 [c1] ~[c4] 中括号内是网格线的名字

>  grid-template-columns: [c1] 100px [c2] auto [c3] 100px [c4];

8. gap 间隙

> ​      /* 列间距 */
>
> ​      /* column-gap: 10px; */
>
> ​       /*行间距  */
>
> ​      /* row-gap: 10px; */
>
> ​      /*合并写法： gap:行间距 列间距 */
>
> ​      gap:10px 20px;

9.area 区域：代表单个或者多个单元格，单引号内分别是单元格的名字（3x3的网格，九个名字）

​      别名一样相当于合并啊，但是要和grid-area一起用，将元素放进去

> grid-template-areas: 'a b c ' 'h j k' 'd e f ';

10 grid-auto-flow 项目的放置顺序：默认横向排列 column竖着排列

> grid-auto-flow: column;

11.row dense水平方向填充  column dense垂直方向填充

> grid-auto-flow: row dense;

12.缩小内容宽高来使得内容居中(单元格的内容)（宽度和高度只有内容大小）

​      place-items（合并写法）

> ​    justify-items: center;
>
> ​      align-items: center;
>
> ​      /* place-items: center; */

 13.设置内容位置（居中）（容器内容 包括间隙）

> ​      justify-content: center;
>
> ​      align-content: center;
>
> ​      /* place-content: center; */

**二、项目属性（写在项目样式中）**

1.用网格线定义单元格列数开始的位置和结束的位置

举例：网格线 列 从第一根开始 第三根结束

> ​     grid-column-start: 1;
>
> ​      grid-column-end: 3;
>
> ​      /* grid-column: 1 / 3; */ 合并写法
>
> /* 合并：grid-area：行的开始/列的开始/行的结束/列的结束 */

2. 将该单元格的内容移动到名字为j 的单元格 其他的往前移

> grid-area: j;

3.该项目自己的对齐方式：水平居中 垂直居中

> ​      justify-self: center;
>
> ​      align-self: center;

## 39. 怎么实现样式隔离？

**一句话回答：** 样式隔离就是防止不同组件/模块的 CSS 互相污染。在大型应用、微前端、组件库开发中尤为重要。

**为什么需要样式隔离？**

- CSS 天生是全局的，没有局部作用域，多人开发容易冲突
- CSS 支持层叠，冲突了也不容易察觉
- 时间长了会积累一堆不敢删的"僵尸样式"

**七种方案对比（记忆口诀：「BEM模块JS，iframe影框层」）：**

| 方案 | 原理 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- | --- |
| **BEM 命名** | 靠命名规范避免冲突 `block__element--modifier` | 简单、可读性好 | 依赖人为遵守，名字可能很长 | 组件库（如 Ant Design） |
| **CSS Modules** | 构建时把类名转成带哈希的唯一名（如 `_3zyde4l`） | 工具自动化，不靠人 | 依赖构建工具，debug 时类名难读 | React/Vue 项目 |
| **CSS-in-JS** | 样式写在 JS 里，运行时生成唯一选择器注入 `<style>` | 样式与组件强绑定，不留僵尸代码 | 运行时开销大，不能用预处理器 | React（styled-components） |
| **iframe** | 完全独立的文档环境，样式天然隔离 | 最严格的隔离 | 太重，通信复杂，SEO差 | 微前端 |
| **Web Components** | Shadow DOM 创建封闭 DOM 环境 | 浏览器原生支持，严格隔离 | 兼容性、学习曲线、样式共享困难 | 跨框架组件库 |
| **Vue Scoped** | 编译时给元素加 `data-v-xxx` 属性选择器 | 简单，支持 `::v-deep` 穿透 | 仅限 Vue SFC | Vue 项目 |
| **CSS @layer** | 用 `@layer` 定义样式层级，后声明的层优先级更高 | 原生规范，组织性好 | 较新，兼容性一般 | 管理第三方库样式覆盖 |

**面试重点展开（每个方案说一两句就够）：**

**BEM 命名**：`Block__Element--Modifier`，比如 `article__header--active`。优点是简单直观，缺点是靠人遵守规范，名字可能特别长。Ant Design 等组件库至今仍在用类似 BEM 的规则。

**CSS Modules**：在构建阶段（比如 webpack 的 css-loader 设置 `modules: true`），把每个类名加上文件名+哈希变成全局唯一。写的时候是 `.title`，编译后变成 `._3zyde4l`，自动避免冲突。

**CSS-in-JS**：以 styled-components 为代表，直接在 JS 里写样式，运行时动态生成 `<style>` 标签。样式和组件强绑定，组件删了样式也跟着没了。缺点是有运行时开销。

**Vue Scoped**：在 `<style scoped>` 中写的样式，Vue 编译时会自动给元素加上 `data-v-f3f3eg9` 这样的属性，选择器也加上对应属性，从而限制样式作用范围。

```vue
<!-- 编译前 -->
<style scoped>
.example { color: red; }
</style>
<div class="example">hi</div>

<!-- 编译后 -->
<style>
.example[data-v-f3f3eg9] { color: red; }
</style>
<div class="example" data-v-f3f3eg9>hi</div>
```

**Web Components（Shadow DOM）**：浏览器原生 API，通过 `attachShadow()` 创建一个封闭的 DOM 环境，内外样式互不影响。

**CSS @layer**：CSS 原生新规范，通过 `@layer` 声明样式层级，后声明的层优先级更高。特别适合管理第三方库样式和自定义样式的覆盖关系。

```css
@layer framework, components, themes;

@layer framework { /* 第三方框架样式，优先级最低 */ }
@layer components { /* 组件样式 */ }
@layer themes     { /* 主题样式，优先级最高 */ }
```
