## 基本概念

- 是什么：

- 受控组件：当一个表单组件被外层以 props 传递 value、以事件回调处理输入的时候，符合这两个条件之后，组件值会被托管到 react 体系中，也就可以称这个组件为受控组件

```jsx
const Comp1 = function () {
  const [text, setText] = useState("");
  return (
    <>
      <label>受控组件: </label>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </>
  );
};
```

- 非受控组件：通过 DOM 元素获取表单数据（比如 Ref 获取表单组件的 Input 的 value）的，我们称之为非受控组件

```javascript
const Comp2 = function () {
  const ref = useRef(null);
  const handleClick = () => {
    if (ref.current) {
      console.log(ref.current.value);
    }
  };
  return (
    <>
      <label>非受控组件: </label>
      <input type="text" ref={ref} />
      <button type="button" onClick={handleClick}>
        取值
      </button>
    </>
  );
};
```

- PS：非受控组件场景，可通过 `defaultValue`设置初始化值

- 为什么：这是 react 下表单(带交互能力)组件的编程模式，由于 react 不支持双向绑定，我们需要同时设置 value 与对应的 onchange 事件(相当于 v-model)，之后才能持续跟踪状态变化

## 深入理解

- 受控组件

- 优点：

- 更符合 mvvm 响应式数据思维
- 受控组件的修改会实时映射到状态值上，我们可以实时做一些校验、格式限制、关联禁用隐藏之类的事情

- 缺点：

- 代码量较多(挺啰嗦的)
- 可能存在性能浪费，容易踩坑

- 非受控组件

- 优点：

- 代码量更少
- 性能相对不太会浪费

- 缺点：

- 获取状态的逻辑相当于直接操作 dom，违背 react 编程思维
- 功能薄弱，比较难做一些实时校验的事情，无法限制输入内容、输入格式

- 深度理解

- 这其实是一个“相对”概念
- 在过往 jQuery (或者说命令式编程)时代，往往不需要时刻关注具体表单值，直到某类事件发生时再一次性取值
- vue 提供了 v-model 指令，一个能够节约代码量的语法糖
- antd 中的实现：

1. [4.x 版本](https://github.com/ant-design/ant-design/blob/ae26f76d945c462b6315ebd4a3740a9fd61ca610/components/input/Input.tsx#L73)：

1. 内部维护 state，不论有没有传入 props.value，都以内部 state 为准，如传入 Props.value，则使用类组件的`getDerivedStateFromProps`拷贝 value 值。
2. 只要父组件传递了 onChange 事件，就会调用，但调用时也会通过 setState，维护内部 state 的值。

1. [4.1x 后版本](https://github.com/react-component/input/blob/master/src/Input.tsx#L42)：

1. 内部使用了 rc-input，数据直接由 props.value 传递到 rc-input 里，rc-input 是一个函数式组件，它内部使用了[ useMergedState hook](https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts#L27) ，每次 props.value 的改变都会触发 hook，返回最新的 value 给 rc-input。
2. 每次修改 input，都会触发 useMergedState 的修改方法，修改内部的 value，同时触发外部 onChange 事件。
