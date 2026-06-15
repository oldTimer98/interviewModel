## 1. 说一下 web worker

**记忆口诀：「独立线程不碰 DOM，postMessage 传消息，CPU 密集放后台」**

**一句话回答：** Web Worker 是浏览器提供的**多线程**能力，让 JavaScript 在**后台独立线程**中执行耗时任务，避免阻塞主线程的 UI 渲染和用户交互。

### 核心特性

| 特性 | 说明 |
| --- | --- |
| 独立线程 | Worker 运行在独立的全局上下文，与主线程并行 |
| 不能操作 DOM | 无法访问 `document`、`window`，不能直接改页面 |
| 通信方式 | 主线程与 Worker 通过 `postMessage` / `onmessage` 通信 |
| 数据传递 | 消息数据会被**结构化克隆**（深拷贝），大对象可用 `Transferable` 转移所有权 |
| 适用场景 | 大数据计算、加解密、图片处理、文件解析等 **CPU 密集型**任务 |

### 使用步骤

**1. 创建 Worker 文件 `worker.js`**

```js
// worker.js — 运行在独立线程
self.onmessage = function (e) {
  const result = heavyCompute(e.data);
  self.postMessage(result);
};

function heavyCompute(data) {
  // 耗时计算逻辑
  return data * 2;
}
```

**2. 主线程创建实例并通信**

```js
const worker = new Worker('worker.js');

worker.postMessage(100);

worker.onmessage = function (e) {
  console.log('计算结果：', e.data);
};

// 用完记得销毁
worker.terminate();
```

### Worker 的类型

| 类型 | 说明 |
| --- | --- |
| Dedicated Worker | 最常用，只能被创建它的页面使用 |
| Shared Worker | 可被多个同源页面共享 |
| Service Worker | 用于离线缓存、推送通知等 PWA 场景 |

### 面试追问点

- **为什么 Worker 不能操作 DOM？** 因为 DOM 不是线程安全的，多线程同时操作会引发竞态问题，所以浏览器禁止 Worker 访问 DOM。
- **和主线程的区别？** 主线程负责 UI 渲染、事件响应；Worker 只做计算，结果通过消息回传。
- **注意：** Worker 有独立的全局对象 `self`，不是 `window`；同源策略同样适用。

---

## 2. 行内元素有哪些？块级元素有哪些？空(void)元素有哪些？

**记忆口诀：「块级 div p ul li，行内 a span img，空元素 br hr img input link meta」**

**一句话回答：** HTML 元素按默认显示方式分为**块级元素**（独占一行、可设宽高）和**行内元素**（同行排列、不可设宽高）；**空元素**是没有闭合标签、不能包含子内容的元素。

### 三类元素对比

| 类型 | 默认 display | 是否独占一行 | 能否设 width/height | 典型代表 |
| --- | --- | --- | --- | --- |
| 块级元素 | block | ✅ | ✅ | div、p、h1-h6、ul、ol、li |
| 行内元素 | inline | ❌ | ❌ | a、span、strong、em、img、input |
| 空元素 | 视元素而定 | - | - | br、hr、img、input、link、meta |

### 块级元素（常见）

`div`、`p`、`h1`-`h6`、`ul`、`ol`、`li`、`dl`、`dt`、`dd`、`table`、`form`、`header`、`footer`、`section`、`article`、`nav`、`aside`

**特点：**
- 默认宽度为父元素 100%，高度由内容撑开
- 可以设置 `margin`、`padding`、`width`、`height`
- 多个块级元素从上到下垂直排列

### 行内元素（常见）

`a`、`span`、`strong`、`em`、`b`、`i`、`img`、`input`、`select`、`textarea`、`label`、`code`

**特点：**
- 宽度由内容决定，多个元素在同一行排列
- 设置 `width`、`height` 无效
- 水平方向 `margin`、`padding` 有效；垂直方向 `padding` 可见但**不影响行高**，垂直 `margin` 无效

> **注意：** `img`、`input` 等虽然表现为行内，但可以通过 CSS 设置宽高（属于「替换元素」的特殊行为）。

### 空元素（Void Elements）

**常见：** `<br>`、`<hr>`、`<img>`、`<input>`、`<link>`、`<meta>`

**较少见：** `<area>`、`<base>`、`<col>`、`<colgroup>`、`<embed>`、`<source>`、`<track>`、`<wbr>`

**特点：**
- 只有开始标签，没有闭合标签（HTML5 中 `<img />` 的 `/` 可省略）
- 不能包含任何子元素或文本内容
- 自闭合，浏览器解析时不会等待闭合标签

### 面试追问点

- **行内元素里能放块级元素吗？** HTML4 规范不允许，HTML5 放宽了部分限制（如 `<a>` 可包裹块级），但实践中仍建议遵循「块包行、行包行」的原则。
- **如何通过 CSS 改变元素类型？** 使用 `display` 属性，如 `span { display: block; }`。

---

## 3. CSS 选择器及其优先级

**记忆口诀：「!important 称王，内联一千 id 一百，类伪属性十，标签伪元素一，通配符零」**

**一句话回答：** CSS 选择器用于匹配元素并应用样式；当多条规则冲突时，按**优先级权重**决定最终生效的样式，权重从高到低为：`!important` > 内联样式 > ID > 类/伪类/属性 > 标签/伪元素 > 通配符。

### 常见选择器一览

| 选择器 | 格式示例 | 权重 |
| --- | --- | --- |
| 内联样式 | `style="color: red"` | 1000 |
| ID 选择器 | `#header` | 100 |
| 类选择器 | `.btn` | 10 |
| 属性选择器 | `input[type="text"]` | 10 |
| 伪类选择器 | `a:hover`、`li:first-child` | 10 |
| 标签选择器 | `div`、`p` | 1 |
| 伪元素选择器 | `p::before`、`::first-line` | 1 |
| 通配符选择器 | `*` | 0 |
| 子选择器 | `ul > li` | 0（仅增加匹配条件） |
| 后代选择器 | `div p` | 0 |
| 相邻兄弟选择器 | `h1 + p` | 0 |

### 优先级计算规则

1. **`!important` 最高**：同一属性同时有普通声明和 `!important` 时，`!important` 胜出
2. **权重相加**：复合选择器的权重 = 各组成部分权重之和
   - `#nav .item` = 100 + 10 = **110**
   - `div.container p` = 1 + 10 + 1 = **12**
3. **权重相同**：后出现的规则覆盖先出现的（层叠顺序）
4. **继承最低**：子元素继承父元素样式，但继承的优先级视为 0，可被任何直接选择器覆盖
5. **来源顺序**（权重相同时）：内联 > 内部 `<style>` > 外部 CSS > 浏览器默认样式

### 代码示例

```css
/* 权重：1 + 10 = 11 */
div.title { color: blue; }

/* 权重：100 + 10 = 110，胜出 */
#main .title { color: red; }

/* !important 可以覆盖更高权重（同层级内） */
.title { color: green !important; }
```

### 面试追问点

- **为什么不推荐滥用 `!important`？** 破坏层叠规则，后续维护困难，需要用更高权重或更多 `!important` 来覆盖。
- **`:not()` 伪类怎么算权重？** 不算自身权重，只计算括号内选择器的权重。
- **CSS 变量（自定义属性）有优先级吗？** 变量本身遵循普通优先级规则，但 `var()` 引用的是运行时值。

---

## 4. display 的属性值及其作用

**记忆口诀：「none 消失，block 块，inline 行，inline-block 行块，flex 弹性，grid 网格」**

**一句话回答：** `display` 决定元素的**外部显示类型**（如何参与文档流布局）和**内部显示类型**（子元素如何排列），是 CSS 布局的基础属性。

### 常用 display 值

| 属性值 | 作用 | 典型场景 |
| --- | --- | --- |
| `none` | 元素不显示，从文档流中移除 | 隐藏元素、条件渲染 |
| `block` | 块级，独占一行，可设宽高 | div、p 的默认行为 |
| `inline` | 行内，不独占一行，不可设宽高 | span、a 的默认行为 |
| `inline-block` | 行内块，不独占一行，可设宽高 | 导航菜单、按钮组 |
| `flex` | 弹性盒布局，子元素沿主轴排列 | 一维布局（导航栏、卡片列表） |
| `inline-flex` | 表现为行内的 flex 容器 | 行内弹性布局 |
| `grid` | 网格布局，二维行列排列 | 页面整体布局、复杂网格 |
| `inline-grid` | 表现为行内的 grid 容器 | 行内网格 |
| `table` | 表现为块级表格 | 模拟表格布局 |
| `table-cell` | 表现为表格单元格 | 垂直居中技巧 |
| `list-item` | 表现为块级并带列表标记 | li 的默认行为 |
| `inherit` | 继承父元素的 display 值 | 保持一致性 |

### 补充说明

- **`display: none` vs `visibility: hidden`**：`none` 不占位，`hidden` 占位（详见第 8 题）
- **Flex 和 Grid 是现代布局主力**：一维用 Flex，二维用 Grid
- **`display` 改变会触发重排**，频繁切换时注意性能

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

---

## 5. display 的 block、inline 和 inline-block 的区别

**记忆口诀：「block 独占能宽高，inline 同行无宽高，inline-block 同行能宽高」**

**一句话回答：** 三者核心区别在于**是否独占一行**和**能否设置宽高**——block 独占且可设宽高，inline 同行不可设宽高，inline-block 同行但可设宽高。

### 三者对比

| 对比维度 | block | inline | inline-block |
| --- | --- | --- | --- |
| 是否独占一行 | ✅ 独占 | ❌ 同行排列 | ❌ 同行排列 |
| 能否设 width/height | ✅ | ❌ | ✅ |
| 垂直 margin | ✅ 有效 | ❌ 无效 | ✅ 有效 |
| 水平 margin/padding | ✅ | ✅ | ✅ |
| 垂直 padding | ✅ 撑开行高 | 可见但不撑开行高 | ✅ 撑开行高 |
| 默认宽度 | 父元素 100% | 内容宽度 | 内容宽度 |
| 典型元素 | div、p、h1 | span、a、em | 无原生元素，需 CSS 设置 |

### 详细说明

**block（块级）：**
- 元素前后自动换行，多个 block 元素垂直堆叠
- 可以设置任意 `width`、`height`、`margin`、`padding`
- 即使不设置宽度，也会占满父容器宽度

**inline（行内）：**
- 元素在同一行内排列，直到一行放不下才换行
- `width`、`height` 设置无效
- 水平方向 `margin`、`padding` 有效；垂直 `margin` 无效，垂直 `padding` 虽然可见但**不会改变行高**
- 不能包含块级元素（HTML5 部分放宽）

**inline-block（行内块）：**
- 兼具两者优点：外部表现为 inline（同行排列），内部表现为 block（可设宽高）
- 元素之间可能出现**间隙**（HTML 空白字符导致，见第 13 题）
- 常用于：导航栏、水平排列的按钮组、图片列表

### 代码示例

```css
.block-demo {
  display: block;
  width: 200px;
  height: 100px;
  background: #e74c3c;
}

.inline-demo {
  display: inline;
  width: 200px;   /* 无效 */
  height: 100px;  /* 无效 */
  background: #3498db;
}

.inline-block-demo {
  display: inline-block;
  width: 200px;
  height: 100px;
  background: #2ecc71;
}
```

---

## 6. 隐藏元素的方法有哪些

**记忆口诀：「display 不占位，visibility 占位不响应，opacity 透明能点击，移出 clip transform 来辅助」**

**一句话回答：** 隐藏元素有多种方式，核心区别在于**是否占据空间**、**是否响应事件**、**是否触发重排**，面试中最常考的是 `display: none`、`visibility: hidden`、`opacity: 0` 三者的差异。

### 隐藏方法对比

| 方法 | 占据空间 | 响应事件 | 触发重排 | 子元素可恢复 | 支持 transition |
| --- | :---: | :---: | :---: | :---: | :---: |
| `display: none` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `visibility: hidden` | ✅ | ❌ | ❌（仅重绘） | ✅ | ✅ |
| `opacity: 0` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `position: absolute` 移出可视区 | ❌ | ❌ | ✅ | - | - |
| `z-index: 负值` | ✅ | ❌ | ❌ | - | - |
| `clip-path: inset(50%)` | ✅ | ❌ | ❌ | - | ✅ |
| `transform: scale(0)` | ✅ | ❌ | ❌ | - | ✅ |
| `height: 0; overflow: hidden` | ❌ | ❌ | ✅ | - | - |

### 重点详解

**`display: none`——彻底消失**
- 元素从渲染树中移除，不占空间、不可交互
- 切换显示/隐藏会触发**重排（reflow）**，性能开销较大
- 子元素无法单独恢复显示

**`visibility: hidden`——隐身占位**
- 元素仍在渲染树中，占据原有空间，不可见也不可点击
- 是**继承属性**，子元素可通过 `visibility: visible` 单独显示
- 仅触发**重绘（repaint）**，性能优于 display

**`opacity: 0`——透明占位**
- 元素完全透明，仍占空间且**可以响应点击事件**
- 常用于淡入淡出动画（配合 `transition`）
- 不会触发重排，GPU 加速友好

### 代码示例

```css
.hide-display { display: none; }
.hide-visibility { visibility: hidden; }
.hide-opacity { opacity: 0; }
.hide-offscreen { position: absolute; left: -9999px; }
.hide-clip { clip-path: inset(50%); }
.hide-scale { transform: scale(0); }
```

### 使用场景建议

| 场景 | 推荐方案 |
| --- | --- |
| 彻底移除元素（如切换 Tab 内容） | `display: none` |
| 隐藏但保留布局空间（如占位骨架） | `visibility: hidden` |
| 淡出动画 / 透明交互层 | `opacity: 0` |
| 无障碍隐藏（视觉隐藏但屏幕阅读器可读） | `.sr-only` 类（clip + absolute） |

---

## 7. link 和 @import 的区别

**记忆口诀：「link 是标签并行加载，@import 是 CSS 语法串行加载，link 能 JS 控制」**

**一句话回答：** `link` 和 `@import` 都是引入外部 CSS 的方式，但 `link` 是 HTML 标签、与页面并行加载且可被 JS 控制；`@import` 是 CSS 语法、需等 CSS 文件解析后才加载，存在性能和兼容问题。

### 对比表格

| 对比维度 | `<link>` | `@import` |
| --- | --- | --- |
| 本质 | HTML 标签 | CSS 语法规则 |
| 加载时机 | 页面加载时**并行**下载 CSS | 需等引入它的 CSS 文件**解析完成后**才加载 |
| 加载顺序 | 与 HTML 同时解析，不阻塞 DOM 构建（CSS 阻塞渲染） | 串行加载，可能产生 FOUC（无样式内容闪烁） |
| 适用范围 | 可引入 CSS、RSS、图标等 | 只能引入 CSS |
| JS 控制 | ✅ 可通过 DOM 操作动态增删 | ❌ 不支持 |
| 兼容性 | 所有浏览器 | CSS2.1 提出，IE5+ 支持 |
| 优先级 | 同权重时后加载的覆盖先加载的 | 同权重时 `@import` 引入的样式**优先级更低** |

### 代码示例

```html
<!-- link 方式（推荐） -->
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="theme.css">

<!-- @import 方式（写在 CSS 文件或 style 标签内） -->
<style>
  @import url('style.css');
  @import url('theme.css') screen;
</style>
```

```js
// link 可被 JS 动态控制
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'dark-theme.css';
document.head.appendChild(link);
```

### 面试结论

**实际开发中推荐使用 `<link>`**，原因：
1. 并行加载，性能更好
2. 可被 JavaScript 动态控制（如主题切换）
3. 不会导致 FOUC
4. `@import` 在构建工具时代已很少直接使用

---

## 8. display:none 与 visibility:hidden 的区别

**记忆口诀：「none 真消失触发重排，hidden 假隐身只重绘，hidden 可继承子能显」**

**一句话回答：** `display: none` 让元素从渲染树中彻底移除，不占位、不可交互、触发重排；`visibility: hidden` 让元素不可见但仍占位，子元素可恢复显示，仅触发重绘。

### 深入对比

| 对比维度 | `display: none` | `visibility: hidden` |
| --- | --- | --- |
| 渲染树 | 完全从渲染树消失 | 仍在渲染树中 |
| 占据空间 | ❌ 不占位 | ✅ 占位 |
| 响应事件 | ❌ 不可点击 | ❌ 不可点击 |
| 继承性 | 非继承属性 | **继承属性**，子元素可设 `visible` 恢复 |
| 性能影响 | 触发**重排（reflow）** | 仅触发**重绘（repaint）** |
| 读屏器 | 不会被读取 | **会被读取**（无障碍需注意） |
| transition 动画 | ❌ 不支持 | ✅ 支持 |
| 子元素 | 全部隐藏，无法单独恢复 | 子元素可通过 `visibility: visible` 单独显示 |
| 计数器 / 表单 | 不参与计数，表单不提交 | 仍参与计数，表单仍会提交 |

### 代码示例

```css
.parent-hidden {
  visibility: hidden;
}
.parent-hidden .child-visible {
  visibility: visible; /* 子元素单独显示，但父元素仍占空间 */
}

.box-none {
  display: none; /* 彻底消失，不占位 */
}
```

```html
<!-- visibility: hidden 的子元素恢复示例 -->
<div class="parent-hidden">
  父元素隐藏
  <span class="child-visible">但我可见！</span>
</div>
```

### 面试速答模板

> `display: none` 是「真消失」——元素从文档流移除，不占位、不可交互，切换时会触发重排，性能开销大，子元素也无法单独恢复。
>
> `visibility: hidden` 是「假隐身」——元素仍占着位置，只是看不见。它是继承属性，子元素可以通过设置 `visibility: visible` 单独显示。只触发重绘，性能更好，且支持 transition 过渡动画。

### 追问：那 `opacity: 0` 呢？

| 对比 | `visibility: hidden` | `opacity: 0` |
| --- | --- | --- |
| 占位 | ✅ | ✅ |
| 响应事件 | ❌ | ✅ **能点击** |
| 继承 | 继承 | 非继承 |
| 动画 | 支持 transition | 支持 transition（更常用） |

---

## 9. 伪元素和伪类的区别和作用

**记忆口诀：「伪类选状态单冒号，伪元素造内容双冒号」**

**一句话回答：** **伪类**用于选择元素的某种**状态**（如悬停、第一个子元素），语法用单冒号 `:`；**伪元素**用于在元素前后**插入虚拟内容**（如装饰文字、清除浮动），语法用双冒号 `::`。

### 核心区别

| 对比维度 | 伪类（Pseudo-class） | 伪元素（Pseudo-element） |
| --- | --- | --- |
| 作用 | 选择已有元素的某种**状态** | 创建/选中元素的**虚拟部分** |
| 是否产生新元素 | ❌ 不产生 | ✅ 产生虚拟元素 |
| 语法 | 单冒号 `:` | 双冒号 `::`（CSS3 规范） |
| 典型示例 | `:hover`、`:active`、`:first-child` | `::before`、`::after`、`::first-line` |

### 常见伪类

| 伪类 | 作用 |
| --- | --- |
| `:hover` | 鼠标悬停状态 |
| `:active` | 鼠标按下状态 |
| `:focus` | 元素获得焦点 |
| `:first-child` | 作为第一个子元素 |
| `:nth-child(n)` | 第 n 个子元素 |
| `:not(selector)` | 排除匹配的元素 |
| `:checked` | 选中的表单控件 |
| `:disabled` | 禁用的表单控件 |

### 常见伪元素

| 伪元素 | 作用 |
| --- | --- |
| `::before` | 在元素内容前插入虚拟元素 |
| `::after` | 在元素内容后插入虚拟元素 |
| `::first-line` | 选中元素的第一行文本 |
| `::first-letter` | 选中元素的第一个字母 |
| `::placeholder` | 选中输入框的占位文字 |
| `::selection` | 选中用户选中的文本 |

### 代码示例

```css
/* 伪类：改变链接状态 */
a:hover { color: #e74c3c; }
a:active { color: #c0392b; }
li:first-child { font-weight: bold; }
li:nth-child(odd) { background: #f9f9f9; }

/* 伪元素：插入虚拟内容 */
.quote::before {
  content: "「";
  color: #999;
}
.quote::after {
  content: "」";
  color: #999;
}

/* 经典应用：清除浮动 */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

/* 装饰性图标 */
.icon-download::before {
  content: "⬇";
  margin-right: 4px;
}
```

### 面试要点

- `::before` 和 `::after` 必须设置 `content` 属性才会生效（可以是 `""` 空字符串）
- 伪元素默认是**行内元素**，可通过 `display` 改变
- CSS2 中伪元素也写单冒号，浏览器兼容；CSS3 规范区分：`:` 伪类，`::` 伪元素
- 伪元素不能用于 `<img>`、`<input>` 等替换元素

---

## 10. 对盒模型的理解

**记忆口诀：「margin 外 border 框 padding 衬 content 心，标准只算 content，border-box 全包进」**

**一句话回答：** 盒模型描述元素占据空间的组成方式，由外到内为 **margin → border → padding → content**；标准盒模型 `width` 只含 content，IE 盒模型（`border-box`）的 `width` 包含 padding 和 border。

### 盒模型结构

```
┌────────────── margin ──────────────┐
│  ┌────────── border ──────────┐    │
│  │  ┌────── padding ──────┐   │    │
│  │  │                     │   │    │
│  │  │      content        │   │    │
│  │  │                     │   │    │
│  │  └─────────────────────┘   │    │
│  └────────────────────────────┘    │
└────────────────────────────────────┘
```

### 两种盒模型对比

| 对比维度 | 标准盒模型 | IE 盒模型 |
| --- | --- | --- |
| `box-sizing` | `content-box`（默认） | `border-box` |
| width 包含 | 仅 content | content + padding + border |
| 设 width: 200px 加 padding: 20px | 实际宽度 = 200 + 40 + border | 实际宽度 = 200（padding 往里挤） |
| 直观性 | 需手动计算 | 设多宽就是多宽 |

### 计算示例

```css
/* 标准盒模型 content-box（默认） */
.box-standard {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  /* 实际占用宽度 = 200 + 20*2 + 5*2 = 250px */
}

/* IE 盒模型 border-box（推荐） */
.box-border {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  /* 实际占用宽度 = 200px，content 宽度 = 200 - 40 - 10 = 150px */
}
```

### 最佳实践

```css
/* 全局设置为 border-box，开发更直观 */
*, *::before, *::after {
  box-sizing: border-box;
}
```

### 面试追问点

- **margin 折叠（塌陷）：** 相邻块级元素的垂直 margin 会合并取较大值，padding/border 或 BFC 可阻止
- **`box-sizing: inherit`：** 子元素继承父元素的 box-sizing 设置
- **为什么推荐 border-box？** 设 width: 100% 再加 padding 不会撑破父容器，布局更可预测

---

## 11. 对 CSS Sprites 的理解

**记忆口诀：「多图合一减请求，background-position 来定位」**

**一句话回答：** CSS Sprites（精灵图/雪碧图）是将**多张小图标合并为一张大图**，通过 `background-image` + `background-position` 定位显示对应区域，从而减少 HTTP 请求、提升加载性能。

### 工作原理

```
┌─────────────────────────────┐
│  icon1  │  icon2  │  icon3  │  ← 合并后的大图
│─────────┼─────────┼─────────│
│  icon4  │  icon5  │  icon6  │
└─────────────────────────────┘

.icon-home {
  background-image: url('sprites.png');
  background-position: 0 0;        /* 显示 icon1 */
  width: 32px;
  height: 32px;
}
```

### 优缺点对比

| 优点 | 缺点 |
| --- | --- |
| 减少 HTTP 请求数，加载更快 | 制作和维护成本高 |
| 合并后总体积通常更小 | 每个图标需精确测量 position |
| 预加载一张图即可缓存所有图标 | 改一个图标需重新合并整图 |
| 减少每张图的协议头开销 | 高分辨率/自适应场景容易出问题 |

### 代码示例

```css
.icon {
  background-image: url('icons-sprite.png');
  background-repeat: no-repeat;
  display: inline-block;
  width: 24px;
  height: 24px;
}

.icon-search { background-position: 0 0; }
.icon-user   { background-position: -24px 0; }
.icon-cart   { background-position: -48px 0; }
.icon-home   { background-position: 0 -24px; }
```

```html
<i class="icon icon-search"></i>
<i class="icon icon-user"></i>
```

### 现代替代方案

| 方案 | 特点 |
| --- | --- |
| **Icon Font**（字体图标） | 矢量、颜色可控、一个字体文件包含所有图标 |
| **SVG Sprite** | 矢量、可 CSS 控制、`<use>` 引用 |
| **SVG 内联** | 最灵活，可单独控制每个 path 的颜色 |
| **图片懒加载 + HTTP/2** | HTTP/2 多路复用降低了合并请求的必要性 |

> 面试中 CSS Sprites 考查的是**性能优化思路**——减少请求数。现代项目虽多用 SVG/Icon Font，但原理和 trade-off 仍需掌握。

---

## 12. CSS 预处理器/后处理器是什么？

**记忆口诀：「预处理写之前增强 CSS，后处理写之后自动优化」**

**一句话回答：** **预处理器**（Sass/Less/Stylus）在编写阶段为 CSS 增加变量、嵌套、mixin 等编程能力，编译输出标准 CSS；**后处理器**（PostCSS）在 CSS 写完后自动优化，如添加浏览器前缀、压缩代码。

### 预处理器 vs 后处理器

| 对比维度 | 预处理器 | 后处理器 |
| --- | --- | --- |
| 处理时机 | **编写之前**（编译时） | **编写之后**（生成 CSS 后） |
| 代表工具 | Sass/Scss、Less、Stylus | PostCSS |
| 核心能力 | 变量、嵌套、mixin、函数、循环 | 自动前缀、压缩、未来 CSS 降级 |
| 输入 | 增强语法（.scss/.less） | 标准 CSS |
| 输出 | 标准 CSS | 优化后的 CSS |

### 预处理器核心特性

```scss
// Sass/Scss 示例
$primary-color: #3498db;
$border-radius: 4px;

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  color: $primary-color;
  border-radius: $border-radius;

  .title {
    font-size: 18px; // 嵌套
  }

  &:hover { // & 引用父选择器
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
}

.container {
  @include flex-center; // 混入
}
```

### 后处理器核心特性

```js
// PostCSS 配置示例（postcss.config.js）
module.exports = {
  plugins: [
    require('autoprefixer'),  // 自动添加 -webkit-、-moz- 等前缀
    require('cssnano'),       // 压缩 CSS
  ]
};
```

```css
/* 输入 */
.box {
  display: flex;
  user-select: none;
}

/* Autoprefixer 输出 */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

### 为什么要使用？

1. **结构清晰**：嵌套让样式层级与 HTML 结构对应，可读性强
2. **复用性强**：变量和 mixin 避免重复代码，改一处全局生效
3. **解决兼容**：Autoprefixer 自动添加前缀，不用手写 `-webkit-`
4. **渐进增强**：完美兼容普通 CSS，可逐步引入老项目

---

## 13. display:inline-block 什么时候会显示间隙？

**记忆口诀：「HTML 空白字符是元凶，font-size 归零或去空格」**

**一句话回答：** `inline-block` 元素之间的间隙是由 HTML 源码中的**换行符和空格**被浏览器渲染为空白字符导致的，与 CSS 的 `margin` 无关。

### 原因分析

```html
<!-- HTML 中的换行和空格会被渲染为一个空白字符（约 4px） -->
<div class="box">A</div>
<div class="box">B</div>
<div class="box">C</div>
<!-- A 和 B、B 和 C 之间会出现间隙 -->
```

`inline-block` 元素像文字一样排列，标签之间的空白字符（空格、换行、Tab）会被当作文本节点渲染，产生约 **4px** 的间隙（具体取决于父元素的 `font-size`）。

### 解决方案对比

| 方案 | 做法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 去除空白 | HTML 标签紧挨着写，不换行 | 最简单 | HTML 可读性差 |
| `font-size: 0` | 父元素设 `font-size: 0`，子元素恢复 | 最常用，HTML 不用改 | 子元素需重置 font-size |
| 负 margin | 子元素设 `margin-right: -4px` | 简单 | 间隙大小随 font-size 变化，不精确 |
| 改变 HTML 结构 | 注释法 `><!--` 消除空白 | 不改 CSS | hack 写法，不推荐 |
| 使用 Flex/Grid | 改用现代布局 | 根本解决 | 需改布局方案 |

### 代码示例

```css
/* 方案一：font-size: 0（推荐） */
.parent {
  font-size: 0;
}
.parent .box {
  display: inline-block;
  font-size: 14px; /* 子元素恢复字体大小 */
}

/* 方案二：负 margin */
.box {
  display: inline-block;
  margin-right: -4px;
}
```

```html
<!-- 方案三：去除 HTML 空白 -->
<div class="parent">
  <div class="box">A</div><!--
  --><div class="box">B</div><!--
  --><div class="box">C</div>
</div>

<!-- 方案四：Flex 布局（最佳） -->
<div class="parent" style="display: flex; gap: 0;">
  <div class="box">A</div>
  <div class="box">B</div>
  <div class="box">C</div>
</div>
```

### 面试结论

现代开发中更推荐直接用 **Flex** 或 **Grid** 布局代替 `inline-block` 排列，从根本上避免间隙问题。但理解间隙产生的原因仍是常考点。

---

## 14. 单行、多行文本溢出隐藏

**记忆口诀：「单行三件套 overflow ellipsis nowrap，多行加 webkit-line-clamp」**

**一句话回答：** 单行文本溢出用 `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` 三件套；多行文本在此基础上增加 `-webkit-line-clamp` 控制显示行数。

### 方案对比

| 方案 | 适用 | 兼容性 | 核心属性 |
| --- | --- | --- | --- |
| 单行省略 | 标题、列表项 | 全浏览器 | overflow + text-overflow + white-space |
| 多行省略 | 摘要、描述 | WebKit 内核为主 | 上述 + -webkit-line-clamp |
| JS 截断 | 需全兼容 | 全浏览器 | 计算字符数 + 插入省略号 |

### 单行文本溢出

```css
.single-line {
  overflow: hidden;           /* 隐藏溢出内容 */
  text-overflow: ellipsis;    /* 溢出部分显示省略号 */
  white-space: nowrap;        /* 强制不换行 */
}
```

> 三个属性**必须同时设置**才能生效，缺一不可。

### 多行文本溢出

```css
.multi-line {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;           /* 弹性盒模型 */
  -webkit-box-orient: vertical;   /* 垂直排列 */
  -webkit-line-clamp: 3;          /* 限制显示 3 行 */
  /* 可选：配合 line-height 和 max-height 更精确 */
  line-height: 1.5;
  max-height: 4.5em; /* line-height × 行数 */
}
```

### 完整 HTML 示例

```html
<p class="single-line">
  这是一段很长的文本内容，超出容器宽度后会显示省略号
</p>

<p class="multi-line">
  这是一段很长的文本内容，超出三行后会显示省略号。
  第二行内容继续展示。第三行内容。第四行不会显示。
</p>
```

### 注意事项

- 多行方案依赖 `-webkit-` 前缀，**Chrome/Safari/Edge 支持**，Firefox 79+ 也支持
- 容器必须有**固定宽度**（或 max-width），否则不会触发溢出
- `text-overflow: ellipsis` 只对块级/行内块元素有效
- 需要全浏览器兼容时，可用 JS 计算字符数截断

---

## 15. 如何判断元素是否到达可视区域

**记忆口诀：「offsetTop 传统算，getBoundingClientRect 灵活，IntersectionObserver 最推荐」**

**一句话回答：** 判断元素是否进入可视区域有三种主流方式：`offsetTop` 手动计算（传统）、`getBoundingClientRect()` 获取位置（灵活）、`IntersectionObserver` 监听交叉（**现代推荐**），常用于图片懒加载、无限滚动、曝光统计。

### 三种方案对比

| 方案 | 性能 | 精确度 | 复杂度 | 推荐度 |
| --- | --- | --- | --- | --- |
| offsetTop 计算 | 差（需监听 scroll） | 一般 | 高 | ⭐⭐ |
| getBoundingClientRect | 中（需监听 scroll） | 高 | 中 | ⭐⭐⭐ |
| IntersectionObserver | 好（浏览器优化） | 高 | 低 | ⭐⭐⭐⭐⭐ |

### 方案一：offsetTop 传统计算

```js
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top < viewHeight &&
    rect.bottom > 0 &&
    rect.left < viewWidth &&
    rect.right > 0
  );
}

// 需配合 scroll 事件（性能较差）
window.addEventListener('scroll', () => {
  if (isInViewport(img)) {
    loadImage(img);
  }
});
```

### 方案二：getBoundingClientRect

```js
function isVisible(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}
```

`getBoundingClientRect()` 返回元素相对于**视口**的位置，比 `offsetTop` 更准确（不受 offsetParent 影响）。

### 方案三：IntersectionObserver（推荐）

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // 懒加载：替换真实地址
      observer.unobserve(img);   // 加载后取消观察
    }
  });
}, {
  root: null,       // 默认视口
  rootMargin: '0px', // 扩展/缩小检测区域
  threshold: 0.1    // 可见 10% 时触发
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### 懒加载 HTML 示例

```html
<img data-src="real-image.jpg" src="placeholder.gif" alt="lazy load">
```

### 面试结论

- **优先使用 IntersectionObserver**：异步、不阻塞主线程、不需要监听 scroll
- `rootMargin` 可实现**预加载**（提前 200px 开始加载）
- `threshold` 可用于**曝光统计**（元素可见 50% 以上算曝光）

---

## 16. z-index 属性在什么情况下会失效

**记忆口诀：「非 static 才生效，层叠上下文定高低，float 同设会失效」**

**一句话回答：** `z-index` 只在元素处于**定位元素**（position 非 static）且处于同一**层叠上下文**时才有效；常见失效原因包括：未设置定位、父元素创建了新层叠上下文、同时设置了 float。

### z-index 生效条件

| 条件 | 说明 |
| --- | --- |
| position 非 static | 必须是 `relative`、`absolute`、`fixed` 或 `sticky` |
| 同一层叠上下文 | 只在同一层叠上下文内比较，不会跨上下文 |
| 非 flex/grid 子项的特殊情况 | flex/grid 子项设 z-index 无需定位也生效 |

### 常见失效场景

**1. 未设置 position（最常见）**

```css
.box {
  z-index: 999; /* 无效！position 默认 static */
}

.box {
  position: relative;
  z-index: 999; /* 生效 */
}
```

**2. 父元素创建了新的层叠上下文**

```css
.parent {
  position: relative;
  z-index: 1; /* 创建了层叠上下文 */
}
.child {
  position: absolute;
  z-index: 9999; /* 只在 parent 上下文内比较，无法超越 parent 的兄弟 */
}
```

**3. 同时设置了 float**

```css
.box {
  float: left;
  position: relative;
  z-index: 10; /* 部分浏览器下可能失效 */
}

/* 解决：去掉 float，改用 inline-block 或 flex */
.box {
  display: inline-block;
  position: relative;
  z-index: 10;
}
```

### 层叠上下文创建条件

以下任一条件都会创建新的层叠上下文：

| 触发条件 | 示例 |
| --- | --- |
| 根元素 | `<html>` |
| position + z-index 非 auto | `position: relative; z-index: 1` |
| opacity < 1 | `opacity: 0.99` |
| transform 非 none | `transform: translateZ(0)` |
| filter 非 none | `filter: blur(5px)` |
| flex/grid 子项 + z-index 非 auto | `z-index: 1`（无需定位） |
| will-change 指定特定属性 | `will-change: transform` |

### 层叠顺序（同一上下文内，从低到高）

1. 层叠上下文根元素的 background/border
2. z-index 为负的定位元素
3. 块级盒模型元素
4. float 元素
5. 行内盒模型元素
6. z-index: 0 / auto 的定位元素
7. z-index 为正的定位元素

### 面试速答

> z-index 失效通常三个原因：① 没有设置 position 为非 static；② 父元素创建了新的层叠上下文，子元素的 z-index 只在父级范围内比较；③ 同时设置了 float 和 z-index。解决方法是确保 position 非 static，并理解层叠上下文的作用范围。

---

## 17. 两栏布局的实现

**记忆口诀：「左定右适应，float+margin、BFC、absolute、flex 四方案」**

**一句话回答：** 两栏布局指**左边固定宽度、右边自适应**的经典布局，常用实现有 float + margin-left、float + BFC、absolute 定位、flex 布局四种方案。

### 方案对比

| 方案 | 核心思路 | 优点 | 缺点 |
| --- | --- | --- | --- |
| float + margin-left | 左浮动 + 右 margin-left | 兼容性好 | 需清除浮动 |
| float + BFC | 左浮动 + 右 overflow:hidden | 右边自动适应 | 需理解 BFC |
| absolute 定位 | 左 absolute + 右 margin/left | 灵活 | 父元素需 relative |
| flex 布局 | 左固定宽 + 右 flex:1 | 最简洁（推荐） | 老 IE 不支持 |

### 方案一：float + margin-left

```css
.left {
  width: 200px;
  height: 200px;
  background: tomato;
  float: left;
}
.right {
  height: 200px;
  margin-left: 200px; /* 等于左栏宽度 */
  background: gold;
}
```

### 方案二：float + BFC（overflow: hidden）

```css
.left {
  width: 200px;
  height: 200px;
  background: tomato;
  float: left;
}
.right {
  height: 200px;
  background: gold;
  overflow: hidden; /* 触发 BFC，不与 float 元素重叠 */
}
```

### 方案三：absolute 定位

```css
/* 3a：左 absolute，右 margin-left */
.outer {
  position: relative;
}
.left {
  position: absolute;
  width: 200px;
  height: 100%;
  background: tomato;
}
.right {
  margin-left: 200px;
  background: gold;
}

/* 3b：左 static，右 absolute 填充剩余空间 */
.outer {
  position: relative;
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

### 方案四：flex 布局（推荐）

```css
.outer {
  display: flex;
}
.left {
  width: 200px;
  background: tomato;
}
.right {
  flex: 1; /* 占据剩余空间 */
  background: gold;
}
```

### HTML 结构（通用）

```html
<div class="outer">
  <div class="left">左栏固定 200px</div>
  <div class="right">右栏自适应</div>
</div>
```

### 面试结论

现代开发**首选 Flex 布局**，代码简洁、无需清除浮动、自适应完美。传统方案考查的是对 float、BFC、定位的理解。

---

## 18. 三栏布局的实现

**记忆口诀：「左右固定中间自适应，float 圣杯双飞翼，absolute margin，flex 最简洁」**

**一句话回答：** 三栏布局指**左右两栏固定宽度、中间栏自适应**的经典布局，实现方案包括 float + margin、absolute + margin、flex、圣杯布局、双飞翼布局等。

### 方案对比

| 方案 | 核心思路 | 中间栏 DOM 位置 | 推荐度 |
| --- | --- | --- | --- |
| flex 布局 | 左右固定宽 + 中间 flex:1 | 任意 | ⭐⭐⭐⭐⭐ |
| absolute + margin | 左右 absolute + 中间 margin | 任意 | ⭐⭐⭐⭐ |
| float + margin | 左右 float + 中间 margin | **必须最后** | ⭐⭐⭐ |
| 圣杯布局 | float + 负 margin + relative | 第一个 | ⭐⭐⭐ |
| 双飞翼布局 | float + 负 margin + 内层 div | 第一个 | ⭐⭐⭐ |

### 方案一：flex 布局（推荐）

```css
.outer {
  display: flex;
}
.left {
  width: 200px;
  background: tomato;
}
.center {
  flex: 1;
  background: lightgreen;
}
.right {
  width: 150px;
  background: gold;
}
```

### 方案二：absolute + margin

```css
.outer {
  position: relative;
}
.left {
  position: absolute;
  left: 0;
  width: 200px;
  background: tomato;
}
.right {
  position: absolute;
  right: 0;
  width: 150px;
  background: gold;
}
.center {
  margin-left: 200px;
  margin-right: 150px;
  background: lightgreen;
}
```

### 方案三：float + margin（中间栏放最后）

```css
.outer {
  overflow: hidden; /* 清除浮动 */
}
.left {
  width: 200px;
  float: left;
  background: tomato;
}
.right {
  width: 150px;
  float: right;
  background: gold;
}
.center {
  margin-left: 200px;
  margin-right: 150px;
  background: lightgreen;
}
```

```html
<!-- 中间栏必须放在 DOM 最后 -->
<div class="outer">
  <div class="left">左 200px</div>
  <div class="right">右 150px</div>
  <div class="center">中间自适应</div>
</div>
```

### 方案四：圣杯布局（Holy Grail）

```css
.outer {
  padding: 0 150px 0 200px; /* 为左右栏留空间 */
  overflow: hidden;
}
.center {
  float: left;
  width: 100%;
  background: lightgreen;
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;       /* 拉到第一行 */
  position: relative;
  left: -200px;             /* 移到左边 */
  background: tomato;
}
.right {
  float: left;
  width: 150px;
  margin-left: -150px;      /* 拉到第一行右边 */
  position: relative;
  right: -150px;            /* 移到右边 */
  background: gold;
}
```

### 方案五：双飞翼布局

```css
.outer {
  overflow: hidden;
}
.center-wrap {
  float: left;
  width: 100%;
}
.center {
  margin: 0 150px 0 200px; /* 为左右栏留空间 */
  background: lightgreen;
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;
  background: tomato;
}
.right {
  float: left;
  width: 150px;
  margin-left: -150px;
  background: gold;
}
```

```html
<!-- 双飞翼：中间栏多包一层 div -->
<div class="outer">
  <div class="center-wrap">
    <div class="center">中间自适应</div>
  </div>
  <div class="left">左 200px</div>
  <div class="right">右 150px</div>
</div>
```

### 圣杯 vs 双飞翼

| 对比 | 圣杯布局 | 双飞翼布局 |
| --- | --- | --- |
| 中间栏结构 | 直接一个 div | 多包一层 div |
| 实现方式 | padding + relative 偏移 | 内层 margin 留空间 |
| 复杂度 | 稍复杂 | 稍简单 |
| 核心思路 | 相同：中间 100% 宽 + 负 margin 拉左右栏 |

### 面试结论

- **日常开发用 Flex**，三行 CSS 搞定
- **圣杯/双飞翼**考查对 float、负 margin、相对定位的深入理解
- 关键区别：圣杯用 padding + relative，双飞翼用额外包裹层 + margin

---

## 19. 水平垂直居中的实现

**记忆口诀：「已知宽高负 margin 或 margin auto，未知宽高 transform 或 flex/grid」**

**一句话回答：** 水平垂直居中需区分**元素宽高是否已知**：已知宽高可用 absolute + 负 margin 或 margin: auto；未知宽高可用 absolute + transform、flex 或 grid 布局。

### 方案总览

| 方案 | 宽高要求 | 兼容性 | 推荐度 |
| --- | --- | --- | --- |
| absolute + 负 margin | 已知 | 全浏览器 | ⭐⭐⭐ |
| absolute + margin: auto | 已知 | 全浏览器 | ⭐⭐⭐⭐ |
| absolute + transform | 未知 | 全浏览器 | ⭐⭐⭐⭐ |
| flex 布局 | 不限 | 现代浏览器 | ⭐⭐⭐⭐⭐ |
| grid 布局 | 不限 | 现代浏览器 | ⭐⭐⭐⭐⭐ |
| table-cell | 不限 | 全浏览器 | ⭐⭐ |

### 已知宽高的居中

**方案一：absolute + 负 margin**

```css
.parent {
  position: relative;
  width: 500px;
  height: 300px;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 100px;
  margin-top: -50px;   /* -(height/2) */
  margin-left: -100px; /* -(width/2) */
}
```

**方案二：absolute + margin: auto（更优雅）**

```css
.child {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 200px;
  height: 100px;
  margin: auto; /* 四方向 auto 实现居中 */
}
```

### 未知宽高的居中

**方案三：absolute + transform（经典）**

```css
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**方案四：flex 布局（最推荐）**

```css
.parent {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
}
```

**方案五：grid 布局**

```css
.parent {
  display: grid;
  place-items: center; /* 水平 + 垂直居中 */
}
```

### 行内元素/text 居中

```css
/* 水平居中 */
.text-center {
  text-align: center;
}

/* 行内块元素水平居中 */
.inline-center {
  text-align: center;
}
.inline-center .child {
  display: inline-block;
}

/* 单行文本垂直居中 */
.line-center {
  height: 50px;
  line-height: 50px; /* line-height = height */
}
```

### 完整示例

```html
<div class="parent">
  <div class="child">居中内容</div>
</div>
```

```css
/* 推荐写法：Flex */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: #f0f0f0;
}
.child {
  padding: 20px 40px;
  background: #3498db;
  color: white;
  border-radius: 8px;
}
```

### 面试结论

- **首选 Flex 或 Grid**，代码最简洁、不限宽高
- **absolute + transform** 是经典方案，适合需要脱离文档流的场景
- **负 margin 方案** 必须知道元素宽高，否则偏移量无法计算

---

## 20. 对 Flex 布局的理解及其使用场景

**记忆口诀：「容器管方向对齐换行，项目管伸缩排序，flex:1 等于 grow1 shrink1 basis0」**

**一句话回答：** Flex（弹性盒模型）是一维布局方案，通过**容器属性**控制主轴方向和对齐方式，通过**项目属性**控制伸缩比例和排序，适合导航栏、居中、等分布局等场景。

### 核心概念

```
┌─────────────── 主轴 (main axis) ───────────────→
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│  │     │  │     │  │     │  │     │
│  │ item│  │ item│  │ item│  │ item│
│  │     │  │     │  │     │  │     │
│  └─────┘  └─────┘  └─────┘  └─────┘
│  ↑
│  交叉轴 (cross axis)
└─ flex container
```

### 容器属性（flex container）

| 属性 | 值 | 作用 |
| --- | --- | --- |
| `flex-direction` | row / row-reverse / column / column-reverse | 主轴方向 |
| `justify-content` | flex-start / center / flex-end / space-between / space-around / space-evenly | 主轴对齐 |
| `align-items` | flex-start / center / flex-end / stretch / baseline | 交叉轴对齐（单行） |
| `align-content` | flex-start / center / flex-end / stretch / space-between / space-around | 交叉轴对齐（多行） |
| `flex-wrap` | nowrap / wrap / wrap-reverse | 是否换行 |
| `flex-flow` | direction + wrap 简写 | 复合属性 |

### 项目属性（flex item）

| 属性 | 作用 | 默认值 |
| --- | --- | --- |
| `flex-grow` | 放大比例（剩余空间分配） | 0（不放大） |
| `flex-shrink` | 缩小比例（空间不足时） | 1（可缩小） |
| `flex-basis` | 分配多余空间前的初始大小 | auto |
| `flex` | grow + shrink + basis 简写 | 0 1 auto |
| `order` | 排列顺序（数值越小越靠前） | 0 |
| `align-self` | 单个项目的交叉轴对齐 | auto |

### flex: 1 的含义

```css
.item {
  flex: 1;
  /* 等价于 */
  flex-grow: 1;    /* 占据剩余空间 */
  flex-shrink: 1;  /* 空间不足时可缩小 */
  flex-basis: 0%;  /* 初始大小为 0，完全按 grow 分配 */
}
```

| 写法 | 等价于 | 说明 |
| --- | --- | --- |
| `flex: 1` | `1 1 0%` | 最常用，等分剩余空间 |
| `flex: auto` | `1 1 auto` | 基于内容大小再分配 |
| `flex: none` | `0 0 auto` | 不伸缩，固定大小 |
| `flex: 0` | `0 1 0%` | 不放大，可缩小 |

### 常见布局示例

**导航栏**

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**水平垂直居中**

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**等分布局**

```css
.row {
  display: flex;
}
.col {
  flex: 1; /* 三等分 */
}
```

**固定 + 自适应（两栏/三栏）**

```css
.layout {
  display: flex;
}
.sidebar {
  width: 200px;
  flex-shrink: 0; /* 不缩小 */
}
.main {
  flex: 1;
}
```

**底部对齐**

```css
.card {
  display: flex;
  flex-direction: column;
}
.card-footer {
  margin-top: auto; /* 推到底部 */
}
```

### 适用场景

| 场景 | 使用的 Flex 特性 |
| --- | --- |
| 导航栏 / 工具栏 | flex + justify-content + align-items |
| 水平/垂直居中 | justify-content: center + align-items: center |
| 等分卡片列表 | flex: 1 或 flex-grow: 1 |
| 固定侧边栏 + 自适应内容 | 固定 width + flex: 1 |
| 等高列布局 | align-items: stretch（默认） |
| 响应式换行 | flex-wrap: wrap |
| 排序控制 | order 属性 |

### Flex vs Grid

| 对比 | Flex | Grid |
| --- | --- | --- |
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用 | 组件内部布局、导航 | 页面整体布局 |
| 对齐 | justify + align | 更强大的网格对齐 |
| 关系 | 互补，常组合使用 | 互补，常组合使用 |

### 面试追问点

- **flex: 1 和 flex: auto 的区别？** `flex: 1` 的 basis 是 0%，完全按 grow 比例分配；`flex: auto` 的 basis 是 auto，先按内容大小再分配剩余空间
- **为什么 flex 子项默认 min-width: auto？** 防止内容溢出时被压缩到 0，可能导致布局问题，可设 `min-width: 0` 解决
- **align-content 和 align-items 的区别？** items 管单行内交叉轴对齐，content 管多行之间的交叉轴对齐（需 flex-wrap: wrap）

---
## 21. 为什么需要清除浮动？清除浮动的方式

**记忆口诀：「浮脱流，父塌陷；清浮动，四方案——定高、clear、BFC、伪元素」**

**一句话回答：** 浮动元素脱离文档流后，父容器无法被撑开产生**高度塌陷**，需要**清除浮动**让父元素恢复正常的块级布局高度。

### 为什么需要清除浮动？

浮动（`float`）的本意是让元素左右排列（如文字环绕图片），但副作用是：

| 问题 | 原因 | 表现 |
| --- | --- | --- |
| **高度塌陷** | 浮动元素脱离文档流，不占父元素高度 | 父容器高度为 0 或变矮 |
| **影响同级元素** | 后续非浮动元素会"钻"到浮动元素下方 | 布局错乱、重叠 |
| **影响父级同级** | 父元素高度异常会连带影响外层布局 | 整体页面错位 |

**浮动工作原理：**

- 浮动元素**脱离普通文档流**，向左或向右移动，直到碰到容器边界或其他浮动元素
- 浮动**不影响块级元素**的整体流，但**会影响行内元素**（文字会环绕浮动框）
- 当父元素**没有设置高度**且子元素全部浮动时，父元素高度无法被子元素撑开 → **高度塌陷**

### 清除浮动的方式对比

| 方式 | 写法 | 优点 | 缺点 | 推荐度 |
| --- | --- | --- | --- | --- |
| **给父元素设高度** | `height: 100px` | 简单直接 | 高度写死，内容变化时失效 | ⭐ |
| **末尾加空 div + clear** | `<div style="clear:both">` | 兼容性好 | 增加无意义 DOM | ⭐⭐ |
| **父元素 overflow 触发 BFC** | `overflow: hidden/auto` | 代码简洁 | 可能裁剪溢出内容 | ⭐⭐⭐ |
| **伪元素清除（推荐）** | `.clearfix::after` | 无额外 DOM，语义清晰 | 需写公共类 | ⭐⭐⭐⭐⭐ |

### 推荐方案：伪元素 clearfix

```css
/* 标准 clearfix 写法 */
.clearfix::after {
  content: '';
  display: block;   /* 必须 block，否则 clear 不生效 */
  clear: both;      /* 清除左右两侧浮动 */
  height: 0;
  visibility: hidden;
}

/* 兼容 IE6/7 的写法（可选） */
.clearfix {
  *zoom: 1;        /* 触发 hasLayout */
}
```

**原理：** `::after` 伪元素在浮动元素之后插入一个块级盒子，设置 `clear: both` 强制该盒子出现在所有浮动元素下方，从而把父元素的高度撑开。

### 其他写法示例

```css
/* 方式1：父元素触发 BFC */
.parent {
  overflow: hidden; /* 或 overflow: auto */
}

/* 方式2：父元素定高（内容固定时可用） */
.parent {
  height: 200px;
}
```

**面试速答：** 浮动导致父元素高度塌陷，清除浮动的本质是让父元素**包含浮动子元素**。推荐用 `.clearfix::after { content:''; display:block; clear:both; }`，无额外 DOM、语义清晰。

---

## 22. 对BFC的理解，如何创建BFC

**记忆口诀：「BFC 是结界，内外不干扰；触发五条件——根浮绝，行溢 flex」**

**一句话回答：** BFC（Block Formatting Context，**块级格式化上下文**）是一个独立的 CSS 布局区域，内部元素的布局不会影响外部，外部也不会影响内部。

### 什么是 BFC？

可以把 BFC 理解为一个**"布局结界"**：

- BFC 内部的块级元素按垂直方向依次排列
- 同一个 BFC 内，相邻块级元素的 **margin 会折叠**
- BFC 区域**不会与浮动元素重叠**
- BFC 是一个**独立的渲染区域**，内外互不影响
- 计算 BFC 高度时，**浮动元素也参与计算**

### 如何创建 BFC？

| 触发条件 | 口诀 | 示例 |
| --- | --- | --- |
| 根元素 | 根 | `<html>` 本身 |
| `float` 不为 `none` | 浮 | `float: left / right` |
| `position` 为 `absolute` 或 `fixed` | 绝 | `position: absolute` |
| `display` 为特定值 | 行 | `inline-block`、`flex`、`inline-flex`、`grid`、`inline-grid`、`table-cell`、`table-caption` |
| `overflow` 不为 `visible` | 溢 | `overflow: hidden / auto / scroll`（最常用） |
| `contain` 为特定值 | - | `contain: layout / content / strict` |

> 日常开发中，最常用的是 **`overflow: hidden`** 和 **`display: flow-root`**（专门用于创建 BFC，无副作用）。

```css
/* 推荐：专门创建 BFC 的属性 */
.bfc {
  display: flow-root;
}

/* 常用替代方案 */
.bfc {
  overflow: hidden;
}
```

### BFC 能解决的三大经典问题

**1. 解决 margin 重叠（外边距折叠）**

```css
/* 两个 div 上下 margin 都是 20px，实际间距只有 20px（取最大值） */
.box1 { margin-bottom: 20px; }
.box2 { margin-top: 20px; }

/* 解决：把其中一个包进 BFC */
.wrapper { overflow: hidden; } /* 触发 BFC，内外 margin 不再折叠 */
```

**2. 解决高度塌陷（清除浮动）**

```css
.parent { overflow: hidden; } /* 父元素触发 BFC */
.child  { float: left; }
/* BFC 计算高度时会包含浮动子元素，父元素不再塌陷 */
```

**3. 实现自适应两栏布局**

```css
.left  { width: 200px; float: left; }
.right { overflow: hidden; } /* 触发 BFC，不与左侧浮动重叠，自动占满剩余宽度 */
```

**面试速答：** BFC 是独立布局区域。触发方式记「根浮绝，行溢 flex」。它能解决 margin 重叠、高度塌陷、两栏布局三个经典问题。

---

## 23. 什么是margin重叠问题？如何解决？

**记忆口诀：「垂直 margin 会折叠，取大取差看正负；兄弟改行内/浮动/定位，父子加 BFC 或边框」**

**一句话回答：** 相邻块级元素在**垂直方向**上的外边距会发生**折叠（合并）**，最终间距不等于两者 margin 之和，而是按特定规则取一个值。

### 什么是 margin 重叠？

**margin 折叠**只发生在**垂直方向**（水平方向不会折叠），且只针对**普通文档流中的块级元素**。以下情况**不会**折叠：

- 浮动元素（`float`）
- 绝对定位元素（`position: absolute/fixed`）
- 行内块元素（`inline-block`）
- 设置了 `overflow` 非 visible 的元素（BFC 内部）

### 三种折叠场景

| 场景 | 说明 | 示例 |
| --- | --- | --- |
| **相邻兄弟元素** | 上下两个 div 的 margin 合并 | `margin-bottom: 30px` + `margin-top: 20px` → 实际 30px |
| **父子元素** | 子元素 margin 溢出到父元素外，与父 margin 合并 | 父 `margin-top: 20px`，子 `margin-top: 30px` → 实际 30px |
| **空块级元素** | 元素自身上下 margin 合并 | 空 div 的 `margin-top` 和 `margin-bottom` 合并 |

### 折叠计算规则

| 情况 | 计算方式 |
| --- | --- |
| 两者都是**正数** | 取**最大值** |
| 一正一负 | 正数减去负数的绝对值 |
| 两者都是**负数** | 取绝对值最大的负数 |

```css
/* 示例：30px + 20px = 30px（不是 50px） */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }

/* 示例：30px + (-10px) = 20px */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: -10px; }
```

### 解决方案

**（1）兄弟元素之间重叠**

| 方法 | 原理 |
| --- | --- |
| `display: inline-block` | 行内块不参与 margin 折叠 |
| `float: left/right` | 浮动元素不参与 margin 折叠 |
| `position: absolute/fixed` | 脱离文档流，不参与折叠 |

**（2）父子元素之间重叠**

| 方法 | 原理 |
| --- | --- |
| 父元素 `overflow: hidden` | 触发 BFC，隔离内外 margin |
| 父元素加 `border` 或 `padding` | 阻断 margin 穿透（哪怕 1px 透明边框也行） |
| 父元素 `display: flow-root` | 专门创建 BFC |
| 子元素 `float` 或 `position: absolute` | 子元素脱离普通流 |

```css
/* 父子 margin 折叠 —— 父元素触发 BFC */
.parent {
  overflow: hidden;
}
.child {
  margin-top: 30px; /* 不再与父元素 margin 折叠 */
}

/* 或者给父元素加 padding/border 阻断 */
.parent {
  padding-top: 1px;
  /* 或 border-top: 1px solid transparent; */
}
```

**面试速答：** margin 折叠只发生在垂直方向的块级元素之间，计算规则是取最大值或做加减。解决思路是让元素**脱离折叠条件**（BFC、浮动、定位、inline-block）或**阻断穿透**（border/padding）。

---

## 24. position的属性有哪些，区别是什么

**记忆口诀：「静 relative 相对自身，absolute 找定位祖先，fixed 钉视口，sticky 滚到阈值就吸附」**

**一句话回答：** `position` 控制元素的定位方式，共有 `static`、`relative`、`absolute`、`fixed`、`sticky` 五种常用值（加 `inherit`），核心区别在于**定位参照物**不同。

### 五种定位方式对比

| 属性值 | 参照物 | 是否脱离文档流 | 是否占位 | 典型场景 |
| --- | --- | --- | --- | --- |
| `static` | 无（默认文档流） | 否 | 是 | 默认布局 |
| `relative` | **自身原始位置** | 否（仍占位） | 是 | 微调位置、作为 absolute 参照 |
| `absolute` | **最近的非 static 定位祖先**（无则 viewport） | 是 | 否 | 弹窗、角标、下拉菜单 |
| `fixed` | **浏览器视口（viewport）** | 是 | 否 | 固定导航栏、回到顶部 |
| `sticky` | **滚动容器 + 阈值** | 否（未吸附时） | 是 | 吸顶标题、表格表头固定 |

### 详细说明

**static（默认值）**

- 元素按正常文档流排列
- `top/right/bottom/left/z-index` 无效

**relative（相对定位）**

- 相对于**元素自身原本的位置**偏移
- **不脱离文档流**，原位置仍占据空间
- 偏移不影响其他元素布局
- 常作为 `absolute` 子元素的定位参照

```css
.box {
  position: relative;
  top: 10px;
  left: 20px; /* 从原位置向右 20px、向下 10px */
}
```

**absolute（绝对定位）**

- 脱离文档流，不占空间
- 定位参照：向上查找第一个 `position` 不为 `static` 的祖先元素；找不到则以**初始包含块**（通常是 viewport）为参照
- `fixed` 元素的祖先如果有 `transform/filter/perspective` 等属性，也会成为 absolute/fixed 的包含块

```css
.parent { position: relative; } /* 建立定位上下文 */
.child {
  position: absolute;
  top: 0;
  right: 0; /* 定位在父元素右上角 */
}
```

**fixed（固定定位）**

- 相对于**视口**定位，滚动页面时位置不变
- 脱离文档流
- 注意：祖先元素有 `transform` 时会"降级"为相对该祖先定位（而非视口）

**sticky（粘性定位）**

- 是 `relative` 和 `fixed` 的混合体
- 未滚动到阈值前表现为 `relative`，到达阈值后"粘"在指定位置
- 必须指定 `top/right/bottom/left` 之一
- 受**最近滚动祖先**影响，父元素 `overflow: hidden` 会导致 sticky 失效

```css
.header {
  position: sticky;
  top: 0;           /* 滚到距顶部 0 时吸附 */
  z-index: 100;
}
```

**面试速答：** 记参照物——relative 相对自身，absolute 相对定位祖先，fixed 相对视口，sticky 滚动吸附。absolute/fixed 脱离文档流不占位。

---

## 25. display、float、position的关系

**记忆口诀：「display 是基础，position 压 float，absolute/fixed 一来 float 就作废」**

**一句话回答：** 三者存在**优先级判断链**：`position（absolute/fixed）> float > display`，高优先级属性会覆盖或改变低优先级属性的表现。

### 优先级判断链

CSS 规范中，元素的最终渲染表现按以下顺序决定：

```
1. display: none?  →  元素不渲染，position 和 float 均无效
2. position: absolute/fixed?  →  float 被强制设为 none，display 被调整
3. float: left/right?  →  display 被调整（block 化）
4. 以上都不是  →  display 保持设定值
```

### 详细规则

| 条件 | 对 float 的影响 | 对 display 的影响 |
| --- | --- | --- |
| `display: none` | 无效 | 元素不显示 |
| `position: absolute/fixed` | **float 强制失效**（视为 none） | 被改为 `block` 或 `table` 等（取决于原始值） |
| `float: left/right` | - | 被改为 `block`（行内元素也会 block 化） |
| `position: relative` + float | float 仍生效 | display 被 block 化；relative 偏移基于浮动后的位置 |

### 关键结论

1. **`position: absolute/fixed` 优先级最高**，有它在，`float` 完全无效
2. **`float` 会让元素 block 化**，无论原本是 inline 还是 inline-block
3. **`position: relative` 不会取消 float**，两者可以同时存在
4. **`display: none` 是终极开关**，设为 none 后元素不参与任何布局计算

```css
/* 示例：absolute 使 float 失效 */
.box {
  position: absolute;
  float: left;    /* 无效，被忽略 */
  display: inline; /* 会被计算为 block */
}

/* 示例：float 使 inline 元素 block 化 */
span {
  float: left;
  /* 计算后的 display 等价于 block */
}
```

**面试速答：** 理解成 if-else 链：none → absolute/fixed → float → display。absolute/fixed 出现时 float 自动失效，display 也会被调整；float 出现时 display 会被 block 化。

---

## 26. CSS 怎么实现三角形？

**记忆口诀：「宽高设零 border 来凑，一边有色对面走，其余 transparent 留」**

**一句话回答：** 利用 border 在交汇处**斜切**形成三角形的特性，将元素宽高设为 0，给一条边设置颜色、其余边设为 `transparent`，即可得到指向对面的三角形。

### 原理

给元素设置 border 时，四条边在交汇处并不是矩形，而是**斜切**的——每条边都是一个梯形/三角形。当宽高为 0 时，每条 border 就变成一个完整的三角形。

```css
/* 四色 border 可清晰看到四个三角形 */
.demo {
  width: 0;
  height: 0;
  border: 80px solid;
  border-color: orange blue red green;
}
```

### 方向与写法对照

| 三角形方向 | 有颜色的边 | 透明边 |
| --- | --- | --- |
| **朝下 ▼** | `border-top` | `border-left`、`border-right` |
| **朝上 ▲** | `border-bottom` | `border-left`、`border-right` |
| **朝右 ▶** | `border-left` | `border-top`、`border-bottom` |
| **朝左 ◀** | `border-right` | `border-top`、`border-bottom` |

**核心规则：哪条边有颜色，三角形就指向对面方向。**

### 代码示例

```css
/* 朝下三角 */
.triangle-down {
  width: 0;
  height: 0;
  border-top: 50px solid red;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
}

/* 朝上三角 */
.triangle-up {
  width: 0;
  height: 0;
  border-bottom: 50px solid red;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
}

/* 朝右三角 */
.triangle-right {
  width: 0;
  height: 0;
  border-left: 50px solid red;
  border-top: 50px solid transparent;
  border-bottom: 50px solid transparent;
}

/* 朝左三角 */
.triangle-left {
  width: 0;
  height: 0;
  border-right: 50px solid red;
  border-top: 50px solid transparent;
  border-bottom: 50px solid transparent;
}

/* 直角三角形（只设相邻两条边） */
.triangle-right-angle {
  width: 0;
  height: 0;
  border-top: 100px solid red;
  border-right: 100px solid transparent;
}
```

### 调整技巧

- 改变各边 border **宽度比例**可调整三角形角度（如 `border-left: 30px; border-right: 70px` 得到不等腰三角）
- 用 `border-radius` 可以得到圆角三角
- 现代方案也可用 `clip-path: polygon(...)` 绘制，更灵活

**面试速答：** 宽高 0 + 一边有色其余 transparent。有色边指向对面。例如 `border-top` 有色 → 三角形朝下。

---

## 27. 实现一个扇形

**记忆口诀：「三角原理加圆角，border-radius 一切就成扇」**

**一句话回答：** 在 CSS 三角形的基础上，给元素加上 `border-radius`，让 border 交汇处变成圆弧，即可得到扇形。

### 实现原理

扇形 = 三角形 + 圆角。当 `border-radius` 的值 ≥ border 宽度时，border 的外边缘会被裁剪成圆弧，形成扇形效果。

### 90° 扇形

```css
.sector-90 {
  width: 0;
  height: 0;
  border: 100px solid transparent;
  border-top-color: red;
  border-radius: 100px; /* 圆角半径 = border 宽度 */
}
```

### 不同角度扇形

通过调整**有颜色的 border 边数**和 **border-radius** 可以控制扇形角度：

```css
/* 180° 半圆扇形 */
.sector-180 {
  width: 0;
  height: 0;
  border: 100px solid transparent;
  border-top-color: red;
  border-bottom-color: red;
  border-radius: 100px;
}

/* 使用 clip-path 实现更精确的扇形（现代方案） */
.sector-clip {
  width: 200px;
  height: 200px;
  background: red;
  border-radius: 50%;
  clip-path: polygon(50% 50%, 100% 0, 100% 100%);
}

/* 使用 conic-gradient 实现扇形（最灵活） */
.sector-gradient {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(red 0deg 90deg, transparent 90deg);
}
```

### 方案对比

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| border + border-radius | 兼容性好，代码简单 | 角度不够精确 |
| clip-path | 角度精确，形状灵活 | 旧浏览器兼容性稍差 |
| conic-gradient | 最灵活，可做任意角度 | 需要较新浏览器 |

**面试速答：** 扇形就是三角形加 `border-radius`，圆角半径等于 border 宽度时得到 90° 扇形。更精确可用 `clip-path` 或 `conic-gradient`。

---

## 28. 实现一个宽高自适应的正方形

**记忆口诀：「正方要等高宽，padding 百分比相对父宽，vw 最直观，伪元素也能撑」**

**一句话回答：** 核心难点是 CSS 中**高度无法像宽度一样用百分比相对自身计算**，需要借助 `padding-top` 百分比（相对父宽）、`vw` 单位或伪元素来让高度等于宽度。

### 关键知识点

> **`padding` 和 `margin` 的百分比值，无论方向，都是相对于父元素的宽度计算的**（不是高度！）。这是实现自适应正方形的核心原理。

### 三种实现方式对比

| 方式 | 原理 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **vw 单位** | 宽度用 `%`，高度用 `vw` | 直观易懂 | 依赖视口，嵌套场景不精确 |
| **padding-top 百分比** | 用 padding 撑出与宽度相等的高度 | 纯 CSS，兼容性好 | 内容需要绝对定位 |
| **伪元素 margin-top** | `::after` 的 `margin-top: 100%` 相对父宽 | 结构清晰 | 需要额外定位内容 |

### 代码示例

**方式1：vw 单位（最简单）**

```css
.square-vw {
  width: 30%;
  height: 30vw; /* 1vw = 视口宽度的 1% */
  background: tomato;
}
```

**方式2：padding-top 百分比（推荐，兼容性最好）**

```css
.square-padding {
  width: 30%;
  height: 0;
  padding-top: 30%; /* 等于宽度的 30%，形成正方形 */
  background: orange;
  position: relative;
}
.square-padding .content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**方式3：伪元素 margin-top**

```css
.square-pseudo {
  width: 30%;
  overflow: hidden;
  background: yellow;
  position: relative;
}
.square-pseudo::after {
  content: '';
  display: block;
  margin-top: 100%; /* 100% 相对父元素宽度 */
}
```

**方式4：aspect-ratio（现代方案）**

```css
.square-modern {
  width: 30%;
  aspect-ratio: 1 / 1; /* 宽高比 1:1 */
  background: lightblue;
}
```

**面试速答：** 推荐 padding-top 百分比方案——`width: 30%; height: 0; padding-top: 30%`，因为 padding 百分比相对父宽。现代浏览器可直接用 `aspect-ratio: 1/1`。

---

## 29. 画一条0.5px的线

**记忆口诀：「物理像素太粗，scale 缩一半；移动端还能 viewport 整体缩」**

**一句话回答：** 在 Retina 等高清屏上，CSS 的 1px 对应 2~3 个物理像素，看起来偏粗。画 0.5px 线的核心思路是**先画 1px 再缩小**，或利用 viewport 缩放。

### 为什么需要 0.5px？

| 屏幕类型 | devicePixelRatio | CSS 1px 等于 |
| --- | --- | --- |
| 普通屏 | 1 | 1 物理像素 |
| Retina 屏 | 2 | 2 物理像素 |
| 超清屏 | 3 | 3 物理像素 |

设计稿要求 1 物理像素的细线，在 DPR=2 的屏幕上就需要 CSS 0.5px。

### 实现方案对比

| 方案 | 原理 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **transform: scale(0.5)** | 1px 元素缩小一半 | 兼容性好，精确 | 需要处理定位 |
| **viewport 缩放** | 整个页面缩小到 0.5 倍 | 全局生效 | 仅移动端，副作用大 |
| **直接 0.5px** | `height: 0.5px` | 代码最简单 | 兼容性差，Android 不支持 |

### 推荐方案：transform scale

```css
/* 水平 0.5px 线 */
.line-h {
  height: 1px;
  background: #ccc;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 垂直 0.5px 线 */
.line-v {
  width: 1px;
  height: 100px;
  background: #ccc;
  transform: scaleX(0.5);
  transform-origin: 0 0;
}

/* 通用写法：伪元素 + scale */
.hairline {
  position: relative;
}
.hairline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #ccc;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}
```

### viewport 缩放方案（仅移动端）

```html
<meta name="viewport" content="width=device-width, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5">
```

**副作用：** 整个页面所有元素（文字、图片）都会被缩小，一般不推荐。

**面试速答：** 推荐伪元素画 1px 线 + `transform: scale(0.5)` 缩小，兼容性好且精确。直接写 0.5px 在 Android 上基本无效。

---

## 30. 设置小于12px的字体

**记忆口诀：「Chrome 最小 12px 砍，scale 缩放来突破，text-size-adjust 已淘汰」**

**一句话回答：** Chrome 等浏览器对中文字体有**最小 12px 限制**，直接设置更小的 `font-size` 无效，需要通过 `transform: scale()` 缩放或切图等方式绕过。

### 为什么会有 12px 限制？

浏览器（尤其 Chrome）为了保证中文可读性，强制设置了最小字体渲染尺寸（中文默认 12px）。即使 CSS 写了 `font-size: 10px`，实际渲染仍是 12px。

### 解决方案对比

| 方案 | 写法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **transform: scale()（推荐）** | 先设 12px 再 scale 缩小 | 兼容性好，灵活 | 占位不变，需调整布局 |
| **-webkit-text-size-adjust** | `none` 取消限制 | 简单 | Chrome 27+ 已废弃，无效 |
| **切图** | 文字做成图片 | 精确控制 | 不可复制、不可缩放、SEO 差 |
| **SVG 文字** | 用 SVG 渲染小字 | 矢量清晰 | 实现复杂 |

### 推荐方案：transform scale

```css
.small-text {
  font-size: 12px;
  display: inline-block;          /* scale 对行内元素无效，需转 block/inline-block */
  transform: scale(0.83);         /* 12 × 0.83 ≈ 10px 视觉效果 */
  transform-origin: left center;  /* 从左侧中心缩放，避免偏移 */
}

/* 10px 效果：scale(0.833) */
/* 8px  效果：scale(0.667) */
```

### 注意事项

- `transform: scale()` 只改变**视觉大小**，元素**占据的空间不变**（仍是 12px 的大小）
- 缩放后可能导致文字模糊（非整数像素渲染）
- 需要配合 `transform-origin` 控制缩放基点，避免位置偏移
- 如果容器空间紧张，还需手动调整 `width/height` 或用负 margin 补偿

**面试速答：** Chrome 最小 12px 限制导致小字体无效。推荐 `font-size: 12px` + `transform: scale(0.83)` + `display: inline-block`，`-webkit-text-size-adjust` 已废弃不可用。

---

## 31. 如何解决 1px 问题？

**记忆口诀：「Retina 一 CSS 像素太粗，伪元素放大再 scale 缩，viewport 全局缩，0.5px 看运气」**

**一句话回答：** 1px 问题是 Retina 高清屏上 **CSS 1px 不等于 1 物理像素**导致的边框偏粗问题，最常用方案是**伪元素 2 倍大小 + scale(0.5) 缩小**。

### 问题本质

```
普通屏（DPR=1）：CSS 1px = 1 物理像素 ✅
Retina屏（DPR=2）：CSS 1px = 2 物理像素 ❌ 看起来是 2px 粗
超清屏（DPR=3）：CSS 1px = 3 物理像素 ❌ 看起来是 3px 粗
```

设计稿上的 1px 细线，在高清屏上需要用 CSS 0.5px（DPR=2）或 0.33px（DPR=3）才能实现 1 物理像素的效果。

### 三种方案对比

| 方案 | 原理 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **伪元素 + scale（推荐）** | 200% 大小画 1px 边框，scale(0.5) 缩回 | 兼容性好，可适配各 DPR | 代码量较多 |
| **viewport 缩放** | JS 动态设置 initial-scale = 1/DPR | 一次设置全局生效 | 文字图片都被缩小 |
| **直接 0.5px** | `border: 0.5px solid` | 代码最简单 | Android 基本不支持 |

### 推荐方案：伪元素 + scale

```css
.border-1px {
  position: relative;
}
.border-1px::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #333;
  transform: scale(0.5);
  transform-origin: left top;
  box-sizing: border-box;
  pointer-events: none; /* 不影响点击 */
}
```

**思路：** 伪元素设为目标的 200% 大小，border 画 1px，再 `scale(0.5)` 缩回原尺寸 → border 视觉上变成 0.5px = 1 物理像素。

### 适配不同 DPR 的 JS 方案

```js
function set1px() {
  const dpr = window.devicePixelRatio || 1;
  const scale = 1 / dpr;
  document.documentElement.style.setProperty('--scale', scale);
}
// CSS 中使用：transform: scale(var(--scale));
```

### viewport 缩放方案

```js
const scale = 1 / window.devicePixelRatio;
document.querySelector('meta[name="viewport"]').setAttribute(
  'content',
  `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}`
);
```

**副作用：** 所有内容等比缩小，需要额外处理文字和图片。

### 仅画底部分割线

```css
.hairline-bottom {
  position: relative;
}
.hairline-bottom::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}
```

**面试速答：** 1px 问题 = Retina 屏 CSS 像素与物理像素不一致。最推荐伪元素 200% + scale(0.5)，兼容性好。直接写 0.5px 在 Android 上不可靠。

---

## 32. CSS 中可继承与不可继承属性有哪些？

**记忆口诀：「字文可见能继承，盒定背浮不继承」**

**一句话回答：** CSS 属性分为**可继承**和**不可继承**两类——可继承属性子元素会自动获得父元素的值，不可继承属性子元素使用浏览器默认值，除非显式设置。

### 可继承 vs 不可继承

| 分类 | 含义 | 子元素未设置时 |
| --- | --- | --- |
| **可继承** | 子元素自动继承父元素的值 | 使用父元素的值 |
| **不可继承** | 子元素不继承，使用初始值 | 使用浏览器默认值 |

### 可继承属性

| 类别 | 属性 |
| --- | --- |
| **字体** | `font`、`font-family`、`font-size`、`font-weight`、`font-style`、`font-variant` |
| **文本** | `color`、`text-align`、`text-indent`、`text-transform`、`word-spacing`、`letter-spacing`、`line-height`（数字形式） |
| **可见性** | `visibility` |
| **列表** | `list-style`、`list-style-type`、`list-style-position`、`list-style-image` |
| **光标** | `cursor` |
| **表格** | `border-collapse`、`border-spacing` |

### 不可继承属性

| 类别 | 属性 |
| --- | --- |
| **盒模型** | `width`、`height`、`margin`、`padding`、`border` |
| **定位** | `position`、`top`、`right`、`bottom`、`left`、`z-index` |
| **背景** | `background`、`background-color`、`background-image`、`background-size` |
| **布局** | `display`、`float`、`clear`、`overflow` |
| **其他** | `opacity`（虽不可继承但子元素会受父元素透明度影响） |

### 特殊说明

```css
/* margin/padding 不可继承！
   子元素看起来"有间距"是因为父元素的 padding 或布局效果，不是继承 */

.parent {
  color: red;        /* ✅ 子元素继承 → 文字变红 */
  font-size: 16px;  /* ✅ 子元素继承 → 字号 16px */
  margin: 20px;     /* ❌ 子元素不继承 → 子元素 margin 为 0 */
  width: 100px;     /* ❌ 子元素不继承 → 子元素 width 为 auto */
}
```

### 强制继承

任何属性都可以通过 `inherit` 关键字强制继承：

```css
.child {
  width: inherit;   /* 强制继承父元素的 width */
  border: inherit;  /* 强制继承父元素的 border */
}
```

**面试速答：** 记口诀「字文可见能继承，盒定背浮不继承」。字体、文本、visibility、list-style 可继承；盒模型、定位、背景、display/float 不可继承。任何属性都可用 `inherit` 强制继承。

---

## 33. line-height: 100% 和 line-height: 1 有什么不一样？

**记忆口诀：「数字继承数字各自算，百分比继承算好的值；推荐用数字不写百分号」**

**一句话回答：** 两者计算结果可能相同，但**继承机制完全不同**——数字继承的是**比例因子**（子元素各自计算），百分比继承的是**父元素计算后的绝对值**（子元素固定使用）。

### 核心区别

| 写法 | 自身计算 | 子元素继承什么 | 子元素如何计算 |
| --- | --- | --- | --- |
| `line-height: 1` | 自身 font-size × 1 | 数字 **1** | 子元素 font-size × 1 |
| `line-height: 100%` | 自身 font-size × 100% | 绝对值 **16px**（假设父 16px） | 固定 16px，不管自身 font-size |
| `line-height: 1.5` | 自身 font-size × 1.5 | 数字 **1.5** | 子元素 font-size × 1.5 |

### 示例对比

```css
.parent {
  font-size: 16px;
  line-height: 1;      /* 自身行高 = 16px */
}
.child {
  font-size: 24px;
  /* 继承 line-height: 1 → 行高 = 24 × 1 = 24px ✅ 协调 */
}

.parent {
  font-size: 16px;
  line-height: 100%;   /* 自身行高 = 16px */
}
.child {
  font-size: 24px;
  /* 继承 line-height: 16px（绝对值）→ 行高 = 16px ❌ 文字被截断 */
}
```

### 为什么推荐用数字？

1. **子元素字号不同时仍保持比例协调**——每个元素按自己的 font-size 重新计算
2. **避免行高过小导致文字被裁剪**——百分比继承可能在子元素字号更大时行高不够
3. **CSS 规范推荐**——数字形式是 `line-height` 最灵活、最安全的写法

### 三种写法等价关系（同一元素上）

```css
/* 以下在 font-size: 20px 的元素上，行高都是 30px */
line-height: 30px;    /* 绝对值 */
line-height: 1.5;       /* 数字：20 × 1.5 = 30px */
line-height: 150%;      /* 百分比：20 × 150% = 30px */
/* 但继承给子元素时，行为完全不同！ */
```

**面试速答：** `line-height: 1` 子元素继承数字 1 再各自乘 font-size；`line-height: 100%` 子元素继承父元素算好的 px 值。推荐用无单位数字。

---

## 34. 如果在伪元素中不写 content 会发生什么

**记忆口诀：「伪元素没 content 就不渲染，空字符串也算有 content」**

**一句话回答：** 不写 `content` 属性，伪元素**不会被生成和渲染**，页面上完全看不到。`content` 是伪元素的**必需属性**，但可以设为空字符串 `''`。

### 原理解释

根据 CSS 规范，伪元素（`::before`、`::after`）的生成条件是：

1. 选择器匹配到元素
2. **`content` 属性不是 `none` 且不是 `normal`（对于 ::before/::after）**

缺少 `content` 时，伪元素不存在于渲染树中，所有其他样式（width、height、background 等）都不会生效。

### 示例

```css
/* ❌ 不会渲染 —— 没有 content */
.box::before {
  display: block;
  width: 100px;
  height: 100px;
  background: red;
  /* 页面上什么都看不到 */
}

/* ✅ 正常渲染 —— content 为空字符串 */
.box::after {
  content: '';          /* 必需！空字符串也是有效 content */
  display: block;
  clear: both;
}

/* ✅ 正常渲染 —— content 有文本 */
.box::before {
  content: '★';
  color: gold;
}

/* ✅ 正常渲染 —— content 有 attr 或 url */
.box::before {
  content: attr(data-label);  /* 读取 HTML 属性值 */
}
.box::after {
  content: url(icon.png);     /* 插入图片 */
}
```

### content 常用值

| 值 | 说明 | 示例 |
| --- | --- | --- |
| `''` | 空字符串，最常用 | clearfix、装饰线 |
| `'text'` | 文本内容 | `content: 'NEW'` |
| `attr(name)` | HTML 属性值 | `content: attr(title)` |
| `url()` | 图片 | `content: url(arrow.svg)` |
| `counter()` | 计数器 | `content: counter(section)` |
| `open-quote` / `close-quote` | 引号 | 自动加引号 |

### 注意事项

- `content: normal` 对 `::before/::after` 等价于不生成伪元素
- 即使 `content: ''`，伪元素仍然占据空间（如果设置了 width/height）
- 伪元素是**行内元素** by default，需要 `display: block` 才能设置宽高

**面试速答：** 不写 content，伪元素不渲染。content 是必需属性，常用 `content: ''` 空字符串来生成无内容的伪元素（如 clearfix）。

---

## 35. flex: shrink 和 flex-grow 的默认值是多少？它们的作用是什么？flex: 1 表示什么？

**记忆口诀：「grow 默认 0 不放大，shrink 默认 1 会缩小，flex:1 就是 1 1 0%」**

**一句话回答：** `flex-grow` 默认 **0**（空间有余不放大），`flex-shrink` 默认 **1**（空间不足等比缩小），`flex: 1` 等价于 `flex: 1 1 0%`（放大、缩小、basis 为 0）。

### flex 三个子属性

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `flex-grow` | **0** | 定义**放大比例**，空间有剩余时如何分配 |
| `flex-shrink` | **1** | 定义**缩小比例**，空间不足时如何收缩 |
| `flex-basis` | **auto** | 定义**分配多余空间之前**的初始主轴大小 |

### flex-grow 详解

```css
/* 容器宽 600px，3 个子元素各 100px，剩余 300px */
.item-a { flex-grow: 1; } /* 分得 300 × 1/3 = 100px → 最终 200px */
.item-b { flex-grow: 2; } /* 分得 300 × 2/3 = 200px → 最终 300px */
.item-c { flex-grow: 0; } /* 不放大 → 保持 100px */
```

- 默认 0 = **不放大**，即使容器有剩余空间
- 值越大，分得剩余空间越多

### flex-shrink 详解

```css
/* 容器宽 300px，3 个子元素各 200px，超出 300px */
.item-a { flex-shrink: 1; } /* 等比缩小 */
.item-b { flex-shrink: 0; } /* 不缩小，保持 200px */
.item-c { flex-shrink: 2; } /* 缩小比例是其他的 2 倍 */
```

- 默认 1 = **等比缩小**
- 设为 0 = 不缩小，可能溢出容器

### flex 简写对照表

| 写法 | 等价于 | 含义 |
| --- | --- | --- |
| `flex: 1` | `1 1 0%` | 等分空间，可放大可缩小 |
| `flex: auto` | `1 1 auto` | 可放大可缩小，初始大小由内容决定 |
| `flex: none` | `0 0 auto` | 不放大不缩小，固定大小 |
| `flex: 0` | `0 1 0%` | 不放大，可缩小，basis 为 0 |
| `flex: 2 3` | `2 3 0%` | grow=2, shrink=3, basis=0% |
| `flex: 100px` | `1 1 100px` | grow=1, shrink=1, basis=100px |

### flex: 1 为什么最常用？

```css
.container {
  display: flex;
}
.item {
  flex: 1; /* = flex: 1 1 0% */
}
/* 所有 item 等分容器空间，无论内容多少 */
```

`flex: 1` 的三个值含义：
- `flex-grow: 1` → 有剩余空间时**等比放大**
- `flex-shrink: 1` → 空间不足时**等比缩小**
- `flex-basis: 0%` → 初始大小为 0，**完全按 grow 比例分配**（忽略内容宽度）

> **对比 `flex: auto`（1 1 auto）**：basis 为 auto 时会先按内容宽度分配，再按 grow 比例分剩余空间，结果可能不等分。

**面试速答：** grow 默认 0 不放大，shrink 默认 1 会缩小。`flex: 1` = `1 1 0%`，表示等分空间。想要内容宽度参与分配用 `flex: auto`。

---

## 36. 如何快速选取同一批兄弟元素的偶数序号元素

**记忆口诀：「偶数 nth-child(even)，奇数 nth-child(odd)，公式 2n 灵活选」**

**一句话回答：** 使用 **`:nth-child(even)`** 或 **`:nth-child(2n)`** 选择偶数序号的兄弟元素，`:nth-child(odd)` 或 `:nth-child(2n+1)` 选择奇数序号。

### 核心选择器

```css
/* 选取偶数序号（第 2、4、6... 个） */
li:nth-child(even) {
  background: #f5f5f5;
}

/* 等价写法 */
li:nth-child(2n) {
  background: #f5f5f5;
}

/* 选取奇数序号（第 1、3、5... 个） */
li:nth-child(odd) {
  background: #fff;
}

/* 等价写法 */
li:nth-child(2n + 1) {
  background: #fff;
}
```

### nth-child 语法详解

`:nth-child(an + b)` 表示从第 b 个开始，每隔 a 个选一个。

| 选择器 | 匹配元素 | 说明 |
| --- | --- | --- |
| `:nth-child(even)` / `:nth-child(2n)` | 2, 4, 6, 8... | 偶数 |
| `:nth-child(odd)` / `:nth-child(2n+1)` | 1, 3, 5, 7... | 奇数 |
| `:nth-child(3n)` | 3, 6, 9, 12... | 每 3 个 |
| `:nth-child(3n+1)` | 1, 4, 7, 10... | 从 1 开始每 3 个 |
| `:nth-child(n+3)` | 3, 4, 5, 6... | 从第 3 个起所有 |
| `:nth-child(-n+3)` | 1, 2, 3 | 前 3 个 |
| `:nth-child(1)` | 1 | 第 1 个（同 `:first-child`） |

### 实际应用示例

```css
/* 斑马纹表格 */
tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* 每 3 个一组，选中每组的第 1 个 */
.item:nth-child(3n + 1) {
  clear: left;
}

/* 选中前 5 个 */
.item:nth-child(-n + 5) {
  font-weight: bold;
}

/* 选中从第 3 个开始的所有 */
.item:nth-child(n + 3) {
  opacity: 0.8;
}
```

### nth-child vs nth-of-type

| 选择器 | 计数方式 | 区别 |
| --- | --- | --- |
| `:nth-child(2n)` | 在所有兄弟元素中计数 | 如果第 2 个不是目标标签，则不匹配 |
| `:nth-of-type(2n)` | 在同类型兄弟元素中计数 | 只数同标签的元素 |

```html
<div>1</div>
<p>2</p>    <!-- p:nth-child(2) ✅  p:nth-of-type(1) ✅ -->
<div>3</div>
<p>4</p>    <!-- p:nth-child(4) ✅  p:nth-of-type(2) ✅ -->
```

**面试速答：** 偶数用 `:nth-child(even)` 或 `:nth-child(2n)`，奇数用 `:nth-child(odd)` 或 `:nth-child(2n+1)`。注意 nth-child 在所有兄弟中计数，nth-of-type 只在同类型中计数。

---

## 37. CSS 中是否存在父选择器？其背后的原因是什么？

**记忆口诀：「以前没有父选择器，解析从前到后性能考虑；现在有 :has() 真父选，:focus-within 来变相」**

**一句话回答：** 传统 CSS **没有父选择器**（无法根据子元素选父元素），原因是浏览器**从前到后解析** HTML，后代未加载时无法影响祖先样式。现在可通过 **`:has()`** 伪类实现真正的父选择器。

### 为什么之前没有父选择器？

CSS 选择器的设计遵循**浏览器解析 HTML 的方向——从上到下、从外到内**：

```
HTML 解析方向：  <html> → <body> → <div> → <p>  （从外到内）
CSS 选择方向：   祖先 → 后代  ✅  （子元素已存在，可以匹配）
                后代 → 祖先  ❌  （子元素可能还没加载）
```

如果支持父选择器（子元素影响祖先样式），浏览器必须**等所有子元素加载完毕**才能渲染父元素样式 → 导致**白屏时间延长**，尤其在慢网络下体验很差。

> 同理，**相邻兄弟选择器只支持后面的元素**（`A + B`），不支持前面的（`B + A`），也是这个原因。

### 现在的解决方案

**1. `:has()` 伪类——真正的父选择器（CSS Selectors Level 4）**

```css
/* 选中包含 .active 子元素的 div */
div:has(.active) {
  border: 2px solid red;
}

/* 选中包含 img 的 figure */
figure:has(img) {
  padding: 10px;
}

/* 选中有必填且未填写的 input 的 form */
form:has(input:required:invalid) {
  border-color: red;
}
```

- `:has()` 接受一个选择器列表作为参数
- 选中的是**包含匹配后代的宿主元素本身**（不是后代）
- Chrome 105+、Safari 15.4+、Firefox 121+ 已支持

**2. `:focus-within`——变相实现父选择器**

```css
/* 当 .form 内部任何元素获得焦点时，高亮 .form */
.form:focus-within {
  box-shadow: 0 0 0 2px blue;
}
```

- 从获得焦点的元素向上"冒泡"，所有祖先都能匹配
- 限制：只能响应 focus 状态，场景有限

**3. JavaScript 辅助**

```js
// 传统方案：JS 给父元素加 class
document.querySelectorAll('.child.active').forEach(el => {
  el.parentElement.classList.add('has-active-child');
});
```

### 方案对比

| 方案 | 能力 | 兼容性 | 适用场景 |
| --- | --- | --- | --- |
| `:has()` | 任意条件选父 | 较新浏览器 | 现代项目首选 |
| `:focus-within` | 仅 focus 状态 | 良好 | 表单高亮 |
| JavaScript | 任意条件 | 全兼容 | 旧浏览器降级 |

**面试速答：** 以前没有父选择器是因为浏览器从前到后解析，支持会导致渲染阻塞。现在用 `:has()` 可实现真正的父选择器，`:focus-within` 可变相实现 focus 场景。

---

## 38. 说一下宫格布局？

**记忆口诀：「Grid 网格做宫格，columns rows 定行列，repeat fr 来分配，gap 留缝 area 分区」**

**一句话回答：** 宫格布局使用 **CSS Grid** 实现，通过 `grid-template-columns/rows` 定义行列，`repeat/fr/gap/grid-area` 等属性灵活控制网格结构。

### Grid 基础

```css
.container {
  display: grid;                    /* 块级网格容器 */
  /* display: inline-grid; */      /* 行内网格容器 */
}
```

设为 Grid 布局后，子元素的 `float`、`display: inline-block`、`vertical-align` 等属性**全部失效**。

### 容器属性（写在父元素）

**1. 定义列和行**

```css
.grid {
  /* 3 列，每列 100px */
  grid-template-columns: 100px 100px 100px;
  /* 3 行，每行 100px */
  grid-template-rows: 100px 100px 100px;
}
```

**2. repeat() 函数——简化重复值**

```css
grid-template-columns: repeat(3, 100px);
/* 等价于 100px 100px 100px */

grid-template-columns: repeat(3, 1fr);
/* 3 列等分 */
```

**3. fr 关键字——按比例分配剩余空间**

```css
grid-template-columns: 1fr 2fr 1fr;
/* 三列按 1:2:1 分配 */
```

**4. auto-fit / auto-fill——自适应列数**

```css
/* 自动填充，每列最小 120px，空间够就增加列数 */
grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));

/* auto-fill vs auto-fit：
   auto-fill 会创建空的轨道列
   auto-fit 会折叠空的轨道列，已有项拉伸 */
```

**5. minmax()——限制尺寸范围**

```css
grid-template-columns: 1fr minmax(200px, 1fr) 1fr;
/* 中间列最小 200px，最大 1fr */
```

**6. gap——网格间隙**

```css
gap: 10px;           /* 行和列都是 10px */
gap: 10px 20px;      /* 行 10px，列 20px */
row-gap: 10px;       /* 行间距 */
column-gap: 20px;    /* 列间距 */
```

**7. grid-template-areas——命名区域**

```css
.grid {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "header header header"
    "sidebar main   main"
    "footer footer footer";
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

**8. 对齐方式**

```css
/* 单元格内内容对齐 */
justify-items: center;  /* 水平 */
align-items: center;    /* 垂直 */
place-items: center;    /* 简写 */

/* 整个网格在容器中对齐 */
justify-content: center;
align-content: center;
place-content: center;
```

### 项目属性（写在子元素）

```css
.item {
  /* 指定网格线位置 */
  grid-column-start: 1;
  grid-column-end: 3;    /* 跨 2 列 */
  /* 简写：grid-column: 1 / 3; */

  grid-row-start: 1;
  grid-row-end: 2;
  /* 简写：grid-row: 1 / 2; */

  /* 指定命名区域 */
  grid-area: header;

  /* 单个项目对齐 */
  justify-self: center;
  align-self: center;
}
```

### 经典 9 宫格示例

```css
.grid-9 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  width: 300px;
  height: 300px;
}
.grid-9 > div {
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Grid vs Flex 选型

| 对比 | Grid | Flex |
| --- | --- | --- |
| 维度 | **二维**（行 + 列） | **一维**（行或列） |
| 适用 | 整体页面布局、宫格 | 导航栏、卡片列表 |
| 对齐 | 两轴同时对齐 | 单轴为主 |
| 复杂度 | 功能更强，学习曲线稍高 | 简单场景更轻量 |

**面试速答：** 宫格布局用 CSS Grid。核心 API：`grid-template-columns/rows` 定义行列，`repeat(3, 1fr)` 等分，`gap` 设间距，`grid-template-areas` 命名区域。自适应用 `repeat(auto-fit, minmax(120px, 1fr))`。

---

## 39. 怎么实现样式隔离？

**记忆口诀：「BEM 模块 JS，iframe 影框层——七种方案各擅长」**

**一句话回答：** 样式隔离是防止不同组件/模块的 CSS 互相污染，常用方案有 **BEM 命名、CSS Modules、CSS-in-JS、Vue Scoped、Shadow DOM、iframe、CSS @layer** 七种。

### 为什么需要样式隔离？

- CSS **天生是全局的**，没有局部作用域
- 多人协作、组件复用时容易产生**类名冲突**
- CSS 的**层叠特性**让冲突难以察觉和调试
- 长期积累会产生大量**"僵尸样式"**（不敢删、不知道谁在用）

### 七种方案对比

| 方案 | 原理 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- | --- |
| **BEM 命名** | 命名规范 `Block__Element--Modifier` | 简单、可读、零成本 | 依赖人为遵守，类名冗长 | 组件库（Ant Design） |
| **CSS Modules** | 构建时类名加哈希变唯一 | 自动化，编译时隔离 | 依赖构建工具，debug 类名难读 | React/Vue 项目 |
| **CSS-in-JS** | 运行时生成唯一选择器注入 `<style>` | 样式与组件强绑定 | 运行时开销，不能用预处理器 | React（styled-components） |
| **Vue Scoped** | 编译时给元素加 `data-v-xxx` 属性 | 开箱即用，支持深度穿透 | 仅限 Vue SFC | Vue 项目 |
| **Shadow DOM** | 浏览器原生封闭 DOM 环境 | 严格隔离，原生支持 | 样式难共享，兼容性 | Web Components |
| **iframe** | 完全独立的文档环境 | 最严格隔离 | 太重，通信复杂，SEO 差 | 微前端 |
| **CSS @layer** | 声明样式层级控制优先级 | 原生规范，组织性好 | 较新，兼容性一般 | 管理第三方库覆盖 |

### 各方案详解

**1. BEM 命名规范**

```css
/* Block__Element--Modifier */
.article { }                    /* 块 */
.article__title { }            /* 元素 */
.article__title--highlight { }  /* 修饰符 */
```

- 通过**长而唯一的类名**避免冲突
- 不需要任何工具，纯靠约定
- 缺点：类名越来越长，依赖团队规范

**2. CSS Modules**

```css
/* styles.module.css */
.title { color: red; }
```

```jsx
// 编译后类名变为 _3zyde4l
import styles from './styles.module.css';
<h1 className={styles.title}>Hello</h1>
```

- 构建工具（webpack/vite）在编译时将类名替换为**唯一哈希值**
- 写时 `.title`，用时 `styles.title`，编译后自动隔离

**3. CSS-in-JS（styled-components）**

```jsx
const Button = styled.button`
  color: white;
  background: ${props => props.primary ? 'blue' : 'gray'};
`;
// 运行时生成唯一 class，注入 <style> 标签
```

- 样式和组件**生命周期绑定**，组件卸载样式也移除
- 支持动态样式（props 驱动）
- 缺点：运行时性能开销

**4. Vue Scoped**

```vue
<style scoped>
.example { color: red; }
</style>
<!-- 编译后 -->
<style>
.example[data-v-f3f3eg9] { color: red; }
</style>
<div class="example" data-v-f3f3eg9>hi</div>
```

- 编译时自动给元素和选择器加 `data-v-xxx` 属性
- 深度穿透：`::v-deep(.child)` 或 `:deep(.child)`

**5. Shadow DOM（Web Components）**

```js
const host = document.createElement('div');
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = `
  <style>p { color: red; }</style>
  <p>Shadow 内的样式不影响外部</p>
`;
```

- 浏览器原生 API，**内外样式完全隔离**
- 外部 CSS 无法进入 Shadow DOM（除非 `:host` 或 CSS 变量穿透）

**6. iframe**

- 每个 iframe 是独立的文档，CSS 天然隔离
- 适合微前端场景（如 qiankun 的 iframe 模式）
- 缺点：通信复杂、性能开销大、SEO 不友好

**7. CSS @layer**

```css
@layer framework, components, themes;

@layer framework {
  .btn { color: black; }  /* 优先级最低 */
}
@layer components {
  .btn { color: blue; }   /* 中等 */
}
@layer themes {
  .btn { color: red; }    /* 优先级最高 */
}
```

- 通过**层级声明**组织样式优先级，后声明的层覆盖前面的
- 适合管理第三方库样式和自定义样式的覆盖关系
- 不是严格隔离，而是**优先级管理**

### 选型建议

| 场景 | 推荐方案 |
| --- | --- |
| React 项目 | CSS Modules 或 CSS-in-JS |
| Vue 项目 | Scoped CSS 或 CSS Modules |
| 组件库开发 | BEM + CSS Modules |
| 跨框架组件 | Shadow DOM（Web Components） |
| 微前端 | CSS Modules + Shadow DOM 或 iframe |
| 管理第三方样式 | CSS @layer |

**面试速答：** 七种方案记「BEM 模块 JS，iframe 影框层」。实际项目中最常用 CSS Modules（编译时哈希）和 Scoped CSS（Vue）/ CSS-in-JS（React）。微前端场景考虑 Shadow DOM 或 iframe。
