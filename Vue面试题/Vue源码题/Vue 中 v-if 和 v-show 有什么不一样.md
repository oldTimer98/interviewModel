本文可结合这篇一起看：[详解 Vue 性能优化](https://www.yuque.com/u1598738/vqazlv/vr1dgahq69nk118s#jnCqA)

核心点：

1. v-show 与 v-if 的共同点
2. v-show 与 v-if 的区别
3. v-show 与 v-if 原理分析
4. v-show 与 v-if 的使用场景总结

1. **v-if** **与** **v-show** **都能控制** **dom** **元素在页面的显示**
2. **v-if** **相比** **v-show** **开销更大的（直接操作****dom****节点增加与删除）**
3. **如果需要非常频繁地切换，则使用 v-show 较好**
4. **如果在运行时条件很少改变，则使用 v-if 较好**



## v-show 与 v-if 的共同点

在 Vue 中 v-show 与 v-if 的作用效果是相同的(不含v-else)，**都能控制元素在页面是否显示**。

在用法上也是相同的：

```plain
<img v-show="isShow" />
<img v-if="isShow" />
```

- 当表达式为true的时候，都会占据页面的位置
- 当表达式都为false时，都不会占据页面位置

## v-show 与 v-if 的区别

可以从如下几个方面分析：

- 控制手段不同

- v-show 隐藏是为该元素添加 css--display:none，dom元素依旧还在；
- v-if 显示隐藏是将 dom 元素整个添加或删除；

- 编译过程不同

- v-show 只是简单的基于 CSS 切换；
- v-if 切换有一个局部卸载的过程，切换过程中合适地销毁和重建内部的事件监听和子组件；

- 编译条件不同：

- v-if 是真正的条件渲染，它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。渲染条件为假时，并不做操作，直到为真才渲染。
- v-show 由 false 变为 true 的时候不会触发组件的生命周期
- v-if 由 false 变为 true 的时候，触发组件的 beforeCreate、create、beforeMount、mounted 钩子，由true 变为 false 的时候触发组件的 beforeDestory、destoryed 方法

- 性能消耗：

- v-if 有更高的切换消耗；
- v-show 有更高的初始渲染消耗；



## 原理分析

v-if 和 v-show 大致流程如下:

- 将模板 template 转为 AST 结构的 JS 对象
- 用 AST 得到的 JS 对象拼装 render 和 staticRenderFns 函数
- render 和 staticRenderFns 函数被调用后生成虚拟 VNODE 节点，该节点包含创建 DOM 节点所需信息
- vm.patch 函数通过虚拟 DOM 算法利用 VNODE 节点创建真实 DOM 节点

### v-show 原理

不管初始条件是什么，元素总是会被渲染。我们看一下在 Vue 中是如何实现的。

代码很好理解，有 transition 就执行 transition，没有就直接设置 display 属性：

```javascript
// https://github.com/vuejs/vue-next/blob/3cd30c5245da0733f9eb6f29d220f39c46518162/packages/runtime-dom/src/directives/vShow.ts
export const vShow: ObjectDirective<VShowElement> = {
  beforeMount(el, { value }, { transition }) {
    el._vod = el.style.display === 'none' ? '' : el.style.display
    if (transition && value) {
      transition.beforeEnter(el)
    } else {
      setDisplay(el, value)
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el)
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    // ...
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value)
  }
}
```

### V-if 原理

v-if 在实现上比 v-show 要复杂的多，因为还有 else else-if 等条件需要处理，这里我们也只摘抄源码中处理 v-if 的一小部分

返回一个 node 节点，render 函数通过表达式的值来决定是否生成 DOM：

```javascript
// https://github.com/vuejs/vue-next/blob/cdc9f336fd/packages/compiler-core/src/transforms/vIf.ts
export const transformIf = createStructuralDirectiveTransform(
  /^(if|else|else-if)$/,
  (node, dir, context) => {
    return processIf(node, dir, context, (ifNode, branch, isRoot) => {
      // ...
      return () => {
        if (isRoot) {
          ifNode.codegenNode = createCodegenNodeForBranch(
            branch,
            key,
            context
          ) as IfConditionalExpression
        } else {
          // attach this branch's codegen node to the v-if root.
          const parentCondition = getParentCondition(ifNode.codegenNode!)
          parentCondition.alternate = createCodegenNodeForBranch(
            branch,
            key + ifNode.branches.length - 1,
            context
          )
        }
      }
    })
  }
)
```
