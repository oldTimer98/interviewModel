##     核心点：

1. 理解题目背后想问的本质是什么？- 对 Vue 基础 API 的熟练程度，以及**考察如何设计，使得组件通用性、复用性更强，如何更好的对组件逻辑进行抽离封装。**
2. **学会从组件****逻辑扩展****和****内容扩展****两个层面进行问题的拆解。**

1. **逻辑扩展****：**mixins、extends、Composition API，以及三者之间的异同点
2. **内容扩展****：**插槽 slot，理解下面 4 个插槽的使用方式及差异点

1. **普通插槽**
2. **具名插槽**
3. **动态插槽**
4. **作用域插槽**

1. 进阶延伸，补充说明 Vue3 新引入 Composition API 后带来的变化



## 解题：

常见的组件扩展方法从逻辑上有：mixins，Composition AP，extends 等，从内容上有 slots。

### mixins

混入 mixins 是分发 Vue 组件中可复用功能的非常灵活的方式。[Vue - mixins](https://v2.vuejs.org/v2/guide/mixins.html?redirect=true)

混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被混入该组件本身的选项。

```javascript
// 定义一个混入对象
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    }
  }
}

// 定义一个组件，使用混入
var Component = Vue.extend({
  mixins: [myMixin]
})

var component = new Component() // => "hello from mixin!"
```

注意，**它们将使用一定的选项合并逻辑与最终的选项进行合并**。

```javascript
const mixin = {
  created() {
    console.log(1)
  }
}

createApp({
  created() {
    console.log(2)
  },
  mixins: [mixin]
})

// => 1
// => 2
```

mixins 选项接受一个 mixin 对象数组。这些 mixin 对象可以像普通的实例对象一样包含实例选项，它们将使用一定的选项合并逻辑与最终的选项进行合并。举例来说，如果你的 mixin 包含了一个 created 钩子，而组件自身也有一个，那么这两个函数都会被调用。

Mixin 钩子的调用顺序与提供它们的选项顺序相同，且会在组件自身的钩子前被调用。

------

but，尽管它们可以在多个组件之间共享功能，但使用mixins可能会带来一些问题：

1. **命名冲突**：Mixins中的方法或属性可能与组件内的方法或属性重名，这可能导致预料之外的覆盖问题。
2. **来源不明确**：当组件使用多个mixins时，很难追踪一个属性或方法的来源。这降低了代码的可维护性，因为你不容易知道某个方法或属性是定义在哪个mixin中的。
3. **依赖管理**：Mixins可能会产生隐式的依赖，这些依赖不容易被追踪和管理。随着应用规模的扩大，这可能会导致代码难以维护。
4. **复杂性增加**：使用mixins可能会意外地增加组件的复杂度，特别是当mixins本身相互依赖或者依赖于特定的组件实现时。
5. **测试困难**：因为mixins中的逻辑和状态是分散的，所以测试涉及mixins的组件可能比测试封装得更好的组件要困难。
6. **可重用性有限**：Mixins通常与Vue实例紧密耦合，因此它们的可重用性通常限于Vue生态系统内部。



### extends

extends 使一个组件可以继承另一个组件的组件选项。

从实现角度来看，extends 几乎和 mixins 相同。通过 extends 指定的组件将会当作第一个 mixin 来处理。

**注意区分 extends 与 mixins 的异同**：

- mixins 选项基本用于组合功能，而 extends 则一般更关注继承关系
- 如果和 mixins 发生冲突，extends 优先级较高，优先起作用
- 一个组件可以混入多个 mixins，但是 **extends 只能继承单个组件**

```javascript
// 扩展对象
const myextends = {
   methods: {
      dosomething(){}
   }
}
// 组件扩展：做数组项设置到 extends 选项，仅作用于当前组件
// 跟混入的不同是它只能扩展单个对象
// 另外如果和混入发生冲突，该选项优先级较高，优先起作用
const Comp = {
   extends: myextends
}
```



### Composition API

混入（mixins）的数据和方法**不能明确判断来源**且可能和当前组件内变量**产生命名冲突**，Vue3 中引入了Composition API，可以很好解决这些问题。

利用独立出来的响应式模块可以很方便的编写独立逻辑并提供响应式的数据，然后在 setup 选项中组合使用，增强代码的可读性和维护性。

```javascript
// 复用逻辑1
function useXX() {}
// 复用逻辑2
function useYY() {}
// 逻辑组合
const Comp = {
   setup() {
      const {xx} = useXX()
      const {yy} = useYY()
      return {xx, yy}
   }
}
```


注意：

1. 在 Vue 2 中，mixins 是创建可重用组件逻辑的主要方式。尽管在 Vue 3 中保留了 mixins 支持，但对于组件间的逻辑复用，[使用组合式 API 的组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)是现在更推荐的方式。
2. extends 是为选项式 API 设计的，不会处理 setup() 钩子的合并。在组合式 API 中，**逻辑复用的首选模式是“组合”而不是“继承”**。如果一个组件中的逻辑需要复用，考虑将相关逻辑提取到[组合式函数](https://cn.vuejs.org/guide/reusability/composables.html#composables)中。

1. **留个问题：为什么组合优于继承呢？**

1. mixins（混入）、extends（继承）和 Composition API 是三种不同的组件复用方式，都可以实现组件复用，减少代码重复，都可以扩展组件的功能和属性

### mixins（混入）、extends（继承）和 Composition API 不同点：

- mixins 是一种将可复用的选项混合到组件中的方式。可以将一个或多个 mixins 对象传递给组件的 mixins 选项，将 mixins 中的选项合并到组件中。这样组件可以继承多个 mixins，并且 mixins 中的选项会在组件内与组件本身的选项进行合并。mixins 可以是普通对象或 Vue 组件对象。
- extends 是一种让一个组件继承另一个组件的方式。可以通过在一个组件定义时使用 extends 选项来指定它继承的组件。继承的组件会被当作基础组件，而当前组件会继承基础组件的所有选项，包括数据、计算属性、生命周期钩子等。extends 只能继承单个组件。
- Composition API 是 Vue 3 中引入的一种组合函数的方式。它提供了一组函数式的 API，使得我们可以更灵活地组织和复用我们的代码逻辑。通过使用 Composition API，我们可以将逻辑相关的代码组合成一个可复用的函数，并在组件中使用这个函数。

各自的使用场景：

- mixins 适用于多个组件之间共享相似的功能或逻辑。例如，多个组件都需要实现相同的方法、计算属性或生命周期钩子，这时可以将这些共享的选项提取到一个 mixins 中，然后在组件中引入相应的 mixins。
- extends 适用于基于现有组件创建新的组件，并且希望新组件能够继承原组件的功能和属性。例如，如果有一个基础的按钮组件，想要创建一种特定样式的新按钮，那么可以使用 extends 来让新按钮组件继承基础按钮组件。
- **Composition API** 适用于更灵活的组合逻辑和代码复用。它允许我们根据需要创建自定义的函数式组合，将相关的逻辑聚合在一起，从而使组件更易于理解、维护和测试。它是 Vue 3 推荐的主要方式。



## 插槽

在 Vue 中，有四种类型的插槽：**普通插槽、具名插槽、动态插槽和作用域插槽**。

### 普通插槽

普通插槽是最基本的插槽形式，也称为默认插槽。

使用 `<slot>` 元素作为占位符，在组件中标记出可插入内容的位置。

父组件可以在组件标签中放置内容，这些内容将被渲染到子组件的 <slot> 占位符处。

```html
<!-- 子组件 -->
<template>
  <div>
    <h2>子组件</h2>
    <slot></slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <div>
    <h1>父组件</h1>
    <child-component>插入的内容</child-component>
  </div>
</template>

<!-- 输出的内容 -->
<div>
  <h1>父组件</h1>
  <div>
    <h2>子组件</h2>
    插入的内容
  </div>
</div>
```

### 具名插槽

具名插槽允许我们在组件中定义多个插槽，并给它们起一个名称。

使用 <slot> 元素并通过 name 属性指定插槽的名称。

父组件在使用子组件时，通过 <template v-slot:[slotName]> 或 <template # [slotName]> 的方式插入内容到对应的具名插槽中。

```html
<!-- 子组件 -->
<template>
  <div>
    <h2>子组件</h2>
    <slot name="header"></slot>
    <slot name="content"></slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <div>
    <h1>父组件</h1>
    <child-component>
      <template #header>
        <h3>头部内容</h3>
      </template>
      <template #content>
        <p>主要内容</p>
      </template>
    </child-component>
  </div>
</template>

<!-- 输出 -->
<div>
  <h1>父组件</h1>
  <div>
    <h2>子组件</h2>
    <h3>头部内容</h3>
    <p>主要内容</p>
  </div>
</div>
```

### 动态插槽

在传统的插槽中，定义的插槽是静态的，父组件在使用子组件时，将内容插入到固定的插槽位置。但有时候，我们希望根据不同的条件或数据动态地决定插槽的内容，这就需要使用动态插槽。

使用动态插槽，我们可以在父组件中通过指定 v-slot 的值来动态选择要插入的插槽。这样，子组件可以根据父组件的选择来渲染不同的插槽内容。

```javascript
<!-- ChildComponent.vue -->
<template>
  <div>
    <!-- 使用动态的插槽名 -->
    <slot :name="slotName"></slot>
  </div>
</template>

<script>
export default {
  props: ['slotName']
}
</script>
```


在上述例子中，`ChildComponent` 的插槽名是通过 `props` 传递的 `slotName` 属性动态决定的，父组件可通过绑定 `v-slot:[dynamicSlotName]` 插入内容到子组件相应的插槽中：

```javascript
<!-- ParentComponent.vue -->
<template>
  <ChildComponent :slotName="dynamicSlotName">
    <!-- 根据 dynamicSlotName 的值提供不同的内容 -->
    <template v-slot:[dynamicSlotName]>
      这里是动态插槽的内容
    </template>
  </ChildComponent>
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      dynamicSlotName: 'header' // 这个值可以动态更改
    }
  }
}
</script>
```

使用动态插槽，我们可以根据不同的条件或数据，在父组件中选择要渲染的插槽内容，从而实现更灵活的组件交互和渲染控制。

需要注意的是，动态插槽在 Vue 2.x 中是使用 v-slot 进行绑定，在 Vue 3.x 中改为使用 v-slot 的简写形式 # 进行绑定，语法略有不同。

### 作用域插槽

作用域插槽具有向插槽内部传递数据的能力，允许子组件在插槽中使用父组件的数据。

使用 `<slot>` 元素并通过带参数的函数形式来定义作用域插槽，并在插槽内部使用传递的数据。

父组件在使用子组件时，可以通过 `<template v-slot:[slotName]="slotProps">` 或 `<template # [slotName]="slotProps">` 的方式指定作用域插槽，并在插槽内使用 slotProps 来访问传递的数据。

```html
<!-- 子组件 -->
<template>
  <div>
    <h2>子组件</h2>
    <slot name="list-item" v-for="item in items" :item="item" :data="{name:''}"></slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <div>
    <h1>父组件</h1>
    <child-component>
      <template #list-item="slotProps">
        <p>物品名称：{{ slotProps.item.name }}</p>
        <p>物品数量：{{ slotProps.data.name }}</p>
      </template>
    </child-component>
  </div>
</template>

<!-- 输出 -->
<div>
  <h1>父组件</h1>
  <div>
    <h2>子组件</h2>
    <p>物品名称：物品A</p>
    <p>物品数量：5</p>
    <p>物品名称：物品B</p>
    <p>物品数量：10</p>
  </div>
</div>
```