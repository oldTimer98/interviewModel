1. useLayoutEffect 和 useEffect 的区别是什么，大家可能会回答 useEffect 是异步的，useLayoutEffect 是同步的，这样回答面试官真的会满意吗，我们需要说清楚他们在源码中的调用时机。

  - useInsertionEffect: 是 DOM 变更之前执行
  - useLayoutEffect: DOM 已经按照 VDOM 更新了, 此时 DOM 已经在内存中更新了, 但是还没有更新到屏幕上
  - useEffect: 则是浏览器完成渲染之后执行
  - 所以三者执行顺序: useInsertionEffect(DOM 变更前)、useLayoutEffect(DOM 变更后)、useEffect
  - useLayoutEffect 与 useEffect 基本相同, 但它会在所有的 DOM 变更之后 同步 调用, 一般可以使用它来读取 DOM 布局并同步触发重渲染, 为了避免阻塞视觉更新, 我们需要尽可能使用标准的 useEffect
  - useEffect 和 useLayoutEffect 都可用于模拟 componentDidUpdatecomponentDidMount
  - 当父子组件都用到 useEffect 时, 子组件中的会比父组件中的先触发

  

  先来看个例子：点击触发更新之后，如果count之前的状态是0，我们随机生成一个数字，在阻塞一段时间，在设置count位随机值，看看在useEffect和useLayoutEffect这两种情况下会有什么不同

  

  ```javascript
  import React, { useLayoutEffect, useState, useEffect } from "react";
  
  export default function App() {
    const [count, setCount] = useState(0);
  
    //用 useLayoutEffect 试试
    useEffect(() => {
      if (count === 0) {
        const randomNum = Math.random() * 100;//随机生成一个数字
  
        const now = performance.now();
  
        while (performance.now() - now < 100) {//阻塞一段时间
          console.log('blocking...');
        }
  
        setCount(randomNum);//重新设置状态，设置成随机数
      }
    }, [count]);
  
    return <div onClick={() => setCount(0)}>{count}</div>;
  }
  
  //在useEffect的情况下，不断点击触发更新，偶尔会显示0
  //在useLayoutEffect的情况下，不断点击触发更新，不会偶现0
  ```

  在源码中不管首次渲染还是更新的时候都会经历一个阶段叫commit阶段，这个阶段主要的工作就是处理一些钩子函数、生命周期、遍历render阶段形成的EffectList链表，将带有副作用的Fiber节点应用到真实节点上，如果对render阶段不了解可以参阅往期文章 render阶段 ，下面这张图是commit阶段源码的结构图，我们详细的讲解一下。

  ![img](https://cdn.nlark.com/yuque/0/2025/png/21757676/1755523862989-7b476b16-4dfd-456c-82ba-60d0eeb0d2d1.png)

  在commitRootImpl的函数中主要分三个部分：

  - commit阶段前置工作
  - mutation阶段

  1. 调用commitBeforeMutationEffects，scheduleCallback调度执行flushPassiveEffects
  2. 调用commitMutationEffects，处理相关的副作用，操作真实节点useLayoutEffect的销毁函数在这个函数中执行
  3. 调用commitLayoutEffects，调用commitLayoutEffects的回调函数，这个时候副作用已经应用到真实节点了，所以能拿到最新的节点。
  4. 在commit阶段结束之后flushPassiveEffects执行useEffect的销毁函数和回调函数。

  - commit阶段收尾工作

  所以useLayout/componentDidMount和useEffect的区别是什么？

  答：他们在commit阶段不同时机执行，useEffect在commit阶段结尾异步调用，useLayout/componentDidMount同步调用

  ![img](https://cdn.nlark.com/yuque/0/2023/png/106346/1694007172990-0e9c44a7-8b79-4eb7-a540-c8829da2c10d.png)
