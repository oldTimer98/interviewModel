1. Composition API：Vue 3 引入了 Composition API，这是一组新的 API，允许用户更灵活地组合组件的逻辑。与 Vue 2 中的 Options API 相比，Composition API 提供了更好的逻辑复用和代码组织方式。
2. 性能提升：Vue 3 在性能方面有显著的提升。它的框架大小减少了，初始化速度更快，同时更新的效率也得到了提高。
3. 响应式系统的重写：Vue 3 的响应式系统从头开始重写，使用了 Proxy 代替了 Object.defineProperty，这使得它可以监听更多类型的数据变化，同时也减少了内存的使用。
4. 更好的 TypeScript 支持：Vue 3 从一开始就考虑了对 TypeScript 的支持，这使得在 TypeScript 环境下开发 Vue 应用更加友好。
5. 新的生命周期钩子：例如 setup 钩子，它是在组件被创建之前执行的，适合用来定义 Composition API 中的响应式属性和函数。
6. Fragment、Teleport 和 Suspense：

- Fragment：在 Vue 3 中，组件可以返回多个根节点，这称为 Fragment。
- Teleport：这个新组件允许将子节点渲染到 DOM 树的任何位置，而不仅仅是父组件内部。
- Suspense：支持异步组件的等待状态，使得异步加载组件时可以提供更好的用户体验。

1. 自定义渲染器 API：Vue 3 提供了创建自定义渲染器的能力，这意味着 Vue 不仅限于浏览器，还可以用于其他环境，如小程序或原生应用。
2. 更多的内置功能：例如对虚拟 DOM 的改进，提供了更多的内置指令和组件，使得开发更加便捷。



## Composition API 的意义

Composition API 是 Vue3 最重要的新特性之一。

在此之前，vue2 中主要使用 option api 定义 vue 组件，它通过定义一个包含各种属性（如 data, methods, computed 等）的对象来组织组件逻辑。虽然 Options API 非常直观且易于上手，但在处理复杂组件时，它存在一些局限性和问题：

1. **逻辑分散**：在大型或复杂的组件中，相关的逻辑往往分散在不同的选项中。例如，一个功能可能需要在 data 中声明变量，在 methods 中定义方法，在 computed 和 watch 中添加逻辑处理，不够内聚！
2. **逻辑重用困难**：当你想要在多个组件之间共享逻辑时，虽然可以通过 mixins 来实现逻辑重用，但 mixins 可能导致命名冲突，并且往往不够直观，难以向上追踪实现代码。
3. **命名冲突**：当使用 mixins 或多个组件继承时，很容易出现属性和方法的命名冲突。这种冲突可能难以追踪，尤其是在大型项目中。
4. **TypeScript 支持不佳**：Vue 2 的 Options API 并非为 TypeScript 设计。虽然可以在 Vue 2 中使用 TypeScript，但类型推导和代码提示不如 Vue 3 的 Composition API。
5. **难以测试**：由于逻辑分散，测试特定功能的逻辑可能变得困难。测试代码可能需要处理组件的多个方面，而不是集中在单一逻辑单元上。



![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1702191360156-f14f27fc-3d5d-4dc9-aa28-69dcc0927495.png)

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1702191290489-c87dc1d0-6e00-4885-acba-82d1d09191cc.png)

而 Composition API 是一种全新的代码组织方式，它能够显著地将代码逻辑从模板化的配置中剥离出来，独立开发，从而在不同程度上解决 or 缓解了上述问题：

1. **逻辑更内聚**：Composition API 允许开发者将相关逻辑聚合在一起，而不是分散在一个组件的不同选项（如 data, methods, computed）中。这种方式使得代码更加模块化，易于维护和理解，尤其是在处理复杂组件时。

在 Options API 中，我们需要将代码逻辑拆散到 data, methods 和 computed 等不同位置：

```javascript
export default {
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count += 1;
    },
    decrement() {
      this.count -= 1;
    },
    reset() {
      this.count = 0;
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  }
};
```

在 Composition API 则可以将这些逻辑存放到同一个地方：

```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const increment = () => {
    count.value += 1;
  };

  const decrement = () => {
    count.value -= 1;
  };

  const reset = () => {
    count.value = initialValue;
  };

  const doubleCount = computed(() => count.value * 2);

  return { count, increment, decrement, reset, doubleCount };
}

// component
import { useCounter } from './useCounter';

export default {
  setup() {
    const { count, increment, decrement, reset, doubleCount } = useCounter();

    return { count, increment, decrement, reset, doubleCount };
  }
};
```

1. **更好的逻辑复用与组合**：通过可组合函数（composables），开发者可以以更小的粒度在不同组件间共享代码片段，这些函数封装了响应式状态、计算属性和其他逻辑，可以被多个组件复用，从而减少重复代码；
2. **更灵活的代码结构**：Composition API 不强制要求遵循特定的代码结构，这给开发者在组织代码时提供了更大的灵活性。例如，可以根据功能而不是选项类型来组织代码。

```javascript
export default {
  data() {
    return {
      language: 'English',
      theme: 'Light'
    };
  },
  methods: {
    changeLanguage(newLang) {
      this.language = newLang;
    },
    changeTheme(newTheme) {
      this.theme = newTheme;
    }
  },
  created() {
    console.log('Component is created');
  }
  // 其他代码...
};
import { ref, onCreated } from 'vue';

export default {
  setup() {
    const language = ref('English');
    const theme = ref('Light');

    const changeLanguage = (newLang) => {
      language.value = newLang;
    };

    const changeTheme = (newTheme) => {
      theme.value = newTheme;
    };

    onCreated(() => {
      console.log('Component is created');
    });

    return { language, theme, changeLanguage, changeTheme };
  }
  // 其他代码...
};
```

1. **更好的 TypeScript 集成**：Composition API 从一开始就考虑了 TypeScript 的集成，提供了更好的类型推导和代码提示。
2. **更易于测试**：由于逻辑更加集中和模块化，使用 Composition API 的组件通常更易于测试，hooks 可以独立于组件进行测试，使得单元测试更加直接和高效。



## 性能提升

Vue3 的体能提升是多方位的，



### 静态树提升

Vue3 重写了虚拟 DOM (Virtual DOM) 的核心实现算法，使得整体渲染性能有非常大的提升，其中最重要的变更正是：静态树提升。

在 vue3 中，编译时会标记识别出组件 vdom 结构中的静态内容部分，并将之提升为一段单独的 v-dom 片段，这些片段不需要参与响应式逻辑，组件重新绘制时也不需要重新生成新的 vdom 阶段，减少整体 dom 操作从而提升渲染性能。例如：

```javascript
<template>
  <div>
    <h1>Welcome to Vue 3</h1>
    <p>This is static content.</p>
    <div>{{ dynamicContent }}</div>
  </div>
</template>

<script>
export default {
  setup() {
    return {
      dynamicContent: 'This is dynamic content'
    };
  }
}
</script>
```

在这个例子中，<h1> 和 <p> 标签及其内容是静态的，因为它们不依赖于任何响应式数据。相比之下，第二个 <div> 是动态的，因为它包含一个响应式数据。经过编译后，将生成如下结构：

```javascript
import { openBlock, createBlock, createVNode, toDisplayString } from 'vue';

function render(_ctx, _cache) {
  return (openBlock(), createBlock("div", null, [
    _hoisted_1, // 提升的静态节点 h1
    _hoisted_2, // 提升的静态节点 p
    createVNode("div", null, toDisplayString(_ctx.dynamicContent), 1 /* TEXT */)
  ]))
}

// 静态内容被提升并存储在外部变量中
const _hoisted_1 = createVNode("h1", null, "Welcome to Vue 3");
const _hoisted_2 = createVNode("p", null, "This is static content.");
```

最终，组件的静态内容（<h1> 和 <p>）部分被提升为常量（_hoisted_1 和 _hoisted_2），这些节点只会在组件初始化时被创建一次。而动态内容（`{{ dynamicContent }}` 的 <div>）则保留在渲染函数中，因为它依赖于响应式状态。

这意味着在每次组件更新时，Vue 不需要重新检查和渲染 <h1> 和 <p> 标签，因为它们已经被识别为不会改变的静态部分。这减少了渲染过程中的工作量，从而提升了性能。



### 按块跟踪

在 Vue 2 及其早期版本中，当组件的一部分状态发生变化时，整个组件的虚拟 DOM 都需要重新渲染和对比（diff）。而在 Vue 3 中，通过将模板分解成更小的独立块（`Block`，**Vue3 模板中的动态部分如：条件渲染、列表渲染等会被视为独立的块**），每个块可以单独被跟踪和更新，这样只有实际发生变化的块会被重新渲染，从而提高了更新的效率。例如：

```javascript
<template>
  <div>
    <p v-if="showMessage">{{ message }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.text }}</li>
    </ul>
  </div>
</template>
```

在这个例子中，有两个主要的动态块：

1. `v-if="showMessage"` 控制的 <p> 标签。
2. `v-for="item in items"` 创建的 <li> 列表。

当 `showMessage` 或 `items` 中的任何一个发生变化时，只有相关的块（<p> 或 <li> 列表）会被重新渲染和对比，而不是整个外层的 <div>。

实现逻辑上，Vue 编译时首先会将节点划分为静态、动态两种类型节点，静态节点直接提升为静态变量，不参与后续变更的计算(上面说的静态树提升)；而动态节点则进一步划分为：

- 条件渲染块（如 v-if）：只有当条件变化时，块中的内容才会被重新渲染。
- 列表渲染块（如 v-for）：列表中的每个元素都是一个单独的块，只有当列表数据发生变化时，相关块才会更新。
- 动态表达式：单个表达式或插值，它们直接依赖于响应式数据。

每个块在渲染时都会注册其响应式依赖。Vue 的响应式系统会跟踪这些依赖，当依赖的数据变化时，只有相关的块会被重新渲染。



### 基于 Proxy 的响应式系统

应该很多同学都知道 vue2 基于 defineProperty 实现响应式，而 vue3 改用 proxy 实现，两者有较大性能差异，但具体差别在哪里呢？

`Proxy` 是 ES6 引入的一种新特性，允许你创建一个对象的代理，从而拦截针对对象的基本操作（如属性读取、设置、枚举等）。Vue 3 正是借助这一特性，当你在组件中声明响应式状态时（例如使用 reactive 或 ref），Vue 会用 Proxy 包裹你的对象，这样就可以在你对这些对象进行操作时进行拦截和相应的响应式处理。

相比于过去的 `Object.defineProperty`，Proxy 能带来许多性能提升：

1. **减少初始化成本**：在 Vue 2 中，响应式系统需要递归地遍历对象的所有属性来应用 Object.defineProperty，这在处理大型或深层嵌套对象时会有显著的性能成本。而在 Vue 3 中，使用 Proxy，响应式转换是惰性的，只有在实际访问属性时才会进行处理，减少了初始化时的性能消耗。
2. **更细粒度的变化检测**：与 Object.defineProperty 相比，Proxy 可以拦截更多类型的操作，包括属性的添加和删除，以及数组索引和长度的变化。这意味着 Vue 可以更精确地跟踪依赖和更新，从而减少不必要的组件渲染。
3. **原生支持集合类型**：Proxy 可以拦截对 JavaScript 集合类型（如 Map, Set, WeakMap, WeakSet）的操作，这是 Object.defineProperty 无法做到的。因此，Vue 3 能够支持更多种类的数据结构。



### 支持 Tree-shaking

Vue3 的发行包提供了 ESM 与 CJS 两种模块方案，其中 ESM 方案支持在打包时做静态分析，并删除掉未被引用消费的模块代码 —— 也就是所谓的 tree-shaking。

开发者在使用 Vue 3 时可以选择性地导入所需功能。如果你不使用 Vue 的某个内置指令或组件，那么它们就不会被包含在最终的构建文件中。

```javascript
import { createApp, ref } from 'vue'; // 只导入 createApp 和 ref

const App = {
  setup() {
    const count = ref(0);
    // ...
  }
};

createApp(App).mount('#app');
```

示例中，只有 `createApp` 和 `ref` 被导入和使用，其他未使用的 Vue 功能将不会包含在最终的构建中。

PS: 这里衍生出来一条规则：不应该使用 `import * from 'vue'` 语句导入 vue 代码，因为这会引入所有内容 —— 即使并未被消费。



### 优化的插槽处理

Vue3 对插槽也做了许多优化：

1. **函数式插槽**：在 Vue 3 中，**所有插槽都是函数式的**！这意味着插槽内容被视为返回 VNodes 的函数，而不是直接是 VNodes(Vue2 返回的是 vnodes)。这种方式允许 Vue 延迟执行插槽内容的渲染，直到真正需要时才进行，从而提高性能。
2. **作用域插槽的优化**：作用域插槽在 Vue 2 中可能会导致不必要的重新渲染，因为父组件更新会导致所有子组件的插槽内容重新评估。Vue 3 中通过更优的依赖追踪减少了这种不必要的渲染(Vue2 中，父组件更新会触发子组件更新)。

1. **按需渲染**：借助函数式插槽，Vue 3 响应式系统能够更准确(借助 proxy)地确定哪些数据影响了插槽内容，只有当插槽的相关响应式数据发生变化时，插槽内容才会重新渲染。
2. **避免父组件更新引发的重渲染**：借助，即使父组件发生了更新，如果这些更新不影响作用域插槽中使用的数据，那么插槽内容不会被重新渲染。这减少了因父组件中无关数据变化而引起的不必要渲染。
3. **插槽内容的独立更新**：借助分块跟踪能力(Block Tracking)，Vue 3 允许作用域插槽内的内容独立于父组件的其余部分更新。这意味着插槽内容可以有自己的渲染和更新周期，提高了渲染效率。

在 Vue 2 中，即使父组件的更新与插槽内容无关，插槽内容也可能被重新渲染：

```javascript
<!-- Vue 2 -->
<template>
  <child-component>
    <template v-slot:default>
      <!-- 即使只有 unrelatedData 发生变化，这里的内容也会重新渲染 -->
      {{ unrelatedData }}
    </template>
  </child-component>
</template>
```

而在 Vue 3 中，除非插槽的依赖发生变化，否则插槽内容不会因父组件的更新而重新渲染：

```javascript
<!-- Vue 3 -->
<template>
  <child-component>
    <template v-slot:default>
      <!-- 这里的内容仅在相关数据发生变化时重新渲染 -->
      {{ relatedData }}
    </template>
  </child-component>
</template>
```

1. **插槽内容的缓存**：由于插槽已经被实现未独立渲染，因此 Vue 3 可以更有效地缓存插槽内容。除非插槽的依赖发生变化，否则即使父组件重新渲染，插槽内容也不会重新生成。
2. **编译时的插槽优化**：Vue 3 的编译器能够检测插槽内容是否依赖于父组件中的响应式数据。如果一个插槽不依赖于父组件中的数据，它将被编译成一个**静态插槽**(类似于静态树提升)，这进一步减少了重新渲染的需要。



### Teleport 组件

注意，这里可能有点 trick，Teleport 组件本身并不能直接提升性能，但它为组件架构提供了更多的灵活性，间接地对性能优化有积极影响。

Teleport 是 Vue 3 引入的一个新特性，它允许开发者将子组件渲染到 DOM 树的任何位置，而不仅仅是父组件内部。这在处理模态框、提示信息、弹出菜单等场景时特别有用。借助 Teleport 组件，在某些方面能够显著影响页面整体性能：

1. **减少重绘和回流**：在传统的 Vue 应用中，像模态框这样的 UI 元素通常作为子组件直接放在父组件的 DOM 结构中。这可能导致频繁的重绘和回流（尤其是当模态框频繁打开或关闭时），因为它们改变了页面布局。使用 Teleport 可以将这些元素移动到更合适的位置（比如 body 标签的直接子元素），从而减少页面布局的变化，提升性能。
2. **组件逻辑分离**：Teleport 允许开发者将与位置无关的组件（如对话框、通知等）从其父组件中分离出来，使得组件结构更加清晰。这种逻辑上的分离有助于提高应用的可维护性，间接地影响到性能（因为更易维护的代码通常更容易优化）。
3. **更好的用户体验**：虽然不直接提升性能，Teleport 提供了构建更流畅用户界面的能力，这可以间接提高用户感知的性能。例如，你可以轻松地创建一个非侵入式的弹出层，而不干扰主界面的布局。

例如：

```javascript
<template>
  <div>
    <!-- 页面主体内容 -->
    <button @click="modalOpen = true">Open Modal</button>

    <!-- Teleport 模态框到 body -->
    <teleport to="body">
      <div v-if="modalOpen" class="modal">
        <!-- 模态框内容 -->
        <button @click="modalOpen = false">Close</button>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modalOpen = ref(false);

    return { modalOpen };
  }
};
</script>
```

在这个例子中，Teleport 被用来将模态框内容传输到 body 标签下，从而避免了对原有 DOM 结构的影响。



## Suspense 组件

Vue3 还提供了 `Suspense` 组件，主要用于优化用户体验，设想这样一段代码：

```javascript
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <div>Loading...</div>
  </template>
</Suspense>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/MyAsyncComponent.vue')
)
```

示例中，`AsyncComponent` 是一个通过 `import()` 方法导入的异步组件，vue 在执行渲染前需要先完成组件的一部加载操作，那么此时可以借助 `Suspense` 组件包裹这样的异步组件，并允许我们定义“fallback”内容，这个内容会在异步依赖未解决之前展示给用户，也就是上例中的 `<div>Loading...</div>`效果。

借助 `suspense`组件，可以达成如下优化：

1. 用户体验的改善：`Suspense` 允许开发者为异步组件加载状态提供更好的用户反馈（如加载指示器），这有助于改善用户体验，特别是在网络慢或性能较差的设备上。
2. 代码组织和可维护性：`Suspense` 提供了一种更清晰和集中的方式来处理组件的异步逻辑。这使得异步逻辑的管理更加直观，有助于提高代码的可读性和维护性。
3. 性能优化：通过 `Suspense`，开发者可以更灵活地控制组件的加载和渲染时机。例如，可以实现懒加载组件，仅在需要时才加载和渲染，减少了初始加载时间，提高了应用的整体性能。
4. 更好的错误处理：`Suspense` 也提供了一种更加优雅的方式来处理异步操作中可能出现的错误，允许开发者为错误状态提供备用内容。

总而言之，`Suspense` 通过提供更好的异步操作处理方式，不仅提升了用户体验，同时也优化了代码的组织和应用性能。



## 更好的 TS 支持

Vue3 对 TS 做了非常深度的支持，包括：

1. 使用 TypeScript 重写源码：Vue 3 的源码完全采用 TypeScript 重写，并且类型覆盖率也比较高，因此调用相关接口时也天然地提供了完善的类型定义；
2. Composition API 的类型推断：Vue 3 引入的 Composition API 设计上更加友好于 TypeScript。这个 API 允许开发者更自然地使用 TypeScript，因为它支持类型推断和类型声明，这在 Vue 2 的 Options API 中是比较难以实现的，表现在几个方面：

1. 函数式编程风格：Composition API 采用了更接近函数式编程的风格。在这种模式下，组件的逻辑被封装在可复用的函数中，而这些函数可以返回明确的类型。TypeScript 与这种模式相兼容，能够更好地进行类型推断和检查。
2. 直接的变量和函数声明：在 Composition API 中，你直接声明响应式引用（如 ref 和 reactive）和计算属性（computed），并且可以为它们指定类型。这与在 Options API 中通过 data, computed, methods 等选项间接定义它们形成对比。直接声明使得 TypeScript 能够更容易地推断和验证这些变量和函数的类型。
3. 类型保留：由于 Composition API 允许直接在 setup 函数中定义逻辑，所以在定义时就可以保留变量的类型信息。而在 Options API 中，当你在 data, computed, methods 等选项中定义属性或方法时，这些属性和方法会被收集并重新构造成一个组件实例，这个过程中类型信息可能会丢失或变得难以推断。

1. 更好的集成工具支持：Vue 3 的工具链，包括像 Vetur 这样的 VS Code 插件，都针对 TypeScript 提供了更好的支持。这包括模板内的类型检查，更准确的代码提示等功能，这些在 Vue 2 中是有限的或不可用的。



## 增强的 v-model



## 片段 Fragment