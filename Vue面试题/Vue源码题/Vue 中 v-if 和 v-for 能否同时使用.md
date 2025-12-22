核心点：

1. 能够回答：理论上可以同时使用，不会报错，但是从最佳实践上而言，**实际编程中，不应该把 v-for 和 v-if 放一起使用**
2. 知道 Vue2 和 Vue3 在同时渲染情况下的异同点



### 解析

- 实践中**不应该把v-for和v-if放一起**
- 在**vue2中**，**v-for的优先级是高于v-if**，把它们放在一起，输出的渲染函数中可以看出会先执行循环再判断条件，哪怕我们只渲染列表中一小部分元素，也得在每次重渲染的时候遍历整个列表，这会比较浪费；另外需要注意的是在**vue3中则完全相反，v-if的优先级高于v-for**，所以v-if执行时，它调用的变量还不存在，就会导致异常
- 通常有两种情况下导致我们这样做：

- 为了**过滤列表中的项目** (比如 v-for="user in users" v-if="user.isActive")。此时更好的做法应该是定义一个计算属性 (比如 activeUsers)，让其返回过滤后的列表即可（比如users.filter(u=>u.isActive)）。

```javascript
<template>
  <div>
    <div v-for="item in filteredItems">
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { name: 'Apple', isVisible: true },
        { name: 'Banana', isVisible: false },
        { name: 'Orange', isVisible: true },
      ]
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter(item => item.isVisible);
    }
  }
};
</script>
```

- 为了**避免渲染本应该被隐藏的列表** (比如 v-for="user in users" v-if="shouldShowUsers")。此时更好的做法是把 v-if 移动至容器元素上 (比如 ul、ol)或者外面包一层template即可。

- 文档中明确指出**永远不要把** **v-if** **和** **v-for** **同时用在同一个元素上**，显然这是一个重要的注意事项。
- 源码里面关于代码生成的部分，能够清晰的看到是先处理v-if还是v-for，顺序上vue2和vue3正好相反，因此产生了一些症状的不同，但是不管怎样都是不能把它们写在一起的。



### 源码剖析

v2：[github1s.com/vuejs/vue/b…](https://github1s.com/vuejs/vue/blob/HEAD/src/compiler/codegen/index.ts)

```javascript
export function genElement(el: ASTElement, state: CodegenState): string {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // ...
  }
}
```

看第 10 ~ 12 行。



v3：[github1s.com/vuejs/core/…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fvuejs%2Fcore%2Fblob%2FHEAD%2Fpackages%2Fcompiler-core%2Fsrc%2Fcodegen.ts%23L586-L587)

```javascript
function genNode(node: CodegenNode | symbol | string, context: CodegenContext) {
  if (isString(node)) {
    context.push(node)
    return
  }
  if (isSymbol(node)) {
    context.push(context.helper(node))
    return
  }
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.IF:
    case NodeTypes.FOR:
    // ...
}
```

看第 10 ~ 12 行。
