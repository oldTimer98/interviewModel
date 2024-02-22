## 1.说一下 web worker

**在 HTML 页面中，如果在执行脚本时，页面的状态是不可响应的，直到脚本执行完成后，页面才变成可响应。web worker 是运行在后台的 js，独立于其他脚本，不会影响页面的性能。 并且通过 postMessage 将结果回传到主线程。这样在进行复杂操作的时候，就不会阻塞主线程了。**

**如何创建 web worker：**

1. **检测浏览器对于 web worker 的支持性**
2. **创建 web worker 文件（js，回传函数等）**
3. **创建 web worker 对象**

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

1. **display: none：渲染树不会包含该渲染对象，因此该元素不会在页面中占据位置，也不会响应绑定的监听事件。**
2. **visibility: hidden：元素在页面中仍占据空间，但是不会响应绑定的监听事件。**
3. **opacity: 0：将元素的透明度设置为 0，以此来实现元素的隐藏。元素在页面中仍然占据空间，并且能够响应元素绑定的监听事件。**
4. **position: absolute：通过使用绝对定位将元素移除可视区域内，以此来实现元素的隐藏。**
5. **z-index: 负值：来使其他元素遮盖住该元素，以此来实现隐藏。**
6. **clip/clip-path** **：使用元素裁剪的方法来实现元素的隐藏，这种方法下，元素仍在页面中占据位置，但是不会响应绑定的监听事件。**
7. **transform: scale(0,0)：将元素缩放为 0，来实现元素的隐藏。这种方法下，元素仍在页面中占据位置，但是不会响应绑定的监听事件**

## 7. link和@import的区别

**两者都是外部引用CSS的方式，它们的区别如下：**

- **link是XHTML标签，除了加载CSS外，还可以定义RSS等其他事务；@import属于CSS范畴，只能加载CSS。**
- **link引用CSS时，在页面载入时同时加载；@import需要页面网页完全载入以后加载。**
- **link是XHTML标签，无兼容问题；@import是在CSS2.1提出的，低版本的浏览器不支持。**
- **link支持使用Javascript控制DOM去改变样式；而@import不支持。**

## 8. display:none与visibility:hidden的区别

**这两个属性都是让元素隐藏，不可见。两者区别如下：**

**（1）在渲染树中**

- **display:none会让元素完全从渲染树中消失，渲染时不会占据任何空间；**
- **visibility:hidden不会让元素从渲染树中消失，渲染的元素还会占据相应的空间，只是内容不可见。**

**（2）是否是继承属性**

- **display:none是非继承属性，子孙节点会随着父节点从渲染树消失，通过修改子孙节点的属性也无法显示；**
- **visibility:hidden** **是继承属性，子孙节点消失是由于继承了** **hidden，通过设置** **visibility:visible** **可以让子孙节点显示；**

**（3）修改常规文档流中元素的** **display通常会造成文档的重排，但是修改** **visibility** **属性只会造成本元素的重绘；**

**（4）如果使用读屏器，设置为** **display:none** **的内容不会被读取，设置为** **visibility:hidden** **的内容会被读取。**

## 9. 伪元素和伪类的区别和作用？

- **伪元素：在内容元素的前后插入额外的元素或样式，但是这些元素实际上并不在文档中生成。它们只在外部显示可见，但不会在文档的源代码中找到它们，因此，称为“伪”元素。例如：**

```plain
p::before {content:"第一章：";}
p::after {content:"Hot!";}
p::first-line {background:red;}
p::first-letter {font-size:30px;}
```

- **伪类：将特殊的效果添加到特定选择器上。它是已有元素上添加类别的，不会产生新的元素。例如：**

```plain
a:hover {color: #FF00FF}
p:first-child {color: red}
```

**总结：伪类是通过在元素选择器上加⼊伪类改变元素状态，⽽伪元素通过对元素的操作进⾏对元素的改变。**

## 10. 对盒模型的理解

**CSS3中的盒模型有以下两种：标准盒子模型、IE盒子模型**

**盒模型都是由四个部分组成的，分别是margin、border、padding和content。**

**标准盒模型和IE盒模型的区别在于设置width和height时，所对应的范围不同：**

- **标准盒模型的width和height属性的范围只包含了content，**
- **IE盒模型的width和height属性的范围包含了border、padding和content。**

**可以通过修改元素的box-sizing属性来改变元素的盒模型：**

- **box-sizeing: content-box表示标准盒模型（默认值）**
- **box-sizeing: border-box表示IE盒模型（怪异盒模型）**

## 11. 对 CSSSprites 的理解

**CSSSprites（精灵图），将一个页面涉及到的所有图片都包含到一张大图中去，然后利用CSS的 background-image，background-repeat，background-position属性的组合进行背景定位。**

**优点：**

- **利用** **CSS Sprites能很好地减少网页的http请求，从而大大提高了页面的性能，这是** **CSS Sprites最大的优点；**
- **CSS Sprites能减少图片的字节，把3张图片合并成1张图片的字节总是小于这3张图片的字节总和。**

**缺点：**

- **在图片合并时，要把多张图片有序的、合理的合并成一张图片，还要留好足够的空间，防止板块内出现不必要的背景。在宽屏及高分辨率下的自适应页面，如果背景不够宽，很容易出现背景断裂；**
- **CSSSprites在开发的时候相对来说有点麻烦，需要借助** **photoshop或其他工具来对每个背景单元测量其准确的位置。**
- **维护方面：CSS Sprites在维护的时候比较麻烦，页面背景有少许改动时，就要改这张合并的图片，无需改的地方尽量不要动，这样避免改动更多的** **CSS，如果在原来的地方放不下，又只能（最好）往下加图片，这样图片的字节就增加了，还要改动** **CSS。**

## 12. CSS预处理器/后处理器是什么？为什么要使用它们？

**预处理器，如：less，sass，stylus，用来预编译** **sass或者** **less，增加了** **css代码的复用性。层级，mixin， 变量，循环， 函数等对编写以及开发UI组件都极为方便。**

**后处理器，** **如：** **postCss，通常是在完成的样式表中根据** **css规范处理** **css，让其更加有效。目前最常做的是给** **css属性添加浏览器私有前缀，实现跨浏览器兼容性的问题。**

**css预处理器为** **css增加一些编程特性，无需考虑浏览器的兼容问题，可以在** **CSS中使用变量，简单的逻辑程序，函数等在编程语言中的一些基本的性能，可以让** **css更加的简洁，增加适应性以及可读性，可维护性等。**

**其它** **css预处理器语言：Sass（Scss）,** **Less,** **Stylus,** **Turbine,** **Swithch css,** **CSS Cacheer,** **DT Css。**

**使用原因：**

- **结构清晰， 便于扩展**
- **可以很方便的屏蔽浏览器私有语法的差异**
- **可以轻松实现多重继承**
- **完美的兼容了** **CSS代码，可以应用到老项目中**

## 13. display:inline-block 什么时候会显示间隙？

- **有空格时会有间隙，可以删除空格解决；**
- **margin正值时，可以让** **margin使用负值解决；**
- **使用** **font-size时，可通过设置** **font-size:0、letter-spacing、word-spacing解决；**

## 14. 单行、多行文本溢出隐藏

- **单行文本溢出**

```css
overflow: hidden;            // 溢出隐藏
text-overflow: ellipsis;      // 溢出用省略号显示
white-space: nowrap;         // 规定段落中的文本不进行换行
```

- **多行文本溢出**

```css
overflow: hidden;            // 溢出隐藏
text-overflow: ellipsis;     // 溢出用省略号显示
display:-webkit-box;         // 作为弹性伸缩盒子模型显示。
-webkit-box-orient:vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
-webkit-line-clamp:3;        // 显示的行数
```

**注意：由于上面的三个属性都是 CSS3 的属性，没有浏览器可以兼容，所以要在前面加一个** **-webkit-** **来兼容一部分浏览器。**

## 15. 如何判断元素是否到达可视区域

**以图片显示为例：**

- **window.innerHeight** **是浏览器可视区的高度；**
- **document.body.scrollTop || document.documentElement.scrollTop** **是浏览器滚动的过的距离；**
- **imgs.offsetTop** **是元素顶部距离文档顶部的高度（包括滚动条的距离）；**
- **内容达到显示区域的：img.offsetTop < window. innerHeight + document.body.scrollTop;**

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

总结：

> /* 居中元素定宽高

> /* 第一种 position:absolute  margin负值为元素的一半*/

```css
设置position:absolute; top:50%;left:50%; margin-left:width/2,margin-top:height/2
.element {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px; /* 定宽 */
  height: 200px; /* 定高 */
  margin-top: -100px; /* 高度的一半 */
  margin-left: -100px; /* 宽度的一半 */
}
```

> /* 第二种 absolute 和 margin:auto*/

```css
.element {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 200px; /* 定宽 */
  height: 200px; /* 定高 */
}
```

> /* 第三种 absolute 和 calc */

```css
.element {
  position: absolute;
  top: calc(50% - 100px); /* 50%减去高度的一半 */
  left: calc(50% - 100px); /* 50%减去宽度的一半 */
  width: 200px; /* 定宽 */
  height: 200px; /* 定高 */
}
```

> /* 居中元素不定宽高 */

> /* 第一种 absolute 和 transform:translate */

```css
.element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

> /* flex布局 */

> /* grid布局 */

```css
.wp{
  display: grid;
}
.box{
  align-self: center;
  justify-self: center;
}
```

- **利用绝对定位，先将元素的左上角通过top:50%和left:50%定位到页面的中心，然后再通过translate来调整元素的中心点到页面的中心。该方法需要考虑浏览器兼容问题。**

```css
.parent {
    position: relative;
}

.child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
}
```

- **利用绝对定位，设置四个方向的值都为0，并将margin设置为auto，由于宽高固定，因此对应方向实现平分，可以实现水平和垂直方向上的居中。该方法适用于盒子有宽高的情况：**

```css
.parent {
    position: relative;
}

.child {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}
```

- **利用绝对定位，先将元素的左上角通过top:50%和left:50%定位到页面的中心，然后再通过margin负值来调整元素的中心点到页面的中心。该方法适用于盒子宽高已知的情况**

```css
.parent {
    position: relative;
}

.child {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -50px;     /* 自身 height 的一半 */
    margin-left: -50px;    /* 自身 width 的一半 */
}
```

- **使用flex布局，通过align-items:center和justify-content:center设置容器的垂直和水平方向上为居中对齐，然后它的子元素也可以实现垂直和水平的居中。该方法要考虑兼容的问题，该方法在移动端用的较多：**

```css
.parent {
    display: flex;
    justify-content:center;
    align-items:center;
}
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

**简单来说：**

**flex布局是CSS3新增的一种布局方式，可以通过将一个元素的display属性值设置为flex从而使它成为一个flex容器，它的所有子元素都会成为它的项目。一个容器默认有两条轴：一个是水平的主轴，一个是与主轴垂直的交叉轴。可以使用flex-direction来指定主轴的方向。可以使用justify-content来指定元素在主轴上的排列方式，使用align-items来指定元素在交叉轴上的排列方式。还可以使用flex-wrap来规定当一行排列不下时的换行方式。对于容器中的项目，可以使用order属性来指定项目的排列顺序，还可以使用flex-grow来指定当排列空间有剩余的时候，项目的放大比例，还可以使用flex-shrink来指定当排列空间不足时，项目的缩小比例。**

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
- **使用 :after 伪元素。由于IE6-7不支持 :after，使用 zoom:1 触发 hasLayout**

```css
.clearfix:after{
    content: "\200B";
    display: table;
    height: 0;
    clear: both;
  }
  .clearfix{
    *zoom: 1;
  }
```

## 22. 对BFC的理解，如何创建BFC

- **Box: Box 是 CSS 布局的对象和基本单位，⼀个⻚⾯是由很多个 Box 组成的，这个Box就是我们所说的盒模型。**
- **Formatting context：块级上下⽂格式化，它是⻚⾯中的⼀块渲染区域，并且有⼀套渲染规则，它决定了其⼦元素将如何定位，以及和其他元素的关系和相互作⽤。**

**块格式化上下文（Block Formatting Context，BFC）是Web页面的可视化CSS渲染的一部分，是布局过程中生成块级盒子的区域，也是浮动元素与其他元素的交互限定区域。**

**通俗来讲：BFC是一个独立的布局环境，可以理解为一个容器，在这个容器中按照一定规则进行物品摆放，并且不会影响其它环境中的物品。如果一个元素符合触发BFC的条件，则BFC中的元素布局不受外部影响。**

**创建BFC的条件：**

- **根元素：body；**
- **元素设置浮动：float 除 none 以外的值；**
- **元素设置绝对定位：position (absolute、fixed)；**
- **display 值为：inline-block、table-cell、table-caption、flex等；**
- **overflow 值为：hidden、auto、scroll；**

**BFC的特点：**

- **垂直方向上，自上而下排列，和文档流的排列方式一致。**
- **在BFC中上下相邻的两个容器的margin会重叠**
- **计算BFC的高度时，需要计算浮动元素的高度**
- **BFC区域不会与浮动的容器发生重叠**
- **BFC是独立的容器，容器内部元素不会影响外部元素**
- **每个元素的左margin值和容器的左border相接触**

**BFC的作用：**

- **解决margin的重叠问题：由于BFC是一个独立的区域，内部的元素和外部的元素互不影响，将两个元素变为两个BFC，就解决了margin重叠的问题。**
- **解决高度塌陷的问题：在对子元素设置浮动后，父元素会发生高度塌陷，也就是父元素的高度变为0。解决这个问题，只需要把父元素变成一个BFC。常用的办法是给父元素设置** **overflow:hidden。**
- **创建自适应两栏布局：可以用来创建自适应两栏布局：左边的宽度固定，右边的宽度自适应。**

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

<div class="left"></div>
<div class="right"></div>
```

**左侧设置** **float:left，右侧设置** **overflow: hidden。这样右边就触发了BFC，BFC的区域不会与浮动元素发生重叠，所以两侧就不会发生重叠，实现了自适应两栏布局。**

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

**sition有以下属性值：**

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

**（1）首先判断display属性是否为none，如果为none，则position和float属性的值不影响元素最后的表现。**

**（2）然后判断position的值是否为absolute或者fixed，如果是，则float属性失效，并且display的值应该被设置为table或者block，具体转换需要看初始转换值。**

**（3）如果position的值不为absolute或者fixed，则判断float属性的值是否为none，如果不是，则display的值则按上面的规则转换。注意，如果position的值为relative并且float属性的值存在，则relative相对于浮动后的最终位置定位。**

**（4）如果float的值为none，则判断元素是否为根元素，如果是根元素则display属性按照上面的规则转换，如果不是，则保持指定的display属性值不变。**

**总的来说，可以把它看作是一个类似优先级的机制，"position:absolute"和"position:fixed"优先级最高，有它存在的时候，浮动不起作用，'display'的值也需要调整；其次，元素的'float'特性的值不是"none"的时候或者它是根元素的时候，调整'display'的值；最后，非根元素，并且非浮动元素，并且非绝对定位的元素，'display'特性值同设置值。**

## 26、css怎么实现三角形？

**CSS绘制三角形主要用到的是border属性，也就是边框。**

**平时在给盒子设置边框时，往往都设置很窄，就可能误以为边框是由矩形组成的。实际上，border属性是右三角形组成的，下面看一个例子：**

```css
div {
    width: 0;
    height: 0;
    border: 100px solid;
    border-color: orange blue red green;
}
```

**将元素的长宽都设置为0，显示出来的效果是这样的：**

**所以可以根据border这个特性来绘制三角形：**

**（1）三角1**

```css
div {
    width: 0;
    height: 0;
    border-top: 50px solid red;
    border-right: 50px solid transparent;
    border-left: 50px solid transparent;
}
```

**（2）三角2**

```css
div {
    width: 0;
    height: 0;
    border-bottom: 50px solid red;
    border-right: 50px solid transparent;
    border-left: 50px solid transparent;
}
```

**（3）三角3**

```css
div {
    width: 0;
    height: 0;
    border-left: 50px solid red;
    border-top: 50px solid transparent;
    border-bottom: 50px solid transparent;
}
```

**（4）三角4**

```css
div {
    width: 0;
    height: 0;
    border-right: 50px solid red;
    border-top: 50px solid transparent;
    border-bottom: 50px solid transparent;
}
```

**（5）三角5**

```css
div {
    width: 0;
    height: 0;
    border-top: 100px solid red;
    border-right: 100px solid transparent;
}
```

**还有很多，就不一一实现了，总体的原则就是通过上下左右边框来控制三角形的方向，用边框的宽度比来控制三角形的角度。**

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

- **利用vw来实现：**

```css
.square {
  width: 10%;
  height: 10vw;
  background: tomato;
}
```

- **利用元素的margin/padding百分比是相对父元素width的性质来实现：**

```css
.square {
  width: 20%;
  height: 0;
  padding-top: 20%;
  background: orange;
}
```

- **利用子元素的margin-top的值来实现：**

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

**在谷歌下css设置字体大小为12px及以下时，显示都是一样大小，都是默认12px。**

**解决方法：**

- **使用Webkit的内核的-webkit-text-size-adjust的私有CSS属性来解决，只要加了-webkit-text-size-adjust:none;字体大小就不受限制了。但是chrome更新到27版本之后就不可以用了。所以高版本chrome谷歌浏览器已经不再支持-webkit-text-size-adjust样式，所以要使用时候慎用。**
- **使用css3的transform缩放属性-webkit-transform:scale(0.5); 注意-webkit-transform:scale(0.75);收缩的是整个元素的大小，这时候，如果是内联元素，必须要将内联元素转换成块元素，可以使用display：block/inline-block/...；**
- **使用图片：如果是内容固定不变情况下，使用将小于12px文字内容切出做图片，这样不影响兼容也不影响美观。**

## 31. 如何解决 1px 问题？

**直接把 1px 改成 1/devicePixelRatio 后的值，这是目前为止最简单的一种方法。这种方法的缺陷在于兼容性不行，IOS 系统需要8及以上的版本，安卓系统则直接不兼容。**

**思路二：伪元素先放大后缩小**

**这个方法的可行性会更高，兼容性也更好。唯一的缺点是代码会变多。**

**思路是先放大、后缩小：在目标元素的后面追加一个 ::after 伪元素，让这个元素布局为 absolute 之后、整个伸展开铺在目标元素上，然后把它的宽和高都设置为目标元素的两倍，border值设为 1px。接着借助 CSS 动画特效中的放缩能力，把整个伪元素缩小为原来的 50%。此时，伪元素的宽高刚好可以和原有的目标元素对齐，而 border 也缩小为了 1px 的二分之一，间接地实现了 0.5px 的效果。**

**代码如下：**

```css
#container[data-device="2"] {
    position: relative;
}
#container[data-device="2"]::after{
      position:absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 200%;
      content:"";
      transform: scale(0.5);
      transform-origin: left top;
      box-sizing: border-box;
      border: 1px solid #333;
    }
}
```

**思路三：viewport 缩放来解决**

**这个思路就是对 meta 标签里几个关键属性下手：**

<meta name="viewport" content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no">

**这里针对像素比为2的页面，把整个页面缩放为了原来的1/2大小。这样，本来占用2个物理像素的 1px 样式，现在占用的就是标准的一个物理像素。根据像素比的不同，这个缩放比例可以被计算为不同的值，用 js 代码实现如下：**

```js
const scale = 1 / window.devicePixelRatio;
// 这里 metaEl 指的是 meta 标签对应的 Dom
metaEl.setAttribute('content', `width=device-width,user-scalable=no,initial-scale=${scale},maximum-scale=${scale},minimum-scale=${scale}`);
```

**这样解决了，但这样做的副作用也很大，整个页面被缩放了。这时 1px 已经被处理成物理像素大小，这样的大小在手机上显示边框很合适。但是，一些原本不需要被缩小的内容，比如文字、图片等，也被无差别缩小掉了。**

## 32.CSS 中可继承与不可继承属性有哪些？

这里其实考察的是可继承与不可继承属性在表现上的一些差异。
一些常见的可继承属性包括：

- 字体相关属性（font、font-size、font-weight等）

- 文本相关属性（color、text-align、line-height等）

- 元素可见性相关属性（visibility）

- 元素间距属性（margin、padding）

  剩下的都可理解为是不可继承属性，它们的特性：

- 不可继承属性不会被子元素继承，子元素不会自动继承父元素上设置的样式属性。

- 子元素需要通过自身的样式来显式地设置不可继承属性。

- 子元素的样式会独立于父元素的样式，不会受到父元素设置的影响。

   一些常见的可继承属性包括：

- 字体相关属性（font、font-size、font-weight等）

- 文本相关属性（color、text-align、line-height等）

- 元素可见性相关属性（visibility）

- 元素间距属性（margin、padding）

  一些常见的不可继承属性包括：

- 盒模型属性（width、height、border、margin、padding等）

- 定位属性（position、top、right、bottom、left等）

- 背景相关属性（background、background-color等）

- 清除浮动的属性（clear）

## 33.line-height: 100% 和 line-height: 1 有什么不一样？

常见细节题目，CSS 中存在很多取值即可以是绝对值，也可以是百分比的情况。

1. line-height: 100% 表示行高与当前字体的实际大小相等，即行高与字体大小相同。
2. line-height: 1 表示行高为字体大小的倍数，具体倍数取决于字体的特性和浏览器的默认样式。

基于 line-height，可以自己再去梳理，padding、margin，当取值为绝对值（px） 或者是百分比（%） 时的异同。

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
