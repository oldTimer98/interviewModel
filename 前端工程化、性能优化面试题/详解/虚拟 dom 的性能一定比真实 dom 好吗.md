首先，这个问题就是错的，如果非要深究，只能说是在考察对 v-dom 与真实 dom 操作的理解深度，侧重于两者的实现差异。

- 关键词：dom、vdom、diff、patch、fiber、reflow
- 延伸开来的问题：

- 为什么一般的 dom 树对比算法需要 O(N^3)，而 react、vue 的 v-dom diff 算法却能保持在 O(N)？

## 基础

简言之，完全有可能！

- v-dom 最大的作用是以更轻量级的 JavaScript 对象数据结构表达dom结构（有利于节省内存开销），之后以更高性能的 v-dom diff 算法计算新旧状态之间的区别，找出最小更新集并 commit(patch) 到页面
- 基于vdom 确实能确保性能下限，确保不会写出特别差的性能
- 但，某些情况下并不能，具体来说：

- 页面初始化，首次创建大量节点时，直接操作dom会比通过 vdom 创建快
- 如果对DOM变更过程做相对复杂的优化，最终能确保用最小更新集，它会比大多数框架或者库都快
- 需要更新所有dom的时候，直接用 innerHTML 通常会比通过 vdom 快



## 进阶

- 那么为什么说虚拟dom更快呢？因为：

- 业务开发同学的能力，可能很参差不齐，容易写出效率很低的代码，比如：

```javascript
<span>foo</span>
// 变成：
<span class="bar">bar</span>

// 手写：
xxx.innerHTML = '<span class=xxxxx>'

// 框架
xxx.classList.add('bar');
xxx.textContent = 'bar';
```

- vdom 真正的意义：

- 在 js 中轻量(相比于使用重度的原始dom)计算出 diff，之后一次性patch到真实dom中
- 屏蔽具体的底层操作，提升开发效率
- 框架给你的保证是，你在不需要手动优化的情况下，我依然可以给你提供过得去的性能；

- 在复杂页面需要做非常复杂的curd操作，如果用原生 DOM 代码量爆炸，功能实现成本已经很高，大多数时候根本没有机会做优化，而 react、vue 一类框架屏蔽了这种底层、凌乱的代码操作，用更容易理解的声明式实现

### dom 操作成本分析

- 跨引擎：DOM 实际操作并不是在 js 引擎 —— 类似于 JSB，由宿主提供接口，每次调用 dom 接口都需要保存当前 JS 上下文、调用 dom、恢复上下文
- 解析：假如是字符串形态的html片段(例如通过 innerHTML 接口)，则浏览器还是得执行一遍 html 解析成dom树操作
- 布局 & 绘制：某些 dom 变化会触发重新布局，而重排操作是非常昂贵的，所幸当代浏览器已经尽可能延迟重排发生的时间，会尽可能在当前 js 执行结束之后才启动
- 怎么优化？

- 尽量减少 dom操作 —— 这正是 diff 算法的作用：找出最小变更集，且diff 过程是用 js 轻量级(相对原始 dom )对象来做的，效率会非常高，例如：

```javascript
<span>foo</span>
// 变成：
<span class="bar">bar</span>

// 手写：
xxx.innerHTML = '<span class=xxxxx>'

// 框架
xxx.classList.add('bar');
xxx.textContent = 'bar';
```

- 避免使用 字符串 形式的dom变更：diff 过程最终都会转化为一系列最小 dom 接口调用 —— 注意，是接口调用，而不是简单字符串替换
- 一次性执行所有 dom 操作：

- vue：patch 过程是同步的，会在一次时间循环中递归左右所有必要的组件更新
- react：以 fiber 架构而言，Reconciliation 阶段确实是异步、分多次的，但仅仅是计算出需要变更的内容，存进 Effect List，之后 commit 阶段再一次性执行所有更新

- 基于vdom确实可以写出性能不会太差的应用，但这会带来一些新的问题：

- v-dom 树会带来新的 JS 内存消耗，不过这方面问题倒不大；
- diff 过程发生在 js 引擎，运行时性能不可能比得上真实 dom 在 c++ 层执行，计算出 diff 之后还是得调 dom 接口更新真实dom
- 所以是多了一层，理论上性能就应该比直接操作dom更慢。或者说，没有任何框架能保证性能比纯手动优化过的 dom 操作更快

- 总之，Virtual DOM 真正的价值：

- 为函数式的 UI 编程方式打开了大门；
- 可以渲染到 DOM 以外的 [backend](https://www.zhihu.com/search?q=backend&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A53544875})，比如 ReactNative；
- 能保证用最小操作完成更新任务，确保页面性能下限，