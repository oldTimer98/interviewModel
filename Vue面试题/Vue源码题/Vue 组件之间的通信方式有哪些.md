**解题核心点：**

1. 了解所有通信方式，展现知识的广度
2. 基于分类（组件关系），记忆不同通信方式，掌握不同使用场景，需要知道哪些是更为常用的，哪些不太常用





首先，通过一张图，感受一下：

![img](https://cdn.nlark.com/yuque/0/2023/png/311219/1695262653543-4326b5fb-e24c-43d9-aec3-42e9da8f6365.png)



### 回答范例：

1. 组件通信常用方式有以下 10 种：

- props
- $emit/$on
- $children/$parent
- $attrs/$listeners
- ref
- $root
- provide + inject
- eventbus
- Vue2: vuex
- Vue3: Pinia



学会基于组件关系进行分类：

- 父子组件

- props/$emit/$parent/ref/$attrs

- 兄弟组件

- $parent/$root/eventbus/vuex/pinia

- 跨层级关系

- eventbus/provide+inject/vuex/pinia





递进延伸：

1. 知道上述所有方式中，哪些其实是已经在 Vue3 中被废弃或者不推荐使用

1. $children 已经在 Vue3 中被废弃  [$children | Vue 3 Migration Guide](https://v3-migration.vuejs.org/breaking-changes/children.html)

1. 在 3.x 中，$children 属性已被删除并且不再受支持。 相反，如果您需要访问子组件实例，我们建议使用 [template refs](https://vuejs.org/guide/essentials/template-refs.html#template-refs)。

1. $listeners 已经在 Vue3 中被废弃 [$listeners removed | Vue 3 Migration Guide](https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html)

1. 在 Vue 3 的虚拟 DOM 中，事件监听器现在只是属性，以 on 为前缀，因此是 $attrs 对象的一部分，因此 $listeners 已被删除。

1. $on 已经在 Vue3 中被废弃 [Events API | Vue 3 Migration Guide](https://v3-migration.vuejs.org/breaking-changes/events-api.html#overview)

1. Vue3 从实例中完全删除了 $on、$off 和 $once 方法。 $emit 仍然是现有 API 的一部分，因为它用于触发由父组件以声明方式附加的事件处理程序。

1. **EventBus** 不推荐使用：当然，这里的不推荐使用并不是说 EventBus 完全不能使用，EventBus 的使用比较看场景，更适合在简单的场景下进行组件之间的通信。它允许任何组件在需要时发布事件，其他组件可以订阅这些事件并作出相应的响应。但是相对全局状态管理 Vuex 和 Pinia，它有如下一些缺点：

1. 增加了组件间的耦合性：使用 EventBus 进行组件通信时，组件需要直接知道其他组件发布的事件和事件的结构。这增加了组件之间的耦合性，使得代码更难以理解和维护。而 Vuex 使用明确的状态管理规则，减少了组件之间的直接依赖关系，提供了更清晰的数据流。
2. 缺乏严格的状态变更追踪：EventBus 并没有像 Vuex 那样提供严格的状态变更追踪机制。在 Vuex 中，通过 mutation 来修改状态，可以确保状态的变更可追踪、可记录和可调试。而 EventBus 并没有强制此类机制，容易导致状态变更不可控，增加调试和排查问题的难度。
3. 较难进行全局状态管理：相对于 Vuex 的中央状态存储，EventBus 更适用于简单的组件通信场景。当应用程序需要复杂的全局状态管理时，例如大型应用或多个组件共享状态，使用 Vuex 提供了更优雅、集中和可扩展的方式来处理这些需求。
4. 性能可能会受到影响：相对于直接调用组件方法或使用事件派发机制，EventBus 会引入一定的性能开销。尤其在大型应用程序中，事件的传递和处理可能会成为性能瓶颈，特别是当事件数量庞大时。



### Vue 中 $*attrs* 和 $listeners 的含义和适用场景是什么？

- $attrs：包含了父作用域中不被 prop 所识别 (且获取) 的特性绑定 ( class 和 style 除外 )。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 ( class 和 style 除外 )，并且可以通过 v-bind="$attrs" 传入内部组件。通常配合 inheritAttrs 选项一起使用。
- $listeners：包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。它可以通过 v-on="$listeners" 传入内部组件

最常见的使用场景在于**多级组件嵌套需要传递数据时**，类似于下面这个：

![img](https://cdn.nlark.com/yuque/0/2023/png/311219/1698116687001-356ee4b0-7acb-4861-87bd-a2c50c9b3c87.png)

组件 A 跟组件 C 怎么通信，我们可以有多少解决方案？

1. 这种情况，应该会想到用 Vuex 来进行数据通信，但是如果项目中**多个组件中的共享状态很少，且项目比较小，全局数据通信也很少**，那我们用 Vuex 来实现这个功能，就感觉有点杀鸡用牛刀了;
2. 我们可以使用组件 B 来做通信的中转站，当组件A需要把数据传到组件 C 时，组件 A 通过 props 将数据传给组件 B，然后组件 B 再用 props 传给组件 C，这是一种解决方案，但是如果嵌套的组件过多，就会导致代码冗余且繁琐，维护就比较困难，而且如果组件 C 也要将数据传给组件 A，也要一层一层往上传递，就更麻烦了;
3. 自定义一个 Vue 数据总线，这种适合组件跨级传递数据，但是缺点是**碰到多人合作时，会导致代码的维护性较低，代码可读性也较低;**
4. 还有一种解决方案，就是用 provide/inject，但是这种方式官方不推荐，因为**这个方法真的是太不好管控了**，比如说我在根组件 provide 了 this，孙孙重孙组件去使用了 this 里面的一个变量，这时候很难去跟踪到这个变量的出处。

因此，在 Vue 2.4 中，为了解决该需求，引入了 $attrs 和 $listeners， 新增了 inheritAttrs 选项。**为了解决隔代传递数据的问题**。

看个例子：

```html
<!-- 父组件 -->
<template>
  <div>
    <child-dom :foo="foo" :bar="bar"></child-dom>
  </div>
</template>

<script>
import ChildDom from "../components/attrs/ChildDom.vue";
export default {
  components: {
    ChildDom,
  },
  data() {
    return {
      foo: "foo",
      bar: "bar",
    };
  },
};
</script>


<!-- 子组件 -->
<template>
  <div>
    <p>foo:{{ foo }}</p>
    <p>attrs: {{ $attrs }}</p>
    <dom-child v-bind="$attrs"></dom-child>
  </div>
</template>

<script>
import DomChild from "./DomChild.vue";
export default {
  props: ["foo"],
  inheritAttrs: false,
  components: {
    DomChild,
  },
};
</script>


<!-- 孙组件 -->
<template>
  <div>
    <p>bar:{{ bar }}</p>
  </div>
</template>

<script>
export default {
  props: ["bar"],
};
</script>
```

在子组件中，由于只定义了 `props: ["foo"]`，而父组件传入了 foo 和 bar 两个属性，因此打印 `$attr`将得到：`{ "bar": "bar"}`。

并且，可以通过在子组件中的 `v-bind="$attrs"` 可以将 `$attrs`继续传递给孙组件。

从上面的代码，可以看出使用 **$attrs** **，****inheritAttrs** 属性能够使用简洁的代码，将组件A 的数据传递给组件 C，也就是解决了**隔代传递数据****的问题**。

同理，Vue2.4 版本新增了 $listeners 属性，我们在子组件上绑定 v-on=”$listeners”, 子组件可以通过*v*−*on*="listeners"继承父组件的事件监听器，就可以实现在父组件中，监听孙组件触发的事件。就能把孙组件发出的数据，传递给父组件。

看看代码：

```html
<!-- 父组件 -->
<template>
  <div>
    <child-dom :foo="foo" :bar="bar" @upFoo="update"></child-dom>
  </div>
</template>

<script>
import ChildDom from "../components/attrs/ChildDom.vue";
export default {
  components: {
    ChildDom,
  },
  data() {
    return {
      foo: "foo",
      bar: "bar",
    };
  },
  methods: {
    update(val) {
      this.foo = val;
      console.log("update success");
    },
  },
};
</script>


<!-- 子组件 -->
<template>
  <div>
    <p>foo:{{ foo }}</p>
    <p>attrs: {{ $attrs }}</p>
    <dom-child v-bind="$attrs" v-on="$listeners"></dom-child>
  </div>
</template>

<script>
import DomChild from "./DomChild.vue";
export default {
  props: ["foo"],
  inheritAttrs: false,
  components: {
    DomChild,
  },
};
</script>


<!-- 孙组件 -->
<template>
  <div>
    <p>bar:{{ bar }}</p>
    <button @click="startUpFoo">我要更新foo</button>
  </div>
</template>

<script>
export default {
  props: ["bar"],
  methods: {
    startUpFoo() {
      this.$emit("upFoo", "foooooooooooo");
      console.log("startUpFoo");
    },
  },
};
</script>
```

此时，孙组件即可通过 `this.$emit("upFoo", "foooooooooooo")`触发父组件的 `upFoo`。
