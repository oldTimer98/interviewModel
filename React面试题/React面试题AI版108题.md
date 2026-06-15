# React面试题AI版108题

## 1. React 事件机制

**记忆口诀：**「事件绑根不绑点，合成事件池复用，冒泡到根再分发」

**核心要点：**
- React 不在真实 DOM 上绑定事件，而是在根节点（React 17+ 为容器根节点）统一委托监听
- 浏览器事件被包装为 SyntheticEvent（合成事件），支持跨浏览器兼容与对象池复用
- 合成事件基于冒泡机制分发到对应组件的处理函数

### 详细解答

React 并不是将 `click` 等事件直接绑定到 `<div>` 等真实 DOM 上，而是采用**事件委托**：在应用根节点处监听所有事件，当事件冒泡到根节点时，React 将其封装为合成事件对象，再交由真正的事件处理函数执行。

```jsx
<div onClick={this.handleClick}>点我</div>
// JSX 上的 onClick 并未绑定在该 div 的真实 DOM 上
```

**这样设计的好处：**

| 优势 | 说明 |
| --- | --- |
| 减少内存消耗 | 无需为每个 DOM 节点单独注册监听器 |
| 统一管理 | 组件挂载/销毁时统一订阅和移除 |
| 跨浏览器兼容 | SyntheticEvent 抹平浏览器差异 |
| 性能优化 | 事件对象池复用，避免大量创建/销毁 |

**合成事件（SyntheticEvent）的特点：**

- 是对原生浏览器事件的跨浏览器包装，接口与原生事件一致
- 原生事件：每个监听器都会创建新的事件对象，大量监听会造成内存压力
- 合成事件：维护**事件池**，需要时从池中取出复用，回调结束后清空属性以便下次复用

**关于阻止冒泡的注意事项（旧版文档说法）：**

早期 React 文档曾提到合成事件与原生事件混用时，`stopPropagation` 可能无法阻止 React 事件系统继续处理。实际开发中应使用 `event.preventDefault()` 阻止默认行为；需要阻止合成事件冒泡时使用 `event.stopPropagation()`。React 17+ 将事件委托目标改为根容器，与原生事件的交互行为有所改进，但仍应避免原生事件与合成事件混用导致执行顺序异常。

### 面试追问

1. **React 17 之后事件委托挂载点有什么变化？** React 16 及之前，合成事件统一委托在 `document` 上；React 17 起改为委托在**应用挂载的根 DOM 容器**上。这样同一页面多个 React 应用之间的事件互不干扰，也便于渐进式迁移。原理仍是事件委托 + 合成事件，只是监听节点从 document 下移到 root。

2. **合成事件对象会被回收吗？异步访问 event 要注意什么？** 会。合成事件在回调执行完毕后会被放回事件池并清空属性（React 17 起逐步移除事件池，但异步访问仍需谨慎）。若在 `setTimeout`、Promise 等异步逻辑中访问 `event`，应提前调用 `event.persist()`（旧版）或先将需要的值存到局部变量，否则可能读到被清空的属性。

---

## 2. React的事件和普通的HTML事件有什么不同？

**记忆口诀：**「命名驼峰传函数，禁止 return false，合成后于原生跑」

**核心要点：**
- 命名、写法、阻止默认行为的方式与原生 HTML 事件不同
- 合成事件后于原生事件执行，混用时要格外注意冒泡顺序
- 合成事件由 React 统一管理，便于事务机制与跨平台

### 详细解答

**React 事件 vs 原生 HTML 事件对比：**

| 对比项 | 原生 HTML 事件 | React 合成事件 |
| --- | --- | --- |
| 事件名 | 全小写 `onclick` | 小驼峰 `onClick` |
| 处理函数 | 字符串 `onclick="handle()"` | 函数 `onClick={handle}` |
| 阻止默认行为 | `return false` 可阻止 | 必须调用 `event.preventDefault()` |
| 绑定位置 | 各 DOM 节点 | 根节点事件委托 |
| 事件对象 | 原生 Event | SyntheticEvent 包装 |

**合成事件的优势：**

- 兼容所有浏览器，跨平台能力更好
- 事件统一注册在根节点，避免频繁新增/删除监听器
- 方便 React 统一管理和事务机制（如批量更新）

**执行顺序（重要）：**

```
原生事件（捕获/冒泡） → 合成事件（冒泡到根节点后触发）
```

因此应**尽量避免原生事件与合成事件混用**。若原生事件中调用 `stopPropagation()` 阻止冒泡，合成事件可能无法执行（因为合成事件依赖冒泡到根节点）。

```jsx
// ❌ 混用示例：原生阻止冒泡可能导致 React 事件不触发
document.getElementById('btn').addEventListener('click', (e) => {
  e.stopPropagation(); // 可能阻断 React 合成事件
});
```

### 面试追问

1. **为什么 React 不允许用 return false 阻止默认行为？** 因为 JSX 中的事件处理器绑定的是**函数引用**而非 HTML 字符串，`return false` 只是函数返回值，不会被 React 解释为"阻止默认行为"。这是 JSX 与 HTML 内联事件的本质区别，必须显式调用 `preventDefault()`。

2. **在 React 事件中如何同时阻止默认行为和冒泡？** 分别调用 `event.preventDefault()` 和 `event.stopPropagation()`。两者独立：`preventDefault` 阻止浏览器默认动作（如表单提交、链接跳转），`stopPropagation` 阻止事件继续向父节点传播。

---

## 3. React 组件中怎么做事件代理？它的原理是什么？

**记忆口诀：**「最外层统一监听，映射表找处理函数，this 需手动绑定」

**核心要点：**
- React 基于 Virtual DOM 实现 SyntheticEvent 层，所有事件自动绑定在最外层
- 事件委派 + 映射表：根节点一个监听器，内部维护组件与处理函数的映射
- 类组件中方法需手动绑定 this（或使用箭头函数）

### 详细解答

React 在底层对合成事件主要做了两件事：

**1. 事件委派（Event Delegation）**

React 把所有事件绑定到 DOM 树最外层（React 17+ 为 root 容器），只用一个统一的事件监听器。该监听器内部维护一个**映射表**，保存各组件注册的事件类型和处理函数。事件冒泡到根节点后，React 根据事件目标找到对应组件的处理函数并调用。

```
用户点击 <button>
    ↓ 冒泡
根节点监听器捕获
    ↓ 查映射表
找到对应组件的 onClick 处理函数
    ↓
执行 handler（SyntheticEvent 作为参数）
```

**2. 自动绑定 this（需注意）**

文档常说"React 自动绑定 this"，但 **`React.Component` 并不会自动绑定**。类组件中事件处理函数里的 `this` 默认不指向组件实例，需要在 constructor 中 `bind`，或使用类属性箭头函数 / 箭头函数写法。

```jsx
class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this); // 手动绑定
  }
  handleClick() {
    console.log(this); // 指向 App 实例
  }
}
```

函数组件没有 `this` 问题，Hooks 时代推荐函数组件 + 箭头函数。

### 面试追问

1. **事件委托相比每个节点单独绑定有什么性能优势？** 大量 DOM 节点时，单独绑定会产生 N 个监听器，占用内存且挂载/卸载成本高。委托只需 1 个监听器，新增/删除 DOM 节点时无需重新注册事件，React 通过映射表动态关联，显著降低内存和 GC 压力。

2. **React 如何知道触发事件的 DOM 对应哪个组件？** React 在渲染真实 DOM 时会建立 Fiber 节点与 DOM 节点的关联。事件从 target 向上冒泡到根节点时，React 通过 DOM 节点找到对应 Fiber，再查找该 Fiber 上注册的事件处理函数并执行。

---

## 4. React 高阶组件、Render props、hooks 有什么区别，为什么要不断迭代

**记忆口诀：**「HOC 包组件，Render Props 传函数，Hooks 抽逻辑最简洁」

**核心要点：**
- 三者都是 React 代码复用方案，迭代目的是解决嵌套地狱、props 覆盖等问题
- HOC 是函数包组件；Render Props 用函数 prop 共享渲染逻辑；Hooks 用自定义 Hook 抽离逻辑
- Hooks 是目前主流，但 HOC 和 Render Props 在特定场景仍有价值

### 详细解答

| 方案 | 本质 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **HOC** | `(WrappedComponent) => EnhancedComponent` | 逻辑复用，不侵入原组件 | props 命名冲突、嵌套地狱（Wrapper 层叠） |
| **Render Props** | 通过 `render` 等函数 prop 共享数据 | 数据与渲染分离，灵活 | 嵌套地狱、无法在 return 外访问数据 |
| **Hooks** | 自定义 Hook 封装可复用逻辑 | 直观、无 props 冲突、无嵌套 | 只能在顶层调用，有规则限制 |

**HOC 示例：**

```jsx
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    state = { data: selectData(DataSource, this.props) };
    render() {
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
```

**Render Props 示例：**

```jsx
<DataProvider render={data => <h1>Hello {data.name}</h1>} />
```

**Hooks 示例：**

```jsx
function useSubscription() {
  const [data] = useState(DataSource.getComments());
  return data;
}
function CommentList() {
  const subData = useSubscription();
  // ...
}
```

**为什么要不断迭代？**

- HOC 的 props 容易被同名覆盖，多层 HOC 嵌套形成"Wrapper Hell"
- Render Props 的回调嵌套同样导致层级过深
- Hooks（React 16.8+）让逻辑复用像普通函数一样调用，解决了上述问题，且能在组件任意位置（return 之外）使用共享逻辑

**注意：** Hook 只能在组件顶层调用，不可放在 if/for 等分支中。

### 面试追问

1. **HOC 的 props 覆盖问题具体是什么？如何解决？** 多个 HOC 可能向被包装组件注入同名 props（如都叫 `data`），后执行的会覆盖先执行的。解决方式：约定 props 命名规范、使用 HOC 组合工具、或改用自定义 Hook 从根本上避免 props 注入。

2. **什么场景下仍然适合用 HOC 而不是 Hooks？** 需要**劫持渲染**（如权限控制、错误边界包装）、**修改组件树结构**、或封装**类组件专用逻辑**时，HOC 更合适。例如 `withRouter`、`connect()` 这类增强组件本身的场景。

---

## 5. 对React-Fiber的理解，它解决了什么问题？

**记忆口诀：**「递归改可中断，时间切片让出 CPU，协调渲染不卡顿」

**核心要点：**
- React 15 递归渲染 VirtualDOM 不可中断，长时间占用主线程导致卡顿
- Fiber 将渲染工作拆分为可中断的小单元，实现时间切片和优先级调度
- Fiber 是协程/纤程思想，让出 CPU 给高优先级任务（如用户输入）

### 详细解答

**React 15 的问题：**

React 15 渲染时递归比对 VirtualDOM，找出变动节点后**同步一口气更新完**。这个过程霸占浏览器主线程，导致：
- 用户交互（点击、输入）得不到响应
- 掉帧，用户感觉卡顿

**Fiber 的解决方案：**

Fiber 架构把渲染过程变成**可中断、可恢复**的任务调度：

```
旧：render 阶段一口气跑完（不可中断）
新：render 阶段拆成 Fiber 单元 → 执行一段 → 让出 CPU → 浏览器响应用户 → 继续
```

**核心思想：**

- Fiber 是一种**控制流程的让出机制**（协程/纤程），本身没有并行能力
- 渲染可被中断，控制权交还浏览器，高优先级任务（用户输入）先执行
- 浏览器空闲后再恢复渲染

**带来的好处：**

| 好处 | 说明 |
| --- | --- |
| 时间切片 | 大量 DOM 操作分批执行，避免一次性阻塞 |
| 优先级调度 | 不同更新有不同优先级（用户输入 > 数据请求 > 动画） |
| 更好的用户体验 | 给用户"应用很快"的感知 |

### 面试追问

1. **Fiber 节点是什么？和 Virtual DOM 什么关系？** Fiber 节点是 React 16 引入的工作单元，既是一种数据结构（链表连接的树），也是调度单位。每个 Fiber 对应一个组件/DOM，保存 state、props、effect 等，并通过 `child`、`sibling`、`return` 指针构成 Fiber 树。Virtual DOM 是描述 UI 的 JS 对象，Fiber 是 React 内部用于**协调（Reconciliation）和调度**的实现载体。

2. **React 18 的 Concurrent Mode 和 Fiber 什么关系？** Concurrent Mode 建立在 Fiber 架构之上，利用 Fiber 的可中断特性实现并发渲染。React 18 正式提供 `createRoot` 开启并发特性，支持 `startTransition`、`useDeferredValue` 等 API，让低优先级更新不阻塞用户交互。

---

## 6. React.Component 和 React.PureComponent 的区别

**记忆口诀：**「Pure 自动浅比较，引用不变不渲染，展示组件性能佳」

**核心要点：**
- PureComponent 内置 `shouldComponentUpdate`，自动做 props 和 state 的浅比较
- 浅比较只比引用地址，对象/数组内容变了但引用相同不会触发渲染
- 适合纯展示组件，可跳过不必要的 render 和 Virtual DOM Diff

### 详细解答

`React.PureComponent` 与 `React.Component` 的唯一实质区别：`PureComponent` 自动实现了 `shouldComponentUpdate`，对 props 和 state 进行**浅比较（shallow compare）**。

```jsx
// 等价于 PureComponent 的行为
shouldComponentUpdate(nextProps, nextState) {
  return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
}
```

**浅比较规则：**

| 数据类型 | 比较方式 | 陷阱 |
| --- | --- | --- |
| 基本类型 | 值比较 | 无 |
| 对象/数组 | 引用地址比较 | 内容变了但引用相同 → 不重新渲染 |

```jsx
// ❌ 浅比较检测不到的变化
this.setState({ list: this.state.list.push(newItem) }); // 变异原数组，引用不变
// ✅ 正确做法：创建新引用
this.setState({ list: [...this.state.list, newItem] });
```

**使用场景：** 纯展示组件、props/state 结构简单且遵循不可变数据的组件。

**函数组件等价方案：** `React.memo(Component)`，同样做浅比较。

### 面试追问

1. **PureComponent 一定比 Component 快吗？** 不一定。浅比较本身有开销，如果组件每次 props/state 都会变，PureComponent 多了一次比较却省不了 render，反而更慢。适合"大部分时候 props/state 不变"的组件。

2. **如何解决 PureComponent 浅比较检测不到深层数据变化？** 遵循不可变数据原则，更新时创建新对象/数组（展开运算符、`map` 等）；或使用 `forceUpdate`（不推荐）；或自行实现 `shouldComponentUpdate` 做深比较（性能代价高）；函数组件可用 `React.memo` 配合自定义比较函数。

---

## 7. Component, Element, Instance 之间有什么区别和联系？

**记忆口诀：**「Element 是描述，Component 是工厂，Instance 是运行时的 this」

**核心要点：**
- Element：描述 UI 的 plain object，创建成本低、不可变
- Component：接收 props 返回 Element 树的函数或类
- Instance：类组件的 `this`，函数组件没有 instance

### 详细解答

| 概念 | 是什么 | 特点 |
| --- | --- | --- |
| **Element** | 普通 JS 对象，描述 DOM/组件在屏幕上的呈现 | 创建成本低、不可变；`React.createElement()` 或 JSX 的产物 |
| **Component** | 声明 UI 的函数或类 | 接收 props，返回 Element 树 |
| **Instance** | 类组件中 `this` 指向的实例 | 存储本地 state、响应生命周期；函数组件无 instance |

```jsx
// Element：描述"要什么"
const element = <Button color="blue" />;

// Component：定义"怎么做"
function Button(props) {
  return <button className={props.color}>{props.label}</button>;
}

// Instance：类组件才有
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }; // instance 上的 state
  }
}
```

**关系链：**

```
Component（组件定义）
    ↓ render / 函数调用
Element（元素描述）
    ↓ React 协调
Instance + DOM（类组件实例 + 真实 DOM）
```

React 帮我们创建和管理 instance，开发者几乎不需要手动 `new Component()`。

### 面试追问

1. **JSX 编译后是什么？和 Element 什么关系？** JSX 被 Babel 编译为 `React.createElement(type, props, ...children)` 调用，返回值就是 **React Element**（一个 plain object，含 `type`、`props`、`key` 等字段）。

2. **函数组件为什么没有 Instance？** 函数组件本质是一次函数调用，执行完即销毁，没有持久化的 `this` 对象。状态通过 Hooks（存在 Fiber 节点上）维护，不需要 class instance 这个概念。

---

## 8. React.createClass和extends Component的区别有哪些？

**记忆口诀：**「createClass 已废弃，语法逗号 vs 分号，this 自动 vs 手动绑」

**核心要点：**
- `React.createClass` 是 ES5 工厂函数写法，React 16 起已废弃
- 主要差异：语法形式、propTypes/defaultProps 声明方式、state 初始化、this 绑定、Mixins 支持
- 现代开发统一使用 `class extends React.Component` 或函数组件

### 详细解答

| 对比项 | React.createClass（已废弃） | extends React.Component |
| --- | --- | --- |
| 语法 | 工厂函数，方法用逗号分隔 | ES6 class，方法不用逗号 |
| propTypes | `propTypes` 对象 + `getDefaultProps()` | 静态属性 `propTypes` + `defaultProps` |
| 初始 state | `getInitialState()` 返回对象 | `constructor` 中 `this.state = {}` |
| this 绑定 | 自动绑定 | 需手动 `bind` 或箭头函数 |
| Mixins | 支持 mixins 数组 | 不支持，推荐 HOC / Hooks |

```jsx
// createClass（旧）
const OldComp = React.createClass({
  getDefaultProps() { return { name: 'Tom' }; },
  getInitialState() { return { count: 0 }; },
  handleClick() { this.setState({ count: 1 }); }, // this 自动绑定
});

// Component（现代）
class NewComp extends React.Component {
  static defaultProps = { name: 'Tom' };
  state = { count: 0 };
  handleClick = () => { this.setState({ count: 1 }); }; // 箭头函数绑定
}
```

`createClass` 已被官方废弃，新项目不应使用。

### 面试追问

1. **为什么 React 废弃 createClass？** ES6 class 成为标准后，createClass 的工厂函数模式显得冗余；自动绑定 this 隐藏了语义，不利于理解；Mixins 容易导致命名冲突和依赖混乱。官方推动 class + Hooks 的统一范式。

2. **extends Component 时为什么必须调用 super(props)？** 子类 `this` 由父类构造函数建立。不调用 `super()` 就使用 `this` 会报错；传入 `props` 是为了在 constructor 中可以通过 `this.props` 访问 props（不传也能在 super 之后访问，但某些场景需要提前使用）。

---

## 9. React 高阶组件是什么，和普通组件有什么区别，适用什么场景

**记忆口诀：**「HOC 是函数不是组件，参数组件返新组件，逻辑复用场景广」

**核心要点：**
- HOC 是 `(WrappedComponent) => EnhancedComponent` 的纯函数，不是 React API
- 与普通组件不同：HOC 不渲染 UI，只增强/包装传入的组件
- 适用场景：逻辑复用、权限控制、性能追踪、props 注入

### 详细解答

**HOC vs 普通组件：**

| | 普通组件 | 高阶组件 |
| --- | --- | --- |
| 本质 | 返回 JSX 的函数/类 | 接收组件、返回新组件的函数 |
| 是否渲染 UI | 是 | 否（由被包装组件渲染） |
| 目的 | 展示/交互 | 复用/增强逻辑 |

**典型适用场景：**

1. **权限控制** — 条件渲染决定是否展示组件
2. **性能追踪** — 劫持生命周期记录渲染耗时
3. **数据 fetching** — 封装请求逻辑，注入 data props
4. **Redux 连接** — `connect()` 就是 HOC

```jsx
function withAdminAuth(WrappedComponent) {
  return class extends React.Component {
    state = { isAdmin: false };
    async componentDidMount() {
      const role = await getCurrentUserRole();
      this.setState({ isAdmin: role === 'Admin' });
    }
    render() {
      return this.state.isAdmin
        ? <WrappedComponent {...this.props} />
        : <div>无权限</div>;
    }
  };
}
export default withAdminAuth(PageA);
```

**注意事项：**

- 不要在 render 中调用 HOC（每次创建新组件导致卸载/remount）
- 复制 static 方法到增强组件（`hoist-non-react-statics`）
- 传递 refs 需配合 `React.forwardRef`

### 面试追问

1. **HOC 和继承有什么区别？** HOC 是**组合**模式：原组件被包装，不修改其代码。继承是 IS-A 关系，子类耦合父类实现。React 官方推崇"组合优于继承"，HOC 更符合 React 哲学。

2. **如何在 HOC 中传递 ref 到被包装组件？** 默认 ref 挂在 HOC 外层。需用 `React.forwardRef` 包装，将 ref 转发给 `WrappedComponent`：HOC 返回 `forwardRef((props, ref) => <WrappedComponent {...props} ref={ref} />)`。

---

## 10. 对componentWillReceiveProps 的理解

**记忆口诀：**「props 变化时触发，初始化不执行，可安全 setState 同步 state」

**核心要点：**
- `componentWillReceiveProps(nextProps)` 在 props 变化时调用，**初始 render 不执行**
- 可在 render 执行前根据新 props 更新 state，调用 setState 安全且不额外触发 render
- React 16.3+ 已废弃，改用 `static getDerivedStateFromProps`

### 详细解答

当父组件传入的 props 发生变化时，子组件会收到新的 props，此时触发 `componentWillReceiveProps(nextProps)`（仅更新阶段，挂载阶段不触发）。

**典型用途：**

```jsx
componentWillReceiveProps(nextProps) {
  if (nextProps.userId !== this.props.userId) {
    // 根据新 props 更新 state，安全且不会额外 render
    this.setState({ data: fetchData(nextProps.userId) });
  }
}
```

**使用好处：**

- 在子组件 render 前拿到新 props，同步更新自身 state
- 可将数据请求放在此处，参数从 `nextProps` 获取，减轻父组件负担
- 请求只在子组件更新时发出，而非每次父组件 render 都发出

**迁移说明（面试常问）：**

| 旧 API | 新 API | 说明 |
| --- | --- | --- |
| componentWillReceiveProps | getDerivedStateFromProps | 静态方法，返回 state 更新对象 |
| componentWillMount | componentDidMount / constructor | 副作用移到 didMount |

### 面试追问

1. **为什么 componentWillReceiveProps 被废弃？** 它在 render 之前同步执行，Fiber 架构下 render 可能可中断/多次调用，此时做副作用（请求、setState）容易导致不一致和 bug。官方将其标记为 UNSAFE，推荐 `getDerivedStateFromProps`（派生 state）或 `componentDidUpdate`（副作用）。

2. **getDerivedStateFromProps 和 componentWillReceiveProps 有什么区别？** `getDerivedStateFromProps` 是**静态方法**，接收 `(nextProps, prevState)` 返回 state 更新对象或 null，不能访问 `this`，适合做纯派生 state。副作用逻辑应放在 `componentDidUpdate` 中。

---

## 11. 哪些方法会触发 React 重新渲染？重新渲染 render 会做些什么？

**记忆口诀：**「setState 或父渲染，Diff 比对最小更新，相同 state 可不渲染」

**核心要点：**
- 触发渲染：`setState`/`forceUpdate`、父组件 re-render、Context 变化
- render 本身只生成 Virtual DOM，Diff 算法决定真实 DOM 最小更新
- setState 传入相同 state 或 null 可能跳过渲染

### 详细解答

**触发 re-render 的方式：**

| 触发方式 | 说明 |
| --- | --- |
| `setState()` | 最常用；合并 state 后触发更新 |
| `forceUpdate()` | 强制跳过 shouldComponentUpdate |
| 父组件 re-render | 子组件默认跟着 re-render，即使 props 未变 |
| Context 变化 | 消费该 Context 的组件 re-render |

**注意：** `setState(null)` 不会触发 render；`setState({ a: 1 })` 当 a 已经是 1 时，React 可能 bail out 跳过渲染。

**render 阶段做了什么：**

1. 调用 render 函数，生成新的 Virtual DOM 树
2. **Diff 算法**：新旧 VDOM 深度优先遍历，标记差异
3. **Commit 阶段**：根据差异对象，最小粒度更新真实 DOM

React 的设计哲学：不管数据怎么变，都以**最小代价**更新 DOM。但顶层 setState 默认会递归 re-render 子树，Diff 虽高效，大树比对仍有开销，因此需要 PureComponent、`React.memo` 等优化。

### 面试追问

1. **父组件 re-render 时，如何阻止子组件跟着渲染？** 使用 `React.memo`（函数组件）、`PureComponent` 或自定义 `shouldComponentUpdate` 返回 false；保证传给子组件的 props 引用稳定（`useCallback`/`useMemo`）；或用 `children` 作为 prop 时注意引用变化。

2. **render 函数会被多次调用吗？** 会。Strict Mode 下开发环境故意双调 render 以暴露副作用；Concurrent Mode 下 render 可能被中断和重试。因此 render 必须是纯函数，不要有副作用。

---

## 12. React如何判断什么时候重新渲染组件？

**记忆口诀：**「shouldComponentUpdate 默认 true，改它来控制渲染时机」

**核心要点：**
- state 变化（setState）或 props 变化都会触发更新流程
- `shouldComponentUpdate` 默认返回 true，因此默认每次更新都 re-render
- 可通过 shouldComponentUpdate / PureComponent / memo 控制是否跳过

### 详细解答

React 更新流程中的渲染决策：

```
setState / 新 props
    ↓
shouldComponentUpdate(nextProps, nextState)  ← 决策点
    ↓ true（默认）
render → Diff → Commit
    ↓ false
跳过 render
```

**state 变化：** 调用 `setState` 后，React 将新 state 与旧 state 合并，进入更新流程。

**props 变化：** 父组件 re-render 传入新 props（或相同 props 新引用），子组件进入更新流程。

**控制渲染：**

```jsx
shouldComponentUpdate(nextProps, nextState) {
  // 仅 count 变化时才 re-render
  return nextProps.count !== this.props.count;
}

// 或直接用 PureComponent / React.memo 自动浅比较
```

Hooks 函数组件没有 shouldComponentUpdate，用 `React.memo` 包裹组件，配合 `useMemo`/`useCallback` 稳定 props。

### 面试追问

1. **setState 后一定会 re-render 吗？** 不一定。若 `shouldComponentUpdate` 返回 false、PureComponent 浅比较无变化、或 React 检测到 state 实际未变（bailout），都会跳过 render。函数组件中 `useState` 若新值与旧值 `Object.is` 相等也跳过。

2. **Context 变化如何触发 re-render？** 当 Provider 的 value 变化时，所有消费该 Context 的组件（`useContext` 或 `Context.Consumer`）都会 re-render，不受 shouldComponentUpdate 阻挡（React 18 前）。React 18 中可通过 `useMemo` 稳定 value 减少不必要渲染。

---

## 13. React声明组件有哪几种方法，有什么不同？

**记忆口诀：**「函数无状态，createClass 已淘汰，class 组件是主流旧写法」

**核心要点：**
- 三种方式：函数组件、React.createClass（废弃）、class extends Component
- 函数组件无 this、无生命周期（Hooks 前），性能更好
- class 组件需手动绑定 this，支持生命周期和 state

### 详细解答

| 方式 | 特点 | 现状 |
| --- | --- | --- |
| **函数组件** | 无 state（Hooks 前）、无 this、无实例化 | 主流，配合 Hooks |
| **React.createClass** | 自动绑定 this、getInitialState | 已废弃 |
| **class Component** | constructor 初始化 state、生命周期 | 仍可用，逐步被函数组件替代 |

**主要区别：**

1. **this 绑定：** createClass 自动绑定；class 需手动 bind 或箭头函数
2. **propTypes/defaultProps：** createClass 用 `getDefaultProps()`；class 用静态属性
3. **初始 state：** createClass 用 `getInitialState()`；class 在 constructor 中声明
4. **性能：** 函数组件无需实例化，无生命周期开销，性能更优

```jsx
// 函数组件（推荐）
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}

// 类组件
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### 面试追问

1. **为什么现在推荐函数组件而不是类组件？** 函数组件更简洁、无 this 困扰、配合 Hooks 可完全替代 class 的生命周期和 state；React 团队未来新特性（Concurrent、Server Components）优先支持函数组件；打包体积更小。

2. **函数组件能使用 state 和生命周期吗？** 能。React 16.8+ 通过 Hooks：`useState` 管理 state，`useEffect` 替代生命周期，`useLayoutEffect`、`useMemo` 等覆盖更多场景。

---

## 14. 对有状态组件和无状态组件的理解及使用场景

**记忆口诀：**「有 state 用 class/Hooks，纯展示用函数，职责单一性能高」

**核心要点：**
- 有状态组件：管理自身 state，有生命周期，可响应交互
- 无状态组件：只依赖 props 渲染，纯展示，性能更好
- 现代 React 中函数组件 + Hooks 可兼顾两者

### 详细解答

**有状态组件：**

| 特点 | 说明 |
| --- | --- |
| 形式 | 类组件，或函数组件 + useState/useReducer |
| 能力 | 管理 state、生命周期、this（类组件） |
| 场景 | 表单、交互、数据 fetching、复杂 UI 逻辑 |
| 缺点 | 易频繁触发生命周期，需注意性能 |

**无状态组件：**

| 特点 | 说明 |
| --- | --- |
| 形式 | 函数组件（Hooks 前） |
| 能力 | 只根据 props 渲染，无副作用 |
| 场景 | Button、Input、Card 等纯展示 |
| 优点 | 无需实例化、代码简洁、易测试、性能好 |
| 缺点 | Hooks 前无法用 ref、生命周期、shouldComponentUpdate |

```jsx
// 无状态：纯展示
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

// 有状态：管理交互
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**总结：** 需要内部状态时选用有状态组件；纯展示优先无状态函数组件。Hooks 时代两者边界模糊，一个函数组件可同时拥有 state 和纯展示逻辑。

### 面试追问

1. **无状态组件真的完全不能持有状态吗？** Hooks 前确实不能。React 16.8 后函数组件通过 `useState`/`useReducer` 可持有状态，"无状态"更多指**不维护 UI 相关本地状态、逻辑简单**的组件，而非语法限制。

2. **类组件的无状态用法是什么？** 类组件不定义 state、只在 render 中根据 props 渲染，即为"类形式的无状态组件"，如 `<Button />` 只接收 props 展示。但通常仍推荐函数组件替代。

---

## 15. 对React中Fragment的理解，它的使用场景是什么？

**记忆口诀：**「多根节点用 Fragment，不增 DOM 包裹层」

**核心要点：**
- React 组件 render 只能返回一个根元素，Fragment 解决多根节点问题
- Fragment 不会在 DOM 中产生额外节点
- 简写语法 `<>...</>` 不能接受 key，需 key 时用 `<React.Fragment key>`

### 详细解答

React 要求组件 return 只能有一个根元素。以前需要额外包一层 `<div>`，会引入无意义的 DOM 节点，影响布局（Flex/Grid）和语义。

**Fragment 用法：**

```jsx
// 完整写法
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
    </React.Fragment>
  );
}

// 简写（不能接受 key 和属性）
render() {
  return (
    <>
      <ChildA />
      <ChildB />
    </>
  );
}

// 列表场景需要 key
items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.desc}</dd>
  </React.Fragment>
))
```

**使用场景：**

- 表格中需要返回 `<tr>` 多个并列元素
- 避免多余 div 破坏 CSS 布局（Flex 子项）
- 列表渲染需要分组但不想增加 wrapper

### 面试追问

1. **Fragment 和 div 包裹有什么区别？** Fragment 不产生真实 DOM 节点，div 会。Fragment 不影响 CSS 选择器、Flex/Grid 子项关系；div 会多一层嵌套，可能导致样式或布局异常。

2. **什么时候不能用 `<>` 简写？** 需要传递 `key`（列表渲染）、`className` 或其他 props 时，必须用 `<React.Fragment key={...}>`，简写语法不支持任何属性。

---

## 16. React如何获取组件对应的DOM元素？

**记忆口诀：**「ref 三种写法，createRef 最标准，函数组件需 forwardRef」

**核心要点：**
- 通过 ref 获取 DOM 节点或类组件实例
- 三种方式：字符串 ref（已废弃）、回调 ref、createRef
- 函数组件默认无实例，需 forwardRef 才能接收 ref

### 详细解答

**三种 ref 写法：**

| 方式 | 示例 | 现状 |
| --- | --- | --- |
| 字符串 ref | `ref="myRef"` + `this.refs.myRef` | 已废弃 |
| 回调 ref | `ref={el => this.el = el}` | 仍可用，适合动态 ref |
| createRef | `this.ref = React.createRef()` | React 16+ 推荐 |

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  componentDidMount() {
    this.myRef.current.focus(); // 访问 DOM
  }
  render() {
    return <input ref={this.myRef} />;
  }
}
```

**ref 返回值：**

- 绑定 HTML 元素 → `ref.current` 是 DOM 节点
- 绑定类组件 → `ref.current` 是组件实例
- 绑定函数组件 → 默认无效，需 `React.forwardRef`

### 面试追问

1. **回调 ref 和 createRef 怎么选？** createRef 适合固定 ref，代码简洁。回调 ref 在 ref 变化时会被调用（传入 null 再传入节点），适合测量 DOM、动态绑定、或在 ref 挂载/卸载时执行逻辑。

2. **useRef 和 createRef 有什么区别？** `createRef` 每次 render 创建新对象，类组件中通常在 constructor 创建一次。`useRef` 在函数组件整个生命周期内保持同一 ref 对象，`current` 可变，还可用于保存任意可变值（不触发 re-render）。

---

## 17. React中可以在render访问refs吗？为什么？

**记忆口诀：**「render 阶段 DOM 未生成，ref 要在 commit 后访问」

**核心要点：**
- render 阶段不能访问 ref.current，此时 DOM 尚未挂载
- ref 在 commit 阶段（DOM 挂载后）才被赋值
- 应在 componentDidMount / useEffect 中访问 ref

### 详细解答

```jsx
render() {
  return (
    <>
      <span ref={this.spanRef}>{this.state.title}</span>
      <span>{this.spanRef.current ? '有值' : '无值'}</span>
      {/* render 中 ref.current 为 null */}
    </>
  );
}
```

**原因：** React 渲染分阶段：

```
Render 阶段 → 生成 Virtual DOM，此时无真实 DOM
    ↓
Commit 阶段 → 挂载/更新真实 DOM，此时 ref 被赋值
```

render 执行时处于 Render 阶段，DOM 还未创建，`ref.current` 为 `null`。

**正确访问时机：**

```jsx
// 类组件
componentDidMount() {
  console.log(this.spanRef.current); // 有值
}

// 函数组件
useEffect(() => {
  console.log(spanRef.current); // 有值
}, []);
```

### 面试追问

1. **为什么 ref 在 render 中是 null 而不是上一次 render 的值？** React 18 Strict Mode 或 re-render 时，render 阶段 ref 尚未更新。且 render 应是纯函数，依赖 ref 会导致 render 结果不确定。React 刻意在 render 阶段不保证 ref 可用，避免副作用渗入 render。

2. **useLayoutEffect 和 useEffect 访问 ref 有什么区别？** 两者都在 commit 后执行，DOM 已挂载，ref 可用。`useLayoutEffect` 在浏览器绘制前同步执行，适合测量 DOM 尺寸并同步更新布局；`useEffect` 异步执行，不阻塞绘制。

---

## 18. 对React的插槽(Portals)的理解，如何使用，有哪些使用场景

**记忆口诀：**「Portal 渲染到父组件外的 DOM 节点，模态框弹层必备」

**核心要点：**
- Portal 将子节点渲染到 DOM 树中存在于父组件之外的节点
- API：`ReactDOM.createPortal(child, container)`
- 典型场景：Modal、Tooltip、Dropdown 等需脱离父级 overflow/z-index 限制

### 详细解答

**基本用法：**

```jsx
import ReactDOM from 'react-dom';

function Modal({ children }) {
  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root')
  );
}
```

- 第一个参数：可渲染的 React 子树
- 第二个参数：目标 DOM 容器

**事件冒泡：** Portal 渲染在外部 DOM，但 React 树中仍是父组件的子节点，**合成事件仍按 React 组件树冒泡**（不是 DOM 树）。

**使用场景：**

| 场景 | 原因 |
| --- | --- |
| Modal / Dialog | 父级 `overflow: hidden` 会裁剪 |
| Tooltip / Popover | 需要更高 z-index 层级 |
| 全屏 Loading | 需覆盖整个 viewport |
| 通知 Toast | 挂载到 body 下固定容器 |

```jsx
// 普通渲染：受父级样式限制
<div style={{ overflow: 'hidden' }}>
  <Modal /> {/* 可能被裁剪 */}
</div>

// Portal：渲染到 body 下，不受父级限制
ReactDOM.createPortal(<Modal />, document.body);
```

### 面试追问

1. **Portal 渲染到 body，事件冒泡走哪棵树？** 走 **React 组件树**，不是 DOM 树。点击 Portal 内按钮，事件会冒泡到 React 树中的父组件，便于在父组件统一处理 Modal 关闭等逻辑。

2. **Portal 和 iframe 渲染弹层有什么区别？** Portal 仍在同一文档、同一 React 应用内，共享 Context、Redux store 和事件系统。iframe 是独立文档，样式隔离更强但通信复杂。Portal 是 React 官方推荐的 DOM 层级解耦方案。

---

## 19. 在React中如何避免不必要的render？

**记忆口诀：**「Pure memo 阻渲染，稳定 props 用 callback，key 合理防重建」

**核心要点：**
- 类组件：shouldComponentUpdate / PureComponent
- 函数组件：React.memo + useMemo/useCallback 稳定 props
- 避免在 render 中创建新对象/函数作为 props

### 详细解答

**优化手段：**

| 手段 | 适用 | 原理 |
| --- | --- | --- |
| `shouldComponentUpdate` | 类组件 | 手动控制是否 re-render |
| `PureComponent` | 类组件 | 自动浅比较 props/state |
| `React.memo` | 函数组件 | 类似 PureComponent |
| `useMemo` / `useCallback` | 函数组件 | 稳定引用，避免子组件无效更新 |
| 状态下放 / 拆分 | 通用 | 缩小 re-render 范围 |

```jsx
// React.memo 缓存函数组件
const Child = React.memo(function Child({ name }) {
  return <div>{name}</div>;
});

// 稳定 props 引用
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => setCount(c => c + 1), []);
  return <Child onClick={handleClick} />;
}
```

**常见陷阱：**

```jsx
// ❌ 每次 render 创建新对象，Child 必定 re-render
<Child style={{ color: 'red' }} />

// ✅ 提取到外部或使用 useMemo
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />
```

### 面试追问

1. **React.memo 的第二个参数比较函数怎么用？** `React.memo(Component, (prevProps, nextProps) => true/false)`，返回 `true` 表示 props 相等、**跳过** re-render（与 shouldComponentUpdate 逻辑相反）。适合 props 中有复杂对象需自定义比较的场景。

2. **状态下放（lifting state down）如何减少渲染？** 把 state 尽量放在需要它的最小组件范围内，而非顶层。例如输入框 state 放在 Input 内部，而非整个 Page，避免 Page 每次按键都 re-render 所有子组件。

---

## 20. 对 React-Intl 的理解，它的工作原理？

**记忆口诀：**「FormatJS 国际化方案，语言包切换驱动组件重渲染」

**核心要点：**
- react-intl 是 Yahoo FormatJS 的一部分，提供 React 国际化组件和 API
- 通过配置不同语言包，按 locale 切换渲染对应语言文本
- 推荐用组件方式（FormattedMessage 等），API 方式用于非组件场景

### 详细解答

React-intl 将国际化与 React 绑定，提供：

- **组件方式（推荐）：** `<FormattedMessage>`、`<FormattedDate>`、`<FormattedNumber>` 等
- **API 方式：** `intl.formatMessage()`，用于无法使用组件的地方

**工作原理：**

```
1. 顶层 IntlProvider 注入 locale 和 messages（语言包）
2. 子组件通过 injectIntl / useIntl 消费
3. 切换 locale → Provider 更新 → 子组件 re-render 显示新语言
```

```jsx
import { IntlProvider, FormattedMessage } from 'react-intl';

const messages = {
  en: { greeting: 'Hello' },
  zh: { greeting: '你好' },
};

<IntlProvider locale="zh" messages={messages.zh}>
  <FormattedMessage id="greeting" />
</IntlProvider>
```

本质是**根据 locale 在语言包间切换**，React 响应式更新 UI。

### 面试追问

1. **react-intl 和 i18next 有什么区别？** react-intl 基于 ICU Message Format，与 FormatJS 生态集成，适合 React 项目。i18next 是框架无关的通用 i18n 库，支持 React/Vue/Angular，插件生态丰富。选型看团队习惯和项目需求。

2. **如何实现按需加载语言包？** 使用动态 import 按 locale 异步加载 JSON 语言文件，加载完成后更新 IntlProvider 的 messages。配合 React.lazy 或路由级代码分割，避免首屏加载所有语言包。

---

## 21. 对 React context 的理解

**记忆口诀：**「跨层传值免 props 层层透传，Provider 提供 Consumer 消费」

**核心要点：**
- Context 提供跨层级组件共享数据的能力，无需逐层传递 props
- 类似"组件树作用域链"，父 Provider 的值可被深层子组件访问
- 适用于主题、语言、用户信息等全局/半全局数据

### 详细解答

**问题背景：** 单向数据流 + props 逐层传递，在深层嵌套时非常繁琐（prop drilling）。

**Context 解决方案：**

```jsx
const ThemeContext = React.createContext('light');

// 提供
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 消费
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

**类比理解：** 类似 JS 作用域链——Context 是组件树内共享的"作用域"，父链上所有 Provider 的 value 组合成子组件可访问的 Context。子组件通过 `useContext` 或 `Context.Consumer` 读取。

**典型场景：** 主题切换、国际化 locale、当前用户信息、Redux store 注入（旧版 connect 底层用 context）。

### 面试追问

1. **Context 和 Redux 有什么区别？** Context 是 React 内置的跨层传递机制，适合低频更新的全局数据（主题、语言）。Redux 是完整状态管理库，提供中间件、时间旅行、严格单向数据流，适合复杂、高频更新的应用状态。简单场景 Context + useReducer 即可替代 Redux。

2. **多个 Context 如何组合使用？** 创建多个 Context（ThemeContext、UserContext 等），在组件树顶层分别包裹 Provider，嵌套或使用多个 Provider 组合。消费时用多个 `useContext` 分别读取，保持职责单一。

---

## 22. 为什么React并不推荐优先考虑使用Context？

**记忆口诀：**「Context 更新难控，组件复用性降，优先 props 和 state」

**核心要点：**
- Context 更新可能导致大量子组件 re-render，性能难控
- 过度使用降低组件可复用性和可测试性
- 推荐优先级：props/state → 第三方状态库 → 最后考虑 Context

### 详细解答

**不推荐优先使用的原因：**

| 问题 | 说明 |
| --- | --- |
| 更新不可控 | Context 变化时所有消费者 re-render，中间组件 `shouldComponentUpdate` 返回 false 也无法阻止 |
| 组件耦合 | 隐式依赖 Context 的组件难以复用和单独测试 |
| API 曾不稳定 | 早期 Context 变化大，升级成本高 |
| 非响应式保证 | 更新依赖 setState 触发，可靠性需关注 |

**推荐使用顺序：**

1. **props / 本地 state** — 组件间直接通信
2. **状态管理库** — Redux、Zustand 等成熟方案
3. **Context** — 以上都不合适时，且影响范围可控（如主题、locale）

**例外：** 组件库内部高内聚使用 Context（如 ThemeProvider）是可接受的，影响范围小于整个 app。

### 面试追问

1. **如何优化 Context 导致的性能问题？** 拆分 Context（按更新频率分离 state 和 dispatch）；用 `useMemo` 稳定 Provider 的 value 引用；将大 Context 拆成多个小 Context；消费组件用 `React.memo`；或使用状态管理库的选择器机制精确订阅。

2. **Context 和 prop drilling 如何权衡？** 2~3 层 props 传递可接受，不必过早引入 Context。超过 3 层或多人协作组件库时考虑 Context。prop drilling 显式、可追踪；Context 隐式、简洁但难调试。

---

## 23. React中什么是受控组件和非控组件？

**记忆口诀：**「受控 value 绑 state，非受控 ref 读 DOM，表单首选受控」

**核心要点：**
- 受控组件：表单值由 React state 控制，通过 onChange 更新 state
- 非受控组件：表单值存在 DOM 中，通过 ref 读取
- React 官方推荐受控组件，数据流清晰可预测

### 详细解答

| 对比 | 受控组件 | 非受控组件 |
| --- | --- | --- |
| 值来源 | React state | DOM 自身 |
| 更新方式 | setState + onChange | ref 读取 |
| 数据流 | 单向、可预测 | 需手动从 DOM 取 |
| 多字段表单 | 需多个 handler 或统一 handler | ref 一次性读取 |
| 官方推荐 | ✅ 推荐 | 快速原型或与非 React 代码集成 |

**受控组件：**

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input value={value} onChange={e => setValue(e.target.value)} />
  );
}
```

**非受控组件：**

```jsx
function UncontrolledInput() {
  const inputRef = useRef();
  const handleSubmit = () => {
    alert(inputRef.current.value);
  };
  return <input ref={inputRef} defaultValue="hello" />;
}
```

**选择建议：** 常规表单用受控；文件上传（`<input type="file">`）通常非受控；与 jQuery 等旧代码集成时非受控更方便。

### 面试追问

1. **受控组件的 value 为 undefined 会怎样？** React 会发出警告，input 变为非受控。应保证 value 始终是字符串（如 `value={state ?? ''}`），或在首次渲染前不渲染 input。

2. **如何实现一个混合模式（defaultValue + 后续受控）？** 首次用 `defaultValue` 非受控初始化，之后切换为受控需保证 key 变化强制 remount，或统一使用受控模式从空字符串开始。React 不允许同一 input 在受控/非受控间切换。

---

## 24. React中refs的作用是什么？有哪些应用场景？

**记忆口诀：**「ref 访问 DOM 和类实例，避坑过度使用，函数组件需 forwardRef」

**核心要点：**
- ref 提供访问 render 中创建的 DOM 节点或类组件实例的方式
- 适用：焦点控制、动画、第三方 DOM 库集成
- 不应过度使用，数据流优先 props/state

### 详细解答

**适用场景：**

- 管理焦点、文本选择、媒体播放控制
- 触发 CSS 动画（集成 react-transition-group 等）
- 集成第三方 DOM 库（D3、jQuery 插件）
- 命令式操作子组件（配合 forwardRef + useImperativeHandle）

```jsx
// 类组件 ref
class Parent extends React.Component {
  inputRef = React.createRef();
  componentDidMount() {
    this.inputRef.current.focus();
  }
  render() {
    return <input ref={this.inputRef} />;
  }
}

// 函数组件需 forwardRef
const FancyInput = React.forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));
```

**ref 返回值规则：**

| 绑定目标 | ref.current |
| --- | --- |
| HTML 元素 | DOM 节点 |
| 类组件 | 组件实例 |
| 函数组件 | 无（除非 forwardRef） |

**注意：** 避免用 ref 做本可用 props/state 实现的事（如数据传递），破坏 React 声明式数据流。

### 面试追问

1. **useImperativeHandle 有什么用？** 配合 forwardRef，向父组件暴露自定义的 imperative 方法，而非整个 DOM。例如暴露 `{ focus, clear }` 方法，隐藏内部实现，适合封装复杂输入组件。

2. **为什么函数组件不能直接接收 ref？** 函数组件没有实例，ref 需要挂载目标。forwardRef 将 ref 作为第二参数传入，由组件内部决定挂载到哪个 DOM 或 ref 对象上，实现与类组件类似的 ref 转发。

---

## 25. React组件的构造函数有什么作用？它是必须的吗？

**记忆口诀：**「构造初始化 state 和绑事件，无 state 无 bind 可省略 super」

**核心要点：**
- 构造函数用于初始化 state 和绑定事件处理函数的 this
- 不是必须的：无 state 初始化、无 bind 需求时可省略
- 使用 constructor 必须调用 `super(props)`

### 详细解答

**构造函数的两个主要用途：**

1. **初始化 state：** `this.state = { ... }`
2. **绑定事件：** `this.handleClick = this.handleClick.bind(this)`

```jsx
class LikeButton extends React.Component {
  constructor(props) {
    super(props); // 必须调用
    this.state = { liked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ liked: !this.state.liked });
  }
  render() { /* ... */ }
}
```

**是否必须？**

| 场景 | 是否需要 constructor |
| --- | --- |
| 需要初始化 state | 需要（或用 class 字段 `state = {}`） |
| 需要 bind 事件 | 需要（或用箭头函数 class 字段） |
| 纯展示、无 state | 不需要 |
| 函数组件 + Hooks | 无 constructor 概念 |

**现代写法可省略 constructor：**

```jsx
class LikeButton extends React.Component {
  state = { liked: false }; // class 字段
  handleClick = () => {     // 箭头函数自动绑定
    this.setState({ liked: !this.state.liked });
  };
}
```

**注意：** `bind` 每次返回新函数，为性能考虑尽量在 constructor 中绑定一次，而非 render 中绑定。

### 面试追问

1. **为什么 constructor 中必须调用 super(props)？** ES6 继承要求：子类 this 由父类 `super()` 创建。不调用 super 就访问 this 报错。传 props 是为了在 constructor 中访问 `this.props`（部分场景需要）。

2. **class 字段语法（state = {}）和 constructor 中初始化有什么区别？** 效果类似，class 字段更简洁。Babel 会将 class 字段编译到 constructor 中。注意 class 字段初始化时不能访问 props（除非用 constructor）。

---

## 26. React.forwardRef是什么？它有什么作用？

**记忆口诀：**「forwardRef 转发 ref，穿透 HOC 和函数组件」

**核心要点：**
- forwardRef 创建能将其接收的 ref 转发到子组件树中另一个组件的组件
- 解决函数组件无法直接接收 ref 的问题
- 常用于 HOC、UI 库封装（Input、Button 等）

### 详细解答

```jsx
const FancyInput = React.forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

// 父组件可直接 ref
function Parent() {
  const inputRef = useRef();
  useEffect(() => { inputRef.current.focus(); }, []);
  return <FancyInput ref={inputRef} />;
}
```

**两大使用场景：**

1. **转发 ref 到 DOM 组件** — 函数组件包装原生 input/button
2. **在高阶组件中转发 ref** — HOC 不应阻断 ref 传递

```jsx
function withLogging(WrappedComponent) {
  return React.forwardRef((props, ref) => (
    <WrappedComponent {...props} ref={ref} />
  ));
}
```

**配合 useImperativeHandle：** 限制暴露给父组件的 ref 内容，只暴露 `{ focus, reset }` 等方法。

### 面试追问

1. **forwardRef 的第二个参数 ref 和普通 props 有什么区别？** ref 不通过 props 传递（`props.ref` 不存在），React 单独作为第二参数传入，避免 ref 被 props 覆盖，也符合 ref 的特殊语义（命令式句柄而非数据）。

2. **React 19 对 ref 有什么变化？** React 19 中 ref 可作为普通 props 传递（`ref` 作为 prop），函数组件可直接接收 `ref` prop，forwardRef 仍可用但不再强制。这是 API 简化，底层转发机制类似。

---

## 27. 类组件与函数组件有什么异同？

**记忆口诀：**「渲染一致心智不同，Hooks 时代函数组件是未来」

**核心要点：**
- 相同：都是 React 最小复用单元，最终渲染效果一致
- 不同：编程范式（OOP vs FP）、生命周期 vs Hooks、性能优化 API 不同
- 趋势：函数组件 + Hooks 是社区和官方主推方向

### 详细解答

**相同点：**

- 都返回 React Element，使用方式和渲染效果一致
- 可互相改写（不推荐随意重构）
- 现代浏览器中性能差异仅在极端场景下明显

**不同点：**

| 维度 | 类组件 | 函数组件 |
| --- | --- | --- |
| 编程范式 | 面向对象：继承、生命周期 | 函数式：immutable、无副作用 |
| 状态管理 | this.state + setState | useState / useReducer |
| 副作用 | 生命周期方法 | useEffect / useLayoutEffect |
| 性能优化 | shouldComponentUpdate / PureComponent | React.memo |
| this | 需要绑定 | 无 this |
| 未来适配 | 并发模式下生命周期复杂 | 更轻量，更易优化 |

**Hooks 之后：** 函数组件可完全替代类组件的生命周期和 state，官方不再推荐新代码使用类组件。Concurrent Mode、Server Components 等未来特性优先支持函数组件。

### 面试追问

1. **什么情况下还需要用类组件？** 错误边界（Error Boundary）目前只能用类组件（`componentDidCatch`）；维护遗留代码；极少数第三方库依赖类组件 ref 实例。新代码几乎无必要。

2. **函数组件和类组件的性能差异大吗？** 日常场景差异可忽略。函数组件略轻（无实例化），配合 memo 优化方便。Concurrent Mode 下函数组件 + Hooks 的细粒度逻辑复用更利于调度优化。

---

## 28. React setState 调用的原理

**记忆口诀：**「入队等批量，batchingStrategy 是锁，锁开才更新」

**核心要点：**
- setState 是分发器，将 partialState 放入组件的 pending 队列
- 由 batchingStrategy.isBatchingUpdates 决定是否立即更新还是排队
- 批量更新机制减少 render 次数，提升性能

### 详细解答

**调用链路：**

```
setState(partialState, callback)
    ↓
updater.enqueueSetState(instance, partialState)
    ↓ 将 state 推入 _pendingStateQueue
enqueueUpdate(instance)
    ↓
isBatchingUpdates === true? 
    ├─ 是 → 放入 dirtyComponents 队列等待
    └─ 否 → batchedUpdates 立即发起更新
```

**关键对象 batchingStrategy：**

- `isBatchingUpdates` 是全局"锁"，初始为 false
- React 调用 `batchedUpdates` 时锁置 true，期间所有 setState 排队
- 锁释放后批量处理 dirtyComponents，合并 state，一次 render

```jsx
// 简化源码逻辑
ReactComponent.prototype.setState = function (partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};
```

**设计思想：** "任务锁"保证大量 setState 有序分批处理，避免频繁 render。

### 面试追问

1. **dirtyComponents 队列是什么？** 等待更新的组件实例列表。当 isBatchingUpdates 为 true 时，setState 不会立即更新，而是将组件推入 dirtyComponents，等当前批量更新结束后统一处理，实现合并更新。

2. **React 18 的自动批处理（Automatic Batching）有什么变化？** React 18 之前只在 React 事件和生命周期中批处理；18 起在 setTimeout、Promise、原生事件等**所有场景**默认自动批处理，多次 setState 合并为一次 render（使用 createRoot 时）。

---

## 29. React setState 调用之后发生了什么？是同步还是异步？

**记忆口诀：**「合并 state 走调和，批处理里异步，原生事件里同步」

**核心要点：**
- setState 后触发调和（Reconciliation），Diff 后最小化更新 DOM
- 表现上"异步"：React 可控场景下批量合并更新
- 原生事件、setTimeout 等 React 不可控场景（18 前）为同步

### 详细解答

**setState 之后发生了什么：**

1. 将传入的 partialState 与当前 state **合并**
2. 触发调和过程（Reconciliation），构建新 Element 树
3. Diff 新旧树，计算最小 DOM 变更
4. Commit 阶段更新 DOM

**同步还是异步？**

| 场景 | React 17 及之前 | React 18（createRoot） |
| --- | --- | --- |
| React 合成事件 | 异步（批处理） | 异步（自动批处理） |
| 生命周期 | 异步 | 异步 |
| setTimeout/Promise | 同步 | 异步（自动批处理） |
| 原生 addEventListener | 同步 | 异步（自动批处理） |

**为什么设计为异步批处理？**

- 多次 setState 合并为一次 render，性能更好
- 避免 render 未完成时 state 与 props 不一致

```jsx
// React 17：合成事件中"异步"
handleClick = () => {
  this.setState({ count: 1 });
  console.log(this.state.count); // 仍是旧值
};

// React 18 createRoot：setTimeout 中也批处理
setTimeout(() => {
  setCount(1);
  setCount(2);
  // 只 render 一次
}, 0);
```

### 面试追问

1. **为什么说 setState 不是"纯异步"？** 它不像 Promise 是真正的宏任务异步。准确说是**批量更新 + 委托更新**：setState 立即将更新入队，但 render 被推迟到当前执行栈清空后。React 18 用 `flushSync` 可强制同步更新。

2. **flushSync 是什么？什么时候用？** `flushSync(() => { setState(...) })` 强制 React 同步完成 DOM 更新。用于需要立即读取 DOM 布局（如测量尺寸）或第三方库集成时。日常应避免，破坏批处理性能优势。

---

## 30. React中的setState批量更新的过程是什么？

**记忆口诀：**「多次入队一次合并，同属性取最后一次，栈空才 flush」

**核心要点：**
- setState 不立即改 state，而是将更新推入队列
- 同一事件处理中多次 setState 合并为一次组件更新
- 相同属性的多次更新，React 只保留最后一次

### 详细解答

**批量更新流程：**

```
setState({ count: count + 1 })  →  入队 [count+1]
setState({ count: count + 1 })  →  入队 [count+1, count+1]
        ↓ 合并（非简单累加！）
    执行最后一次 count+1（基于闭包中的旧 count）
        ↓
    一次 render
```

**经典陷阱：**

```jsx
// 连续三次 +1，结果只 +1（不是 +3）
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);

// ✅ 正确：函数式更新
setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1); // 结果 +3
```

**原因：** 批量更新时，多次 setState 使用的是**同一次 render 前的 state 快照**，相同 key 的更新会被覆盖为最后一次，而非累加。

**何时停止"攒批"？** 同步代码执行栈清空后，React flush 队列，执行合并和 render。

### 面试追问

1. **为什么 setState 要用函数式更新？** 函数式更新 `setState(prev => prev + 1)` 基于**最新 state** 计算，不受批处理快照影响，连续多次调用可正确累加。直接传对象依赖闭包中的旧值，批处理下容易出错。

2. **React 18 自动批处理和 React 17 的批处理范围有什么不同？** React 17 仅在 React 事件处理器和生命周期中批处理；18 在 createRoot 下**所有更新**（含 setTimeout、fetch 回调、原生事件）默认批处理，行为更一致，减少意外多次 render。

---

## 31. React中有使用过getDefaultProps吗？它有什么作用？

**记忆口诀：**「createClass 专属默认值，现代用 defaultProps 静态属性」

**核心要点：**
- getDefaultProps 是 React.createClass 的 API，为 props 设置默认值
- 现代 class 组件用静态属性 `static defaultProps = {}`
- 函数组件同样支持 `Component.defaultProps` 或参数默认值

### 详细解答

**createClass 写法（已废弃）：**

```jsx
var ShowTitle = React.createClass({
  getDefaultProps: function () {
    return { title: 'React' };
  },
  render: function () {
    return <h1>{this.props.title}</h1>;
  }
});
```

**现代写法：**

```jsx
// 类组件
class ShowTitle extends React.Component {
  static defaultProps = { title: 'React' };
  render() {
    return <h1>{this.props.title}</h1>;
  }
}

// 函数组件（推荐解构默认值）
function ShowTitle({ title = 'React' }) {
  return <h1>{title}</h1>;
}
```

**作用：** 当父组件未传入某 prop 时，使用默认值，避免 undefined 导致的渲染异常。

### 面试追问

1. **defaultProps 和函数参数默认值哪个更好？** 函数组件推荐**参数默认值**（`{ title = 'React' }`），更简洁、TypeScript 友好、tree-shaking 更好。defaultProps 在 React 19 中已废弃，逐步移除。

2. **defaultProps 对 undefined 和 null 都生效吗？** 仅当 prop 为 `undefined` 时使用默认值；传入 `null` 不会触发 defaultProps，组件收到的是 null。这是 JavaScript 默认参数和 defaultProps 的共同行为。

---

## 32. React中setState的第二个参数作用是什么？

**记忆口诀：**「第二个参数是回调，DOM 更新完成后执行，推荐用 useEffect 替代」

**核心要点：**
- setState 第二个参数是 callback，在 state 更新且组件 re-render 完成后执行
- 等价于 componentDidUpdate 中执行，可拿到更新后的 state/DOM
- 函数组件中推荐 useEffect 替代此 callback

### 详细解答

```jsx
this.setState(
  { key1: newState1, key2: newState2 },
  () => {
    // 此时 state 已更新，DOM 已 commit
    console.log(this.state.key1);
    this.inputRef.current.focus();
  }
);
```

**使用场景：**

- 依赖更新后 state 发起请求
- 更新 DOM 后测量尺寸、滚动位置
- 连续 setState 后执行后续逻辑

**现代替代方案：**

```jsx
// 类组件
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    // 响应 count 变化
  }
}

// 函数组件
useEffect(() => {
  // 响应 count 变化
}, [count]);
```

官方建议优先使用生命周期 / useEffect，callback 形式不利于逻辑聚合和清理。

### 面试追问

1. **setState callback 和 componentDidUpdate 有什么区别？** callback 仅针对**本次** setState 触发的更新；componentDidUpdate 在**任何** props/state 变化后都触发。多次 setState 合并后，每个 callback 都会执行（在合并 render 之后）。

2. **函数组件 useState 有类似 callback 吗？** 没有。useState 的 setter 不接受 callback。需用 `useEffect` 监听 state 变化，或 `flushSync` + 同步读取。这是 Hooks 设计上的差异。

---

## 33. React中的setState和replaceState的区别是什么？

**记忆口诀：**「setState 是合并，replaceState 是替换，后者已废弃」

**核心要点：**
- setState：partialState 与当前 state 浅合并（类似 Object.assign）
- replaceState：用 nextState **完全替换** state，未包含的 key 会被删除
- replaceState 已废弃，现代 React 只用 setState

### 详细解答

| 方法 | 行为 | 语法 |
| --- | --- | --- |
| **setState** | 浅合并，保留未提及的 state 字段 | `setState(partialState, callback)` |
| **replaceState** | 完全替换，原 state 中不在 nextState 的字段被删除 | `replaceState(nextState, callback)` |

```jsx
// state = { a: 1, b: 2 }

this.setState({ a: 10 });
// 结果：{ a: 10, b: 2 }  ← b 保留

this.replaceState({ a: 10 });
// 结果：{ a: 10 }  ← b 被删除
```

**现状：** `replaceState` 已在 React 16 移除。等效操作可用 `setState` 传入完整 state，或函数组件中 `useState` 直接设置新对象。

### 面试追问

1. **什么场景需要"替换"而非"合并" state？** 当新 state 与旧 state 结构完全不同（如切换用户后重置整个表单 state）时，合并可能残留脏字段。应显式设置完整新 state 对象，而非依赖 replaceState。

2. **setState 的合并是深合并还是浅合并？** **浅合并**（shallow merge）。嵌套对象需手动展开：`setState({ user: { ...state.user, name: 'Tom' } })`，或使用 immer 等库简化不可变更新。

---

## 34. 在React中组件的this.state和setState有什么区别？

**记忆口诀：**「state 初始化用，改值必须 setState，直接改不触发渲染」

**核心要点：**
- this.state 用于声明/读取状态，constructor 中初始化
- setState 是修改 state 的唯一正确方式，会触发 re-render
- 直接修改 this.state 不会更新视图

### 详细解答

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }; // ✅ 初始化
  }

  wrong() {
    this.state.count = 1; // ❌ 直接修改，页面不更新
  }

  correct() {
    this.setState({ count: 1 }); // ✅ 触发 re-render
  }
}
```

| 操作 | 是否更新 DOM | 说明 |
| --- | --- | --- |
| `this.state = { ... }` | 仅 constructor 中初始化 | 其他位置不应直接赋值整个 state |
| `this.state.xxx = yyy` | ❌ 不更新 | 破坏不可变原则，跳过更新流程 |
| `this.setState({ ... })` | ✅ 更新 | 正确方式，走批量更新流程 |

**函数组件等价：** `useState` 返回 `[state, setState]`，同样不能直接修改 state 变量，必须通过 setter 更新。

### 面试追问

1. **为什么不能直接修改 this.state？** React 依赖 setState 触发调度流程（入队、批处理、shouldComponentUpdate、Diff）。直接修改绕过了这套机制，React 不知道需要 re-render，且破坏不可变数据原则，导致 PureComponent 等优化失效。

2. **setState 是合并 state，那 this.state 什么时候是最新的？** setState 调用后 this.state **不会立即更新**（批处理）。最新值在 render 阶段才可见，或在 setState callback / componentDidUpdate 中获取。不要在 setState 后立即读 this.state 期望新值。

---

## 35. state 是怎么注入到组件的，从 reducer 到组件经历了什么样的过程

**记忆口诀：**「store 存 state，connect 订阅变化，mapStateToProps 注入 props」

**核心要点：**
- Redux 通过 connect 高阶组件将 store 中的 state 映射为组件 props
- 流程：action → reducer 更新 store → subscribe 通知 → connect 重新 mapStateToProps → setState → render
- connect 本质是订阅 store 的高阶组件

### 详细解答

**connect 用法：**

```jsx
const mapStateToProps = (state, ownProps) => ({
  active: ownProps.filter === state.visibilityFilter
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setFilter: () => dispatch(setVisibilityFilter(ownProps.filter))
});

export default connect(mapStateToProps, mapDispatchToProps)(Link);
```

**reducer → 组件完整流程：**

```
1. dispatch(action)
2. reducer 处理 action，返回新 state，store 更新
3. store.subscribe 触发 connect 组件的 _updateProps
4. mapStateToProps(store.getState(), ownProps) 计算新 props
5. connect 内部 setState({ allProps }) 
6. 被包装组件 re-render，收到新 props
```

**connect 简化原理：**

```jsx
export const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
  class Connect extends React.Component {
    static contextTypes = { store: PropTypes.object };

    componentDidMount() {
      this.store = this.context.store;
      this.unsubscribe = this.store.subscribe(() => this.forceUpdate());
    }

    render() {
      const stateProps = mapStateToProps(this.store.getState(), this.props);
      const dispatchProps = mapDispatchToProps(this.store.getState, this.props);
      return <WrappedComponent {...stateProps} {...dispatchProps} {...this.props} />;
    }
  }
  return Connect;
};
```

### 面试追问

1. **mapStateToProps 的 ownProps 是什么？** 父组件传给 connect 包装组件的 props。用于将外部 props 与 store state 组合计算，例如根据 `ownProps.id` 从 state 中取对应数据。

2. **为什么 connect 后组件会在 store 变化时 re-render？** connect 内部 `store.subscribe` 注册了监听，store 每次 dispatch 后调用回调，重新执行 mapStateToProps 并 setState/forceUpdate，驱动被包装组件 re-render。可用 `shallowEqual` 比较优化，props 未变则跳过。

---

## 36. React组件的state和props有什么区别？

**记忆口诀：**「props 外部传入只读，state 内部私有可变，setState 触发渲染」

**核心要点：**
- props：父组件传入，只读，类似函数参数
- state：组件私有，通过 setState 修改，触发 re-render
- 两者变化都可能触发组件更新

### 详细解答

| 对比 | props | state |
| --- | --- | --- |
| 来源 | 父组件传入 | 组件内部创建 |
| 可变性 | 只读，不可修改 | 可变，通过 setState |
| 初始化 | 父组件决定 | constructor / useState |
| 作用 | 组件间通信 | 管理组件内部状态 |
| 更新触发 | 父组件 re-render | setState / useState setter |

```jsx
function Child({ name, age }) { // props：外部传入
  const [count, setCount] = useState(0); // state：内部管理
  return (
    <div>
      {name} - {age} - {count}
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

**设计原则：** 组件应像纯函数一样保护 props 不被修改；state 是组件"私有"数据，不应被外部直接访问和修改。

### 面试追问

1. **props 和 state 都能触发更新，如何决定数据放哪里？** 需要跨组件共享、由父组件控制 → props；仅组件内部使用、外部不需要知道 → state。可提升 state 到共同父组件，或通过 Context/Redux 共享。

2. **props 变化但内容相同会 re-render 吗？** 会进入更新流程（父组件 re-render 导致），但是否真正 render 取决于 shouldComponentUpdate/PureComponent/memo。若浅比较 props 相同，可 bail out 跳过 render。

---


## 37. React中的props为什么是只读的？

**记忆口诀：**「props 单向流，只读保纯函数，同输入同输出，无副作用才稳定」

**核心要点：**
- props 是父组件向子组件传递数据的唯一通道，数据流必须单向（父 → 子）
- React 借鉴函数式编程中「纯函数」思想，props 不可变保证渲染结果可预测
- 子组件不应直接修改 props，需要变更时应通过回调通知父组件

**详细解答：**

`this.props` 是组件间通信的接口，原则上只能从父组件流向子组件。React 具有浓重的函数式编程思想，其中「纯函数」有两个关键特征：

1. **给定相同输入，总是返回相同输出**
2. **过程没有副作用，不依赖外部可变状态**

props 的只读性正是汲取了纯函数思想：相同的 props 输入，页面展示内容一致，且不会因为子组件私自修改 props 而产生不可预期的副作用。

如果允许子组件修改 props，会破坏单向数据流，导致状态来源混乱、调试困难。正确的做法是：子组件通过 `props.onChange(newValue)` 等回调函数通知父组件，由父组件更新 state 后再以新 props 下发。

```jsx
// ❌ 错误：子组件不应修改 props
function Child({ data }) {
  data.count = 1; // 违反只读原则
}

// ✅ 正确：通过回调通知父组件
function Child({ count, onIncrement }) {
  return <button onClick={() => onIncrement(count + 1)}>{count}</button>;
}
```

### 面试追问

1. **props 和 state 都可以驱动渲染，为什么 state 可以修改而 props 不行？** state 是组件自身管理的内部状态，修改入口明确且可控（setState / useState）；props 是外部（父组件）注入的数据，若子组件能改 props，则同一数据存在多个修改源，违背单向数据流，状态变化不可追溯。React 通过 props 只读强制「谁拥有数据谁负责修改」。

2. **Immutable 数据与 props 只读有什么关系？** props 只读是 React 的约定（开发模式下 Object.freeze），Immutable 是工程实践层面的强化。使用 Immutable.js 或 immer 等工具保证数据不可变，可以让 shouldComponentUpdate / PureComponent 的浅比较正确生效，避免因引用不变但内容变化导致的渲染遗漏。

---

## 38. 在React中组件的props改变时更新组件的有哪些方法？

**记忆口诀：**「props 变更新组件，getDerivedStateFromProps 代 willReceiveProps，返回 null 则不更新」

**核心要点：**
- 核心思路：将新 props 映射到 state（派生状态），触发重新渲染
- React 16.3+ 推荐 `getDerivedStateFromProps` 替代已废弃的 `componentWillReceiveProps`
- 若 props 变化不需要影响 state，必须返回 `null`

**详细解答：**

当父组件传入的 props 更新时，子组件需要同步更新自身 state 并重新渲染，常见方案如下：

**（1）componentWillReceiveProps（已废弃）**

在 render 执行前触发，可通过 `this.props` 和 `nextProps` 对比，决定是否更新 state。曾用于将请求参数从 props 中提取并在子组件内发请求，但会破坏 state 单一数据源，且 Fiber 架构下可能被多次调用。

**（2）getDerivedStateFromProps（推荐，16.3+）**

静态方法，无法访问 `this`，通过 `nextProps` 和 `prevState` 判断是否需要更新 state：

```jsx
class MyComponent extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.type !== prevState.type) {
      return { type: nextProps.type };
    }
    return null; // 不需要更新时必须返回 null
  }
}
```

**注意事项：**
- 这是静态方法，不能发请求或访问实例方法
- React 16.4+ 中 setState 也会触发此方法，需用额外字段（如 `prevPropValue`）记录上次 props，避免覆盖用户本地 state
- 函数组件中可用 `useEffect(() => { ... }, [prop])` 监听 props 变化

### 面试追问

1. **getDerivedStateFromProps 和 componentDidUpdate 监听 props 变化有什么区别？** getDerivedStateFromProps 在 render 之前执行，用于将 props 同步到 state（派生状态），必须是纯函数、无副作用；componentDidUpdate 在 DOM 更新后执行，适合发请求、操作 DOM 等副作用。若只是「props 变了就请求数据」，应放在 componentDidUpdate 或 useEffect 中，而非 getDerivedStateFromProps。

2. **什么是派生状态的反模式？** 当 props 和 state 始终可以互相推导时，通常不需要 state，直接用 props 渲染即可。滥用 getDerivedStateFromProps 会导致 state 冗余、逻辑复杂，且容易出现「用户操作被 props 覆盖」的 bug（如 16.4 后 setState 也触发该钩子的问题）。

---

## 39. React中怎么检验props？验证props的目的是什么？

**记忆口诀：**「PropTypes 运行时校验，TypeScript 编译期校验，早发现早警告」

**核心要点：**
- 使用 `prop-types` 库在运行时校验 props 类型，不匹配时在控制台警告
- TypeScript 通过接口/类型定义在编译期校验，是更现代的做法
- 目的是在开发阶段尽早发现类型错误，提升代码可读性和可维护性

**详细解答：**

React 提供了 **PropTypes** 用于 props 验证。当传入的数据类型与定义不符时，控制台会发出警告，帮助在应用变复杂前发现问题。

```jsx
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.func,
};
```

常用 PropTypes 类型：`string`、`number`、`bool`、`func`、`object`、`array`、`node`、`element`、`oneOf`、`oneOfType`、`shape`、`exact` 等。

**验证 props 的目的：**
1. **类型安全**：避免传入错误类型导致运行时崩溃
2. **文档作用**：propTypes 即组件 API 文档，便于团队协作
3. **调试友好**：开发阶段快速定位 props 传错问题

若项目使用 TypeScript，推荐用接口替代 PropTypes：

```tsx
interface GreetingProps {
  name: string;
  age?: number;
}
const Greeting: React.FC<GreetingProps> = ({ name }) => <h1>Hello, {name}</h1>;
```

### 面试追问

1. **PropTypes 在生产环境还会校验吗？** React 15+ 中，PropTypes 已从 react 包中分离，需单独安装 `prop-types`。生产构建时，若使用 Create React App 等工具，PropTypes 校验代码通常会被 strip 掉以减小体积；TypeScript 类型则在编译阶段校验，编译后不存在。

2. **defaultProps 和 PropTypes 如何配合使用？** `defaultProps` 为可选 props 提供默认值，在 props 未传入或值为 `undefined` 时生效。与 PropTypes 配合：required 的 prop 不设 defaultProps，可选 prop 可同时声明 `PropTypes.xxx` 和 `defaultProps.xxx`，保证组件在无 props 时也能正常工作。

---

## 40. React的生命周期有哪些？

**记忆口诀：**「挂载 constructor→render→didMount，更新 getDerived→should→render→snapshot→didUpdate，卸载 willUnmount」

**核心要点：**
- 三个阶段：挂载（Mount）、更新（Update）、卸载（Unmount）
- 挂载：constructor → getDerivedStateFromProps → render → componentDidMount
- 更新：getDerivedStateFromProps → shouldComponentUpdate → render → getSnapshotBeforeUpdate → componentDidUpdate

**详细解答：**

React 组件生命周期分为三个阶段：

### 1. 挂载阶段（Mount）

组件首次被创建并插入 DOM，**只执行一次**：

| 生命周期 | 作用 |
| --- | --- |
| constructor | 初始化 state、绑定 this，必须调用 super(props) |
| getDerivedStateFromProps | 静态方法，props 映射到 state，返回对象或 null |
| render | 核心方法，返回 JSX，必须实现 |
| componentDidMount | DOM 已挂载，适合发请求、订阅、操作 DOM |

### 2. 更新阶段（Update）

props 或 state 变化时触发，**可能多次执行**：

| 生命周期 | 作用 |
| --- | --- |
| getDerivedStateFromProps | 同上 |
| shouldComponentUpdate | 性能优化，返回 false 跳过渲染 |
| render | 重新渲染 |
| getSnapshotBeforeUpdate | render 后、DOM 更新前，返回值传给 didUpdate |
| componentDidUpdate | DOM 更新后，适合对比 props 发请求 |

### 3. 卸载阶段（Unmount）

| 生命周期 | 作用 |
| --- | --- |
| componentWillUnmount | 清理定时器、取消请求、取消订阅 |

### 4. 错误处理

| 生命周期 | 作用 |
| --- | --- |
| componentDidCatch | 捕获子组件树中的 JS 错误，用于错误边界 |

**render 可返回的类型：** React 元素、数组/Fragment、Portals、字符串/数字、布尔/null（不渲染）。

### 面试追问

1. **componentDidMount 中调用 setState 会发生什么？** 会触发额外一次 render，但发生在浏览器绘制之前，用户无感知。应避免在此频繁 setState，初始 state 应在 constructor 中设置。官方推荐在 didMount 中发起网络请求。

2. **shouldComponentUpdate 为什么建议用 PureComponent 而非手写？** 手写浅比较容易遗漏边界情况，深比较（JSON.stringify）性能更差。PureComponent 内置 props 和 state 的浅比较，代码更简洁可靠。函数组件对应方案是 `React.memo`。

---

## 41. React 废弃了哪些生命周期？为什么？

**记忆口诀：**「will 三兄弟被废弃，Fiber 可打断多次调，副作用挪到 did 里」

**核心要点：**
- 废弃：componentWillMount、componentWillReceiveProps、componentWillUpdate（render 之前的 will 系列）
- 根本原因：Fiber 架构下 render 可中断，will 钩子可能被多次调用
- 替代方案：getDerivedStateFromProps、getSnapshotBeforeUpdate、componentDidUpdate

**详细解答：**

React 16.3 标记废弃、17 移除三个生命周期，均在 **render 之前**执行：

### 1. componentWillMount

- **废弃原因**：功能可由 constructor + componentDidMount 替代；SSR 环境下可能内存泄漏（willMount 订阅但 willUnmount 不执行）；Fiber 下可能执行多次
- **替代**：初始化放 constructor，副作用放 componentDidMount

### 2. componentWillReceiveProps

- **废弃原因**：破坏 state 单一数据源，易导致 state 不可预测；Fiber 下可能多次调用
- **替代**：`getDerivedStateFromProps`（静态、纯函数、用 prevState 对比）

### 3. componentWillUpdate

- **废弃原因**：回调可能被多次调用；获取 DOM 状态时机不可靠
- **替代**：副作用迁移到 `componentDidUpdate`；DOM 快照用 `getSnapshotBeforeUpdate`

### getSnapshotBeforeUpdate 的价值

在 DOM 更新**前**读取布局信息（如滚动位置），返回值作为 componentDidUpdate 第三个参数，保证快照与最终 DOM 一致：

```jsx
getSnapshotBeforeUpdate(prevProps) {
  if (prevProps.list.length < this.props.list.length) {
    const list = this.listRef.current;
    return list.scrollHeight - list.scrollTop;
  }
  return null;
}
```

### 面试追问

1. **为什么 Fiber 会导致 will 生命周期执行多次？** Fiber 将渲染分为可中断的 reconcile 阶段和不可中断的 commit 阶段。高优先级任务（如用户输入）可能打断低优先级渲染，导致组件多次进入 render 前的准备阶段，will 钩子随之多次触发，其中副作用（请求、订阅）会被重复执行。

2. **UNSAFE_ 前缀的生命周期是什么？** React 16.3 为尚未移除的 will 系列添加了 `UNSAFE_` 前缀（如 UNSAFE_componentWillMount），提醒开发者这些 API 不安全且未来会移除。StrictMode 下会双重调用这些钩子以帮助发现副作用问题。

---

## 42. React 16.X 中 props 改变后在哪个生命周期中处理

**记忆口诀：**「props 变映射 state 用 getDerivedStateFromProps，副作用放 didUpdate」

**核心要点：**
- 将 props 同步到 state：使用 `getDerivedStateFromProps`
- 发请求、操作 DOM 等副作用：使用 `componentDidUpdate` 或 `useEffect`
- 不需要更新 state 时必须返回 `null`

**详细解答：**

React 16.X 中，props 改变后的处理分两类场景：

**场景一：props 变化需要同步到 state（派生状态）**

使用 `getDerivedStateFromProps`，替代已废弃的 `componentWillReceiveProps`：

```jsx
static getDerivedStateFromProps(nextProps, prevState) {
  if (nextProps.userId !== prevState.userId) {
    return { userId: nextProps.userId };
  }
  return null;
}
```

特点：静态方法、不能访问 this、不能有副作用、在每次 render 前调用。

**场景二：props 变化需要执行副作用（请求数据等）**

使用 `componentDidUpdate`：

```jsx
componentDidUpdate(prevProps) {
  if (this.props.userId !== prevProps.userId) {
    this.fetchUser(this.props.userId);
  }
}
```

函数组件等价写法：

```jsx
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

### 面试追问

1. **getDerivedStateFromProps 能在里面发 AJAX 请求吗？** 不能。它是静态纯函数，在 render 之前同步执行，不应包含副作用。发请求应放在 componentDidMount（首次）和 componentDidUpdate / useEffect（props 变化时）。

2. **props 变化一定会触发 getDerivedStateFromProps 吗？** 会。不仅 props 变化，组件内部 setState 和 forceUpdate 也会触发。因此若只想在 props 变化时更新 state，必须与 prevState 中记录的旧 props 值对比，而非简单赋值。

---

## 43. React 性能优化在哪个生命周期？它优化的原理是什么？

**记忆口诀：**「shouldComponentUpdate 守门员，浅比较返回 false 就跳过 render」

**核心要点：**
- 性能优化关键生命周期：`shouldComponentUpdate`
- 返回 `false` 时跳过后续 render 和 componentDidUpdate
- 默认浅比较，推荐用 PureComponent 或 React.memo 替代手写

**详细解答：**

React 父组件 re-render 会导致所有子组件默认 re-render，即使 props 未变。`shouldComponentUpdate(nextProps, nextState)` 在 state 或 props 变化后、render 前调用，默认返回 `true`。

**优化原理：** 比较当前 props/state 与下一次 props/state，若数据相等返回 `false`，终止更新流程，跳过后续 render 和 componentDidUpdate。

```jsx
shouldComponentUpdate(nextProps, nextState) {
  if (this.props.num === nextProps.num && this.state.count === nextState.count) {
    return false;
  }
  return true;
}
```

**注意事项：**
- 只做**浅比较**，引用类型需保证引用变化才触发更新
- 避免深比较（JSON.stringify），可能比 re-render 更慢
- 推荐使用 `React.PureComponent` 或 `React.memo` 自动浅比较

**setState 新对象技巧：**

```jsx
// 确保引用变化
this.setState({ obj: { ...this.state.obj, key: newValue } });
// 或使用 immer 等不可变库
```

函数组件优化：`React.memo(Component, arePropsEqual?)`

### 面试追问

1. **父组件 re-render 但 props 没变，子组件会 re-render 吗？** 会，默认情况下 React 不保证 props 不变就不渲染子组件。需要子组件实现 shouldComponentUpdate / PureComponent / memo 来跳过无效渲染。这也是 React 性能优化中「向下传递稳定引用」重要的原因。

2. **useMemo 和 shouldComponentUpdate 有什么区别？** shouldComponentUpdate 决定是否 re-render 整个组件；useMemo 缓存计算结果，组件仍可能 re-render 但跳过昂贵计算。useCallback 缓存函数引用，配合 memo 子组件避免 props 引用变化导致的不必要渲染。Hooks 方案更细粒度。

---

## 44. state 和 props 触发更新的生命周期分别有什么区别？

**记忆口诀：**「state 和 props 更新走同一条路，props 多一个 willReceiveProps（已废弃）」

**核心要点：**
- state 更新：shouldComponentUpdate → render → getSnapshotBeforeUpdate → componentDidUpdate
- props 更新：流程相同，旧版额外有 componentWillReceiveProps（16 已废弃）
- 两者都触发 getDerivedStateFromProps 和 shouldComponentUpdate

**详细解答：**

### state 更新流程

```
setState / forceUpdate
  → getDerivedStateFromProps
  → shouldComponentUpdate（返回 false 则终止）
  → render
  → getSnapshotBeforeUpdate
  → componentDidUpdate
```

### props 更新流程

```
父组件 re-render 传入新 props
  → getDerivedStateFromProps
  → shouldComponentUpdate
  → render
  → getSnapshotBeforeUpdate
  → componentDidUpdate
```

**主要区别：**

| 对比项 | state 更新 | props 更新 |
| --- | --- | --- |
| 触发源 | 组件内部 setState | 父组件 re-render |
| 旧版额外钩子 | 无 | componentWillReceiveProps（已废弃） |
| 现代替代 | — | getDerivedStateFromProps |

**重要认知：**
- 父组件 re-render 时，即使 props 未变，子组件默认也会 re-render
- shouldComponentUpdate 仅作性能优化，不能依赖它「阻止」必要的渲染
- componentWillUpdate 已废弃，副作用应放在 componentDidUpdate

### 面试追问

1. **setState 传入相同值会触发 re-render 吗？** 在 React 18 之前，setState 即使值相同也可能触发 re-render（会走 shouldComponentUpdate）。React 18 中若 Object.is 比较 state 无变化，可能跳过 re-render。但不应依赖此行为，应用 shouldComponentUpdate / PureComponent 明确控制。

2. **forceUpdate 会跳过 shouldComponentUpdate 吗？** 不会。forceUpdate 仍会调用 shouldComponentUpdate，若返回 false 则不更新。若需强制更新，shouldComponentUpdate 中应对 forceUpdate 场景特殊处理，或重新设计状态结构。

---

## 45. React中发起网络请求应该在哪个生命周期中进行？为什么？

**记忆口诀：**「异步请求放 didMount，同步初始化放 constructor，willMount 已废弃别用」

**核心要点：**
- 官方推荐：`componentDidMount` 中发起异步请求
- 原因：此时 DOM 已挂载，保证只请求一次，兼容 SSR
- 避免 componentWillMount：Fiber 下可能多次执行，SSR 会重复请求

**详细解答：**

**推荐：componentDidMount**

```jsx
componentDidMount() {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => this.setState({ data }));
}
```

函数组件等价：

```jsx
useEffect(() => {
  fetch('/api/data').then(/* ... */);
}, []);
```

**为什么不在 componentWillMount？**

1. **SSR 问题**：服务端和客户端各执行一次，fetch 重复
2. **数据到达时机**：willMount 中请求，render 时数据未必返回，需处理 loading 态；忘记设初始 state 体验差
3. **Fiber 架构**：willMount 可能被多次调用，导致重复请求
4. **时间差异微乎其微**：willMount 比 didMount 早不了多少，网络延迟远大于此

**constructor 中：** 只做 state 初始化，不适合放副作用请求。

**props 变化重新请求：** 放在 `componentDidUpdate` 或 `useEffect([deps])` 中。

### 面试追问

1. **componentDidMount 中 setState 会导致二次 render 吗？** 会，但发生在浏览器绘制前，用户通常无感知。这是预期行为，用于将请求结果写入 state 并更新 UI。注意避免在 didMount 中无条件 setState 导致无限循环。

2. **React 18 StrictMode 下 useEffect 会执行两次，如何避免重复请求？** 开发模式下 StrictMode 故意双重挂载以暴露副作用问题。可用 AbortController 在 cleanup 中取消请求，或用 ref 标记是否已请求。生产环境不会双重执行。

---

## 46. React 16中新生命周期有哪些

**记忆口诀：**「Render 可暂停，Pre-commit 读 DOM，Commit 写 DOM，新增 getDerived 和 getSnapshot」

**核心要点：**
- React 16 按 Fiber 架构分为 Render、Pre-commit、Commit 三阶段
- 新增：getDerivedStateFromProps、getSnapshotBeforeUpdate
- 废弃：componentWillMount、componentWillReceiveProps、componentWillUpdate

**详细解答：**

React 16 从 Fiber 角度重新解读生命周期：

### 三阶段划分

| 阶段 | 说明 | 可访问 DOM |
| --- | --- | --- |
| Render | 计算状态，可被 Fiber 中断 | 否 |
| Pre-commit | DOM 更新前，DOM 信息可读 | 只读 |
| Commit | 更新真实 DOM | 是 |

### 完整生命周期（16+）

**挂载：**
- constructor
- getDerivedStateFromProps ⭐新增
- render
- componentDidMount

**更新：**
- getDerivedStateFromProps ⭐新增
- shouldComponentUpdate
- render
- getSnapshotBeforeUpdate ⭐新增
- componentDidUpdate

**卸载：**
- componentWillUnmount

**新增钩子详解：**

1. **getDerivedStateFromProps(props, state)**：静态，props → state 映射，替代 willReceiveProps
2. **getSnapshotBeforeUpdate(prevProps, prevState)**：DOM 更新前捕获信息（如滚动位置），返回值传给 didUpdate

**废弃钩子：** componentWillMount、componentWillReceiveProps、componentWillUpdate（均加 UNSAFE_ 前缀）

### 面试追问

1. **Render 阶段和 Commit 阶段分别做什么？** Render（reconcile）阶段构建 Fiber 树、diff、计算变更，可被打断；Commit 阶段依次执行 beforeMutation（getSnapshotBeforeUpdate）、mutation（DOM 更新）、layout（componentDidMount/Update、useLayoutEffect），不可中断。

2. **getDerivedStateFromProps 和 getSnapshotBeforeUpdate 分别在哪个阶段？** getDerivedStateFromProps 在 Render 阶段、每次 render 前调用；getSnapshotBeforeUpdate 在 Commit 阶段的 beforeMutation 子阶段，DOM 尚未更新但可读取当前 DOM 状态。

---

## 47. 父子组件的通信方式？

**记忆口诀：**「父传子用 props，子传父 props 加回调」

**核心要点：**
- 父 → 子：通过 props 传递数据和函数
- 子 → 父：父组件定义回调，通过 props 传给子组件，子组件调用并传参
- 数据流单向，状态由父组件统一管理

**详细解答：**

### 父组件向子组件通信

父组件通过 props 向子组件传递数据：

```jsx
// 子组件
const Child = ({ name, age }) => {
  return <p>{name} - {age}岁</p>;
};

// 父组件
const Parent = () => {
  return <Child name="React" age={18} />;
};
```

### 子组件向父组件通信

props + 回调函数：

```jsx
// 子组件
const Child = ({ onSendMessage }) => {
  return (
    <button onClick={() => onSendMessage('你好!')}>
      发送消息
    </button>
  );
};

// 父组件
class Parent extends Component {
  handleMessage = (msg) => {
    console.log('收到:', msg);
  };

  render() {
    return <Child onSendMessage={this.handleMessage} />;
  }
}
```

函数组件中注意回调引用稳定性，可用 `useCallback` 避免子组件无效 re-render。

### 面试追问

1. **父组件如何把 JSX 传给子组件？** 通过 `props.children` 或命名插槽（如 `props.header`、`props.footer`）。父组件包裹的内容会作为 children 传入子组件，子组件在 render 中 `{this.props.children}` 渲染，实现内容分发。

2. **回调函数为什么要 bind(this) 或用箭头函数？** 类组件中回调作为 props 传递时，若直接传 `this.handleClick`，调用时 this 指向会丢失。箭头函数自动绑定词法 this，或在 constructor 中 bind。函数组件无 this 问题。

---

## 48. 跨级组件的通信方式？

**记忆口诀：**「层层 props 太麻烦，Context 全局共享跨多级」

**核心要点：**
- 传统方式：中间组件逐层传递 props（透传），复杂度高
- 推荐方式：Context API 跨层级共享数据
- 适用场景：主题、语言、用户信息等全局性数据

**详细解答：**

### 方式一：props 逐层透传

中间每一层组件都要传递 props，即使中间层不需要该数据，增加复杂度和维护成本。

### 方式二：Context API（推荐）

Context 提供「全局」数据共享，任意层级可直接消费：

```jsx
const ThemeContext = React.createContext('light');

// 深层子组件
class DeepChild extends Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {theme => <div style={{ color: theme }}>主题色</div>}
      </ThemeContext.Consumer>
    );
  }
}

// 或使用 useContext Hook
function DeepChild() {
  const theme = useContext(ThemeContext);
  return <div style={{ color: theme }}>主题色</div>;
}

// 父组件提供
class App extends Component {
  render() {
    return (
      <ThemeContext.Provider value="red">
        <MiddleComponent />
      </ThemeContext.Provider>
    );
  }
}
```

**适用场景：** 主题、认证用户、国际化语言等跨多层的全局数据。

**注意：** Context 变化会导致所有消费组件 re-render，应用 `useMemo` 拆分 Context 或配合 state 分片优化。

### 面试追问

1. **Context 和 Redux 如何选择？** Context 适合低频更新的全局数据（主题、locale），无需额外库；Redux 适合复杂状态逻辑、中间件、时间旅行调试、大量组件订阅同一 state 且需精细更新控制。Context 本身不解决性能问题，频繁更新会导致大范围 re-render。

2. **Provider 的 value 变化为什么会导致所有 Consumer 更新？** React 通过 context 引用比较，value 引用变化则所有订阅该 Context 的组件 re-render。应将 value 用 useMemo 包裹，或将 state 和 dispatch 拆成两个 Context，减少不必要的渲染。

---

## 49. 非嵌套关系组件的通信方式？

**记忆口诀：**「非嵌套用发布订阅，Redux 全局态，兄弟找共同父组件」

**核心要点：**
- 发布-订阅（Event Bus）：自定义事件模块解耦通信
- 全局状态管理：Redux、Zustand 等
- 兄弟组件：找共同父组件，提升 state 到父级

**详细解答：**

非嵌套组件指没有包含关系的组件，包括兄弟组件和不在同一父级下的组件。

### 1. 发布-订阅模式（Event Bus）

```jsx
// eventBus.js
const listeners = {};
export const eventBus = {
  on(event, cb) { (listeners[event] = listeners[event] || []).push(cb); },
  emit(event, data) { (listeners[event] || []).forEach(cb => cb(data)); },
  off(event, cb) { listeners[event] = (listeners[event] || []).filter(f => f !== cb); },
};

// 组件 A 发布
eventBus.emit('userLogin', { id: 1 });

// 组件 B 订阅
useEffect(() => {
  const handler = (data) => console.log(data);
  eventBus.on('userLogin', handler);
  return () => eventBus.off('userLogin', handler);
}, []);
```

### 2. 全局状态管理

Redux、Zustand、MobX 等，任意组件通过 store 读写共享状态。

### 3. 兄弟组件通信

找到两个兄弟的共同父组件，将 state 提升到父级，通过 props + 回调实现：

```
Parent (state)
  ├── ChildA (onChange)
  └── ChildB (value)
```

### 面试追问

1. **Event Bus 有什么缺点？** 事件名字符串易冲突、难以追踪数据流、组件卸载若忘记 off 会内存泄漏、不支持时间旅行调试、大型项目难以维护。React 官方更推荐显式数据流（props、Context、状态管理库）。

2. **模块联邦或微前端中跨应用通信怎么做？** 常用 customEvent、Shared Worker、全局变量（qiankun 的 globalState）、postMessage、或独立的状态服务（Redis + WebSocket）。与 React 内部通信不同，需考虑应用隔离和安全性。

---

## 50. 如何解决 props 层级过深的问题

**记忆口诀：**「层级深用 Context 或 Redux，避免 props 钻取」

**核心要点：**
- 问题本质：props drilling（属性逐层透传）
- 方案一：Context API 跨层共享
- 方案二：Redux 等全局状态管理库

**详细解答：**

当组件树层级很深时，中间组件仅作「搬运工」传递 props，导致：
- 代码冗余，中间组件被迫接收无关 props
- 维护困难，修改数据结构需改多层
- 可读性差，难以追踪数据来源

**解决方案：**

### 1. Context API

```jsx
const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState({ name: 'Tom' });
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

// 任意深层组件
function DeepComponent() {
  const user = useContext(UserContext);
  return <span>{user.name}</span>;
}
```

### 2. 状态管理库

Redux、Zustand、MobX 等将状态集中在 store，组件按需订阅，彻底消除透传。

### 3. 组件组合（Composition）

通过 `children` 或 render props 将组件「插」到需要的位置，而非通过 props 传递：

```jsx
<Page user={user}>
  <Sidebar />  {/* 直接在 JSX 中使用 user，无需 props 透传 */}
</Page>
```

### 面试追问

1. **状态提升和 Context 如何选择？** 仅少数兄弟/父子需要共享 state 时用状态提升；跨 3 层以上且多组件需要同一数据时用 Context；状态逻辑复杂、需中间件/调试时用 Redux。不要过早使用全局方案，增加复杂度。

2. **Context 会导致性能问题吗？如何解决？** 会。Provider value 变化时所有 Consumer re-render。解决：拆分多个 Context；value 用 useMemo；将频繁变化与稳定数据分 Context；配合 memo 包裹消费组件；或使用 Redux 的选择器精确订阅。

---

## 51. 组件通信的方式有哪些

**记忆口诀：**「父传子 props，子传父回调，兄弟找父级，跨级 Context，全局 Redux，事件总线」

**核心要点：**
- 父子：props 向下，回调向上
- 跨级：Context
- 非嵌套/兄弟：状态提升、Event Bus、Redux
- 根据场景选择，避免过度设计

**详细解答：**

| 通信场景 | 方式 | 说明 |
| --- | --- | --- |
| 父 → 子 | props | 单向数据流，传递数据和函数 |
| 子 → 父 | props + 回调 | 父定义函数，子调用并传参 |
| 兄弟组件 | 共同父组件 | 状态提升到父级，props 分发 |
| 跨层级 | Context | 全局共享，避免 props 钻取 |
| 非嵌套组件 | 发布订阅 | Event Bus，自定义事件 |
| 复杂全局状态 | Redux / Zustand / MobX | 集中管理，可预测更新 |

**选型建议：**
- 简单父子：props + 回调
- 主题/用户等低频全局：Context
- 复杂业务状态、异步流：Redux + 中间件
- 临时解耦、少量跨组件：Event Bus（注意清理）

### 面试追问

1. **redux 和 Context 都能全局共享状态，区别是什么？** Context 是 React 内置的依赖注入机制，不提供状态更新逻辑、中间件、DevTools；Redux 是完整状态管理方案，单一 store、纯函数 reducer、可预测、支持中间件处理异步。Context 适合简单共享，Redux 适合复杂应用。

2. **forwardRef 算通信方式吗？** 严格说是命令式通信/ ref 透传，父组件通过 ref 直接调用子组件方法或访问 DOM，绕过了 props 数据流。适用于 focus、scroll、动画等命令式场景，但应谨慎使用，优先声明式 props。

---

## 52. React-Router的实现原理是什么？

**记忆口诀：**「监听 URL 变化，匹配 Route 渲染组件，history 库磨平差异」

**核心要点：**
- 客户端路由两种模式：Hash（hashchange）和 History（pushState/popstate）
- react-router 基于 history 库封装，维护路由列表，URL 变化时匹配 Component 并 render
- 不刷新页面，只更新匹配的组件内容

**详细解答：**

### 客户端路由实现思想

**1. Hash 模式**
- 监听 `hashchange` 事件感知 hash 变化
- 修改 URL：`location.hash = '#/path'`
- URL 形如：`http://example.com/#/about`

**2. History 模式（H5）**
- 通过 `history.pushState` / `replaceState` 改变 URL
- 监听 `popstate` 事件（浏览器前进/后退）
- URL 形如：`http://example.com/about`

### react-router 实现思想

1. **基于 history 库**：封装上述两种模式，保存历史记录，磨平浏览器差异
2. **路由匹配**：维护路由配置列表，URL 变化时按 path 匹配对应 Component
3. **渲染**：匹配成功后 render 对应组件，实现 SPA 无刷新切换

```
URL 变化 → history 监听 → 匹配 Route → 渲染 Component
```

### 面试追问

1. **BrowserRouter 刷新 404 怎么解决？** History 模式下 URL 是真实路径，服务器需配置 fallback 将所有路由指向 index.html（Nginx：`try_files $uri /index.html`）。Hash 模式不需要，因为 `#` 后内容不发送到服务器。

2. **react-router v6 和 v4 核心区别？** v6 移除 Switch 改 Routes、Route 用 element 替代 component、相对路由、useNavigate 替代 useHistory、Routes 内部自动 rank 匹配无需 exact。v6 更简洁，嵌套路由用 Outlet 实现。

---

## 53. 如何配置 React-Router 实现路由切换

**记忆口诀：**「Route 配路径，Switch 取首个，Link 做跳转，Redirect 做重定向」

**核心要点：**
- `<Route>` 按 path 匹配并渲染对应组件
- `<Switch>` 只渲染第一个匹配的 Route
- `<Link>` / `<NavLink>` 导航，`<Redirect>` 重定向

**详细解答：**

### 1. Route 组件

路由匹配通过比较 Route 的 path 与当前 pathname 实现：

```jsx
// pathname = '/about'
<Route path="/about" component={About} />  // 渲染 About
<Route path="/contact" component={Contact} />  // 渲染 null
<Route component={Always} />  // 无 path 始终匹配，渲染 Always
```

v6 写法：`<Route path="/about" element={<About />} />`

### 2. Switch + Route（v4/v5）

Switch 遍历子 Route，**只渲染第一个匹配**的：

```jsx
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="/contact" component={Contact} />
</Switch>
```

v6 用 `<Routes>` 替代，内置匹配优先级。

### 3. 导航组件

```jsx
<Link to="/">Home</Link>           // 普通链接
<NavLink to="/about" activeClassName="active">About</NavLink>  // 高亮当前
<Redirect to="/login" />           // 强制重定向
```

### 基本配置示例（v5）

```jsx
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
      </Switch>
    </BrowserRouter>
  );
}
```

### 面试追问

1. **Route 的 exact 属性作用是什么？** 精确匹配 path，不加 exact 时 `/` 会匹配所有以 `/` 开头的路径（如 `/about` 也会匹配 `/`）。Switch 内通常给根路由加 exact 避免误匹配。

2. **嵌套路由怎么配置？** v5 在 Route 的 render 中再嵌 Switch/Route；v6 用嵌套 Route + `<Outlet />` 渲染子路由出口。父 Route path 需带 `/*` 或相对路径，子 Route 写相对 path。

---

## 54. React-Router怎么设置重定向？

**记忆口诀：**「Redirect 组件配 from 和 to，Switch 内优先匹配」

**核心要点：**
- 使用 `<Redirect>` 组件实现重定向
- 属性：`from`（匹配路径）、`to`（目标 URL 或 location 对象）、`push`（是否入栈）
- 常放在 Switch 内，作为 Route 之一

**详细解答：**

```jsx
import { Switch, Route, Redirect } from 'react-router-dom';

<Switch>
  <Redirect from="/users/:id" to="/users/profile/:id" />
  <Route path="/users/profile/:id" component={Profile} />
</Switch>
```

访问 `/users/123` 会被重定向到 `/users/profile/123`。

**Redirect 属性：**

| 属性 | 说明 |
| --- | --- |
| from | 需要匹配的原路径 |
| to | 重定向目标，可为字符串或 location 对象 `{ pathname, search, state }` |
| push | 默认 false（replace），true 时入 history 栈，可回退 |

**编程式重定向（v5）：**

```jsx
this.props.history.replace('/login');
// 或
this.props.history.push('/login');
```

**v6：**

```jsx
import { Navigate } from 'react-router-dom';
<Route path="/old" element={<Navigate to="/new" replace />} />

const navigate = useNavigate();
navigate('/login', { replace: true });
```

**典型场景：** 未登录跳转登录页、旧 URL 兼容、默认路由 fallback。

### 面试追问

1. **Redirect 和 history.replace 有什么区别？** Redirect 是声明式，在 render 中根据条件渲染；history.replace 是命令式，在事件/副作用中调用。Redirect 的 push 属性控制 replace 还是 push；默认 replace 不留历史记录。

2. **如何实现路由鉴权？** 封装 PrivateRoute 高阶组件，检查 token，未登录 render Redirect to="/login"；v6 封装 ProtectedRoute 组件，不满足条件 return `<Navigate to="/login" />`。登录成功后 Redirect 回原页面（location.state.from）。

---

## 55. react-router 里的 Link 标签和 a 标签的区别

**记忆口诀：**「Link 阻止默认走 history，a 标签整页刷新」

**核心要点：**
- 最终都渲染为 `<a>` 标签，但行为不同
- Link 阻止默认跳转，通过 history API 改变 URL，仅更新匹配组件
- a 标签触发浏览器完整页面刷新

**详细解答：**

### Link 组件

react-router 的路由跳转链接，配合 Route 使用，实现 SPA 无刷新切换：

1. 有 onClick 则先执行 onClick
2. **阻止 a 标签默认行为**（event.preventDefault）
3. 根据 `to` 属性，用 **history**（push/replace）改变 URL
4. URL 变化触发 Route 匹配，更新对应组件，**不刷新整个页面**

### a 标签

普通超链接，点击后浏览器请求新页面，**整页刷新**，React 应用重新加载。

### 核心区别

| 对比项 | Link | a |
| --- | --- | --- |
| 页面刷新 | 否，局部更新 | 是，整页刷新 |
| 路由方式 | history / hash API | 浏览器导航 |
| 状态保留 | 保留 React 状态 | 状态丢失 |
| 使用场景 | SPA 内部路由 | 外链、下载 |

**Link 阻止默认后的跳转逻辑（简化）：**

```javascript
// Link 内部类似逻辑
onClick(e) {
  e.preventDefault();
  history.push(to); // 或 hash 变更
}
```

### 面试追问

1. **Link 的 to 可以是对象吗？** 可以。`to={{ pathname: '/home', search: '?tab=1', hash: '#section', state: { from: 'nav' } }}`，state 会存入 history location，目标页通过 location.state 读取，刷新后 state 丢失。

2. **NavLink 和 Link 区别？** NavLink 是 Link 的扩展，当前 URL 匹配时自动添加 active 类名或 style（activeClassName / activeStyle），适合导航菜单高亮当前页。v6 改为 `className={({ isActive }) => isActive ? 'active' : ''}`。

---

## 56. React-Router如何获取URL的参数和历史对象？

**记忆口诀：**「params 动态路由，search 查询串，state 内存传，history 用 useHistory」

**核心要点：**
- 动态路由参数：`match.params` 或 `useParams()`
- 查询字符串：`location.search`，需 URLSearchParams 解析
- 历史对象：`useHistory()`（v5）或 `useNavigate()`（v6）

**详细解答：**

### 获取 URL 参数

**1. query 传参（?id=111）**

路由：`path="/admin"`
URL：`/admin?id=111`

```jsx
// v5 类组件
const search = this.props.location.search; // '?id=111'
const params = new URLSearchParams(search);
const id = params.get('id');

// v5/v6 Hooks
const { search } = useLocation();
const id = new URLSearchParams(search).get('id');
```

**2. 动态路由（/admin/:id）**

路由：`path="/admin/:id"`
URL：`/admin/111`

```jsx
// v5
const { id } = this.props.match.params;

// Hooks
const { id } = useParams();
```

**3. state/query 对象传参**

```jsx
<Link to={{ pathname: '/admin', state: { id: 111 } }} />

// 接收
const location = useLocation();
const id = location.state?.id; // 刷新后丢失
```

### 获取历史对象

```jsx
// v5
import { useHistory } from 'react-router-dom';
const history = useHistory();
history.push('/home');
history.goBack();

// v6
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/home');
navigate(-1);
```

类组件：`this.props.history`

### 面试追问

1. **useParams 和 useSearchParams 区别？** useParams 获取路径动态段（`/user/:id` 中的 id）；useSearchParams（v6）或解析 location.search 获取查询参数（`?tab=1`）。动态路由参数更 RESTful，query 适合可选过滤条件。

2. **如何实现路由参数变化时重新请求数据？** 函数组件：`useEffect(() => { fetchData(id); }, [id])`，id 来自 useParams；类组件：componentDidUpdate 对比 prevProps.match.params。React Router v6 同一组件复用时 params 变化会触发 re-render，依赖项变化触发 effect。

---

## 57. React-Router 4怎样在路由变化时重新渲染同一个组件？

**记忆口诀：**「同组件不同参数，didUpdate 或 willReceiveProps 里对比 location 再请求」

**核心要点：**
- 同一路由组件，不同 URL 参数时 props（location/match）会变化
- 在 componentDidUpdate 或 componentWillReceiveProps 中对比 pathname/params
- 函数组件用 useEffect 监听 params 变化

**详细解答：**

路由变化时，同一组件实例的 props（location、match）会更新，但 componentDidMount 不会再次执行，需手动监听变化：

**类组件（v4/v5）：**

```jsx
class NewsList extends Component {
  componentDidMount() {
    this.fetchData(this.props.location);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.fetchData(this.props.location);
    }
  }

  fetchData(location) {
    const type = location.pathname.replace('/', '') || 'top';
    this.props.dispatch(fetchListData(type));
  }

  render() { /* ... */ }
}
```

旧版也可用 `componentWillReceiveProps(nextProps)` 对比 location（已废弃）。

**函数组件（推荐）：**

```jsx
function NewsList() {
  const { type } = useParams();
  const location = useLocation();

  useEffect(() => {
    fetchListData(type);
  }, [type, location.pathname]);

  return /* ... */;
}
```

**v6 注意：** React Router v6 在路径参数变化时会 remount 组件（取决于 key），有时 useEffect 依赖 params 即可，无需手动对比 location。

### 面试追问

1. **为什么 componentDidMount 不会在路由参数变化时再次执行？** React Router 复用同一组件实例，仅更新 props（location、match），不卸载 remount。因此 didMount 只执行一次，参数变化需在 didUpdate 或 useEffect deps 中处理。

2. **如何让路由变化强制 remount 组件？** 给 Route 的 component 加 key：`<Route path="/user/:id" render={(props) => <User key={props.match.params.id} />} />`，id 变化时 React 视为新组件，didMount 重新执行。适用于需要完全重置 state 的场景。

---

## 58. React-Router的路由有几种模式？

**记忆口诀：**「Hash 看 hash，Browser 用 history API，StaticRouter 做 SSR」

**核心要点：**
- 两种主流：HashRouter（hash）和 BrowserRouter（history）
- Hash：`#/path`，兼容性好，无需服务器配置
- Browser：真实路径，需服务器 fallback，URL 更美观

**详细解答：**

react-router-dom 提供两种客户端路由模式：

### 1. BrowserRouter（History 模式）

使用 HTML5 History API（pushState、replaceState、popstate）：

- URL 格式：`http://xxx.com/path`
- 优点：URL 美观，无 `#`
- 缺点：刷新需服务器配置，否则 404

```jsx
<BrowserRouter basename="/calendar" forceRefresh={false}>
  <App />
</BrowserRouter>
```

**主要属性：**
- `basename`：路由基准路径
- `forceRefresh`：不支持 history API 的浏览器是否强制刷新
- `getUserConfirmation`：导航确认函数（配合 Prompt）

### 2. HashRouter（Hash 模式）

使用 `window.location.hash`：

- URL 格式：`http://xxx.com/#/path`
- 优点：无需服务器配置，兼容性好
- 缺点：URL 带 `#`，SEO 略差

```jsx
<HashRouter hashType="slash">  {/* #/path */}
  <App />
</HashRouter>
```

**hashType：** slash（`#/`）、noslash（`#`）、hashbang（`#!/`）

### 对比

| 对比项 | BrowserRouter | HashRouter |
| --- | --- | --- |
| URL | /path | /#/path |
| 服务器配置 | 需要 | 不需要 |
| SEO | 较好 | 一般 |
| 兼容性 | 需 history API | 更好 |

### 面试追问

1. **SSR 环境用什么 Router？** 使用 StaticRouter（react-router-dom/server），传入 location 和 context，服务端渲染时不操作浏览器 history，客户端 hydrate 后切换 BrowserRouter。

2. **pushState 和 hash 改变的区别？** pushState 修改真实 URL 路径，不触发页面 reload，需监听 popstate（pushState 本身不触发事件，需自行 dispatch）；hash 改变触发 hashchange，URL 仅 `#` 后变化，不发送到服务器。

---

## 59. React-Router 4的Switch有什么用？

**记忆口诀：**「Switch 包 Route，只渲染第一个匹配，配合 exact 精确匹配」

**核心要点：**
- Switch 遍历子 Route/Redirect，**只渲染第一个匹配**的
- 不加 Switch 时多个 Route 可能同时匹配并渲染
- 常与 exact 联用，实现精确路径匹配

**详细解答：**

### 问题场景

不加 Switch 时：

```jsx
<Route path="/" component={Home} />
<Route path="/login" component={Login} />
```

访问 `/login` 时，`/` 和 `/login` **都会匹配**（因为 `/login` 以 `/` 开头），页面同时展示 Home 和 Login。

### Switch 的作用

```jsx
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/login" component={Login} />
</Switch>
```

Switch 按顺序遍历，**只渲染第一个匹配**的子元素（Route 或 Redirect）。

### exact 的作用

即使有了 Switch，访问 `/login` 时 `/` 仍可能先匹配。加 `exact` 精确匹配：

```jsx
<Switch>
  <Route exact path="/" component={Home} />
  <Route exact path="/login" component={Login} />
</Switch>
```

**规则：**
- Switch 内只能放 Route 和 Redirect
- 把更具体的路由放前面，通用/404 放最后
- v6 用 `<Routes>` 替代，内置 rank 算法自动最长匹配

### 面试追问

1. **Route 不加 path 会怎样？** 始终匹配任何 URL。常用于 404 页面，放在 Switch 最后：`<Route component={NotFound} />`。Switch 保证只有前面都不匹配时才渲染它。

2. **Switch 和 Routes（v6）匹配策略有何不同？** Switch 按声明顺序第一个匹配；Routes 按 path 特异性 rank 排序，最长/最具体路径优先，不依赖声明顺序，因此 v6 不太需要 exact。

---

## 60. 对 Redux 的理解，主要解决什么问题

**记忆口诀：**「React 管视图，Redux 管状态，单向数据流，全局 store 统一存」

**核心要点：**
- Redux 是 JS 状态容器，解决复杂应用中 state 管理混乱问题
- React 单向数据流在大型项目中 props 回调/event 难以维护
- Redux 提供统一 store，组件通过 dispatch/subscribe 读写状态

**详细解答：**

React 是视图层框架，组件间数据流单向（父 → 子 props）。项目变大时：
- 管理 state 的事件/回调越来越多
- 一个 model 变化引起连锁反应，state 何时为何变化不可控
- 组件间传递数据路径复杂

**Redux 解决的问题：**

1. **集中管理 state**：统一 store 仓储，所有组件从 store 获取所需 state
2. **可预测的状态变更**：只能通过 dispatch action → reducer 修改 state
3. **解耦组件**：组件不需层层传递，直接 connect 到 store
4. **支持调试**：时间旅行、action 日志（Redux DevTools）

**Redux 本身无 UI**，react-redux 将 Redux 状态机与 React UI 绑定：dispatch action 改变 state 时自动更新页面。

**数据流：**

```
View → dispatch(action) → Reducer → Store → subscribe → View 更新
```

**适用场景：** 中大型应用、多组件共享 state、复杂异步逻辑、需要状态回溯调试。

### 面试追问

1. **什么情况下不需要 Redux？** 组件局部 state 足够、父子通信简单、Context 能满足跨层共享、无复杂异步流。Redux 有样板代码成本，小项目用 useState + Context 或 Zustand 更轻量。

2. **Redux 和 React Context 的本质区别？** Context 是依赖注入机制，不提供更新规范；Redux 是架构模式，强制 action/reducer 纯函数更新、中间件扩展、DevTools。Context 适合传静态/低频数据，Redux 适合可预测的全局状态机。

---

## 61. Redux 原理及工作流程

**记忆口诀：**「createStore 建仓库，dispatch 发 action，reducer 算新 state，subscribe 通知更新」

**核心要点：**
- 核心 API：createStore、dispatch、getState、subscribe
- 数据流：action → dispatch → reducer → new state → 通知订阅者
- 源码模块：createStore、combineReducers、applyMiddleware、compose、bindActionCreators

**详细解答：**

### 核心原理

Redux 源码主要模块：

| 模块 | 作用 |
| --- | --- |
| createStore | 创建唯一 store |
| combineReducers | 合并多个 reducer |
| applyMiddleware | 增强 dispatch |
| compose | 函数组合（右到左） |
| bindActionCreators | 包装 action 自动 dispatch |

**createStore 简化实现：**

```javascript
function createStore(reducer, initialState) {
  let currentState = initialState;
  const listeners = [];

  const getState = () => currentState;

  const dispatch = (action) => {
    currentState = reducer(currentState, action);
    listeners.forEach(listener => listener());
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  };

  dispatch({ type: '@@INIT' }); // 初始化 state
  return { getState, dispatch, subscribe };
}
```

### 工作流程

1. **创建 store**：`const store = createStore(reducer)`
2. **定义 action**：`{ type: 'ADD', payload: data }`
3. **派发 action**：`store.dispatch(action)`
4. **reducer 处理**：`(state, action) => newState`，纯函数，不可改原 state
5. **通知订阅**：store 调用 listeners，组件 re-render

**角色分工：**
- **Store**：存储 state，中间人
- **Action**：描述「发生了什么」
- **Reducer**：根据 action 计算新 state
- **View**：dispatch action，subscribe 获取 state

### 面试追问

1. **reducer 为什么必须是纯函数？** 纯函数相同输入相同输出、无副作用，保证 state 变化可预测、可测试、支持时间旅行调试。若 reducer 中有异步或修改原 state，DevTools 无法正确 replay，状态不可追溯。

2. **combineReducers 做了什么？** 将多个 reducer 合并为一个，每个 reducer 管理 state 树的一个 slice，dispatch action 时各 reducer 分别处理，返回合并后的新 state 树。保证 store 唯一性同时实现模块化。

---

## 62. Redux 中异步的请求怎么处理

**记忆口诀：**「同步 reducer 管 state，异步交给中间件，thunk 简单 saga 强大」

**核心要点：**
- reducer 必须同步纯函数，异步逻辑放中间件
- redux-thunk：action 可以是函数 `(dispatch) => {}`，简单易用
- redux-saga：Generator 处理异步，功能强大，适合复杂流程

**详细解答：**

小规模项目可在 componentDidMount 直接请求；中大型项目用中间件统一管理异步流。

### 1. redux-thunk

**原理：** 若 dispatch 的是函数，中间件执行该函数并注入 dispatch/getState。

```javascript
// store 配置
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
const store = createStore(reducer, applyMiddleware(thunk));

// 异步 action creator
const fetchData = () => (dispatch) => {
  axios.get('/api/data').then(res => {
    dispatch({ type: 'FETCH_SUCCESS', payload: res.data });
  });
};

// 组件中
dispatch(fetchData());
```

**优点：** 体积小、上手简单
**缺点：** 样板代码多、异步与 action 耦合、功能有限

### 2. redux-saga

**原理：** 通过 Generator 函数监听 action，执行副作用。

```javascript
import { takeEvery, put, call } from 'redux-saga/effects';

function* fetchDataSaga() {
  try {
    const data = yield call(axios.get, '/api/data');
    yield put({ type: 'FETCH_SUCCESS', payload: data });
  } catch (e) {
    yield put({ type: 'FETCH_ERROR' });
  }
}

function* rootSaga() {
  yield takeEvery('FETCH_REQUEST', fetchDataSaga);
}
```

**优点：** 异步解耦、异常处理优雅、支持并发控制（takeLatest/takeEvery）
**缺点：** 学习成本高、体积较大

### 3. 其他

redux-observable（RxJS）、RTK Query（官方推荐，内置数据 fetching）

### 面试追问

1. **redux-thunk 中间件如何识别函数 action？** applyMiddleware 包装 dispatch，若 action 是 function，则执行 `action(dispatch, getState)` 而不传给 reducer；若是普通对象，继续传递给下一个 middleware 最终到 reducer。

2. **RTK 如何简化异步？** createAsyncThunk 自动生成 pending/fulfilled/rejected action，createSlice 的 extraReducers 处理；RTK Query 封装请求缓存、loading、refetch，减少样板代码，是 Redux 官方现代推荐方案。

---

## 63. Redux 怎么实现属性传递，介绍下原理

**记忆口诀：**「connect 连 React 和 Redux，mapState 取数据，mapDispatch 发 action」

**核心要点：**
- react-redux 通过 Provider 注入 store，connect 连接组件
- mapStateToProps：state → props；mapDispatchToProps：dispatch → props
- 数据流：View → dispatch → reducer → store → mapStateToProps → View

**详细解答：**

react-redux 数据传输完整链路：

```
View 点击 → mapDispatchToProps → dispatch(action)
  → reducer → store 更新
  → subscribe 通知 → mapStateToProps → props 更新 → View re-render
```

**完整示例：**

```jsx
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';

const reducer = (state = { text: 5 }, action) => {
  switch (action.type) {
    case 'ADD': return { text: state.text + 1 };
    case 'REMOVE': return { text: state.text - 1 };
    default: return state;
  }
};

const store = createStore(reducer);

class App extends React.Component {
  render() {
    const { text, onAdd, onRemove } = this.props;
    return (
      <div>
        <div>数据: {text}</div>
        <div onClick={onAdd}>加</div>
        <div onClick={onRemove}>减</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ text: state.text });
const mapDispatchToProps = (dispatch) => ({
  onAdd: () => dispatch({ type: 'ADD' }),
  onRemove: () => dispatch({ type: 'REMOVE' }),
});

const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);
```

**connect 原理三步骤：**
1. 从 Provider context 获取 store
2. 订阅 store，state 变化时 mapStateToProps 对比，setState 触发 render
3. 将 state 和 dispatch 方法作为 props 传入 WrappedComponent

### 面试追问

1. **mapStateToProps 返回的对象每次都新建，会重复 render 吗？** connect 内部对 mapStateToProps 结果做浅比较，若各字段引用/值未变则不触发 setState。但若每次返回新对象且内部字段引用变化，会 re-render。应用 reselect 缓存 selector 结果。

2. **useSelector 和 connect 有什么区别？** useSelector 是 Hooks API，组件内直接 `const data = useSelector(state => state.xxx)`，默认严格相等比较；connect 是 HOC，性能优化需手动 memo。RTK 推荐 useSelector + useDispatch 替代 connect。

---

## 64. Redux 中间件是什么？接受几个参数？柯里化函数两端的参数具体是什么？

**记忆口诀：**「中间件插在 dispatch 和 reducer 之间，柯里化 storeAPI 返回 next 返回 action 处理器」

**核心要点：**
- 中间件扩展 dispatch，在 action 到达 reducer 前执行副作用
- 签名：`({ getState, dispatch }) => next => action => {}`
- applyMiddleware 用 compose 串联多个中间件

**详细解答：**

Redux 中间件位于 **action 发起后、到达 reducer 前**，用于异步、日志、崩溃报告等。

**数据流变化：**

```
view → action → middleware → reducer → store → view
```

**applyMiddleware 源码核心：**

```javascript
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args);
    let dispatch = () => { throw new Error('dispatching while building middleware'); };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args),
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
}
```

**柯里化参数：**

| 层级 | 参数 | 说明 |
| --- | --- | --- |
| 第一层 | `{ getState, dispatch }` | middlewareAPI，访问 store |
| 第二层 | `next` | 下一个 middleware 的 dispatch |
| 第三层 | `action` | 当前派发的 action |

**自定义 logger 中间件：**

```javascript
const logger = store => next => action => {
  console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};
```

### 面试追问

1. **中间件为什么要用柯里化？** 分层注入依赖：第一层拿到 store API，第二层拿到 next（链式传递），第三层处理 action。compose 从右到左组合，形成洋葱模型，每个 middleware 可在 next(action) 前后执行逻辑。

2. **多个中间件的执行顺序是什么？** applyMiddleware 中 middlewares 数组从左到右注册，compose 从右到左组合，因此 dispatch 时**左边 middleware 先执行**，action 像洋葱一样穿过各层，最终到达 store.dispatch（reducer）。

---

## 65. Redux 请求中间件如何处理并发

**记忆口诀：**「takeEvery 并行全处理，takeLatest 只保留最后一次」

**核心要点：**
- redux-saga 提供并发控制 effect
- takeEvery：每个 action 都 fork 新 saga，并行执行
- takeLatest：新 action 到来时 cancel 前一个未完成的 saga

**详细解答：**

redux-saga 集中处理异步，提供两种典型并发策略：

### 1. takeEvery — 并行处理

每个匹配的 action 都会 fork 新 saga 任务，**互不干扰，全部执行**：

```javascript
function* takeEvery(pattern, saga) {
  while (true) {
    const action = yield take(pattern);
    yield fork(saga, action); // 不等待，继续监听
  }
}

// 使用
yield takeEvery('FETCH_USER', fetchUserSaga);
```

**适用：** 每个请求都需完成，如批量上传、日志上报。

### 2. takeLatest — 只保留最新

新 action 到来时，**cancel 上一个未完成的 saga**，只处理最后一次：

```javascript
function* takeLatest(pattern, saga) {
  let lastTask;
  while (true) {
    const action = yield take(pattern);
    if (lastTask) yield cancel(lastTask);
    lastTask = yield fork(saga, action);
  }
}

// 使用：搜索框输入，只关心最后一次结果
yield takeLatest('SEARCH', searchSaga);
```

**适用：** 搜索联想、快速切换 tab，避免旧请求覆盖新结果。

### 其他

- **takeLeading**：第一个未完成时忽略后续
- **debounce/throttle**：防抖节流
- **race**：多个 saga 竞速，先完成者胜出

### 面试追问

1. **redux-thunk 如何处理并发搜索？** thunk 本身无内置并发控制，需在 action 内手动实现：用递增 requestId，响应回来时对比 id 是否最新；或 AbortController 取消旧请求。这也是 saga takeLatest 的优势所在。

2. **cancelled saga 如何清理？** saga 被 cancel 时，若在 try/finally 中，finally 块仍会执行，可在其中清理资源。也可 yield cancelled() 判断是否被取消，配合 call 的可取消 API（如 axios CancelToken）。

---

## 66. Redux 状态管理器和变量挂载到 window 中有什么区别

**记忆口诀：**「window 存数据，Redux 管变化，可回溯可预测」

**核心要点：**
- 两者都能存储数据，但 Redux 提供完整状态管理模式
- Redux 支持时间旅行、action 追溯、可预测更新
- window 全局变量变更不可追踪，易引发混乱

**详细解答：**

| 对比项 | window 全局变量 | Redux |
| --- | --- | --- |
| 数据存储 | 随意挂载 | 单一 store 树 |
| 更新方式 | 任意修改 | 仅 dispatch action |
| 变更追溯 | 不可追溯 | DevTools 时间旅行 |
| 组件联动 | 需手动通知/轮询 | subscribe 自动更新 |
| 异步管理 | 无规范 | 中间件统一处理 |
| 可预测性 | 差 | 高（纯函数 reducer） |

**Redux 解决的核心问题：**

前端 state 来源多样（服务器响应、缓存、UI 状态），若随意修改：
- 一个 model 变化引发连锁反应，难以追踪
- 重现 bug、添加功能困难
- SSR、路由预取等场景更复杂

Redux 将 **变化** 和 **异步** 分离：reducer 纯函数处理变化，中间件处理异步，state 变更路径清晰可控。

**window 适用场景：** 极简单的全局配置、第三方库要求、legacy 代码。生产环境应避免把业务 state 挂 window。

### 面试追问

1. **Redux 时间旅行是怎么实现的？** DevTools 中间件拦截每个 action 和 state snapshot，存入历史栈。用户点击某个历史节点时，store 替换为对应 state 或 replay 到该点的 action 序列，实现状态回溯调试。

2. **全局 EventEmitter 和 Redux 区别？** EventEmitter 是发布订阅，无单一数据源、无 state 树、变更不可预测；Redux 有唯一 store、强制 action/reducer 流程。EventEmitter 适合事件通知，Redux 适合应用状态管理。

---

## 67. mobox 和 redux 有什么区别？

**记忆口诀：**「Redux 单一 store 不可变，MobX 多 store 响应式可变」

**核心要点：**
- 共同点：统一状态管理、单一可信数据源、React 绑定（react-redux / mobx-react）
- Redux：函数式、不可变 state、action/reducer 显式更新
- MobX：面向对象、observable 可变、自动依赖追踪

**详细解答：**

### 共同点

- 解决状态管理混乱，统一维护应用状态
- 单一可信数据来源（store）
- 操作方式统一可控
- 支持 react-redux、mobx-react 连接 React

### 区别

| 对比项 | Redux | MobX |
| --- | --- | --- |
| 设计思想 | Flux / 函数式 | 响应式 / OOP |
| 数据结构 | plain object，不可变 | observable，可变 |
| 更新方式 | dispatch action → reducer | 直接修改 observable |
| Store | 单一 store | 多个 store |
| 学习曲线 | 较陡（函数式+中间件） | 较平缓 |
| 调试 | DevTools 时间旅行 | 较难预测，依赖追踪 |
| 模板代码 | 较多 | 较少 |
| 性能 | 手动优化（connect/selector） | 自动精确 re-render |

**Redux 核心概念：** Action、Reducer、Store、Middleware

**MobX 核心概念：** Action、Store、Observable、Derivation（computed）

**选型建议：**
- 大型团队、需严格规范、时间旅行：Redux（或 RTK）
- 快速开发、OOP 风格、自动响应：MobX

### 面试追问

1. **MobX 如何实现自动精确更新？** 通过 Proxy（或 Object.defineProperty）拦截 observable 读写，render 时自动收集依赖（autorun/reaction），observable 变化时仅通知依赖它的组件 re-render，无需手动 shouldComponentUpdate。

2. **Redux 不可变和 MobX 可变对性能有何影响？** Redux 每次返回新 state 引用，需 connect/useSelector 浅比较或 immutable 库；MobX 细粒度追踪，修改嵌套属性只更新相关组件。Redux 大 state 树 re-render 范围可能更大，靠 reselect 优化；MobX 默认更精细但调试复杂 state 更难。

---

## 68. Redux 和 Vuex 有什么区别，它们的共同思想

**记忆口诀：**「同根 Flux 思想，Vuex 弱化 action 用 mutation 直改 state」

**核心要点：**
- 共同思想：单一数据源、状态变化可预测（Flux/MVU）
- Vuex 用 mutation 同步改 state，无需 switch reducer
- Vuex 依赖 Vue 响应式自动渲染，无需 subscribe

**详细解答：**

### Redux 和 Vuex 区别

| 对比项 | Redux | Vuex |
| --- | --- | --- |
| 更新入口 | dispatch action | commit mutation |
| 状态变更 | reducer（switch type） | mutation 函数直接改 state |
| 异步 | 中间件（thunk/saga） | actions → commit mutation |
| 渲染触发 | subscribe + connect | Vue 响应式自动更新 |
| 数据流 | action → reducer → store | commit → mutation → store |

**通俗理解：**
- Vuex **弱化 dispatch**，通过 commit 直接触发 mutation 变更 state
- **取消 action 概念**（async action 仍存在但同步变更走 mutation）
- **弱化 reducer**，mutation 内直接修改 state（Vue 响应式追踪）
- 框架更简易，但 mutation 必须同步

### 共同思想

1. **单一数据源（Single Source of Truth）**：全局 state 集中在 store
2. **变化可预测**：只能通过规定方式修改 state，便于调试和测试

本质上都是对 **MVVM** 思想的实践，将数据从视图中抽离，实现视图与状态的解耦。

### 面试追问

1. **Vuex 为什么要求 mutation 必须同步？** DevTools 需要捕获 mutation 前后 state 快照，异步 mutation 无法确定 state 变更的时间点，调试时间旅行会乱序。异步逻辑放 actions，actions 内 API 返回后 commit mutation。

2. **Pinia 和 Vuex 比有什么改进？** Pinia 去掉 mutation，action 可直接同步/异步改 state；无 modules 嵌套，多 store；更好的 TS 支持；API 更简洁，Vue 3 官方推荐。思想仍是一致的可预测状态管理。

---

## 69. Redux 中间件是怎么拿到 store 和 action? 然后怎么处理?

**记忆口诀：**「applyMiddleware 注入 API，柯里化链式传 next，最后一环接真 dispatch」

**核心要点：**
- applyMiddleware 创建 middlewareAPI：`{ getState, dispatch }`
- 每个 middleware 接收 API，返回 `next => action => {}`
- compose 串联，最后一个 middleware 的 next 是 store.dispatch

**详细解答：**

redux 中间件本质是**函数柯里化**，applyMiddleware 源码流程：

1. 创建 store 后，构造 `middlewareAPI = { getState: store.getState, dispatch: (...args) => dispatch(...args) }`
2. 每个 middleware 接收 middlewareAPI，返回 `next => action => result`
3. `chain = middlewares.map(mw => mw(middlewareAPI))`
4. `dispatch = compose(...chain)(store.dispatch)`

**函数签名：**

```javascript
const middleware = ({ getState, dispatch }) => next => action => {
  // 可在 next(action) 前后做逻辑
  return next(action);
};
```

**处理流程（洋葱模型）：**

```
dispatch(action)
  → middleware1 前逻辑
    → middleware2 前逻辑
      → store.dispatch(action) → reducer
    → middleware2 后逻辑
  → middleware1 后逻辑
```

- **拿到 store**：第一层柯里化参数 middlewareAPI
- **拿到 action**：第三层柯里化参数 action
- **处理**：调用 `next(action)` 传给下一层，不调用则拦截 action

**thunk 示例：** 若 `typeof action === 'function'`，执行 `action(dispatch, getState)`，否则 `next(action)`。

### 面试追问

1. **为什么 dispatch 在 middleware 构建时用占位函数？** 因为 compose 形成链时，dispatch 尚未确定（正在被 middleware 包装）。占位函数防止构建期间误 dispatch，链构建完成后 dispatch 被替换为增强版 dispatch。

2. **中间件能修改 action 吗？** 可以。在 next 前修改 action 对象（如添加 meta、转换 async 为 sync action 序列），然后 `return next(modifiedAction)`。redux-promise 等中间件会将 Promise action 展开为多个 sync action。

---

## 70. Redux中的connect有什么作用

**记忆口诀：**「connect 桥接 React 和 Redux，取 state、绑 dispatch、订阅变化」

**核心要点：**
- connect 是 react-redux 的核心 HOC，连接组件与 store
- 三大职责：获取 state、包装组件传入 props、订阅 store 变化
- 通过浅比较决定是否触发 WrappedComponent re-render

**详细解答：**

connect 负责 **连接 React 和 Redux**，主要做三件事：

### 1. 获取 state

通过 React context 从 Provider 获取 store，调用 `store.getState()` 获取 state tree，经 `mapStateToProps` 映射为 props。

### 2. 包装原组件

返回 Connect 组件，render 时渲染 WrappedComponent，合并：
- mapStateToProps 返回的 state props
- mapDispatchToProps 返回的 action props
- 父组件传入的 ownProps

```jsx
connect(mapStateToProps, mapDispatchToProps)(MyComponent)
```

### 3. 监听 store 变化

connect 缓存上次 mapStateToProps 结果，subscribe store，state 变化时：
- 重新执行 mapStateToProps
- **浅比较** 新旧 props，有变化则 setState 触发 Connect 及子组件 re-render

**性能优化：**
- mapStateToProps 应做纯函数计算，复杂逻辑用 reselect
- 可传 `{ pure: true }`（默认）启用浅比较
- 避免在 mapStateToProps 中返回新对象/新函数（除非必要）

**现代替代：** `useSelector` + `useDispatch`（React-Redux 7.1+）

### 面试追问

1. **connect 的 mergeProps 做什么？** 第三参数 `(stateProps, dispatchProps, ownProps) => finalProps`，自定义三者合并逻辑。默认 Object.assign 合并。用于 stateProps 和 dispatchProps 冲突时精细控制，或注入额外 props。

2. **Provider 和 connect 如何配合？** Provider 通过 context 向下传递 store；connect 消费 context 获取 store 并 subscribe。无 Provider 时 connect 报错。Provider 应包裹应用根组件，通常只用一个 store 实例。

---

## 71. 对 React Hook 的理解，它的实现原理是什么

**记忆口诀：**「Hook 给函数组件补能力，链表存状态，按调用顺序对应 Fiber」

**核心要点：**
- Hook 让函数组件拥有 state、生命周期等能力，弥补相对类组件的不足
- 实现原理：Fiber 节点上维护 Hook 链表，按调用顺序存储 state/effect
- 设计目标：逻辑复用、拆分生命周期、降低 class 学习成本

**详细解答：**

React Hook 是 React 16.8 引入的 API，使函数组件具备完整功能。

### 为什么需要 Hook？

**类组件问题：**
- 逻辑难以复用（HOC/render props 导致嵌套地狱）
- 生命周期内相关逻辑被拆分，无关逻辑混在一起
- class、this、bind 学习成本高

**函数组件早期局限：** 无 state、无生命周期，只是「无状态组件」。

### Hook 的作用

为函数组件补齐缺失能力：`useState`、`useEffect`、`useContext` 等，像「零部件箱」按需挂载。

### 实现原理（简化）

1. **Fiber 节点**上维护 `memoizedState` 指向 Hook 链表
2. 每次 render 按**固定顺序**调用 Hook，通过链表节点读取/更新对应 state
3. `useState` 返回 `[state, dispatch]`，dispatch 触发 re-render
4. `useEffect` 在 commit 阶段异步执行，cleanup 在下次 effect 前或卸载时执行

```
Fiber.memoizedState → Hook1 → Hook2 → Hook3
                        ↓       ↓       ↓
                     useState useEffect useMemo
```

**这就是为什么 Hook 不能放在条件/循环中** — 调用顺序必须每次 render 一致，否则链表节点错位。

### 面试追问

1. **Hook 和类组件生命周期如何对应？** useEffect 合并 didMount/didUpdate/willUnmount（依赖 [] 等同 didMount，return 清理函数等同 willUnmount）；useLayoutEffect 同步版，等同 componentDidMount/Update 中的 DOM 操作；无直接对应 constructor，state 初始值放 useState 参数。

2. **自定义 Hook 本质是什么？** 以 use 开头的函数，内部调用其他 Hook，复用的是**状态逻辑**而非组件。每个组件调用自定义 Hook 时拥有独立的 state/effect，遵循相同规则（顺序、顶层调用）。

---

## 72. 为什么 useState 要使用数组而不是对象

**记忆口诀：**「数组解构按顺序命名自由，对象解构必须同名或起别名」

**核心要点：**
- useState 返回 `[state, setState]` 数组，便于解构赋值时自定义命名
- 若返回对象，多次 useState 必须解构同名属性并起别名，繁琐易错
- 设计目标：降低使用复杂度，符合解构习惯

**详细解答：**

```jsx
const [count, setCount] = useState(0);
const [name, setName] = useState('');
```

### 数组解构的优势

```jsx
const [one, two, three] = [1, 2, 3];
// 按位置命名，随意取名
const [count, setCount] = useState(0);
const [visible, setVisible] = useState(false);
```

### 若返回对象的问题

```jsx
// 第一次
const { state, setState } = useState(false);
// 第二次 — 必须重命名，否则冲突
const { state: count, setState: setCount } = useState(0);
```

对象解构要求**属性名与返回对象一致**，多次使用时：
- 不能都用 `state`、`setState`
- 必须每次起别名，代码冗长
- 实际项目中 useState 调用频繁，体验很差

### 设计考量

React 团队选择数组是为**降低使用复杂度**：
- 数组按**顺序**解构，名称任意
- 与 ES6 解构习惯一致
- 多个 state 声明简洁清晰

**对比 useReducer：** 返回 `[state, dispatch]` 同样用数组，保持一致性。

### 面试追问

1. **useReducer 为什么也用数组返回？** 与 useState 保持 API 一致性，解构命名自由 `[state, dispatch]`，若用对象则多个 reducer 场景同样面临命名冲突。React Hook API 设计强调简洁和人体工学。

2. **Vue 的 ref/reactive 和 useState 返回形式有何不同？** Vue 3 ref 返回对象 `{ value }`，单一变量无命名冲突问题；React 单组件内多次 useState 需要多个独立命名，数组解构是最简方案。两者设计哲学不同：Vue 响应式包装值，React 元组返回 state 和 updater。

---

## 73. 为什么 useState 要使用数组而不是对象

**记忆口诀：**「数组解构可命名，对象多次要别名」

**核心要点：**
- `useState` 返回 `[state, setState]` 数组，配合解构赋值可按位置自由命名
- 若返回对象，多次调用时必须重命名属性（如 `state: counter`），使用成本高
- 本质是降低 API 使用复杂度，与 ES6 数组解构习惯一致

`useState` 的返回值设计是一个典型的 API 易用性决策。日常写法如下：

```jsx
const [count, setCount] = useState(0)
```

这里用到了 ES6 的**数组解构**。数组解构允许调用者按顺序为每个元素取任意名字：

```jsx
const [one, two, three] = [1, 2, 3]  // 名字完全自定义
```

若 `useState` 返回对象，则必须按属性名解构，且多次调用时属性名冲突：

```jsx
// 假设 useState 返回对象（实际并非如此）
const { state, setState } = useState(false)
const { state: counter, setState: setCounter } = useState(0)  // 必须起别名
```

在一个组件中可能调用多个 `useState`，数组解构只需按顺序命名即可，代码简洁；对象解构则每次都要处理命名冲突，实际项目中会非常繁琐。

**结论：** 返回数组而非对象，是为了**降低使用复杂度**，让开发者可以像写普通变量一样自由命名 state 和 setter。

### 面试追问

1. **如果 useState 改成返回对象，会有哪些实际问题？**
   每次调用 `useState` 返回的对象属性名都是 `state` 和 `setState`，在同一作用域内无法重复解构，必须为每次调用手动起别名。组件中 state 越多，代码越冗长，可读性和 copy-paste 复用性都会下降。

2. **为什么不用带 key 的对象来替代多次 useState？**
   React 团队评估过类似 `{ count: useState(0) }` 或传 Symbol key 的方案，但会导致 custom hook 复用时 key 冲突（同一 hook 调用两次无法区分），且丧失从组件中抽取 hook 的能力。固定顺序 + 数组返回值是最简且支持 hook 组合的方案。

---

## 74. React Hooks 解决了哪些问题？

**记忆口诀：**「复用难、逻辑散、class 烦，Hooks 函数一把抓」

**核心要点：**
- 解决组件间**复用状态逻辑**困难（替代 HOC / render props 的嵌套地狱）
- 解决复杂组件中**生命周期与业务逻辑耦合**、代码难以拆分的问题
- 解决 **class 组件**中 this、生命周期记忆成本高等学习障碍

React Hooks 主要解决了 class 组件时代的三大痛点：

**（1）组件间复用状态逻辑很难**

过去复用逻辑依赖高阶组件（HOC）或 render props，导致组件树层层嵌套（"嵌套地狱"），代码难以阅读和维护。Hooks 允许将状态逻辑提取为自定义 Hook（如 `useForm`、`useFetch`），在**不改变组件结构**的前提下跨组件复用，且便于单独测试。

**（2）复杂组件变得难以理解**

class 组件中，同一生命周期函数里往往混杂多种不相关逻辑（如在 `componentDidMount` 中既请求数据又注册事件监听，卸载时又要分别清理）。Hooks 允许按**功能**而非生命周期来组织代码——相关的请求、订阅、清理逻辑写在同一个 `useEffect` 中，职责更清晰。

**（3）难以理解的 class**

class 组件需要理解 `this` 绑定、构造函数等 JavaScript 概念，学习曲线陡峭。Hooks 让函数组件也能使用 state 和副作用，组件"更像是函数"，与 React 声明式、函数式的理念一致，同时无需学习复杂的函数式编程框架。

### 面试追问

1. **Hooks 相比 HOC 复用逻辑有什么优势？**
   HOC 需要在组件外层包裹一层，改变组件树结构，且多个 HOC 叠加时 props 来源难以追踪。自定义 Hook 是普通的函数调用，不改变 JSX 结构，逻辑来源清晰，也不会出现 props 命名冲突或 ref 转发等 HOC 常见问题。

2. **Hooks 能完全替代 class 组件吗？**
   绝大多数场景可以。目前 class 组件仍独有的能力主要是 `componentDidCatch` / `getDerivedStateFromError`（错误边界），React 已提供 `react-error-boundary` 等方案。官方推荐新项目优先使用函数组件 + Hooks。

---

## 75. React Hook 的使用限制有哪些？

**记忆口诀：**「顶层调用不乱序，只在函数组件里用」

**核心要点：**
- 不要在循环、条件或嵌套函数中调用 Hook
- 只在 React 函数组件或自定义 Hook 中调用 Hook
- 限制根源：Hook 状态依赖**固定调用顺序**（内部以链表存储）

React Hooks 有两条硬性规则：

**规则一：只在 React 函数组件或自定义 Hook 中调用 Hook**

Hooks 基于函数组件设计，class 组件没有对应的调用机制。第三个设计目标（摆脱 class 的学习和优化障碍）决定了 Hooks 只服务于函数组件。

**规则二：不要在循环、条件或嵌套函数中调用 Hook**

React 内部用**链表**（早期文档称"数组"）按调用顺序存储每个 Hook 的状态。每次渲染时，按相同顺序遍历链表取回对应 state。若在条件分支中跳过某个 Hook，后续 Hook 的取值就会错位，导致状态混乱。

**为什么不能用"单个对象 state"规避？**
把所有 state 合并到一个对象会丧失抽取 custom hook 的能力；用 string/Symbol 作 key 则在 custom hook 被多次调用时产生命名冲突。固定顺序是最简方案。

**实践建议：** 使用 `eslint-plugin-react-hooks` 在编译期自动检测违规写法。

### 面试追问

1. **Hook 的调用顺序为什么必须固定？**
   React 不通过变量名识别 Hook，而是把第 N 次 `useState()` 视为"第 N 个 state"。重渲染时按相同顺序从链表中读取。条件调用会导致链表索引错位，例如 `useState(0)` 的状态可能被 `useEffect` 误读。

2. **自定义 Hook 内部可以条件调用 Hook 吗？**
   不可以。自定义 Hook 本身也必须遵守相同规则——其内部的 Hook 调用同样需要在每次渲染时保持固定顺序。条件逻辑应放在 Hook 内部的 effect 回调中，而非决定是否调用 Hook。

---

## 76. useEffect 与 useLayoutEffect 的区别

**记忆口诀：**「Effect 异步不阻塞，Layout 同步防闪烁」

**核心要点：**
- 两者底层签名一致，都用于处理副作用（DOM 操作、订阅、定时器等）
- `useEffect` 异步执行，不阻塞浏览器绘制，适用于绝大多数场景
- `useLayoutEffect` 在 DOM 变更后、浏览器绘制前同步执行，适合测量布局、避免闪烁

**共同点：**
- 都用于在函数组件中处理副作用
- 底层都调用 `mountEffectImpl`，用法几乎一致（依赖数组、cleanup 函数等）

**不同点：**

| 对比项 | useEffect | useLayoutEffect |
| --- | --- | --- |
| 执行时机 | DOM 更新后**异步**执行（浏览器绘制之后） | DOM 更新后**同步**执行（浏览器绘制之前） |
| 是否阻塞渲染 | 不阻塞 | 阻塞浏览器绘制 |
| 典型场景 | 数据请求、订阅、日志 | 测量 DOM 尺寸、同步修改样式避免闪烁 |
| 执行顺序 | 较晚 | 总是先于 useEffect |

**React 18+ 三者执行顺序（commit 阶段）：**

```
useInsertionEffect → DOM 变更 → useLayoutEffect → 浏览器绘制 → useEffect
```

- `useInsertionEffect`：DOM 变更前，专供 CSS-in-JS 库注入样式
- `useLayoutEffect`：DOM 已更新、绘制前，同步读写布局
- `useEffect`：绘制后异步执行

**选型建议：** 默认用 `useEffect`；若出现视觉闪烁或需要同步读取布局，再换 `useLayoutEffect`。两者会长期共存，暂无合并计划。

### 面试追问

1. **什么场景必须用 useLayoutEffect？**
   需要在浏览器绘制前同步读取 DOM 布局信息（如 `getBoundingClientRect`）并据此修改 DOM/样式时。例如 Tooltip 定位、动画初始值计算。若用 `useEffect`，用户可能先看到错误位置再跳到正确位置（闪烁）。

2. **useLayoutEffect 在 SSR 中有什么问题？**
   服务端没有 DOM，`useLayoutEffect` 会触发警告（React 会降级为 `useEffect`）。SSR 场景下涉及 DOM 测量的逻辑应放在客户端 `useEffect` 中，或使用 `typeof window !== 'undefined'` 判断环境。

---

## 77. React Hooks 在平时开发中需要注意的问题和原因

**记忆口诀：**「顶层不调 Hook，数组要解构，props 变要同步，Context 别滥用」

**核心要点：**
- Hook 必须在组件顶层调用，保证调用顺序一致
- 更新数组/对象 state 需创建新引用，不可直接 mutate
- props 驱动的 state 需用 `useEffect` 同步，不能仅靠 `useState` 初始值

**（1）Hook 调用位置：顶层，不在循环/条件/嵌套函数中**

React 依赖调用顺序匹配 Hook 状态，条件调用会导致状态错位。

**（2）useState 更新数组/对象：不可直接 mutate**

```jsx
// ❌ 错误：push 修改原数组，引用未变，不会触发重渲染
num.push(1)
setNums(num)

// ✅ 正确：创建新数组
setNums([...num, 1])
```

class 组件中 `setState` 会做浅合并，有时 mutate 后仍触发更新；函数组件的 `useState` 用 `Object.is` 比较，引用不变则不更新。

**（3）props 变化时同步 state：需 useEffect**

```jsx
const [tabColumn, setTabColumn] = useState(columns)
// useState 初始值只在首次渲染生效
useEffect(() => { setTabColumn(columns) }, [columns])
```

**（4）善用 useCallback / useMemo**

父组件每次渲染都会创建新的函数/对象引用，可能导致子组件不必要的重渲染。用 `useCallback` 缓存回调，用 `useMemo` 缓存计算结果。

**（5）不要滥用 useContext**

Context 值变化会导致所有消费组件重渲染。复杂全局状态优先考虑 Zustand、Jotai 等细粒度方案，或拆分多个 Context。

### 面试追问

1. **为什么 class 组件 push 数组后 setState 有时能更新，useState 却不行？**
   class 的 `setState` 会将传入的对象浅合并到 state 中，即使数组引用未变，只要调用了 `setState` 就可能触发更新（取决于 `shouldComponentUpdate`）。`useState` 的 setter 用 `Object.is` 比较新旧值，引用相同则跳过渲染。

2. **useCallback 和 useMemo 什么时候才真正有必要？**
   当回调或计算结果作为 props 传给被 `React.memo` 包裹的子组件，或作为其他 Hook 的依赖项时。若子组件没有性能问题，或依赖项本身每次都在变，包一层反而增加开销。

---

## 78. React Hooks 和生命周期的关系？

**记忆口诀：**「无 Hook 无生命周期，有 Hook 用 Effect 对标」

**核心要点：**
- 纯函数组件没有生命周期；引入 Hooks 后才具备类似生命周期的能力
- `useState` 对应 constructor，`useEffect` 对应 mount/update/unmount
- `React.memo` 对应 `shouldComponentUpdate`，错误边界尚无 Hook 等价

**关键认知：** 函数组件本质是一个 render 函数，没有 state 就没有生命周期。使用 Hooks 后，`useState`、`useEffect`、`useLayoutEffect` 赋予了函数组件生命周期语义。

**class 与 Hooks 对应关系：**

| class 生命周期 | Hooks 等价 |
| --- | --- |
| constructor | `useState` 初始化 state |
| getDerivedStateFromProps | 渲染期间 `setState`（需谨慎，可能多次执行） |
| shouldComponentUpdate | `React.memo` / `useMemo` |
| render | 函数组件函数体本身 |
| componentDidMount | `useEffect(() => {}, [])` |
| componentDidUpdate | `useEffect(() => {}, [deps])` |
| componentWillUnmount | `useEffect` 的 cleanup 函数 |
| componentDidCatch | 暂无原生 Hook（可用 class 或第三方库） |

**useEffect 组合示例：**

```jsx
useEffect(() => {
  // componentDidMount + componentDidUpdate（count 变化时）
  document.title = `Clicked ${count} times`
  return () => {
    // cleanup：下次 effect 执行前 + unmount 时
  }
}, [count])
```

**建议：** 优先使用 `useEffect`；需要同步 DOM 操作时用 `useLayoutEffect`。

### 面试追问

1. **useEffect 的空依赖数组 `[]` 和 class 的 componentDidMount 完全等价吗？**
   语义接近但不完全等价。`useEffect(fn, [])` 在浏览器绘制后异步执行；`componentDidMount` 在 DOM 插入后同步触发。Strict Mode 下 `useEffect` 会双重挂载（开发环境），cleanup 也会执行两次。

2. **如何在 Hooks 中实现 getDerivedStateFromProps？**
   可以在渲染期间比较 props 与 state 并 `setState`，React 会丢弃当前渲染并立即用新 state 重渲染。但官方不推荐此模式，优先考虑直接由 props 派生值（无需 state）或用 `key` 重置组件。

---

## 79. 对虚拟 DOM 的理解？虚拟 DOM 主要做了什么？虚拟 DOM 本身是什么？

**记忆口诀：**「JS 对象描述 DOM，Diff 比对最小更新」

**核心要点：**
- 虚拟 DOM 是用 JavaScript 对象描述真实 DOM 结构的轻量级副本
- 数据变化时新旧 VDOM 做 Diff，生成 patch 批量更新真实 DOM
- 核心价值是声明式编程 + 跨平台 + 保证性能下限，而非绝对比操作 DOM 更快

**虚拟 DOM 是什么？**

Virtual DOM 是一个 JavaScript 对象（VNode），通过对象属性（type、props、children 等）描述 DOM 树的结构和状态。React 将 JSX 编译为 `React.createElement` 调用，产出 VNode 树。

**虚拟 DOM 做了什么？**

1. **抽象 DOM 操作**：开发者只需描述 UI 应该是什么样子（声明式），框架负责计算如何更新 DOM
2. **Diff 比对**：数据变化时，新 VDOM 与旧 VDOM（或缓存）比较，找出最小变更集（patch）
3. **批量更新**：将多次变更合并，一次性应用到真实 DOM，减少重排重绘次数

**为什么使用虚拟 DOM？**

- **保证性能下限**：不做手动优化时，Diff + 批量更新也能提供可接受的性能
- **跨平台**：VDOM 是 JS 对象，可渲染到 Web DOM、React Native、Canvas 等不同平台
- **研发体验**：函数式 UI 编程，组件化开发，无需手动操作 DOM

**性能对比：**

| 操作 | 真实 DOM | 虚拟 DOM |
| --- | --- | --- |
| 少量更新 | 直接操作可能更快 | 多一层 JS 计算开销 |
| 大量更新 | 需手动优化 | Diff 批量更新，性能可控 |
| 首次渲染 | 无额外开销 | 需构建 VDOM，略慢 |

### 面试追问

1. **虚拟 DOM 一定比直接操作 DOM 快吗？**
   不一定。修改单个按钮文案时，直接操作 DOM 更快。虚拟 DOM 的优势在于复杂场景下的批量更新和声明式开发模式。React 官方从未将 VDOM 作为性能卖点，而是强调开发体验和可维护性。

2. **虚拟 DOM 如何支持 SSR？**
   服务端没有 DOM API，可将组件渲染为 HTML 字符串（`renderToString` / `renderToPipeableStream`）。VDOM 作为中间表示，在 Node.js 环境中生成 HTML，客户端 hydration 时复用同一套组件逻辑。

---

## 80. React diff 算法的原理是什么？

**记忆口诀：**「三层策略：同层树、同型组件、同层 key」

**核心要点：**
- Diff 对比新旧 VDOM 树，生成 patch 以最小成本更新真实 DOM
- 三个优化策略：树层级同层比较、组件 type 比较、元素 key 优化列表
- React 16+ 基于 Fiber 架构，Diff 过程可中断、可恢复

**Diff 流程：**

```
真实 DOM → 映射为 VDOM → 数据变化 → 新 VDOM 与旧 VDOM Diff → 生成 patch → 更新真实 DOM
```

**三个优化策略：**

**策略一：树层级 — 同层比较，不跨层级**

两棵树只对同一层级的节点比较。若节点不存在则连同子树一起删除，不做跨层移动。这基于 Web 应用中跨层级移动 DOM 极少的假设，将 O(n³) 降为 O(n)。

**策略二：组件层级 — 同 type 才深入比较**

- 组件 type 相同 → 继续树 Diff
- 组件 type 不同 → 直接替换整个子树

因此父组件 type 变化会导致子树完全重建，这也是 `React.memo`、`PureComponent`、`shouldComponentUpdate` 能提升性能的原因。

**策略三：元素层级 — key 优化列表**

同层级子节点通过 key 标识身份。React 可识别哪些元素是新增、删除还是移动，从而用 DOM 移动代替销毁+重建，降低开销。

**Fiber 架构（React 16+）：**

Diff 过程拆分为可中断的工作单元（FiberNode 双链表结构），由 current 树与 workInProgress 树双缓冲完成更新，支持时间切片和优先级调度。

### 面试追问

1. **为什么 React Diff 不做跨层级比较？**
   跨层级移动 DOM 在真实应用中极少出现，而跨层比较会将复杂度从 O(n) 提升到 O(n³)。同层比较是性能与正确性的权衡，若确实需要跨层移动，应通过 key 在同层重新排列实现。

2. **React.memo 是如何利用 Diff 策略提升性能的？**
   `React.memo` 在组件层级做浅比较 props，若 props 未变则跳过该组件及其子树的 Diff，直接复用上次渲染结果。这利用了策略二"同 type 才深入比较"的前提——连 Diff 都省了。

---

## 81. React key 是干嘛用的？为什么要加？key 主要是解决哪一类问题？

**记忆口诀：**「key 标识节点身份，列表 Diff 靠它认」

**核心要点：**
- key 帮助 React 识别列表中哪些元素被增删、移动或修改
- 同级元素 key 必须唯一且稳定，避免不必要的 DOM 销毁与重建
- 主要解决**列表渲染**中元素复用错乱的问题

**key 的作用：**

在 React Diff 的同层级比较中，key 是元素的唯一标识。React 通过 key 判断：
- 某元素是**新创建**的还是从其他位置**移动**来的
- 哪些元素被**删除**，哪些被**保留**

**主要解决的问题：**

列表增删排序时，若无 key 或 key 不稳定，React 可能错误复用 DOM 节点，导致：
- 输入框内容错位（状态残留）
- 不必要的 DOM 销毁和重建（性能浪费）

**注意事项：**

- key 必须在同级元素中唯一
- **不要用数组 index 作为 key**（列表会增删排序时 index 会变，导致复用错误）
- **不要用随机数作 key**（每次渲染 key 都变，比不加 key 性能更差）

```jsx
// ✅ 用稳定唯一 id
{list.map(item => <li key={item.id}>{item.name}</li>)}

// ❌ 列表会变化时用 index
{list.map((item, index) => <li key={index}>{item.name}</li>)}
```

### 面试追问

1. **什么情况下可以用 index 作为 key？**
   列表是静态的、不会增删排序，且列表项没有内部 state（如纯展示文本）时，index 作为 key 问题不大。一旦列表可能重排、插入或删除，或列表项含受控输入等 state，就必须用稳定 id。

2. **key 会传给 DOM 元素吗？**
   不会。key 是 React 内部使用的特殊属性，不会出现在最终 DOM 上。若需要在 DOM 上使用类似标识，应单独传一个 data 属性。

---

## 82. 虚拟 DOM 的引入与直接操作原生 DOM 相比，哪一个效率更高，为什么？

**记忆口诀：**「单次 DOM 原生快，批量更新 VDOM 稳，核心矛盾在体验」

**核心要点：**
- 单次小量更新：直接操作原生 DOM 通常更快
- 复杂/批量更新：虚拟 DOM 通过 Diff 批量应用变更，性能更可控
- VDOM 的核心价值是声明式开发体验，而非绝对性能优势

**分场景分析：**

| 场景 | 谁更快 | 原因 |
| --- | --- | --- |
| 修改一个按钮文案 | 原生 DOM | VDOM 多了一层 JS 对象创建和 Diff 计算 |
| 首次渲染大量 DOM | 原生 innerHTML | VDOM 需先构建完整 VDOM 树 |
| 复杂列表增删排序 | VDOM | Diff + key 优化，最小化 DOM 操作 |
| 多组件联动更新 | VDOM | 批量合并更新，避免多次重排重绘 |

**核心观点：**

虚拟 DOM 的主要矛盾不在性能，而在于**开发者体验**。它让开发者用声明式、函数式的方式描述 UI，框架负责高效的 DOM 更新。React 官方从未将 VDOM 作为性能卖点。

VDOM 提供的是**性能下限保证**——即使不做手动优化，也能有"过得去"的性能。配合 `React.memo`、时间切片等优化后，可以做得更好。

### 面试追问

1. **为什么说虚拟 DOM 是"用空间换时间"？**
   每次渲染都需要在内存中维护一棵 VDOM 树（空间开销），以此换取 Diff 算法找出最小变更集、批量更新 DOM 的能力（时间优化）。对于简单页面，这棵树的维护成本可能超过收益。

2. **Svelte 不用虚拟 DOM 也能做到高性能，VDOM 还有必要吗？**
   Svelte 在编译期分析依赖、生成精确的 DOM 更新指令，运行时无 VDOM 开销。VDOM 的价值在于统一的运行时模型、跨平台能力和生态成熟度。不同框架有不同取舍，VDOM 并非唯一高性能路径。

---

## 83. React 与 Vue 的 diff 算法有何不同？

**记忆口诀：**「思路同层比，Fiber 可中断，Vue3 有 LIS」

**核心要点：**
- 两者整体策略一致：同层比较、组件 type 判断、key 优化列表
- React 16+ 引入 Fiber，Diff 可中断恢复，支持时间切片
- Vue 3 引入最长递增子序列（LIS）优化列表移动，曾引入时间切片后移除

**共同思路：**

Diff 的触发时机都是 state 变化 → 生成新 VDOM → 与旧 VDOM 对比 → 生成 patch → 更新 DOM。两者都采用：
- 树层级同层比较
- 组件 type 相同才深入
- 元素层级用 key 优化列表

**React 的特点：**

- React 16 引入 **Fiber 架构**，Diff 过程拆分为可中断的工作单元
- 双缓冲（current / workInProgress 树），支持优先级调度和 Concurrent 特性
- 默认全子树重渲染，需手动 `React.memo` / `PureComponent` 优化

**Vue 的特点：**

- Vue 2 采用**双端比较**（头头、尾尾、头尾、尾头四种比较）
- Vue 3 在编译期标记静态节点（patchFlag），Diff 时跳过静态内容
- Vue 3 列表 Diff 使用**最长递增子序列**减少 DOM 移动次数
- 组件级依赖追踪，仅更新依赖变化数据的组件（默认优化更细）

**时间切片：**

Vue 3 初期引入过类似 React 的时间切片，后因收益不高移除。React 的 Fiber 时间切片是其核心架构特性，两者在大多数场景性能差异不大。

### 面试追问

1. **Vue 3 的最长递增子序列优化是什么？**
   列表 Diff 时，先处理头尾相同的节点，中间剩余部分通过 key 映射找可复用节点，再对剩余新节点序列求最长递增子序列（LIS）。LIS 中的节点不需要移动，只需移动不在 LIS 中的节点，减少 DOM 操作次数。

2. **为什么 React 默认全子树渲染而 Vue 默认精确更新？**
   React 强调数据不可变和函数式，通过引用比较判断变化，默认认为 props 变了就需要重渲染。Vue 通过 getter/setter 或 Proxy 精确追踪依赖，组件渲染时已知哪些数据变了。这是设计哲学差异，React 用 memo 手动优化，Vue 默认自动优化。

---

## 84. React 组件命名推荐的方式是哪个？

**记忆口诀：**「继承 Component 命名，不用 displayName 凑合」

**核心要点：**
- React 推荐通过 ES6 class 继承 `React.Component` 来命名组件
- 不推荐仅用 `React.createClass` + `displayName` 的方式
- 函数组件直接以函数名作为组件名，配合 ESLint 规则保证大写开头

**React 推荐的方式：**

```jsx
// ✅ 推荐：class 继承，组件名即类名
export default class TodoApp extends React.Component {
  render() { /* ... */ }
}

// ✅ 推荐：函数组件，函数名即组件名
export default function TodoApp() {
  return <div>...</div>
}
```

**不推荐的方式：**

```jsx
// ❌ 旧式：createClass + displayName
export default React.createClass({
  displayName: 'TodoApp',
  // ...
})
```

**原因：**
- ES6 class 语法是 JavaScript 标准，createClass 已被废弃
- class / 函数名会被 DevTools、错误堆栈、HMR 直接使用，无需额外 displayName
- 函数组件命名需以大写字母开头，ESLint `react/function-component-definition` 规则可强制检查

### 面试追问

1. **displayName 还有什么用？**
   在使用 HOC 包裹组件时，DevTools 中可能只显示 HOC 的名字。可在 HOC 返回的组件上设置 `WrappedComponent.displayName = 'withAuth(UserProfile)'` 以便调试。匿名函数组件也可手动设置 displayName。

2. **文件命名和组件命名有什么关系？**
   社区惯例是一个文件一个组件，文件名与组件名一致（PascalCase），如 `TodoApp.jsx` 导出 `TodoApp`。这便于搜索和维护，但不是强制要求。

---

## 85. React 最新版本解决了什么问题，增加了哪些东西？

**记忆口诀：**「16 Fiber+Hooks，17 事件改，18 并发批处理」

**核心要点：**
- React 16：Fiber 架构、Error Boundary、Hooks（16.8）
- React 17：新 JSX 转换、事件委托改绑 root、渐进升级
- React 18：并发渲染、自动批处理、Suspense SSR、新 Hooks

**React 16.x — 架构革新**

- **Fiber 架构**：可中断渲染，解决大型应用同步渲染阻塞主线程的问题
- **Time Slicing**：任务可暂停、恢复，保持交互流畅
- **Suspense + lazy**：异步加载组件，优雅处理 loading 状态
- **Error Boundary**（`componentDidCatch`）：捕获子树渲染错误，展示 fallback
- **React 16.8 Hooks**：`useState`、`useEffect`、`useContext` 等，函数组件拥有状态和副作用

**React 17 — 渐进升级**

- 新 JSX 转换：编译后自动注入 `jsx()`，无需 `import React`
- 事件委托从 `document` 改为 root 容器，更好支持微前端和多 React 版本共存
- StrictMode 增强：移除对 `UNSAFE_` 生命周期的静默支持

**React 18 — 并发特性**

- **并发渲染（Concurrent Rendering）**：Fiber 按优先级调度，提升交互响应性
- **自动批处理**：`setTimeout`、Promise、原生事件中的多次 setState 也会合并
- **新 Root API**：`createRoot` 替代 `ReactDOM.render`
- **Suspense SSR**：流式渲染（`renderToPipeableStream`）
- **新 Hooks**：`useId`、`useTransition`、`useDeferredValue`、`useSyncExternalStore`
- **React Server Components**（实验性）：服务端组件减轻客户端 bundle

### 面试追问

1. **React 18 自动批处理和 React 17 有什么区别？**
   React 17 只在 React 事件处理器中批处理 setState。React 18 在 `setTimeout`、`Promise.then`、原生事件等所有场景都自动批处理。若需立即渲染，可用 `flushSync` 强制同步更新。

2. **useTransition 和 useDeferredValue 有什么区别？**
   `useTransition` 标记状态更新为低优先级过渡（`startTransition`），适合用户触发的非紧急更新（如 tab 切换）。`useDeferredValue` 延迟使用某个值的更新，适合延迟展示派生结果（如搜索建议列表）。

---

## 86. React 实现一个全局的 Dialog

**记忆口诀：**「单例挂 body，命令式 open/close，Portal 渲染」

**核心要点：**
- 全局 Dialog 通常用单例模式，挂载到 `document.body`
- 通过命令式 API（`Dialog.open()` / `Dialog.close()`）或 Context 控制显隐
- 可用 Portal + CSS 过渡动画实现遮罩层和内容区

**实现思路：**

1. **创建 Dialog 容器**：在 `document.body` 追加一个 div 作为挂载点
2. **单例组件**：Dialog 组件维护 open/close 状态和内容
3. **命令式 API**：暴露 `open(options)` 和 `close()` 方法供全局调用
4. **Portal 渲染**：用 `ReactDOM.createPortal` 将 Dialog 渲染到 body 下的容器
5. **动画**：配合 CSS Transition 或 `react-transition-group` 实现进出场动画

**核心代码结构：**

```jsx
// 1. 创建挂载点
const div = document.createElement('div')
document.body.appendChild(div)

// 2. Dialog 组件
class Dialog extends Component {
  state = { visible: false, content: null }

  open = (options) => {
    this.setState({ visible: true, ...options })
  }

  close = () => {
    this.setState({ visible: false })
    this.state.onClose?.()
  }

  render() {
    if (!this.state.visible) return null
    return ReactDOM.createPortal(
      <div className="dialog-overlay">
        <div className="dialog-content">
          {this.state.content}
        </div>
      </div>,
      div
    )
  }
}

// 3. 导出单例方法
const dialogRef = React.createRef()
ReactDOM.render(<Dialog ref={dialogRef} />, div)
export const Dialog = {
  open: (opts) => dialogRef.current.open(opts),
  close: () => dialogRef.current.close(),
}
```

**现代方案：** 使用 Context + Hook（如 `useModal`）或第三方库（antd Modal、react-hot-toast）实现，支持 Promise 化调用（`await Modal.confirm()`）。

### 面试追问

1. **全局 Dialog 为什么推荐用 Portal？**
   Portal 将 Dialog 渲染到 DOM 树的任意位置（通常是 body），避免被父组件的 `overflow: hidden`、`z-index` 层叠上下文等 CSS 影响，确保遮罩层覆盖整个视口。

2. **命令式 API 和声明式 API 各有什么优劣？**
   命令式（`Dialog.open()`）适合工具函数、非组件上下文（如 axios 拦截器弹错误提示），调用简单。声明式（`<Modal visible={show} />`）状态可追踪、易测试、符合 React 数据流。实际项目常两者结合：声明式为主，命令式封装为语法糖。

---

## 87. React 数据持久化有什么实践吗？

**记忆口诀：**「redux-persist 存 localStorage，刷新不丢状态」

**核心要点：**
- 页面刷新后内存中的 React/Redux 状态会丢失，需要持久化到 localStorage 等
- 常用方案：`redux-persist` 自动同步 Redux store 到 localStorage
- 也可封装自定义 Hook 或 Storage 工具直接读写 localStorage

**常见实践：**

**（1）封装 Storage 工具**

```jsx
const storage = {
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)) },
  get(key) { return JSON.parse(localStorage.getItem(key)) },
  remove(key) { localStorage.removeItem(key) },
}
```

**（2）redux-persist（最常用）**

```jsx
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'settings'],  // 只持久化部分 reducer
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(persistedReducer)
export const persistor = persistStore(store)
```

```jsx
// 入口文件
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

**（3）其他方案**

- **Zustand persist 中间件**：`create(persist(...))` 一行配置
- **sessionStorage**：临时数据（如表单草稿），关闭标签页后清除
- **自定义 Hook**：`useLocalStorage(key, initialValue)` 双向绑定 localStorage
- **URL / History API**：路由 state 存储临时数据

### 面试追问

1. **redux-persist 的 whitelist 和 blacklist 有什么区别？**
   `whitelist` 指定哪些 reducer 需要持久化，其余不存。`blacklist` 指定哪些 reducer 不持久化，其余都存。敏感数据（token 等）应放 blacklist 或使用加密存储。

2. **localStorage 存大量数据有什么风险？**
   localStorage 通常限制 5MB，且是同步 API，读写会阻塞主线程。大量数据应存 IndexedDB，或只持久化必要字段。还需注意 SSR 环境没有 localStorage，需做环境判断。

---

## 88. 对 React 和 Vue 的理解，它们的异同

**记忆口诀：**「同：VDOM 组件化；异：JSX vs 模板，单向 vs 双向」

**核心要点：**
- 相似：Virtual DOM、组件化、props 数据流、生态各自独立
- 不同：模板 vs JSX、数据响应原理、状态管理哲学、扩展机制
- 选型取决于团队技术栈、项目规模和开发者偏好

**相似之处：**

- 都基于 Virtual DOM 提升渲染性能
- 都采用组件化架构，props 向下传递数据
- 都将核心库与路由、状态管理解耦（React Router / Vue Router，Redux / Pinia）
- 都有跨平台方案（React Native / UniApp）
- 都有官方脚手架（Create React App / Vite + Vue）

**不同之处：**

| 对比维度 | React | Vue |
| --- | --- | --- |
| 模板 | JSX（JS 语法扩展） | 类 HTML 模板 + 指令 |
| 数据流 | 单向数据流 | 默认支持 v-model 双向绑定 |
| 响应式 | 引用比较，需手动优化 | 依赖追踪，默认精确更新 |
| 状态管理 | Redux / Zustand / Jotai | Pinia / Vuex |
| 扩展机制 | 高阶组件 / Render Props / Hooks | mixins（Vue2）/ composables（Vue3） |
| 学习曲线 | 需学 JSX + 函数式概念 | 模板更接近 HTML，上手较快 |
| Diff 策略 | Fiber 可中断 | 编译期优化 + LIS |

**设计理念：**

- React："Just JavaScript"，UI = f(state)，一切皆 JS
- Vue："渐进式框架"，可逐步引入，模板/选项式/组合式 API 灵活选择

### 面试追问

1. **React 为什么强调单向数据流而 Vue 支持双向绑定？**
   React 认为数据流向清晰可预测，子组件不应直接修改父组件数据，所有变更通过回调上报。Vue 的 v-model 本质是语法糖（`:value` + `@input`），底层仍是 props down / events up，只是开发更便捷。Vue 3 的 composables 与 React Hooks 在逻辑复用上也趋于一致。

2. **什么项目更适合选 React 或 Vue？**
   没有绝对答案。React 生态更大（Native、Next.js、Meta 支持），适合大型团队和复杂应用。Vue 模板直观、默认优化好，适合快速开发和中小型项目。实际选型更多看团队熟悉度和现有技术栈。

---

## 89. 可以使用 TypeScript 写 React 应用吗？怎么操作？

**记忆口诀：**「CRA 加 --typescript，已有项目装 types 改后缀」

**核心要点：**
- 完全支持，Create React App 和 Vite 均内置 TypeScript 模板
- 新建项目加 `--template typescript` 即可
- 已有 JS 项目安装 `@types/*` 并将 `.js` 改为 `.tsx`

**（1）新建 TypeScript React 项目**

```bash
# Create React App
npx create-react-app my-app --template typescript

# Vite（推荐）
npm create vite@latest my-app -- --template react-ts
```

**（2）已有 JS 项目迁移**

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
```

- 根目录添加 `tsconfig.json`
- 将 `.js` / `.jsx` 文件重命名为 `.ts` / `.tsx`
- 逐步为 props 和 state 添加类型定义

**常用类型写法：**

```tsx
// 函数组件 props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
)

// useState 自动推断
const [count, setCount] = useState(0)

// 事件类型
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}
```

### 面试追问

1. **React.FC 现在还推荐使用吗？**
   React 18 类型更新后，社区更倾向于显式定义 props 类型而不使用 `React.FC`。`React.FC` 隐式包含 `children` 类型，且对泛型组件支持不好。推荐直接 `(props: Props) => JSX.Element` 写法。

2. **TypeScript 项目中如何给 CSS Modules 加类型？**
   安装 `typescript-plugin-css-modules` 或在项目中声明 `*.module.css` 模块类型。Vite 项目可配置 `vite-plugin-svgr` 等插件自动生成类型声明文件。

---

## 90. React 设计思路，它的理念是什么？

**记忆口诀：**「声明式 UI，组件组合，VDOM 批量更新，一次学习随处写」

**核心要点：**
- 声明式编程：描述 UI 应该是什么，而非如何操作 DOM
- 组件化：可组合、可复用、可维护、可测试的独立单元
- 函数式思想：UI = f(state, props)，数据驱动视图

**（1）声明式，简单直观**

React 的核心价值是**声明式编码**——为每个状态设计简洁视图，数据变化时 React 自动更新 DOM。开发者无需手动操作 DOM，代码更可靠、易调试。

**（2）组件化**

React 将 UI 拆分为独立、可复用的组件：
- **可组合**：小组件组合成大组件
- **可重用**：同一组件可在多处使用
- **可维护**：逻辑和 UI 封装在组件内部
- **可测试**：组件独立，便于单元测试

**（3）Virtual DOM**

将真实 DOM 抽象为 JS 对象树，数据变化时 Diff 找出最小变更，批量更新 DOM。提供 `shouldComponentUpdate` / `React.memo` 等优化手段。

**（4）函数式编程**

组件本质是 `props => UI` 的纯函数（理想情况下）。React 鼓励使用不可变数据、纯函数、Hooks 组合，减少副作用和冗余代码。

**（5）一次学习，随处编写**

React 组件可渲染到 Web（React DOM）、移动端（React Native）、桌面端（Electron），甚至服务端（SSR / RSC），核心概念通用。

### 面试追问

1. **React 为什么强调"单向数据流"？**
   数据从父到子通过 props 传递，子组件通过回调通知父组件变更。单向流使数据变化可追踪、可预测，避免多源数据互相修改导致的调试困难（"谁改了我的数据？"）。

2. **React 的"Learn Once, Write Anywhere" 在实际中如何实现？**
   核心组件逻辑（state 管理、业务逻辑、Hooks）可在 Web 和 Native 间共享。平台差异部分（`<div>` vs `<View>`）通过 React Native 的桥接层或 React Native Web 适配。Next.js 则扩展到 SSR/SSG 场景。

---

## 91. React 中 props.children 和 React.Children 的区别

**记忆口诀：**「children 直接渲染，React.Children 遍历改造」

**核心要点：**
- `props.children` 是父组件传入的子元素，可直接渲染
- `React.Children` 提供工具方法遍历、映射、计数子元素，可逐个修改 props
- 需要给所有子组件注入统一 props 时用 `React.Children.map` + `cloneElement`

**props.children：**

父组件传入的子 JSX 会作为 `props.children` 传递给子组件，直接渲染即可：

```jsx
function Layout({ children }) {
  return <div className="layout">{children}</div>
}

<Layout>
  <Header />
  <Main />
</Layout>
```

**React.Children：**

当需要对每个子元素进行操作（如注入 props、过滤特定类型）时，使用 `React.Children` API：

```jsx
function RadioGroup({ name, children }) {
  return (
    <div>
      {React.Children.map(children, child => {
        if (child.type === RadioOption) {
          return React.cloneElement(child, { name })  // 给每个 Radio 注入 name
        }
        return child
      })}
    </div>
  )
}
```

**常用 API：**

| 方法 | 作用 |
| --- | --- |
| `React.Children.map` | 遍历子元素并映射（类似 Array.map） |
| `React.Children.forEach` | 遍历但不返回值 |
| `React.Children.count` | 统计子元素数量 |
| `React.Children.only` | 断言只有一个子元素 |
| `React.Children.toArray` | 转为扁平数组 |

**关键区别：** `React.Children.map` 能正确处理 `null`、`undefined`、单个元素和数组等多种 children 形态，而原生 JS 的 `map` 无法处理这些边界情况。

### 面试追问

1. **React.Children.map 和直接用 children.map 有什么区别？**
   `props.children` 可能是单个元素、数组、字符串或 null，不一定有 `.map` 方法。`React.Children.map` 统一处理这些形态。此外，React 18 之前 children 可能是 opaque 结构，直接 map 可能出错。

2. **cloneElement 有什么使用场景和注意事项？**
   用于在父组件中给子组件追加 props（如 RadioGroup 注入 name）。注意 `cloneElement` 会浅合并 props，子组件原有 props 优先级更高。React 官方更推荐通过 Context 传递共享数据，而非 cloneElement。

---

## 92. React 的状态提升是什么？使用场景有哪些？

**记忆口诀：**「共享 state 提到最近公共父组件，props 下发」

**核心要点：**
- 多个组件需要共享同一 state 时，将 state 提升到它们最近的共同父组件
- 父组件通过 props 将 state 和更新函数传给子组件
- 体现 React 单向数据流：子组件通过回调通知父组件更新

**概念：**

当几个组件需要共用同一份数据时，不应在各组件内部各自维护 state，而应将 state **提升到它们最近的共同祖先组件**中，由父组件统一管理，再通过 props 分发给子组件。

**典型场景：**

- 多个输入框联动（一个输入控制另一个显示）
- 兄弟组件间通信（如 TodoList 的 Filter 和 List 共享 filter 状态）
- 表单中多个字段的联动校验

**示例：两个输入框联动**

```jsx
function Parent() {
  const [value, setValue] = useState('')

  return (
    <div>
      <Input1 value={value} onChange={setValue} />
      <Input2 value={value} />  {/* 显示 Input1 的值 */}
    </div>
  )
}

function Input1({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}

function Input2({ value }) {
  return <input value={value} readOnly />
}
```

**与 Redux/Context 的关系：**

状态提升适合**局部、少量组件**共享 state。当多个层级、多个不相关组件都需要同一份数据时，应使用 Context 或 Redux 等全局状态管理方案，避免"prop drilling"。

### 面试追问

1. **状态提升和 Context 怎么选？**
   仅 2-3 层组件共享、数据变更不频繁 → 状态提升。跨多层组件、多处消费、频繁更新 → Context 或状态管理库。Context 值变化会导致所有消费者重渲染，高频更新场景需拆分 Context 或使用 Zustand 等细粒度方案。

2. **状态提升会导致父组件频繁重渲染吗？如何优化？**
   会。父组件 state 变化会重渲染所有子组件。优化方式：将 state 拆到尽可能低的层级（不要无脑提到最顶层）；子组件用 `React.memo` 包裹；更新函数用 `useCallback` 缓存。

---

## 93. React 中 constructor 和 getInitialState 的区别

**记忆口诀：**「getInitialState 是 ES5 旧 API，constructor 是 ES6 标准」

**核心要点：**
- 两者都用于初始化组件 state，作用相同
- `getInitialState` 是 `React.createClass`（ES5）的 API，已废弃
- `constructor` 是 ES6 class 的标准写法，现代 React 推荐使用

**getInitialState（已废弃）：**

```jsx
// React.createClass 时代（ES5）
var App = React.createClass({
  getInitialState() {
    return { userName: 'hi', userId: 0 }
  },
  render() { /* ... */ }
})
```

**constructor（现代写法）：**

```jsx
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { userName: 'hi', userId: 0 }
  }
  render() { /* ... */ }
}
```

**函数组件等价写法：**

```jsx
function App() {
  const [userName, setUserName] = useState('hi')
  const [userId, setUserId] = useState(0)
  // ...
}
```

**主要区别：**

| 对比项 | getInitialState | constructor |
| --- | --- | --- |
| 所属 API | React.createClass | ES6 class |
| 状态 | 已废弃 | 现行标准 |
| 初始化方式 | 返回 state 对象 | `this.state = {}` |
| 是否需要 super | 不需要 | 必须 `super(props)` |

### 面试追问

1. **constructor 中为什么要调用 super(props)？**
   不调用 `super(props)` 则 `this` 未绑定，无法访问 `this.props` 和 `this.state`。在 constructor 中需要使用 props 初始化 state 时（如 `this.state = { value: props.initialValue }`），必须传 props 给 super。

2. **函数组件还需要 constructor 吗？**
   不需要。函数组件用 `useState` 初始化 state，没有 constructor 概念。若需要在挂载前做一次性计算，可用 `useState(() => expensiveComputation())` 惰性初始化。

---

## 94. React 的严格模式如何使用，有什么用处？

**记忆口诀：**「StrictMode 不渲染 UI，开发环境帮你找隐患」

**核心要点：**
- `<React.StrictMode>` 包裹组件树，仅在开发环境生效
- 检测过时 API、意外副作用、不安全生命周期等潜在问题
- 不会渲染任何可见 UI，类似 Fragment

**使用方式：**

```jsx
import React from 'react'

function App() {
  return (
    <React.StrictMode>
      <Header />
      <Main />
      <Footer />
    </React.StrictMode>
  )
}
```

也可只包裹部分组件，被包裹的子树才会做额外检查。

**StrictMode 检测内容：**

- **不安全生命周期**：警告 `componentWillMount`、`componentWillReceiveProps` 等
- **过时的 ref API**：警告字符串 ref
- **过时的 Context API**：警告 legacy context
- **意外的副作用**：开发环境故意**双重调用** render 和 effect，暴露缺少 cleanup 的问题
- **过时的 findDOMNode**

**注意：**

- 只在开发环境生效，生产环境无影响
- React 18 StrictMode 会双重挂载/卸载组件，确保 effect cleanup 正确
- 不是错误边界，不能捕获渲染错误

### 面试追问

1. **StrictMode 双重调用 effect 会导致开发环境请求发两次吗？**
   会。开发环境下 `useEffect` 执行 → cleanup → 再执行。若 effect 中有数据请求且没有 cleanup 取消机制，确实会发两次请求。这是故意设计，提醒开发者 effect 必须有正确的 cleanup（如 AbortController）。

2. **生产环境需要移除 StrictMode 吗？**
   不需要手动移除，StrictMode 在生产环境自动失效，零开销。保留在代码中可持续在开发时获得检查能力。Create React App 和 Vite 模板默认已包裹 StrictMode。

---

## 95. 在 React 中遍历的方法有哪些？

**记忆口诀：**「数组 map 渲染，对象 entries，Children 遍历子组件」

**核心要点：**
- 数组：用 `map` 返回 JSX 列表（不要用 forEach，它不返回值）
- 对象：用 `Object.entries` + `map` 或 `for...in` + IIFE
- 子组件：用 `React.Children.map` 遍历 props.children

**（1）遍历数组 — map**

```jsx
const list = ['a', 'b', 'c']
return (
  <ul>
    {list.map((item, index) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)
```

注意：`forEach` 不返回新数组，不能用于 JSX 渲染。

**（2）遍历对象**

```jsx
const obj = { a: 1, b: 2, c: 3 }

// 方式一：Object.entries + map（推荐）
{Object.entries(obj).map(([key, value]) => (
  <li key={key}>{value}</li>
))}

// 方式二：for...in + IIFE
{(() => {
  const items = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      items.push(<li key={key}>{obj[key]}</li>)
    }
  }
  return items
})()}
```

**（3）遍历子组件 — React.Children.map**

```jsx
{React.Children.map(children, (child, index) => (
  <div key={index} className="wrapper">{child}</div>
))}
```

### 面试追问

1. **为什么 JSX 中不能用 for 循环直接渲染列表？**
   JSX 花括号内需要是**表达式**，而 `for` 是语句不是表达式。可用 IIFE 包裹 `for` 循环（`( () => { ... return arr } )()`），但 `map` 更简洁 idiomatic。

2. **Object.keys、Object.values、Object.entries 遍历对象各有什么场景？**
   `Object.keys` 只需 key 时用；`Object.values` 只需 value 时用；`Object.entries` 同时需要 key 和 value 时用（渲染对象列表最常见）。三者时间复杂度相同，选最语义化的即可。

---

## 96. 在 React 中页面重新加载时怎样保留数据？

**记忆口诀：**「持久化四方案：Redux-persist、localStorage、sessionStorage、History API」

**核心要点：**
- 页面刷新会清空内存中的 React state，需要持久化到浏览器存储
- 全局状态用 redux-persist / Zustand persist
- 临时数据用 sessionStorage 或 History API 的 state

**常见方案：**

**（1）Redux + redux-persist**

将 Redux store 同步到 localStorage，刷新后自动恢复。适合全局状态（用户信息、主题设置等）。

**（2）localStorage / sessionStorage**

- `localStorage`：永久存储，手动清除或过期策略
- `sessionStorage`：标签页关闭后清除，适合临时数据（如表单草稿、页面间传参）

```jsx
// 离开页面前保存
useEffect(() => {
  return () => sessionStorage.setItem('formData', JSON.stringify(form))
}, [form])

// 进入页面时恢复
const saved = sessionStorage.getItem('formData')
const [form, setForm] = useState(saved ? JSON.parse(saved) : initialForm)
```

**（3）History API（react-router）**

路由跳转时通过 `state` 传递数据，返回时可恢复：

```jsx
navigate('/detail', { state: { from: 'list', data: item } })
const location = useLocation()
const prevData = location.state?.data
```

**（4）URL 参数**

将必要数据编码到 URL query 中，刷新后从 URL 解析恢复。适合搜索条件、分页等。

**（5）服务端存储**

关键数据存数据库，刷新后重新请求。最可靠但依赖网络。

### 面试追问

1. **sessionStorage 和 localStorage 在 React 应用中怎么选？**
   需要跨标签页共享、长期保留（如登录 token、用户偏好）→ localStorage。仅在当前标签页会话内有效（如多步表单中间状态、页面间临时传参）→ sessionStorage。敏感数据两者都不安全，应 HttpOnly Cookie + 服务端 session。

2. **如何用自定义 Hook 封装 localStorage 持久化？**
   ```jsx
   function useLocalStorage(key, initialValue) {
     const [value, setValue] = useState(() => {
       const stored = localStorage.getItem(key)
       return stored ? JSON.parse(stored) : initialValue
     })
     useEffect(() => {
       localStorage.setItem(key, JSON.stringify(value))
     }, [key, value])
     return [value, setValue]
   }
   ```

---

## 97. 同时引用 react.js、react-dom.js 和 babel.js 它们都有什么作用？

**记忆口诀：**「react 核心，react-dom 渲染，babel 转 JSX」

**核心要点：**
- `react.js`：React 核心库（createElement、Component、Hooks 等）
- `react-dom.js`：DOM 渲染器，将 React 元素渲染到浏览器 DOM
- `babel.js`：编译工具，将 JSX 语法转换为 `React.createElement` 调用

**三个库的分工：**

| 库 | 作用 | 类比 |
| --- | --- | --- |
| `react.js` | 组件定义、状态管理、Hooks、Virtual DOM 逻辑 | 引擎 |
| `react-dom.js` | 将 React 元素渲染/更新到浏览器 DOM（`ReactDOM.render` / `createRoot`） | 驱动 |
| `babel.js` | 将 JSX 语法编译为浏览器可执行的 JS（`React.createElement(...)`） | 翻译器 |

**为什么分开？**

React 核心与平台无关（`react`），渲染层因平台而异（`react-dom` 用于 Web，`react-native` 用于移动端）。这种分离实现了"一次学习，随处编写"。

**现代项目：**

实际开发中不会直接引入这三个 CDN 脚本，而是通过 npm + webpack/Vite 构建：
- `react` 和 `react-dom` 作为 npm 依赖
- Babel 或 SWC 作为构建工具内嵌，编译 JSX

### 面试追问

1. **react-dom 和 react 能不能只引一个？**
   不能。`react` 定义组件和状态逻辑，但不包含 DOM 操作。`react-dom` 依赖 `react`，提供 `createRoot`、`render` 等 DOM 渲染 API。服务端渲染则用 `react-dom/server`。

2. **不用 Babel 能写 React 吗？**
   可以，直接写 `React.createElement('div', null, 'Hello')` 而不写 JSX。但 JSX 大幅提升了开发体验，现代构建工具（Vite、CRA）都内置 JSX 编译，无需手动配置 Babel。

---

## 98. React 必须使用 JSX 吗？

**记忆口诀：**「JSX 是语法糖，createElement 才是本体」

**核心要点：**
- React 不强制使用 JSX，JSX 是 `React.createElement` 的语法糖
- 每个 JSX 元素编译后等价于一个 `createElement` 调用
- 不用 JSX 时直接调用 `React.createElement` 即可

**JSX 写法：**

```jsx
function Hello({ toWhat }) {
  return <div>Hello {toWhat}</div>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Hello toWhat="World" />
)
```

**等价的无 JSX 写法：**

```jsx
function Hello({ toWhat }) {
  return React.createElement('div', null, `Hello ${toWhat}`)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(Hello, { toWhat: 'World' })
)
```

**何时不用 JSX：**
- 不想配置 JSX 编译环境
- 动态创建大量结构相似的元素（用 `createElement` 循环更简洁）
- 某些代码生成工具直接产出 `createElement` 调用

**结论：** JSX 不是必须的，但它是 React 生态的标准写法，可读性和开发效率远高于纯 `createElement`。

### 面试追问

1. **JSX 和 HTML 有什么本质区别？**
   JSX 是 JavaScript 语法扩展，编译后为 JS 函数调用。差异包括：`className` 代替 `class`、`htmlFor` 代替 `for`、自闭合标签必须闭合、属性值为 JS 表达式（`{变量}`）、必须有一个根元素（或 Fragment）。

2. **为什么 JSX 中组件名必须大写开头？**
   小写标签（`<div>`）编译为字符串 `'div'`，创建 DOM 元素。大写开头（`<MyComponent>`）编译为变量引用，创建 React 组件实例。这是 JSX 区分 HTML 元素和 React 组件的约定。

---

## 99. 为什么使用 JSX 的组件中没有看到使用 React 却需要引入 React？

**记忆口诀：**「17 前 JSX 编译要 React，17 后自动注入」

**核心要点：**
- JSX 本质是 `React.createElement()` 的语法糖，编译后需要 React 在作用域内
- React 17 之前：每个 JSX 文件必须 `import React from 'react'`
- React 17 之后：新 JSX 转换自动注入，无需手动 import

**React 17 之前：**

Babel 将 JSX 编译为 `React.createElement(...)` 调用，因此 React 必须在作用域内：

```jsx
// 源码
<div>Hello</div>

// 编译后
React.createElement('div', null, 'Hello')
```

所以即使代码中没有显式写 `React`，编译后的代码依赖 `React.createElement`，必须 `import React from 'react'`。

**React 17 新 JSX 转换：**

编译器自动从 `react/jsx-runtime` 导入 `jsx` 函数，无需手动 import：

```jsx
// 编译后
import { jsx as _jsx } from 'react/jsx-runtime'
_jsx('div', { children: 'Hello' })
```

**如何启用：** Create React App 4+、Vite、Next.js 等现代工具链默认已启用新转换。旧项目可在 Babel 配置中设置：

```json
{
  "presets": [["@babel/preset-react", { "runtime": "automatic" }]]
}
```

### 面试追问

1. **react/jsx-runtime 和 React.createElement 有什么区别？**
   新转换使用 `jsx(type, props, key)` 函数，比 `createElement` 更简洁（不需要 `...children` 展开）。且静态元素可在编译期优化（如 React 19 的 React Compiler 进一步消除不必要的创建）。

2. **TypeScript 项目中 JSX 不 import React 会报类型错误吗？**
   需要在 `tsconfig.json` 中设置 `"jsx": "react-jsx"`（React 17+ 新转换）。旧配置 `"jsx": "react"` 仍要求 React 在作用域内。设置正确后 TypeScript 也不会报 `'React' refers to a UMD global` 错误。

---

## 100. 在 React 中怎么使用 async/await？

**记忆口诀：**「effect 里写 async 函数再调用，事件处理器可直接 async」

**核心要点：**
- 事件处理器可以直接声明为 `async` 函数
- `useEffect` 回调不能直接 async，需内部定义 async 函数再调用
- 旧项目需配置 Babel 支持 async/await 语法

**（1）事件处理器中直接使用**

```jsx
const handleClick = async () => {
  const res = await fetch('/api/data')
  const data = await res.json()
  setData(data)
}

<button onClick={handleClick}>加载</button>
```

**（2）useEffect 中间接使用**

`useEffect` 的回调不能是 async 函数（因为 async 函数返回 Promise，而 useEffect 期望返回 cleanup 函数或 undefined）：

```jsx
// ❌ 错误
useEffect(async () => {
  const data = await fetchData()
  setData(data)
}, [])

// ✅ 正确
useEffect(() => {
  const loadData = async () => {
    const data = await fetchData()
    setData(data)
  }
  loadData()
}, [])
```

**（3）Babel 配置（旧项目）**

若遇到 `regeneratorRuntime is not defined`，需配置 Babel：

```json
{
  "plugins": ["@babel/plugin-transform-async-to-generator"]
}
```

现代 CRA / Vite 项目已内置支持，可直接使用。

### 面试追问

1. **useEffect 中 async 请求如何在组件卸载后避免 setState？**
   使用 AbortController 或 mounted 标志位：
   ```jsx
   useEffect(() => {
     const controller = new AbortController()
     fetchData({ signal: controller.signal }).then(setData)
     return () => controller.abort()
   }, [])
   ```

2. **Suspense 和 async/await 在数据请求中怎么配合？**
   React 18 的 Suspense 数据请求需配合 `use` Hook 或框架（Next.js、Relay）的缓存机制。传统 async/await 在 effect 中请求仍是主流做法，Suspense 更适合框架级数据层集成。

---

## 101. React.Children.map 和 JS 的 map 有什么区别？

**记忆口诀：**「Children.map 处理 null/undefined，JS map 不行」

**核心要点：**
- JS 原生 `map` 只能用于数组，`null`/`undefined` 会报错
- `React.Children.map` 专门处理 React children 的各种形态
- children 可能是单元素、数组、null、undefined 或混合结构

**核心区别：**

```jsx
const children = null

// ❌ JS map 报错
children.map(child => child)  // TypeError

// ✅ React.Children.map 安全处理
React.Children.map(children, child => child)  // 返回 null
```

**React.Children.map 能处理的 children 形态：**

- 单个 React 元素、元素数组
- `null` / `undefined`（直接返回 null）
- 字符串 / 数字（文本节点）
- 嵌套数组（自动扁平化一层）

需要对 `props.children` 逐个操作（注入 props、包裹 wrapper、过滤类型）时，应使用 `React.Children.map`。

### 面试追问

1. **React.Children.toArray 和 React.Children.map 有什么区别？**
   `toArray` 将 children 转为扁平数组，方便用原生数组方法操作。`map` 在遍历的同时映射为新元素。`toArray` 还会为没有 key 的元素自动添加后缀 key，避免警告。

2. **React 18 中 children 的类型有什么变化？**
   React 18 将 children 类型从 opaque 结构改为更标准的 `React.ReactNode`。对开发者而言，`React.Children` API 行为不变，仍是处理 children 的推荐方式。

---

## 102. 对 React SSR 的理解

**记忆口诀：**「服务端出 HTML，客户端 hydrate，SEO 和首屏双赢」

**核心要点：**
- SSR 在服务端将组件渲染为 HTML 字符串，发送到浏览器
- 客户端 hydration 为静态 HTML 绑定事件，变为可交互应用
- 优势：SEO 友好、首屏快；劣势：服务端压力、开发复杂度

**SSR 流程：**

```
服务端：组件 + 数据 → renderToString → HTML 字符串 → 发送给浏览器
客户端：接收 HTML（首屏可见）→ 加载 JS → hydration（绑定事件）→ 可交互 SPA
```

**对比 CSR（客户端渲染）：**

| 对比项 | CSR | SSR |
| --- | --- | --- |
| 首屏 | 白屏等待 JS 加载执行 | 服务端直接返回 HTML，立即可见 |
| SEO | 爬虫拿到空 body | 爬虫拿到完整 HTML |
| 服务端压力 | 低 | 高（每个请求都要渲染） |
| 交互时间 | JS 加载完即可交互 | 需 hydration 完成 |

**优势：**

1. **SEO 友好**：爬虫直接获取完整 HTML 内容
2. **首屏速度快**：用户无需等待 JS 下载执行即可看到页面
3. **低端设备体验好**：减少客户端渲染计算量

**劣势：**

1. **服务端压力大**：高并发时 CPU 占用高
2. **开发限制**：服务端只执行到数据获取，无 DOM/BOM API
3. **复杂度增加**：同构代码需处理两端环境差异
4. **TTFB 可能增加**：服务端渲染耗时

**React SSR 方案：** Next.js（推荐）、Remix、手动 `renderToString` / `renderToPipeableStream`（React 18 流式 SSR）。

### 面试追问

1. **SSR 和 SSG（静态站点生成）有什么区别？**
   SSR 是每次请求时在服务端动态渲染 HTML。SSG 是在构建时预渲染 HTML，部署为静态文件。SSG 性能最好（CDN 直出），但不适合个性化/实时数据页面。Next.js 同时支持 SSR（`getServerSideProps`）和 SSG（`getStaticProps`）。

2. **hydration 是什么？和不 hydration 直接 CSR 有什么区别？**
   hydration 是 React 在客户端"激活"服务端渲染的 HTML——复用已有 DOM 结构并绑定事件处理器和 state。若不 hydration 直接 CSR，React 会丢弃 SSR 的 HTML 重新渲染，浪费服务端工作且可能闪烁。hydration mismatch（服务端和客户端渲染不一致）会导致 React 警告并强制客户端重渲染。

---

## 103. 为什么 React 要用 JSX？

**记忆口诀：**「JSX 是语法糖，树结构 XML 可读强，编译成 createElement」

**核心要点：**
- JSX 是 JavaScript 语法扩展，结构类似 XML，描述 UI 树结构可读性强
- 编译后等价于 `React.createElement` 调用，不是浏览器原生语法
- React 团队不引入 JS 以外的开发体系，JSX 仍是 JS

**JSX 的价值：**

React 需要将组件描述为一棵 UI 树。XML/HTML 在**树结构描述**上天生可读性强，JSX 借用了这种直观性：

```jsx
// JSX：结构清晰
<div className="card">
  <h1>{title}</h1>
  <p>{content}</p>
</div>

// 等价 createElement：嵌套深时可读性差
React.createElement('div', { className: 'card' },
  React.createElement('h1', null, title),
  React.createElement('p', null, content)
)
```

**JSX 不是必须的：**

React 不强制 JSX，可直接写 `createElement`。JSX 只是语法糖，Babel 编译后仍是 JS 函数调用。

**React 团队的设计哲学：**

- 不引入 JavaScript 以外的模板语言（如 Vue 的 .vue 文件）
- 通过合理的关注点分离保持组件开发的纯粹性
- "Just JavaScript"——UI 就是 JS 函数的返回值

### 面试追问

1. **JSX 和模板引擎（如 Handlebars）有什么本质区别？**
   模板引擎是字符串替换，在运行时拼接 HTML。JSX 编译为 JS 函数调用，产出的是 Virtual DOM 对象而非 HTML 字符串。JSX 中可以使用任意 JS 表达式（map、三元、函数调用），表达力远超模板引擎。

2. **为什么 JSX 文件扩展名是 .jsx 而不是 .js？**
   历史原因是让工具（Babel、编辑器）识别文件含 JSX 语法并正确编译/高亮。React 17 新 JSX 转换后，`.js` 文件也可以写 JSX（CRA、Vite 默认支持）。`.tsx` 则用于 TypeScript + JSX。

---

## 104. HOC 相比 mixins 有什么优点？

**记忆口诀：**「HOC 无隐式依赖、无命名冲突、更函数式」

**核心要点：**
- mixins 存在隐式依赖、命名冲突、维护雪球效应等问题
- HOC 通过包装组件显式传递 props，依赖关系清晰
- HOC 更函数式，与 React 组件即函数的理念一致

**mixins 的问题：**

1. **隐式依赖**：组件使用了 mixin 中的 state 或方法，形成隐藏依赖。移除 mixin 时需全局搜索哪些组件依赖了它
2. **命名冲突**：多个 mixin 或组件本身可能有同名方法，后者静默覆盖前者，难以调试
3. **雪球效应**：一个 mixin 被多个组件使用，修改 mixin 可能影响所有使用者，维护成本指数增长
4. **class 专属**：React 16 全面拥抱函数组件和 Hooks 后，mixins 无法用于函数组件

**HOC 的优势：**

1. **显式依赖**：HOC 通过 props 传递增强能力，依赖关系在 JSX 中一目了然
2. **无命名冲突**：每个 HOC 包装独立，props 命名由 HOC 控制
3. **可组合**：多个 HOC 可以 compose（`compose(withAuth, withLogging)(Component)`）
4. **函数式**：HOC 是纯函数，输入组件输出增强组件，易于测试
5. **与 Hooks 共存**：HOC 适合包装展示层，Hooks 适合复用逻辑，两者互补

### 面试追问

1. **HOC 有什么问题？Hooks 如何替代？**
   HOC 的问题：嵌套过多（wrapper hell）、ref 需要转发、props 来源不明确、静态属性丢失。Hooks 通过自定义 Hook（如 `useAuth()`）直接复用逻辑，不改变组件树结构，是官方推荐的复用方式。HOC 仍适合权限包裹、错误边界等横切关注点。

2. **多个 HOC 嵌套怎么解决 ref 和 props 问题？**
   使用 `React.forwardRef` 转发 ref。props 冲突可通过 HOC 约定命名空间（如 `withAuth` 注入 `auth` prop 对象而非散列属性）。或使用 compose 工具函数合并多个 HOC 为一个。

---

## 105. React 中的高阶组件运用了什么设计模式？

**记忆口诀：**「HOC 是装饰器模式，外层包壳不改动原组件」

**核心要点：**
- HOC 运用**装饰器模式（Decorator Pattern）**
- 在不修改原组件的情况下，通过外层包装增强功能
- 返回一个新组件，将 props 和增强的 state/props 传递给原组件

**装饰器模式：**

动态地给对象（组件）添加新功能，而不改变其原有结构。HOC 接收一个组件，返回一个包装后的新组件：

```jsx
function withWindowWidth(BaseComponent) {
  return function WrappedComponent(props) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(() => {
      const onResize = () => setWindowWidth(window.innerWidth)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }, [])

    return <BaseComponent {...props} windowWidth={windowWidth} />
  }
}

const MyComponent = ({ windowWidth }) => (
  <div>Window width: {windowWidth}</div>
)

export default withWindowWidth(MyComponent)
```

**装饰器模式的特点：**
- **不修改原组件**：BaseComponent 完全不知道被包装
- **透明增强**：外部使用者只看到增强后的组件
- **可叠加**：多个装饰器可以层层包装

**JavaScript 装饰器提案：**

ES 装饰器语法提供了原生支持（Stage 3）：

```jsx
@withWindowWidth
class MyComponent extends React.Component { /* ... */ }
```

功能等价于 HOC，但语法更简洁。React 社区目前仍以 HOC 函数和自定义 Hook 为主。

### 面试追问

1. **HOC 和装饰器模式中的"代理模式"有什么区别？**
   装饰器模式增强原对象功能，两者接口一致，外部无感知。代理模式控制对原对象的访问（如权限检查、缓存），可能改变行为。HOC 更接近装饰器——包装后组件的 JSX 用法不变，只是多了额外的 props 或行为。

2. **除了装饰器模式，React 还用到了哪些设计模式？**
   - **观察者模式**：setState 触发订阅者（组件）更新
   - **组合模式**：组件树结构，父组件统一管理子组件
   - **策略模式**：不同渲染策略（Concurrent vs Sync）
   - **工厂模式**：`React.createElement` 创建元素对象

---

## 106. React 为什么需要合成事件

**记忆口诀：**「兼容、委托、批更新、事件池（17 前）」

**核心要点：**
- 合成事件是对原生事件的跨浏览器封装，统一 API 差异
- 事件委托到根容器（React 17+ 绑定 root），减少内存占用
- 配合 Fiber 批量更新，同一事件回调中多次 setState 只触发一次渲染

**React 合成事件（SyntheticEvent）存在的四个原因：**

**（1）跨浏览器兼容**

统一不同浏览器的事件 API 差异（如 IE 的 `attachEvent` vs 标准的 `addEventListener`），开发者无需关心浏览器兼容性。

**（2）性能优化 — 事件委托**

React 17 之前将所有事件绑定到 `document`，17 之后绑定到 root 容器。无论页面上有多少 DOM 元素，只需一个事件监听器，通过事件冒泡分发到对应的 React 组件。

**（3）与 Fiber 架构协同 — 批量更新**

合成事件配合 React 的批量更新机制。在同一事件回调中多次调用 `setState`，React 会合并为一次重渲染（React 18 自动批处理扩展到所有场景）。

**（4）统一事件对象（React 16 事件池，17 已移除）**

React 16 使用事件池复用 SyntheticEvent 对象，减少 GC 压力。React 17 移除了事件池，因为现代 JS 引擎 GC 性能已足够好，事件池反而增加了异步访问事件的复杂度。

**合成事件 vs 原生事件：**

```jsx
// 合成事件
<button onClick={handleClick}>Click</button>

// 原生事件（需 ref）
<button ref={btn => btn?.addEventListener('click', handleClick)}>Click</button>
```

合成事件通过 `e.nativeEvent` 可访问原生事件。混用两者时注意执行顺序：原生事件先触发（绑定在 DOM 上），合成事件后触发（事件委托）。

### 面试追问

1. **React 17 为什么把事件委托从 document 改到 root 容器？**
   为了支持微前端场景——页面中可能存在多个 React 应用（不同版本），事件不应全部冒泡到 document 后被错误的 React 实例处理。绑定到各自的 root 容器实现了隔离，也更好兼容 Web Components 嵌套 React 的场景。

2. **合成事件中调用 e.stopPropagation 能阻止原生事件吗？**
   不能。合成事件的 `stopPropagation` 只阻止 React 合成事件系统中的冒泡，不影响原生 DOM 事件。若需阻止原生冒泡，应通过 `e.nativeEvent.stopImmediatePropagation()`。

---

## 107. React 元素中 $$typeof 的作用

**记忆口诀：**「Symbol 身份标识，防 JSON 注入 XSS」

**核心要点：**
- `$$typeof` 是 React 元素的安全标识，值为 `Symbol.for('react.element')`
- 防止攻击者通过 JSON 注入伪造 React 元素对象
- JSON 无法表示 Symbol，因此无法伪造合法的 React 元素

**背景：**

React 元素本质是一个普通 JS 对象：

```jsx
{
  type: 'div',
  props: { children: 'Hello' },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element')  // 安全标识
}
```

**安全问题：**

若服务端允许用户存储/提交 JSON 数据，攻击者可构造如下恶意对象：

```json
{
  "type": "div",
  "props": {
    "dangerouslySetInnerHTML": { "__html": "<img onerror='alert(1)' src=''>" }
  }
}
```

若 React 直接渲染此对象，会执行恶意脚本（XSS 攻击）。

**$$typeof 的防护机制：**

1. 每个合法 React 元素都有 `$$typeof: Symbol.for('react.element')`
2. 渲染前 React 校验 `$$typeof` 是否为合法 Symbol
3. JSON 不支持 Symbol 类型，攻击者无法通过 JSON 注入伪造 `$$typeof`
4. 不支持 Symbol 的旧环境回退为数字 `0xeac7`

**结论：** `$$typeof` 是 React 0.14 引入的安全机制，确保只有 React 自己创建的元素对象才会被渲染。

### 面试追问

1. **如果攻击者直接在 JS 代码中构造 React 元素对象呢？**
   `$$typeof` 只防 JSON 反序列化注入场景。若攻击者能执行任意 JS，安全边界已突破，任何防御都无效。此机制针对的是"服务端存储用户 JSON 数据并在 React 中渲染"这一特定攻击向量。

2. **React 还有哪些类似的内部 Symbol 标识？**
   - `Symbol.for('react.fragment')` — Fragment 元素
   - `Symbol.for('react.portal')` — Portal 元素
   - `Symbol.for('react.provider')` / `Symbol.for('react.context')` — Context
   - `Symbol.for('react.forward_ref')` — forwardRef 组件
   - `Symbol.for('react.memo')` — memo 组件
   - `Symbol.for('react.lazy')` — lazy 组件

---

## 108. React 如何拆分组件？原则是什么？

**记忆口诀：**「单一职责、可复用、分层抽象、高内聚低耦合」

**核心要点：**
- 遵循单一职责、可复用、分离关注点等原则
- 展示组件（UI）与容器组件（逻辑）分离
- 实操信号：render 超 100 行或 props 超 10 个时考虑拆分

**组件拆分七原则：**

**1. 单一职责（SRP）**
一个组件只负责一个功能。组件过于庞大时，按职责拆成多个小组件。

**2. 可复用性**
通用 UI 和逻辑封装为独立组件，通过 props 传参，避免硬编码数据。

**3. 单一抽象层次**
同一组件内不混合高层业务逻辑与底层 UI 渲染。业务逻辑提取到 Hook 或容器组件。

**4. 分离关注点**
- **展示组件（Presentational）**：只负责 UI 渲染，通过 props 接收数据和回调
- **容器组件（Container）**：负责数据获取、状态管理、业务逻辑

**5. 高内聚低耦合**
组件内部功能集中相关，组件间通过 props/回调通信，减少直接依赖。

**6. 可测试性**
小组件职责清晰，便于单元测试。展示组件可独立测试 UI，容器组件可 mock 数据测试逻辑。

**7. 命名与文档**
组件、props、方法命名语义化，复杂组件补充注释说明用途和 props 含义。

**实操判断标准：**

- render 函数超过 **100 行** → 考虑拆分
- props 超过 **10 个** → 考虑合并相关 props 或拆分
- 一个组件有多个 `useEffect` 处理不相关逻辑 → 按功能拆分
- 多处重复使用相同 JSX 结构 → 提取为公共组件

**拆分示例：**

```jsx
// ❌ 一个大组件
function UserPage() {
  // 100+ 行：数据请求 + 表单 + 列表 + 分页 ...
}

// ✅ 拆分后
function UserPage() {
  return (
    <div>
      <UserSearch onSearch={handleSearch} />
      <UserTable data={users} />
      <Pagination total={total} onChange={handlePageChange} />
    </div>
  )
}
```

### 面试追问

1. **展示组件和容器组件的划分在 Hooks 时代还有意义吗？**
   概念仍有价值但实现方式变了。Hooks 时代不再严格区分两种组件文件，而是用自定义 Hook 提取逻辑（容器职责），组件本身专注 UI（展示职责）。如 `useUserList` Hook 管理数据，`UserList` 组件只负责渲染。

2. **如何判断一个组件该不该拆？拆太细会有什么问题？**
   拆太细会导致 props drilling、文件数量爆炸、过度抽象。判断标准：如果拆分后的子组件不会被复用，且拆分不能提升可读性或可测试性，则不必拆。遵循"三次法则"——同样的代码出现三次再提取。
