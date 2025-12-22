1. ### React v16.0 前的生命周期

  ![img](https://cdn.nlark.com/yuque/0/2023/png/106346/1694005498207-a379026f-f008-444d-80e3-469313e4559a.png?x-oss-process=image%2Fcrop%2Cx_0%2Cy_0%2Cw_1509%2Ch_634)

  1. 挂载阶段:

  - constructor(构造函数)
  - componentWillMount(组件将要渲染)
  - render(渲染组件)
  - componentDidMount(组件渲染完成)

  1. 更新阶段: 分两种情况一种是 state 更新、一种是 props 更新

  - componentWillReceiveProps(组件 props 变更)
  - shouldComponentUpdate(组件是否渲染)
  - componentWillUpdate(组件将要更新)
  - render(渲染组件)
  - componentDidUpdate(组件更新完成)

  1. 卸载阶段:

  - componentWillUnmount(组件将要卸载)

  ### React v16.0 后的生命周期

  ![img](https://cdn.nlark.com/yuque/0/2023/png/106346/1694005759240-b4f57064-d7cf-4783-8fb3-18c0055b9607.png)

  1. 挂载阶段:

  - constructor(构造函数)
  - getDerivedStateFromProps(派生 props)
  - render(渲染组件)
  - componentDidMount(组件渲染完成)

  1. 更新阶段:

  - getDerivedStateFromProps(派生 props)
  - componentWillUpdate(组件将要更新)
  - render(渲染组件)
  - getSnapshotBeforeUpdate(获取快照)
  - componentDidUpdate(组件更新完成)

  1. 卸载阶段:

  - componentWillUnmount(组件将要卸载)

  ### getDerivedStateFromProps

  getDerivedStateFromProps 首先它是 静态 方法, 方法参数分别下一个 props、上一个 state, 这个生命周期函数是为了替代 componentWillReceiveProps 而存在的, 主要作用就是监听 props 然后修改当前组件的 state

  ```jsx
  // 监听 props 如果返回非空值, 则将返回值作为新的 state 否则不进行任何处理
  static getDerivedStateFromProps(nextProps, prevState) {
    const { type } = nextProps;
  
    // 返回 nuyll: 对于 state 不进行任何操作
    if (type === prevState.type) {
      return null;
    }
  
    // 返回具体指则更新 state
    return { type }
  }
  ```

  ### getSnapshotBeforeUpdate

  getSnapshotBeforeUpdate 生命周期将在 render 之后 DOM 变更之前被调用, 此生命周期的返回值将作为 componentDidUpdate 的第三个参数进行传递, 当然通常不需要此生命周期, 但在重新渲染期间需要手动保留 DOM 信息时就特别有用

  打印结果:

  **缘由:**

  - 大多数开发者使用 componentWillUpdate 的场景是配合 componentDidUpdate, 分别获取 渲染 前后的视图状态, 进行必要的处理, 但随着 React异步渲染 等机制的到来, 渲染 过程可以被分割成多次完成, 还可以被 暂停 甚至 回溯, 这导致 componentWillUpdate 和 componentDidUpdate 执行前后可能会间隔很长时间, 足够使用户进行交互操作更改当前组件的状态, 这样可能会导致难以追踪的 BUG

  - 所以就新增了 getSnapshotBeforeUpdate 生命周期, 目的就是就是为了解决上述问题并取代 componentWillUpdate, 因为 getSnapshotBeforeUpdate 方法是在 componentWillUpdate 后(如果存在的话), 在 React 真正更改 DOM 前调用的, 它获取到组件状态信息会更加可靠
  - 除此之外, getSnapshotBeforeUpdate 还有一个十分明显的好处: 它调用的结果会作为第三个参数传入 componentDidUpdate 避免了 componentWillUpdate 和 componentDidUpdate 配合使用时将组件临时的状态数据存在组件实例上浪费内存
  - 同时 getSnapshotBeforeUpdate 返回的数据在 componentDidUpdate 中用完即被销毁, 效率更高

  ### React v16.0 之后为什么要删除 Will 相关生命周期

  1. **被删除的生命周期:**

  - componentWillReceiveProps
  - componentWillMount
  - componentWillUpdate

  1. **删除原因:**

  - 这些生命周期方法经常被误解和巧妙地误用
  - 它们的潜在误用可能会在异步渲染中带来更多问题, 同时如果现有项目中使用了这几个生命周期, 将会在控制台输出如下警告! 大致意思就是这几个生命周期将在 18.x 彻底下面, 如果一定要使用可以带上 UNSAFE_ 前缀

  1. **为何移除** **componentWillMount****:** 因为在 异步渲染机制 中允许对组件进行中断停止等操作, 可能会导致单个组件实例 componentWillMount 被多次调用, 很多开发者目前会将事件绑定、异步请求等写在 componentWillMount 中, 一旦异步渲染时 componentWillMount 被多次调用, 将会导致:

  - 进行重复的事件监听, 无法正常取消重复的事件, 严重点可能会导致内存泄漏
  - 发出重复的异步网络请求, 导致 IO 资源被浪费
  - 补充: 现在, React 推荐将原本在 componentWillMount 中的网络请求移到 componentDidMount 中, 至于这样会不会导致请求被延迟发出影响用户体验, React 团队是这么解释的: componentWillMount、render 和 componentDidMount 方法虽然存在调用先后顺序, 但在大多数情况下, 几乎都是在很短的时间内先后执行完毕, 几乎不会对用户体验产生影响。

  1. **为何移除** **componentWillUpdate****:**

  - 大多数开发者使用 componentWillUpdate 的场景是配合 componentDidUpdate, 分别获取 渲染 前后的视图状态, 进行必要的处理, 但随着 React异步渲染 等机制的到来, 渲染 过程可以被分割成多次完成, 还可以被 暂停 甚至 回溯, 这导致 componentWillUpdate 和 componentDidUpdate 执行前后可能会间隔很长时间, 足够使用户进行交互操作更改当前组件的状态, 这样可能会导致难以追踪的 BUG
  - 所以后面新增了 getSnapshotBeforeUpdate 生命周期, 目的就是就是为了解决上述问题并取代 componentWillUpdate, 因为 getSnapshotBeforeUpdate 方法是在 componentWillUpdate 后(如果存在的话), 在 React 真正更改 DOM 前调用的, 它获取到组件状态信息会更加可靠
  - 除此之外, getSnapshotBeforeUpdate 还有一个十分明显的好处: 它调用的结果会作为第三个参数传入 componentDidUpdate 避免了 componentWillUpdate 和 componentDidUpdate 配合使用时将组件临时的状态数据存在组件实例上浪费内存
  - 同时 getSnapshotBeforeUpdate 返回的数据在 componentDidUpdate 中用完即被销毁, 效率更高
