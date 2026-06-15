## 1. vue开发中常用的指令有哪些？

**记忆口诀：**「v-if/show 控显隐，v-for 列表，v-on 事件，v-model 双绑，v-bind 属性」

**一句话总结：** Vue 指令是带 `v-` 前缀的特殊属性，在编译阶段被解析为 DOM 操作或数据绑定逻辑，是模板语法与响应式系统之间的桥梁。

| 分类 | 指令 | 作用 |
| --- | --- | --- |
| 条件渲染 | `v-if` / `v-else` / `v-else-if` | 条件为真才创建/销毁 DOM |
| 条件渲染 | `v-show` | 始终渲染，通过 CSS `display` 切换 |
| 列表渲染 | `v-for` | 基于数组/对象/数字迭代渲染 |
| 事件绑定 | `v-on`（`@`） | 绑定 DOM 事件及修饰符 |
| 属性绑定 | `v-bind`（`:`） | 动态绑定 HTML 属性、class、style |
| 双向绑定 | `v-model` | 表单元素与数据的语法糖 |
| 内容渲染 | `v-text` / `v-html` | 文本插值 / 原始 HTML 插入 |
| 特殊 | `v-once` / `v-memo` / `v-cloak` | 一次性渲染 / 条件缓存 / 防闪烁 |
| Vue3 新增 | `v-is`（已废弃） | 动态组件 |

**详细解答：**

Vue 指令的本质是编译器在 AST 转换阶段识别带 `v-` 前缀的属性，将其转化为 render 函数中的相应逻辑。常用指令可按功能分为四大类：

**条件与列表：** `v-if` 是"真正"的条件渲染——惰性、会销毁/重建子树；`v-show` 始终挂载 DOM，仅切换 CSS。`v-for` 遍历时必须提供稳定 `:key`，帮助 diff 算法识别节点身份。

**数据绑定：** `v-bind` 将 JS 表达式结果绑定到 DOM 属性；`v-model` 是 `:value` + `@input`（或对应 prop/event）的语法糖，实现双向绑定。

**事件与内容：** `v-on` 支持 `.stop`、`.prevent` 等修饰符；`v-text` 替换 `textContent`，`v-html` 设置 `innerHTML`（有 XSS 风险，需信任内容）。

**注意事项：**
- `v-if` 与 `v-for` 不建议同元素使用（Vue2 中 v-for 优先级更高，Vue3 中 v-if 更高）
- `v-show` 不支持 `<template>` 和 `v-else`
- 自定义指令通过 `directives` 选项或 `app.directive()` 注册，生命周期钩子：`created → beforeMount → mounted → beforeUpdate → updated → beforeUnmount → unmounted`

**代码示例：**

```vue
<template>
  <div>
    <!-- 条件渲染 -->
    <p v-if="type === 'A'">类型 A</p>
    <p v-else-if="type === 'B'">类型 B</p>
    <p v-show="visible">始终存在于 DOM</p>

    <!-- 列表渲染 -->
    <ul>
      <li v-for="item in list" :key="item.id">{{ item.name }}</li>
    </ul>

    <!-- 双向绑定 + 事件修饰符 -->
    <input v-model.trim="keyword" @keyup.enter="search" />

    <!-- 属性绑定 -->
    <img :src="url" :class="{ active: isActive }" />
  </div>
</template>
```

**面试追问：**
1. **`v-if` 和 `v-show` 在编译和运行时分别做了什么？什么场景选哪个？** `v-if` 编译为三元表达式控制 VNode 是否创建，切换时销毁/重建 DOM；`v-show` 编译为指令，始终创建 DOM 只切换 `display`。频繁切换用 `v-show`（避免重建开销），条件很少变化用 `v-if`（减少首次渲染量）。
2. **为什么 `v-for` 的 `:key` 不建议用 index？什么情况下可以用 index？** index 在列表增删/排序时会变化，导致 diff 误判为内容变化，复用错误 DOM 节点（如输入框状态错乱）。纯展示、不会增删排序的静态列表可以用 index。

---

## 2. Vue diff 算法的原理

**记忆口诀：**「同层比较不跨级，先比 type 再比 key，Vue2 双端四指针，Vue3 最长递增子序列」

**一句话总结：** Diff 算法通过同层比较新旧 VNode 树，找出最小 DOM 变更集，Vue2 用双端对比，Vue3 在此基础上引入最长递增子序列优化列表移动。

| 对比项 | Vue 2 | Vue 3 |
| --- | --- | --- |
| 列表 diff | 双端对比（头头/尾尾/头尾/尾头） | 头尾预处理 + 最长递增子序列 |
| 静态优化 | patchFlag 有限 | Block Tree + patchFlag + 静态提升 |
| 比较策略 | 全量递归 | 按 Block 追踪动态节点 |
| key 作用 | 复用同 type+key 节点 | 同左，且配合 LIS 减少移动 |

**详细解答：**

Virtual DOM 的核心价值不是"比 DOM 快"，而是提供可编程的中间层 + 批量更新。Diff 的目标是**以 O(n) 复杂度找出两棵同层 VNode 树的最小差异**。

**三大原则：**
1. **同层比较**：只比较同一层级，不跨层级移动（跨层视为删除+新建）
2. **type 不同直接替换**：标签/组件类型变了，整棵子树重建
3. **key + type 相同则复用**：复用 DOM 节点，仅 patch props 和 children

**Vue 2 双端对比流程：**
- 维护 oldStart/oldEnd/newStart/newEnd 四个指针
- 头头比 → 尾尾比 → 头尾比 → 尾头比，匹配则移动指针
- 都不匹配则在 oldChildren 中按 key 查找，找到则移动 DOM，找不到则新建
- 指针交叉后，剩余 old 删除，剩余 new 插入

**Vue 3 优化：**
1. 头尾预处理消去不变前缀/后缀（如 `[a,b]` 和 `[a,b,f,c,d,e,h,g]` 先锁定 a、b、g）
2. 中间乱序段建立 `newIndexToOldIndexMap`
3. 对 map 求**最长递增子序列（LIS）**，LIS 对应节点不移动，其余做 insert/move
4. 编译期 **patchFlag** 标记动态属性，运行时跳过静态内容对比

**key 的作用：** 唯一标识列表节点，使 diff 能正确复用 DOM 而非就地复用导致状态错乱（如 input 光标、组件内部状态）。

**代码示例：**

```javascript
// Vue 3 核心判断：type + key 一致才视为同一节点
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

// 最长递增子序列示意（简化）
// old: [a, b, c, d, e, f, g]
// new: [a, b, f, c, d, e, h, g]
// 中间段 oldIndex: [5, 2, 3, 4, -1]
// LIS = [2, 3, 4] → c,d,e 不移动，f 移到前面，h 新增
```

**面试追问：**
1. **为什么 diff 不做跨层级比较？如果确实需要跨层移动怎么办？** 跨层级移动在实际业务中极少出现，同层比较将 O(n³) 降为 O(n)。确实需要跨层移动时，使用 `<Teleport>` 组件或手动管理 DOM。
2. **Vue 3 最长递增子序列算法的时间复杂度是多少？为什么能减少 DOM 移动？** O(n log n)。LIS 找出最长不需要移动的节点序列，只移动不在该序列中的节点，最小化 DOM 操作次数。

---

## 3. vue mixin解决了什么问题，原理以及缺点？

**记忆口诀：**「mixins 混选项共享逻辑，命名冲突是痛点，Vue3 推荐 Composition API 替代」

**一句话总结：** Mixin 通过 `mergeOptions` 将可复用选项（data、methods、生命周期等）合并进组件，解决 Options API 时代逻辑复用问题，但带来来源不透明和命名冲突。

| 对比项 | `mixins`（局部） | `Vue.mixin`（全局） |
| --- | --- | --- |
| 作用范围 | 单个组件 | 所有组件实例 |
| 合并方式 | `mergeOptions` | 同左 |
| 钩子顺序 | mixin 先于组件执行 | 同左 |
| 典型场景 | 组件逻辑复用 | 插件初始化（如 vuex、vue-router） |

**详细解答：**

**解决的问题：** 在 Options API 中，多个组件共享相同 data、methods、生命周期逻辑时，避免 copy-paste，实现"横向复用"。

**原理 — mergeOptions 合并策略：**
1. 递归合并 `extends` 和 `mixins` 数组中的每个对象
2. 不同选项有不同策略：
   - `data`：递归合并，组件优先
   - `methods` / `computed` / `components`：同名时组件覆盖 mixin
   - 生命周期钩子：合并为数组，**mixin 钩子先执行，组件钩子后执行**
   - `watch`：合并为对象，key 冲突组件优先

```javascript
// 简化合并逻辑
if (child.mixins) {
  for (let i = 0; i < child.mixins.length; i++) {
    parent = mergeOptions(parent, child.mixins[i], vm)
  }
}
```

**与 extends 区别：** `extends` 类似单继承，`mixins` 支持多个混入对象数组。

**缺点（面试重点）：**
1. **命名冲突**：多个 mixin 或 mixin 与组件同名属性，覆盖规则不直观
2. **来源不透明**：组件用了哪些 data/methods，需逐个翻 mixin 文件
3. **耦合性高**：修改 mixin 可能影响所有使用方，难以追踪
4. **TypeScript 支持差**：类型推断困难
5. **隐式依赖**：mixin 间可能存在隐式依赖，难以 tree-shaking

**Vue 3 替代方案：** Composition API（`composables`）——显式 import、命名空间清晰、可按需组合。

**代码示例：**

```javascript
// mixins/logger.js
export default {
  created() {
    console.log(`[${this.$options.name}] created`)
  },
  methods: {
    log(msg) { console.log(msg) }
  }
}

// 组件中使用
export default {
  mixins: [logger],
  name: 'MyComponent',
  created() {
    // mixin 的 created 先执行，再执行这里
    this.log('hello')
  }
}
```

**面试追问：**
1. **mixin 和 extends 的生命周期钩子执行顺序是什么？** mixin 的钩子先于组件自身执行；多个 mixin 按声明顺序依次执行；extends 的钩子在 mixin 之前执行。data/methods 等选项冲突时组件自身优先。
2. **为什么 Vue 3 官方推荐用 Composables 而不是 mixins？** Composables 是显式函数调用，数据来源清晰、无命名冲突、TypeScript 友好、可按需引入；mixin 是隐式合并，多个 mixin 冲突难调试，来源不透明。

---

## 4. vue3有哪些改变？

**记忆口诀：**「Proxy 响应式、Composition API 组合逻辑、Fragment/Teleport/Suspense 新组件、编译优化 Tree-shaking」

**一句话总结：** Vue 3 在响应式底层、组合式 API、编译优化和新特性组件上全面重构，追求更好的性能、TypeScript 支持和逻辑复用能力。

| 维度 | Vue 2 | Vue 3 |
| --- | --- | --- |
| 响应式 | `Object.defineProperty` | `Proxy` |
| API 风格 | Options API 为主 | Composition API + Options API |
| 根节点 | 单根 | Fragment 多根 |
| 生命周期 | `beforeDestroy` / `destroyed` | `beforeUnmount` / `unmounted` |
| 异步组件 | 工厂函数 + 组件选项 | `defineAsyncComponent` |
| v-model | 单个，默认 value/input | 多个，默认 modelValue/update:modelValue |
| 打包 | 整体引入 | ESM + Tree-shaking |
| TS 支持 | 有限 | 原生友好 |

**详细解答：**

**1. 响应式系统重写**
- Proxy 代理整个对象，天然支持属性新增/删除、数组索引/length 变更
- 惰性代理：访问嵌套对象时才递归代理，初始化更快
- 支持 `Map`、`Set`、`WeakMap`、`WeakSet`

**2. Composition API**
- `setup()` / `<script setup>` 按逻辑组织代码，而非按选项类型
- `ref`、`reactive`、`computed`、`watch`、`watchEffect` 等独立 API
- 更好的逻辑复用（Composables）和 TypeScript 推断

**3. 新特性组件**
- **Fragment**：多根节点，减少无意义 wrapper div
- **Teleport**：将子树渲染到 DOM 任意位置（模态框、Toast）
- **Suspense**：异步组件加载态统一管理

**4. 编译优化**
- **静态提升（hoistStatic）**：静态 VNode 提升为模块常量
- **PatchFlag**：标记动态类型（class、text、props 等），diff 时跳过静态
- **Block Tree**：收集动态节点，更新时只 diff 动态部分
- **事件缓存**：内联 handler 缓存避免重复创建

**5. 其他重要变化**
- 自定义渲染器 API（`createRenderer`）——支持小程序、Canvas 等
- `createApp` 替代 `new Vue`，支持多应用实例
- `emits` 显式声明、`expose` 控制暴露、`defineProps` / `defineEmits` 宏
- 移除 `$on` / `$off` / `$once` 事件 API
- Filters 过滤器移除

**代码示例：**

```vue
<!-- Vue 3 Composition API + 新特性 -->
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const modalOpen = ref(false)

onMounted(() => console.log('mounted'))
</script>

<template>
  <!-- Fragment：多根节点 -->
  <header>标题</header>
  <main>{{ count }}</main>

  <!-- Teleport -->
  <teleport to="body">
    <div v-if="modalOpen" class="modal">模态框</div>
  </teleport>
</template>
```

**面试追问：**
1. **Vue 3 的静态提升和 Block Tree 分别解决了什么问题？** 静态提升（hoistStatic）将纯静态节点的 VNode 创建提到 render 函数外，避免每次渲染重新创建；Block Tree 将动态节点收集到 flat 数组，diff 时只遍历动态节点跳过静态子树。
2. **Vue 3 为什么移除 Filters？推荐用什么替代？** Filters 语法特殊（管道符 `|`）、不能 tree-shake、与 JS 表达式混淆。推荐用 computed 属性或普通函数调用替代，更直观且可复用。

---

## 5. 说一下generator的原理

**记忆口诀：**「调用返迭代器，next 遇 yield 暂停，value 给值 done 判终」

**一句话总结：** Generator 是 ES6 提供的可暂停函数，调用后返回迭代器，通过 `yield` 分步产出值，底层依赖协程上下文保存与恢复。

**详细解答：**

Generator 函数（`function*`）是 JavaScript 实现**协程**的基础，也是 async/await 的底层实现之一。

**执行机制：**
1. 调用 Generator 函数**不立即执行**函数体，而是返回一个**迭代器对象**（同时是 Iterable）
2. 调用 `iterator.next()` 才开始/继续执行，直到遇到 `yield` 或 `return`
3. 遇到 `yield expr`：暂停执行，返回 `{ value: expr, done: false }`
4. `next(arg)` 的参数会作为上一个 `yield` 表达式的返回值（双向通信）
5. 遇到 `return` 或函数结束：返回 `{ value: xxx, done: true }`
6. 抛出异常：迭代器 `done` 变为 true，异常在外部 `try/catch` 捕获

**与 Vue 的关联：**
- Vue 2 的 `asyncGeneratorStep` / `regeneratorRuntime` 用于编译 async 函数
- 早期 `co` 库 + Generator 实现异步流程控制
- 现代开发中 async/await 是 Generator + Promise 的语法糖

**关键 API：**
- `yield*`：委托给另一个 Generator 或可迭代对象
- `iterator.throw(err)`：在暂停处注入异常
- `iterator.return(val)`：强制结束 Generator

**代码示例：**

```javascript
function* idGenerator() {
  let id = 0
  while (true) {
    const reset = yield ++id  // next 传入的值赋给 reset
    if (reset) id = 0
  }
}

const gen = idGenerator()
console.log(gen.next())       // { value: 1, done: false }
console.log(gen.next())       // { value: 2, done: false }
console.log(gen.next(true))   // { value: 1, done: false } — reset
console.log(gen.return(99))   // { value: 99, done: true }

// yield* 委托
function* inner() { yield 2; yield 3 }
function* outer() { yield 1; yield* inner(); yield 4 }
// [...outer()] → [1, 2, 3, 4]
```

**面试追问：**
1. **Generator 和 async/await 是什么关系？async 函数本质上如何工作？** async/await 是 Generator + Promise 的语法糖。async 函数内部相当于自动执行器驱动 Generator：`await expr` 等价于 `yield Promise.resolve(expr)`，执行器在 Promise resolve 后自动调用 `next()` 继续执行。
2. **`yield` 和 `return` 在迭代器结果上有什么区别？** `yield` 返回 `{ value, done: false }`，生成器暂停可继续；`return` 返回 `{ value, done: true }`，生成器结束。`for...of` 会忽略 return 的值，只消费 yield 的值。

---

## 6. 谈谈你对vue的理解

**记忆口诀：**「渐进式框架、数据驱动、组件化、响应式、虚拟DOM」

**一句话总结：** Vue 是渐进式、数据驱动的 MVVM 框架，通过响应式系统连接数据与视图，组件化 + 虚拟 DOM 实现高效可维护的前端应用开发。

**详细解答：**

**核心定位 — 渐进式框架：**
- 可以只用 `<script>` 标签引入做局部增强
- 也可以 Vue Router + Pinia/Vuex 构建完整 SPA
- 通过 `@vue/server-renderer` 做 SSR，通过自定义渲染器扩展到小程序/Native
- 按需采纳，不强制全家桶

**核心思想 — 数据驱动视图（MVVM）：**
- **Model**：响应式 data / reactive state
- **View**：模板编译后的 render 函数
- **ViewModel**：Vue 实例 / 组件实例，负责绑定与调度
- 开发者关注"状态变化"，框架负责"视图同步"

**五大技术支柱：**

1. **响应式系统**：数据变更 → Dep 通知 → Watcher/Effect 触发 → 组件 re-render
2. **模板编译**：template → AST → render function → VNode
3. **虚拟 DOM + Diff**：计算最小更新，批量 patch 真实 DOM
4. **组件化**：SFC 单文件组件，props down / events up，插槽扩展
5. **编译优化（Vue 3）**：静态提升、Block Tree、Tree-shaking

**生态与优势：**
- 易学易用：模板语法接近 HTML，中文文档完善
- 性能优秀：Vue 3 编译期优化 + 响应式惰性代理
- 灵活组合：Options API 与 Composition API 共存
- 工具链成熟：Vite、Vue DevTools、VueUse

**适用场景：** 中后台管理系统、SPA、SSR 站点、移动端 H5、跨端（uni-app 等）均适合。

**代码示例：**

```vue
<!-- 一个典型 Vue 组件体现核心思想 -->
<script setup>
import { ref, computed } from 'vue'

const todos = ref([{ text: '学习 Vue', done: false }])
const remaining = computed(() => todos.value.filter(t => !t.done).length)

function addTodo(text) {
  todos.value.push({ text, done: false }) // 数据驱动，视图自动更新
}
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.text">{{ todo.text }}</li>
  </ul>
  <p>剩余 {{ remaining }} 项</p>
</template>
```

**面试追问：**
1. **你怎么理解 Vue 的"渐进式"？和 React/Angular 的定位差异是什么？** 渐进式指可以只用核心（声明式渲染），按需引入路由、状态管理、SSR 等。React 定位为 UI 库需自行搭配生态；Angular 是全家桶框架，开箱即用但学习曲线陡。Vue 介于两者之间，核心精简但官方生态完整。
2. **Vue 2 和 Vue 3 在架构设计上的最大区别是什么？** ① 响应式从 defineProperty 改为 Proxy；② 引入 Composition API 替代 Options API 为主要组织方式；③ 编译器做了大量优化（静态提升、PatchFlag、Block Tree）；④ 源码用 TypeScript 重写，monorepo 拆包。

---

## 7. 双向数据绑定的原理

**记忆口诀：**「数据劫持 + 发布订阅：Observer 监听 → Dep 收集 → Watcher 通知 → 视图更新」

**一句话总结：** Vue 双向绑定本质是响应式（数据→视图）加 v-model 语法糖（视图→数据），底层通过数据劫持 + 发布订阅 + 虚拟 DOM 更新实现。

**详细解答：**

严格来说，Vue 的"双向绑定"分两个方向：

**数据 → 视图（响应式）：**
1. **Observer**：递归遍历 data，用 `defineProperty`（Vue2）或 `Proxy`（Vue3）劫持 getter/setter
2. **Dep**：每个响应式属性对应一个依赖收集器
3. getter 中 `dep.depend()` 收集当前正在计算的 Watcher/Effect
4. setter 中 `dep.notify()` 通知所有订阅者更新

**视图 → 数据（v-model）：**
- 监听 DOM 事件（input/change），将用户输入写回 data
- 本质是 `:value` + `@input` 语法糖

**完整链路（Vue 2）：**

```
new Vue()
  → initState() 初始化 data，observe(data)
  → compile/template 编译，为每个绑定创建 Watcher
  → 渲染 Watcher 执行 render()，触发 getter，Dep 收集依赖
  → 数据变更 → setter → dep.notify()
  → Watcher.update() → queueWatcher（异步队列）
  → nextTick → render Watcher.run() → 新 VNode → patch DOM
```

**MVVM 角色：**
- **Observer**：数据监听器
- **Compiler**：模板编译，解析指令/插值，创建更新函数
- **Watcher**：连接 Observer 与 Compiler 的桥梁
- **Scheduler**：异步批量更新队列

**Vue 3 变化：** `effect` 替代 Watcher，`track/trigger` 替代 Dep，组件实例不再是响应式对象本身。

**代码示例：**

```javascript
// 简化版响应式原理（Vue 3 风格）
let activeEffect = null

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)       // 依赖收集
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)     // 派发更新
      return true
    }
  })
}

function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}
```

**面试追问：**
1. **Vue 的"双向绑定"和 Angular 的双向绑定实现方式有什么不同？** Vue 用 `Object.defineProperty`/`Proxy` 劫持 getter/setter，精确追踪依赖；Angular 用脏检查（Zone.js 拦截异步事件后遍历所有绑定检查变化）。Vue 更精确，Angular 检查范围更广但实现更简单。
2. **从修改 data 到页面更新，中间为什么是异步的？** 同一事件循环内可能多次修改 data，若每次都同步 re-render 开销太大。Vue 将更新放入微任务队列，批量去重后一次性 patch，显著减少 DOM 操作。

---

## 8. 使用 Object.defineProperty() 跟Proxy进行数据劫持分别有什么缺点？

**记忆口诀：**「defineProperty 逐属性劫持不能监听新增/删除/数组下标，Proxy 整体代理全能但不兼容 IE」

**一句话总结：** defineProperty 需逐属性定义、无法感知新增/删除和部分数组操作；Proxy 能拦截全部操作但兼容性受限且需通过原始对象访问。

| 对比项 | Object.defineProperty | Proxy |
| --- | --- | --- |
| 拦截粒度 | 单个属性 | 整个对象 |
| 新增/删除属性 | ❌ 需 `$set`/`$delete` | ✅ 自动追踪 |
| 数组索引/length | ❌ 需重写方法 hack | ✅ 原生支持 |
| 初始化成本 | 递归 define 所有属性 | 惰性代理，按需递归 |
| 兼容性 | IE9+ | 不支持 IE，ES6+ |
| 原始对象访问 | 直接访问 | 需 `.raw` 或 toRaw |
| 嵌套对象 | 递归 define | 访问时 lazy reactive |

**详细解答：**

**Object.defineProperty 的缺点：**

1. **无法检测新增/删除属性**：必须在初始化时就存在该属性才能被劫持；Vue 2 提供 `Vue.set` / `this.$set`  workaround
2. **数组限制**：无法拦截 `push/pop/splice` 等方法的语义（索引变化），Vue 2 重写数组原型方法 + 手动 notify
3. **性能问题**：深层对象需递归遍历所有 key 并 defineProperty，初始化开销大
4. **Map/Set/类实例**：难以劫持
5. **需已知 key**：动态属性名场景不友好

**Proxy 的缺点：**

1. **兼容性**：不支持 IE11 及以下，部分旧 WebView 需 polyfill 或降级
2. **Proxy 本身无法 polyfill**：无法在不支持 Proxy 的环境"模拟"完整语义
3. **原始对象隔离**：操作的是 Proxy 包装对象，某些场景需 `toRaw()` 获取原始对象（如 `JSON.stringify` 需注意）
4. **性能考量**：每次 get/set 都经过 handler，极端高频读写场景需 benchmark（实际 Vue 3 整体更快）
5. **无法拦截私有属性**（private fields `#xxx`）

**Vue 的应对策略：**
- Vue 2：数组方法重写 + `$set`/`$delete` + 递归 Observer
- Vue 3：全面 Proxy + `Reflect` 操作 + lazy reactive

**代码示例：**

```javascript
// defineProperty 无法监听新增属性
const obj = {}
Object.defineProperty(obj, 'a', {
  get() { return this._a },
  set(v) { this._a = v; console.log('a changed') }
})
obj.a = 1        // ✅ 触发
obj.b = 2        // ❌ 不触发

// Proxy 可以
const proxy = new Proxy({}, {
  set(target, key, value) {
    console.log(`set ${key}`)
    target[key] = value
    return true
  }
})
proxy.newKey = 'hello'  // ✅ 触发
```

**面试追问：**
1. **Vue 2 是如何解决数组变异方法监听问题的？** 重写数组原型上的 7 个变异方法（push/pop/shift/unshift/splice/sort/reverse），在方法执行后手动 `ob.dep.notify()` 通知更新。索引赋值和 length 修改无法拦截，需用 `$set`。
2. **为什么 Vue 3 选择 Proxy 而不是继续优化 defineProperty？** defineProperty 的根本限制无法突破：无法拦截新增/删除属性、数组索引/length、Map/Set 等。Proxy 代理整个对象一劳永逸，还支持惰性递归（访问时才代理子对象），初始化更快。代价是不支持 IE。

---

## 9. Computed 和 Watch 的区别

**记忆口诀：**「computed 有缓存依赖变才算，watch 无缓存变了就执行；computed 同步算值，watch 适合异步操作」

**一句话总结：** Computed 是基于依赖的惰性缓存"派生状态"，Watch 是对特定数据源变化的"副作用监听"。

| 对比项 | Computed | Watch |
| --- | --- | --- |
| 缓存 | ✅ 依赖不变不重新计算 | ❌ 每次变化都执行 |
| 返回值 | 必须有返回值 | 无返回值，执行副作用 |
| 异步 | 不支持（应纯同步） | ✅ 适合异步操作 |
| 初始化执行 | 默认不执行（访问时） | `immediate: true` 可立即执行 |
| 深度监听 | 自动追踪依赖 | 需 `deep: true` |
| 使用场景 | 派生/格式化/过滤数据 | 请求、防抖、复杂联动 |

**详细解答：**

**Computed 原理：**
- 内部创建 **Computed Watcher**，`lazy: true`
- 首次访问时计算，将依赖收集到 Computed Watcher 的 Dep
- 依赖变化时标记 dirty，下次访问才重新计算
- 支持 getter/setter（`computed: { fullName: { get, set } }`）

**Watch 原理：**
- 为监听源创建 **User Watcher**
- 源变化时执行 callback，可获取 `newVal` 和 `oldVal`
- 默认浅比较（引用比较），对象需 `deep: true`
- Vue 3 `watchEffect` 自动收集依赖，无需显式指定源

**选型原则：**
- 需要一个**值**用于模板展示 → `computed`（如 `filteredList`、`fullName`）
- 需要在数据变化时**做某事** → `watch`（如发请求、操作 DOM、路由跳转）
- 多个数据组合派生 → `computed`
- 监听路由/param/query 变化 → `watch(() => route.params.id, ...)`

**代码示例：**

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const firstName = ref('张')
const lastName = ref('三')
const keyword = ref('')

// computed：派生值，有缓存
const fullName = computed(() => `${firstName.value}${lastName.value}`)

// watch：副作用，适合异步
watch(keyword, async (newVal) => {
  if (!newVal) return
  const res = await fetch(`/api/search?q=${newVal}`)
  // 处理搜索结果...
}, { debounce: 300 }) // Vue 3.5+ 或自行 debounce
</script>
```

**面试追问：**
1. **computed 的缓存是如何实现的？什么情况下 computed 会重新计算？** Vue 2 中 computed watcher 有 `dirty` 标志，依赖变化时 `dirty = true`，下次访问才重新计算（lazy）；Vue 3 用 `ReactiveEffect` + `scheduler`，依赖的 reactive 数据 trigger 时标记脏值。只有依赖变化且被访问时才重新计算。
2. **`watch` 和 `watchEffect` 有什么区别？各自适用什么场景？** `watch` 需显式声明监听源，可获取新旧值，默认懒执行；`watchEffect` 立即执行并自动收集函数内依赖，无旧值。watch 适合对特定数据变化做精确响应；watchEffect 适合副作用依赖多个响应式数据且不需要旧值的场景。

---

## 10. Computed 和 Methods 的区别

**记忆口诀：**「computed 看依赖有缓存，methods 每次调用都执行」

**一句话总结：** 两者都能得到相同结果，但 computed 基于依赖缓存、作为响应式属性访问；methods 是每次调用都执行的函数。

| 对比项 | Computed | Methods |
| --- | --- | --- |
| 触发方式 | 依赖变化时标记 dirty，访问时计算 | 每次调用都执行 |
| 缓存 | ✅ | ❌ |
| 模板语法 | `{{ fullName }}`（无括号） | `{{ formatDate() }}`（需括号） |
| 参数 | 不支持传参 | ✅ 可传参 |
| 适用场景 | 派生状态 | 事件处理、需参数的逻辑 |

**详细解答：**

**Computed 特点：**
- 本质是一个 **Watcher**，具备 lazy 缓存机制
- 在 render 过程中被访问时，若 `dirty === false` 直接返回 `_value`
- 依赖的响应式数据未变，多次访问不会重复计算
- 适合"从已有状态派生新状态"的场景

**Methods 特点：**
- 普通函数，挂载在组件实例上
- 每次模板 re-render 中被调用就会执行（即使参数和依赖没变）
- 适合事件处理器、需要参数的计算、不需要缓存的操作

**性能考量：**
- 模板中 `<div v-for="item in list">{{ compute(item) }}</div>` 若用 methods，每次父组件更新都会全量重算
- 改用 computed（返回处理后的 list）或确保 methods 足够轻量

**代码示例：**

```vue
<template>
  <p>{{ reversedMessage }}</p>       <!-- computed：无括号 -->
  <p>{{ reverseMessage() }}</p>     <!-- methods：有括号，每次 render 都执行 -->
</template>

<script>
export default {
  data() { return { message: 'Hello' } },
  computed: {
    reversedMessage() {
      console.log('computed 执行')
      return this.message.split('').reverse().join('')
    }
  },
  methods: {
    reverseMessage() {
      console.log('method 执行')
      return this.message.split('').reverse().join('')
    }
  }
}
</script>
```

**面试追问：**
1. **什么情况下你会选择 methods 而不是 computed？** 需要传参数时（computed 不接受参数）、需要主动触发（事件处理）、有副作用（API 请求、DOM 操作）时用 methods。纯数据派生用 computed。
2. **computed 和 methods 在组件 re-render 时的执行时机有什么不同？** re-render 时 methods 在模板中每次引用都会重新执行；computed 只有依赖变化时才重新计算，依赖未变则直接返回缓存值，不会因为无关数据变化而执行。

---

## 11. slot是什么？有什么作用？原理是什么？

**记忆口诀：**「默认匿名一个，具名靠 name，作用域插槽子传父」

**一句话总结：** Slot 是 Vue 的内容分发机制，允许父组件向子组件指定位置注入模板内容，作用域插槽还能让子组件向父组件回传数据。

| 类型 | 语法 | 特点 |
| --- | --- | --- |
| 默认插槽 | `<slot />` | 一个组件只有一个默认插槽 |
| 具名插槽 | `<slot name="header" />` | 可多个，父用 `v-slot:name` 或 `#name` |
| 作用域插槽 | `<slot :item="item" />` | 子传数据给父，父决定如何渲染 |
| Vue 3 新语法 | `v-slot` → `#` 简写 | 统一为 `v-slot` / `#` |

**详细解答：**

**作用：**
1. **组件复用与灵活布局**：子组件定义骨架，父组件填充具体内容（如 Card、Layout、Table）
2. **解耦**：子组件不关心插槽内容的具体实现
3. **作用域插槽**：父组件使用子组件内部数据（如 el-table 的自定义列）

**原理：**

**编译阶段：**
- 父组件插槽内容被编译为 **slot functions**（Vue 3）或 **renderSlot 调用**
- 子组件 `<slot>` 在 render 时调用 `$slots.default()` 或 `$slots.xxx()`

**运行时（Vue 2）：**
- 实例化时，父组件 vnode 的 `children` 按 slot 名分类存入 `vm.$slots`
- 渲染子组件遇到 `<slot>` 时，用 `$slots` 对应内容替换

**Vue 3 优化：**
- 插槽编译为函数，**延迟执行 + 独立更新**，父更新不一定导致插槽重渲染
- `useSlots()` / `useAttrs()` 在 setup 中访问

**代码示例：**

```vue
<!-- 子组件 BaseLayout.vue -->
<template>
  <div class="layout">
    <header><slot name="header" /></header>
    <main><slot /></main>
    <footer>
      <slot name="footer" :year="2026" />  <!-- 作用域插槽 -->
    </footer>
  </div>
</template>

<!-- 父组件 -->
<BaseLayout>
  <template #header><h1>页面标题</h1></template>
  <p>主内容</p>
  <template #footer="{ year }">
    <p>© {{ year }} Company</p>
  </template>
</BaseLayout>
```

**面试追问：**
1. **作用域插槽和 props 传数据有什么本质区别？** props 是父传子数据，子组件决定如何渲染；作用域插槽是子传父数据 + 父决定如何渲染，实现了「数据提供方」和「渲染决策方」的反转，类似 React 的 render props。
2. **Vue 3 插槽编译为函数带来了什么性能优势？** Vue 2 中父组件更新会强制子组件插槽重渲染；Vue 3 将插槽编译为惰性函数，只有插槽内容的依赖变化时才重新执行，避免不必要的子组件更新。

---

## 12. 说一下mvc、mvp以及mvvm的区别和使用场景

**记忆口诀：**「MVC 控制器中转，MVP Presenter 替 Controller，MVVM ViewModel 双向绑」

**一句话总结：** 三者都是分层架构，核心区别在于 View 与 Model 的通信方式——MVC 经 Controller 中转，MVP 由 Presenter 完全接管，MVVM 通过 ViewModel 自动双向绑定。

| 模式 | 数据流 | View 与 Model | 耦合度 | 代表 |
| --- | --- | --- | --- | --- |
| MVC | View → Controller → Model → View | 可能直接读取 Model | 中 | Spring MVC、Rails |
| MVP | View ↔ Presenter ↔ Model | 完全隔离，View 被动 | 低 | Android 早期、GWT |
| MVVM | View ↔ ViewModel ↔ Model | 数据绑定自动同步 | 低（框架依赖） | Vue、Angular |

**详细解答：**

**MVC（Model-View-Controller）：**
- **Model**：数据和业务逻辑
- **View**：展示层，负责渲染
- **Controller**：接收用户输入，调用 Model，选择 View 展示
- 问题：View 和 Model 可能直接通信（尤其服务端 MVC），导致耦合；前端 AngularJS 1.x 中 Controller 容易膨胀

**MVP（Model-View-Presenter）：**
- **Presenter** 替代 Controller，且更"重"
- View 完全被动（Passive View），只负责展示和用户事件转发
- Presenter 从 Model 取数据，格式化后驱动 View 更新
- View 与 Model **完全解耦**，便于单元测试 Presenter
- 缺点：Presenter 代码量大，需手动维护 View 状态同步

**MVVM（Model-View-ViewModel）：**
- **ViewModel**：View 的状态抽象，暴露可绑定数据和命令
- **数据绑定**：View 变化自动更新 ViewModel，ViewModel 变化自动更新 View
- 开发者无需手动操作 DOM（声明式）
- 缺点：调试数据流不如命令式直观；复杂场景 binding 可能产生性能问题

**使用场景：**
- **MVC**：传统服务端渲染、简单 CRUD 应用
- **MVP**：需要高可测试性的桌面/GUI 应用
- **MVVM**：现代 SPA、数据驱动 UI 框架（Vue、Angular、WPF）

**Vue 的 MVVM 体现：**
- Model → `data` / `reactive`
- View → `template`
- ViewModel → Vue 组件实例 + 响应式绑定系统

**面试追问：**
1. **Vue 更接近 MVP 还是 MVVM？为什么？** 更接近 MVVM。Vue 的 ViewModel（组件实例）自动同步 Model（data）和 View（template），开发者不需要手动操作 DOM。但严格说 Vue 允许直接操作 DOM（ref），并非纯 MVVM。
2. **MVVM 的数据绑定在大型应用中可能带来什么问题？如何规避？** 过度的响应式追踪可能导致性能问题（大量 watcher）和调试困难（数据变化链路不透明）。规避：合理使用 `shallowRef/shallowReactive`、`Object.freeze` 冻结纯展示数据、模块化 store 管理状态。

---

## 13. 如何保存页面的当前的状态

**记忆口诀：**「卸载存 Storage/路由 state，不卸载用 keep-alive + activated」

**一句话总结：** 根据组件是否被销毁，选择 keep-alive 缓存、Storage 持久化、路由传参或全局状态管理来保存页面状态。

| 场景 | 方案 | 适用 |
| --- | --- | --- |
| 组件不销毁 | `keep-alive` | Tab 切换、列表→详情→返回 |
| 组件销毁 | `localStorage` / `sessionStorage` | 刷新恢复、跨会话 |
| 组件销毁 | 路由 params/query/state | 页面间临时传递 |
| 任意 | Pinia/Vuex + 持久化插件 | 复杂全局状态 |
| SSR | `useState` / cookie | 服务端渲染场景 |

**详细解答：**

**场景一：组件不会被卸载（最常见）**

使用 `<keep-alive>` 缓存组件实例，切换时保留 data、scroll 位置、表单输入：

```vue
<keep-alive :include="['ListPage']" :max="10">
  <router-view :key="$route.fullPath" />
</keep-alive>
```

- `include`/`exclude`：按组件 name 匹配
- `max`：LRU 缓存上限
- 生命周期：`activated`（进入）/ `deactivated`（离开）
- 配合路由 meta：`meta: { keepAlive: true }`

**场景二：组件会被卸载**

1. **Storage 持久化**：在 `onBeforeUnmount` 中 `JSON.stringify` 保存，进入时恢复；注意 Date、Map 等需自定义序列化
2. **路由 state**：`router.push({ name: 'Detail', state: { scroll: 100 } })`，刷新后丢失
3. **URL 参数**：适合可分享、可书签的状态（筛选条件、页码）
4. **Pinia + pinia-plugin-persistedstate**：全局状态持久化

**最佳实践：**
- 列表页滚动位置：keep-alive + `activated` 中恢复，或 `scrollBehavior`
- 表单草稿：`sessionStorage` 或 `debounce` 自动保存
- 区分"返回需恢复"和"新进入需重置"：用路由 meta flag 或 `onBeforeRouteEnter` 判断

**代码示例：**

```javascript
// 路由配置
{
  path: '/list',
  component: () => import('@/views/List.vue'),
  meta: { keepAlive: true }
}

// List.vue — 保存滚动位置
export default {
  name: 'ListPage',
  activated() {
    this.$refs.scrollContainer.scrollTop = this.scrollTop
  },
  deactivated() {
    this.scrollTop = this.$refs.scrollContainer.scrollTop
  }
}
```

**面试追问：**
1. **keep-alive 的 LRU 缓存策略是什么？include 和 exclude 的匹配规则？** LRU（最近最少使用）：超出 `max` 限制时淘汰最久未访问的缓存组件。include/exclude 匹配组件的 `name` 选项，支持字符串（逗号分隔）、正则和数组。
2. **如果 keep-alive 缓存的组件需要刷新数据，你会怎么做？** 在 `activated` 钩子中重新请求数据；或 `watch` 路由参数变化触发刷新；也可通过改变 `<router-view :key>` 强制重建（但失去缓存意义）。

---

## 14. 常见的事件修饰符及其作用

**记忆口诀：**「stop 阻冒泡，prevent 阻默认，capture 捕获，self 仅自身，once 只一次」

**一句话总结：** Vue 事件修饰符是对原生 DOM 事件行为的声明式封装，在编译时追加到 handler 外层，按特定顺序链式调用。

| 修饰符 | 等价原生操作 | 作用 |
| --- | --- | --- |
| `.stop` | `event.stopPropagation()` | 阻止冒泡 |
| `.prevent` | `event.preventDefault()` | 阻止默认行为 |
| `.capture` | 捕获阶段监听 | 事件捕获模式 |
| `.self` | `if (e.target === e.currentTarget)` | 仅目标元素自身触发 |
| `.once` | 触发后自动 removeEventListener | 只触发一次 |
| `.passive` | `{ passive: true }` | 不阻止默认，优化滚动性能 |
| `.native`（Vue2） | 监听组件根元素原生事件 | Vue3 已移除 |
| 按键修饰符 | `keyCode` / `key` 判断 | 如 `.enter`、`.esc`、`.tab` |
| 鼠标修饰符 | button 判断 | `.left`、`.right`、`.middle` |
| 系统修饰符 | meta/ctrl/shift/alt | 组合键 |

**详细解答：**

**修饰符链式调用顺序：** 编译后从外到内包裹 handler，如 `@click.stop.prevent` → 先 stop 再 prevent。

**Vue 3 变化：**
- 移除 `.native`：未声明在 `emits` 中的 v-on 监听器默认作为原生 attrs 绑定到根元素
- 显式 `emits: ['click']` 可区分组件事件和原生事件

**按键修饰符：**
- Vue 3 推荐使用 `.enter`、`.tab` 等别名，不再推荐 `keyCode`
- 自定义：`<input @keyup.space="submit" />`

**`.passive` 与 `.prevent` 冲突：** 同时使用会警告，passive 表示不会调用 preventDefault。

**代码示例：**

```vue
<template>
  <!-- 阻止表单提交刷新 + 阻止冒泡 -->
  <form @submit.prevent="onSubmit">
    <button @click.stop="handleClick">点击</button>
  </form>

  <!-- 回车搜索 -->
  <input @keyup.enter="search" />

  <!-- 组合键 -->
  <div @click.ctrl="selectItem">Ctrl + 点击多选</div>

  <!-- 滚动优化 -->
  <div @scroll.passive="onScroll">...</div>
</template>
```

**面试追问：**
1. **`.self` 修饰符和 `@click` 在子元素上冒泡上来有什么区别？** `.self` 只有事件的 `event.target === event.currentTarget`（即点击元素自身而非子元素冒泡）时才触发。普通 `@click` 会响应子元素冒泡上来的事件。
2. **Vue 3 为什么移除了 `.native` 修饰符？** Vue 3 中组件默认透传所有未声明为 emits 的事件监听器到根元素（通过 `$attrs`），不再需要 `.native` 区分原生/组件事件。未在 `emits` 中声明的事件自动作为原生事件绑定。

---

## 15. v-if、v-show、v-html 的原理

**记忆口诀：**「if 编译分支不渲染，show 指令改 display，html 设 innerHTML」

**一句话总结：** v-if 在编译期转为条件分支控制 VNode 创建；v-show 始终创建 VNode，运行时通过指令修改 display；v-html 设置 innerHTML 渲染原始 HTML。

| 指令 | 编译阶段 | 运行时 | DOM 存在 |
| --- | --- | --- | --- |
| `v-if` | 转为三元/条件 Block | 条件 false 不创建 VNode | 可能不存在 |
| `v-show` | 普通指令 | 修改 `el.style.display` | 始终存在 |
| `v-html` | 添加 domProps | 设置 `innerHTML` | 存在 |

**详细解答：**

**v-if 原理：**
- 编译器 `transformIf` 将 `v-if/else-if/else` 链转为条件表达式 codegenNode
- render 时条件为 false 返回 `null`（不创建 VNode），true 才渲染分支
- 切换时销毁/重建子树，事件监听器和子组件生命周期完整走一遍
- **惰性**：初始 false 不渲染

**v-show 原理：**
- 编译为 directive，始终生成 VNode 并 patch 到 DOM
- 指令钩子 `beforeMount/updated` 中调用 `setDisplay(el, value)`
- 隐藏时保存原 display 到 `el._vod`，显示时恢复
- 可配合 `<transition>` 做 CSS 过渡

**v-html 原理：**
- 编译时通过 `domProps: { innerHTML: _s(xxx) }` 设置
- 会先清空子节点再插入 HTML
- **安全风险**：XSS 攻击，只应渲染可信内容；优先用 Mustache 插值（自动转义）

**选型：**
- 频繁切换 → `v-show`
- 运行时条件很少变 / 需惰性加载 → `v-if`
- 渲染富文本 → `v-html` + DOMPurify 消毒

**代码示例：**

```javascript
// v-if 编译结果（简化）
// <div v-if="ok">A</div><div v-else>B</div>
// → ok ? createVNode("div", null, "A") : createVNode("div", null, "B")

// v-show 指令核心（Vue 3）
function setDisplay(el, value) {
  el.style.display = value ? el._vod : 'none'
}
```

**面试追问：**
1. **v-if 切换时子组件的生命周期是怎样的？和 v-show 对比？** `v-if` 为 false 时组件完全销毁（beforeUnmount → unmounted），为 true 时重新创建（beforeCreate → mounted）。`v-show` 始终走完整创建流程，切换只改 `display`，不触发生命周期。
2. **v-html 和 Mustache 插值在 XSS 防护上有什么区别？** Mustache `{{ }}` 自动转义 HTML 字符（`<` → `&lt;`），安全。`v-html` 直接插入原始 HTML，不转义，有 XSS 风险，只应用于可信内容。

---

## 16. v-model 是如何实现的，语法糖实际是什么？

**记忆口诀：**「v-model = :value + @input，自定义组件可通过 model 选项改 prop 和 event」

**一句话总结：** v-model 是语法糖，在不同元素上映射为不同的 prop + event 组合，编译器将其转化为属性绑定和事件监听。

| 元素 | 绑定属性 | 监听事件 | 说明 |
| --- | --- | --- | --- |
| `<input text>` | `:value` | `@input` | 默认文本 |
| `<textarea>` | `:value` | `@input` | 同 text |
| `<input checkbox>` 单个 | `:checked` | `@change` | boolean |
| `<input checkbox>` 多个 | `:checked` + 数组操作 | `@change` | value 数组 |
| `<input radio>` | `:checked` | `@change` | 比较 value |
| `<select>` | `:value` | `@change` | 单选/多选 |
| 组件 Vue2 | `:value` | `@input` | 可 model 选项定制 |
| 组件 Vue3 | `:modelValue` | `@update:modelValue` | 可多个 v-model |

**详细解答：**

**核心机制：**
1. **prop down**：将 data 绑定到表单元素的 value/checked
2. **event up**：监听 input/change，将新值写回 data
3. 编译器 `model` transform 自动生成上述绑定

**编译细节：**
- input 事件中有 `composing` 检查，避免中文输入法中间态触发更新
- checkbox 数组模式：checked 时 concat，unchecked 时 splice
- Vue 3 支持 `v-model.trim`、`.number`、`.lazy`（change 替代 input）

**Vue 3 多 v-model：**
```html
<UserForm v-model:name="name" v-model:age="age" />
<!-- 等价于 -->
<UserForm :name="name" @update:name="name = $event"
          :age="age" @update:age="age = $event" />
```

**与 .sync 关系：** Vue 3 废弃 `.sync`，统一为 `v-model:propName`。

**代码示例：**

```html
<!-- 语法糖 -->
<input v-model.trim.number="count" />

<!-- 等价展开 -->
<input
  :value="count"
  @input="count = $event.target.value.trim()"
  type="number"
/>

<!-- lazy 修饰符：change 事件 -->
<input v-model.lazy="msg" />
<!-- 等价于 :value + @change -->
```

**面试追问：**
1. **v-model 的 `.lazy`、`.number`、`.trim` 修饰符分别如何实现？** `.lazy` 将 `input` 事件改为 `change` 事件（失焦时才更新）；`.number` 用 `parseFloat` 转换值，无法解析则返回原值；`.trim` 对值调用 `.trim()` 去除首尾空格。
2. **Vue 3 为什么把默认 prop 从 `value` 改为 `modelValue`？** 支持同一组件上多个 `v-model`（如 `v-model:title`、`v-model:content`），每个对应独立的 prop + 事件。用 `value` 的话无法区分多个绑定。

---

## 17. v-model 可以被用在自定义组件上吗？如果可以，如何使用？

**记忆口诀：**「子组件 prop + emit 语法糖，Vue2 用 value/input，Vue3 用 modelValue/update:modelValue」

**一句话总结：** 可以，v-model 在组件上是 `:modelValue` + `@update:modelValue`（Vue3）的语法糖，子组件接收 prop 并通过 emit 回传新值。

| 版本 | 默认 prop | 默认 event | 自定义 |
| --- | --- | --- | --- |
| Vue 2 | `value` | `input` | `model: { prop, event }` 选项 |
| Vue 3 | `modelValue` | `update:modelValue` | 多 v-model 或 `defineModel` |

**详细解答：**

**使用步骤：**

1. **父组件**：`<CustomInput v-model="text" />`
2. **编译展开**：`<CustomInput :modelValue="text" @update:modelValue="text = $event" />`
3. **子组件**：
   - 声明 prop 接收值
   - 值变化时 `$emit('update:modelValue', newVal)`

**Vue 3 推荐写法 — defineModel（3.4+）：**

```vue
<!-- 子组件 -->
<script setup>
const model = defineModel() // 自动 prop + emit
</script>
<template>
  <input :value="model" @input="model = $event.target.value" />
</template>
```

**多个 v-model：**
```vue
<!-- 父 -->
<UserForm v-model:name="name" v-model:email="email" />

<!-- 子 -->
<script setup>
const name = defineModel('name')
const email = defineModel('email')
</script>
```

**注意：**
- 不应在子组件直接修改 prop（Vue 2 需 `$emit('input')`）
- 复杂组件内部维护 localValue + watch 同步亦可
- `v-model` 本质是单向数据流 + 事件回传，不是魔法双向绑定

**代码示例：**

```vue
<!-- CustomInput.vue (Vue 3) -->
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <input :value="modelValue" @input="onInput" />
</template>

<!-- 父组件 -->
<CustomInput v-model="searchText" />
```

**面试追问：**
1. **子组件能否直接修改 v-model 绑定的 prop？为什么？** 不能。Vue 遵循单向数据流，直接修改 prop 会报警告。应通过 `emit('update:modelValue', newVal)` 通知父组件修改，父组件更新后 prop 自然变化。
2. **`defineModel` 和手动 prop + emit 相比有什么优势？** `defineModel`（Vue 3.4+）是编译宏语法糖，自动生成 prop 声明和 emit 逻辑，返回一个可直接 `.value` 读写的 ref，减少样板代码，写法更直观。

---

## 18. data为什么是一个函数而不是对象

**记忆口诀：**「函数返回新对象，组件复用不共享；根实例只有一个，对象也无妨」

**一句话总结：** 组件会被多次复用，函数返回全新 data 对象保证每个实例数据独立；根 Vue 实例只有一个，data 可以是对象。

**详细解答：**

**根本原因 — JavaScript 引用类型：**

```javascript
const shared = { count: 0 }  // 引用类型

// 若 data 是对象
data: shared  // 所有组件实例共享同一引用

// 组件 A 修改 count
// 组件 B 的 count 也变了 → 状态污染
```

**函数返回新对象：**

```javascript
data() {
  return { count: 0 }  // 每次 new 组件实例都调用，返回新对象
}
```

**根实例例外：**
```javascript
new Vue({
  data: { appName: 'MyApp' }  // 只有一个实例，不存在复用问题
})
```

**Vue 3 变化：**
- Options API 仍要求 `data` 为函数
- Composition API 中 `setup()` 本身每次创建组件时执行，`ref/reactive` 自然隔离
- `<script setup>` 顶层变量按实例隔离

**mergeOptions 中的处理：**
- 组件 `data` 必须是函数，否则开发环境警告
- 调用 `data.call(vm)` 获取数据后，`observe` 使其响应式

**代码示例：**

```javascript
// ❌ 错误：对象导致共享
const dataObj = { n: 1 }
Vue.component('Bad', { data: dataObj })

// ✅ 正确：函数返回新对象
Vue.component('Good', {
  data() {
    return { n: 1 }
  }
})

// 验证
const app = new Vue({ el: '#app', template: '<Good/><Good/>' })
// Bad 组件两个实例 n 联动；Good 组件互不影响
```

**面试追问：**
1. **如果 data 写成对象，Vue 开发环境会怎样？生产环境呢？** Vue 2 开发环境会 warn：`data option should be a function`；生产环境可能静默共享导致多实例状态污染。Vue 3 组件的 data 选项仍要求函数，但 `createApp` 根实例可以用对象。
2. **Vue 3 Composition API 中还需要关心这个问题吗？为什么？** 不需要。`setup` 中用 `ref/reactive` 声明状态，每次组件实例化都执行 setup 函数，天然隔离，不存在共享问题。

---

## 19. $nextTick 原理及作用

**记忆口诀：**「DOM 更新是异步的，nextTick 在更新后回调；优先 Promise > MutationObserver > setImmediate > setTimeout」

**一句话总结：** `$nextTick` 将回调推迟到 Vue 完成 DOM 异步更新后的下一个微任务/宏任务中执行，确保能访问到更新后的 DOM。

**详细解答：**

**为什么需要：**
- Vue 数据变更后 **不会同步更新 DOM**，而是推入 **异步更新队列**（同一 tick 多次修改只触发一次渲染）
- 若在 `data` 修改后立即操作 DOM，拿到的是**更新前**的状态
- `$nextTick(cb)` 保证 cb 在 **patch 完成之后**执行

**异步更新流程：**
1. setter → `dep.notify()` → watcher/effect 标记 dirty
2. `queueWatcher` 去重推入队列
3. `nextTick(flushSchedulerQueue)` 注册刷新
4. 当前同步代码执行完毕 → 微任务执行 → 渲染 watcher 运行 → patch DOM
5. `$nextTick` 回调执行

**降级策略（Vue 2）：**
```
Promise.then → MutationObserver → setImmediate → setTimeout(0)
```
Vue 3 主要使用 `Promise.then`（微任务）。

**使用场景：**
- 修改数据后获取 DOM 尺寸/位置/焦点
- 配合第三方 DOM 库（如图表）在更新后初始化
- 在 created 中操作 DOM（应改用 mounted + nextTick）

**代码示例：**

```javascript
import { nextTick, ref } from 'vue'

const list = ref([])
const listEl = ref(null)

async function addItem() {
  list.value.push({ id: Date.now() })
  await nextTick() // 等待 patch 完成后再读 DOM
  console.log(listEl.value.children.length)
}

// 简化原理：callbacks 队列 + Promise.then 微任务刷新
function nextTick(cb) {
  callbacks.push(cb)
  if (!pending) {
    pending = true
    Promise.resolve().then(flushCallbacks)
  }
}
```

**面试追问：**
1. **`$nextTick` 回调是在微任务还是宏任务中执行？和 `setTimeout(fn, 0)` 有什么区别？** 优先微任务（`Promise.then`），不支持时降级为 `MutationObserver` 或 `setTimeout`。微任务在当前宏任务结束后、下一次渲染前执行，比 `setTimeout(fn,0)` 更快，能在 DOM 更新后立即拿到新 DOM。
2. **Vue 为什么要异步批量更新 DOM，而不是数据变一次就 render 一次？** 同步更新会导致一个事件循环内多次修改触发多次 re-render，产生大量无意义的中间态 DOM 操作。批量更新将多次修改合并为一次 patch，显著提升性能。

---

## 20. Vue template 到 render 的过程

**记忆口诀：**「parse 成 AST，optimize 标记静态，generate 出 render」

**一句话总结：** Vue 编译器将 template 字符串经 parse → transform → generate 三阶段，产出 render 函数，运行时执行 render 生成 VNode 并 patch 到 DOM。

| 阶段 | 输入 | 输出 | 核心工作 |
| --- | --- | --- | --- |
| Parse | template 字符串 | AST | HTML 解析 + 指令/插值识别 |
| Transform | AST | AST（优化后） | 指令转换、静态标记、hoist |
| Generate | AST | render 函数字符串 | 生成 createElement/VNode 代码 |

**详细解答：**

**1. Parse（解析）：**
- 基于正则 + 状态机的 HTML Parser（非完整浏览器 HTML Parser）
- 识别标签、属性、文本、插值 `{{ }}`、指令 `v-xxx`
- 处理 `<template>`、`<script>` 等特殊标签
- 输出 **AST 节点树**（ElementNode、TextNode、InterpolationNode 等）

**2. Transform（转换/优化）：**
- **指令转换**：`v-if` → 条件表达式，`v-for` → `_renderList`，`v-model` → prop + event
- **静态分析（Vue 3）**：
  - `patchFlag` 标记动态节点类型
  - `hoistStatic` 静态节点提升为模块常量
  - `cacheStatic` 缓存静态 VNode
  - Block Tree 收集动态子节点
- **作用域分析**：slot、v-for 作用域变量

**3. Generate（代码生成）：**
- 遍历 AST 生成 `render` 函数源码
- Vue 3 使用 `createElementBlock` / `createElementVNode` + patchFlag
- 输出如 `_c('div', { ... }, [_v("hello")])`
- 通过 `new Function(code)` 或 `eval` 转为可执行函数（配合 `with(this)` 或 `_ctx`）

**运行时：**
```
render.call(proxy) → VNode Tree → patch(oldVNode, newVNode) → DOM
```

**手写 render 绕过编译：**
```javascript
export default {
  render(h) {
    return h('div', { class: 'app' }, this.message)
  }
}
```

**SFC 编译：** `.vue` 文件由 `@vue/compiler-sfc` 分别编译 `<template>`、`<script>`、`<style>`，template 编译结果注入组件的 `render` 选项。

**代码示例：**

```javascript
// 编译流程示意
// <div>{{ msg }}</div>

// 1. AST（简化）
{
  type: 1, tag: 'div', children: [
    { type: 5, content: { type: 4, content: 'msg' } }  // 插值
  ]
}

// 2. Generate 输出
function render(_ctx) {
  return (_openBlock(), _createElementBlock('div', null, [
    _createTextVNode(_toDisplayString(_ctx.msg), 1 /* TEXT */)
  ]))
}
```

**面试追问：**
1. **Vue 3 的 Block Tree 和 patchFlag 是如何减少 diff 范围的？** 编译器将动态节点收集到 Block 的 `dynamicChildren` 数组，patch 时只遍历该数组跳过静态子树。patchFlag 标记节点的动态类型（TEXT/CLASS/PROPS 等），patch 时只比较有变化的部分，避免全量 props diff。
2. **为什么 Vue 编译器不使用浏览器原生 DOMParser 来解析 template？** ① DOMParser 会自动补全/修正 HTML，改变原始结构（如自动闭合标签）；② 无法解析 Vue 特有语法（v-if、v-for、@click 等指令）；③ 自定义 parser 可在 Node.js 等非浏览器环境运行（SSR）。

## 21. Vue data 中某一个属性的值发生改变后，视图会立即同步执行重新渲染吗？

**记忆口诀：**「数据变不立刻刷，异步队列批处理，同 watcher 只推一次，nextTick 才见新 DOM」

**一句话总结：** 不会。Vue 采用异步更新策略，同一事件循环内的多次数据变更会被合并，在下一个 tick 才批量更新 DOM。

### 对比：同步 vs 异步更新

| 维度 | 同步更新（假设） | Vue 异步更新（实际） |
| --- | --- | --- |
| DOM 刷新时机 | 每次 setter 立即重绘 | 当前事件循环结束后统一刷新 |
| 多次连续修改 | 触发多次渲染 | 同一 watcher 只入队一次 |
| 性能 | 频繁操作 DOM，开销大 | 批量 diff，减少无效渲染 |
| 读取 DOM | 改完立刻是新 DOM | 需 `$nextTick` 才能读到新 DOM |

### 详细解答

Vue 的响应式系统在数据变化时并不会立刻操作真实 DOM，而是走以下流程：

1. **触发 setter**：响应式数据的 `set` 拦截器被调用，对应属性的 `Dep` 执行 `notify()`。
2. **Watcher 入队**：每个组件渲染对应一个渲染 Watcher（Vue2）或 ReactiveEffect（Vue3），`update()` 不会立即执行，而是调用 `queueWatcher` 将其推入更新队列。
3. **去重缓冲**：若同一 Watcher 已在队列中，不会重复入队。这避免了 `for` 循环里连续改 100 次数据触发 100 次渲染的问题。
4. **nextTick 刷新**：当前同步代码执行完毕后，Vue 通过 `Promise.then` / `MutationObserver` / `setTimeout` 等微任务/宏任务机制，在下一个事件循环 tick 调用 `flushSchedulerQueue`，依次执行队列中 Watcher 的 `run()`，完成 Virtual DOM diff 和 patch。

**为什么这样设计？**

- 减少 DOM 操作次数，提升性能。
- 保证同一 tick 内多次数据变更只产生一次最终渲染结果，状态更可预测。
- 开发者若需要在 DOM 更新后操作节点（如 focus、测量尺寸），必须使用 `$nextTick`。

### 代码示例

```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
      this.count++
      this.count++
      // 此时 DOM 仍是旧值，因为三次修改被合并为一次更新
      console.log(this.$refs.num.textContent) // 可能还是 0

      this.$nextTick(() => {
        console.log(this.$refs.num.textContent) // 3
      })
    }
  }
}
```

```html
<p ref="num">{{ count }}</p>
<button @click="increment">+3</button>
```

### 面试追问

1. **Vue3 的异步更新机制和 Vue2 有什么区别？** Vue3 用 `ReactiveEffect` + `scheduler` 替代 Dep/Watcher 队列，但核心仍是批量调度；组件级更新粒度更细，配合编译时静态提升进一步优化。
2. **`$nextTick` 回调是微任务还是宏任务？** Vue2/3 优先使用 `Promise.then`（微任务），不支持时降级为 `MutationObserver` 或 `setTimeout`（宏任务）。

---

## 22. Vue 中给 data 中的对象属性添加一个新的属性时会发生什么？如何解决？

**记忆口诀：**「后加属性非响应，Vue2 靠 $set，Vue3 Proxy 自动追踪新 key」

**一句话总结：** Vue2 中直接给已有响应式对象新增属性不会触发视图更新，因为初始化时未对该 key 做响应式劫持；需用 `Vue.set` / `this.$set` 或替换整个对象。

### 对比：Vue2 vs Vue3

| 场景 | Vue2 行为 | Vue3 行为 |
| --- | --- | --- |
| `obj.newKey = value` | 不响应，视图不更新 | Proxy 自动追踪，视图更新 |
| 数组索引赋值 `arr[i] = x` | 不响应 | 自动响应 |
| 修改数组 length | 不响应 | 自动响应 |
| 推荐写法 | `$set(obj, key, val)` | 直接赋值即可 |

### 详细解答

**Vue2 原理：** `Object.defineProperty` 只能在对象**初始化递归遍历**时对已有属性定义 getter/setter。运行时新增的属性只是普通属性，没有 Dep 依赖收集，setter 也不会 `notify`。

**Vue3 原理：** `Proxy` 代理整个对象，`set` trap 能拦截任意属性的新增/删除，自动建立响应式关联并触发依赖更新。

**Vue2 解决方案：**

1. **`this.$set(target, key, value)`**（推荐）：内部对对象调用 `defineReactive` 新增响应式属性；对数组则调用 `splice` 触发更新。
2. **替换整个对象**：`this.obj = { ...this.obj, newKey: value }`，触发对象引用变化。
3. **`Object.assign` + 替换**：`this.obj = Object.assign({}, this.obj, { newKey: value })`。
4. **初始化时声明所有字段**：即使值为 `undefined` 或 `null`，也能保证响应式。

### 代码示例

```vue
<template>
  <div>
    <p>{{ obj.a }}</p>
    <p>{{ obj.b }}</p> <!-- 直接赋值时 Vue2 不会更新 -->
    <button @click="addWrong">错误方式</button>
    <button @click="addCorrect">正确方式</button>
  </div>
</template>

<script>
export default {
  data() {
    return { obj: { a: 'hello' } }
  },
  methods: {
    addWrong() {
      this.obj.b = 'world' // Vue2：obj 有 b，视图不刷新
    },
    addCorrect() {
      // Vue2
      this.$set(this.obj, 'b', 'world')
      // Vue3 直接 this.obj.b = 'world' 即可
    }
  }
}
</script>
```

```javascript
// $set 简化原理（Vue2 源码思路）
function set(target, key, val) {
  if (Array.isArray(target) && typeof key === 'number') {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (hasOwn(target, key)) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val) // 新增响应式属性
  ob.dep.notify()
  return val
}
```

### 面试追问

1. **`$set` 对数组和对象的处理有何不同？** 数组走 `splice` 触发变异方法通知；对象走 `defineReactive` 新增 getter/setter 再 `notify`。
2. **为什么 Vue3 不需要 `$set` 了？** Proxy 的 `set` 拦截器能捕获新增属性，ReactiveEffect 会自动收集并触发更新。

---

## 23. 描述下 Vue 自定义指令

**记忆口诀：**「DOM 底层操作用指令，Vue2 五钩子 Vue3 四钩子，全局 directive 局部 directives」

**一句话总结：** 自定义指令是 Vue 提供的 DOM 操作扩展机制，在元素生命周期的特定阶段执行钩子，适合聚焦、权限、懒加载等纯 DOM 场景。

### Vue2 vs Vue3 钩子对照

| Vue2 | Vue3 | 触发时机 |
| --- | --- | --- |
| `bind` | `created` | 指令与元素绑定时 |
| `inserted` | `mounted` | 元素插入父节点后 |
| `update` | `beforeUpdate` | 组件 VNode 更新前 |
| `componentUpdated` | `updated` | 组件及子 VNode 更新后 |
| `unbind` | `unmounted` | 指令与元素解绑时 |

### 详细解答

**定义方式：**

- **全局**：`app.directive('focus', { ... })`（Vue3）或 `Vue.directive('focus', { ... })`（Vue2）
- **局部**：组件选项 `directives: { focus: { ... } }`

**钩子参数 `binding` 对象：**

| 属性 | 说明 |
| --- | --- |
| `value` | 指令绑定的值（`v-demo="foo"` 中的 foo） |
| `oldValue` | 更新前的值（仅 update 类钩子） |
| `arg` | 参数（`v-demo:foo` 中的 foo） |
| `modifiers` | 修饰符对象（`v-demo.a.b` → `{ a: true, b: true }`） |
| `instance` | Vue3 中组件实例（Vue2 为 `vnode.context`） |

**使用原则：**

- 优先用组件和数据驱动；指令用于**普通 DOM 元素**的底层操作。
- 不要通过指令直接修改 `v-model` 绑定的值（不会同步）；应通过事件通知组件。
- Vue3 不推荐在组件上使用自定义指令（多根节点时指令无法确定挂载目标）。

**常见场景：** 自动聚焦、按钮权限控制（`v-permission`）、图片懒加载、拖拽、防抖节流点击、复制到剪贴板。

### 代码示例

```javascript
// 全局注册 - 自动聚焦
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 权限指令
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding
    const permissions = store.getters.permissions
    if (!permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
})

// 图片懒加载
app.directive('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        observer.unobserve(el)
      }
    })
    observer.observe(el)
  },
  unmounted(el, binding, vnode) {
    // 清理 observer
  }
})
```

```html
<input v-focus />
<button v-permission="'admin:delete'">删除</button>
<img v-lazy="imageUrl" />
```

### 面试追问

1. **自定义指令和组件的区别？** 组件是完整 UI 单元，有模板和状态；指令是附着在元素上的行为扩展，无独立渲染，专注 DOM 副作用。
2. **Vue3 指令在编译后如何工作？** 编译器生成 `withDirectives(vnode, [[directive, value, arg, modifiers]])`，渲染时在各阶段调用对应钩子。

---

## 24. 子组件可以直接改变父组件的数据吗？

**记忆口诀：**「单向数据流，子不改父 prop，$emit 通知父组件自己改」

**一句话总结：** 不可以。子组件应通过 props 接收、通过 `$emit` 通知父组件修改，以维护可预测的数据流；直接改 prop 会触发 Vue 警告。

### 对比：正确 vs 错误做法

| 方式 | 是否推荐 | 说明 |
| --- | --- | --- |
| 子组件 `$emit('update:xxx', val)` | ✅ | v-model 语法糖的标准模式 |
| 父组件 `:count="count" @update:count="count = $event"` | ✅ | 单向数据流 |
| 子组件 `this.propValue = newVal` | ❌ | 违反单向数据流，开发模式警告 |
| 子组件改 prop 对象/数组内部属性 | ⚠️ | 不报错但仍是反模式，难以追踪 |
| `props` + `computed` 本地副本 | ✅ | 需要子组件内部编辑时用 |

### 详细解答

Vue 采用**单向数据流（Unidirectional Data Flow）**：

- 父 → 子：通过 props 传递，父组件数据更新时子组件 prop 自动刷新。
- 子 → 父：通过 `$emit` 派发事件，由父组件决定是否、如何修改自身状态。

**为什么不能直接改 prop？**

1. 多个子组件共享同一 prop 时，一处修改会导致数据流混乱。
2. 父组件状态变化会覆盖子组件的修改，产生不可预期行为。
3. 调试困难：无法从数据变更链路定位问题来源。

**例外与边界：**

- **引用类型 prop**：`this.user.name = 'x'` 技术上可行（修改的是对象引用内容），Vue 不会警告，但仍是反模式。
- **`.sync` / `v-model`**：本质是 `$emit('update:propName')` 的语法糖，数据修改权仍在父组件。
- **provide/inject、Vuex/Pinia**：跨层级共享状态，修改应通过明确的 action/mutation，而非子组件直接改父数据。

### 代码示例

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Child :title="title" @update:title="title = $event" />
  <!-- Vue3 简写 -->
  <Child v-model:title="title" />
</template>

<script>
import Child from './Child.vue'
export default {
  components: { Child },
  data() { return { title: 'Hello' } }
}
</script>
```

```vue
<!-- 子组件 Child.vue -->
<template>
  <input :value="title" @input="$emit('update:title', $event.target.value)" />
</template>

<script>
export default {
  props: { title: String },
  // ❌ 错误：this.title = 'xxx'
}
</script>
```

### 面试追问

1. **`.sync` 修饰符和 `v-model` 有什么关系？** Vue2 中 `.sync` 是 `:prop` + `@update:prop` 的语法糖；Vue3 统一为 `v-model:propName`。
2. **子组件需要编辑 prop 怎么办？** 用 computed 的 getter/setter 或 data 本地副本，setter 中 `$emit` 通知父组件。

---

## 25. Vue 是如何收集依赖的？

**记忆口诀：**「render 读数据走 getter，Dep 收集 Watcher，setter notify 触发更新」

**一句话总结：** 组件渲染时 Watcher/effect 作为「订阅者」读取响应式数据，触发 getter 将 Watcher 注册到 Dep；数据变更时 setter 通知 Dep，Dep 驱动 Watcher 重新执行。

### Vue2 vs Vue3 依赖收集对比

| 对比项 | Vue2 | Vue3 |
| --- | --- | --- |
| 拦截方式 | `Object.defineProperty` | `Proxy` |
| 订阅者 | `Watcher` | `ReactiveEffect` |
| 发布者 | `Dep`（每个 key 一个） | 全局 `targetMap`（WeakMap 结构） |
| 收集时机 | getter 中 `dep.depend()` | track() 在 get trap 中 |
| 触发时机 | setter 中 `dep.notify()` | trigger() 在 set/delete trap 中 |

### 详细解答

**Vue2 完整流程：**

1. **初始化**：`initState` → `observe(data)` → 递归 `defineReactive`，每个属性创建一个 `Dep` 实例。
2. **挂载组件**：`mountComponent` 创建渲染 Watcher，执行 `watcher.get()`。
3. **依赖收集**：`get()` 内 `pushTarget(watcher)` 设置全局 `Dep.target`，然后执行 `vm._render()`。
4. **触发 getter**：render 函数访问 `data.xxx`，触发 getter → `dep.depend()` → `Dep.target.addDep(dep)` → `dep.addSub(watcher)`。
5. **数据变更**：setter → `dep.notify()` → 遍历 subs 调用 `watcher.update()` → 异步队列 → 重新 render。

**Vue3 完整流程：**

1. `reactive()` 创建 Proxy，`get` trap 中调用 `track(target, key)`。
2. `track` 将当前活跃的 `activeEffect` 存入 `targetMap`：`WeakMap<target, Map<key, Set<effect>>>`。
3. 组件渲染时 `effect(renderFn, { scheduler })`，render 过程中读取的数据自动被 track。
4. 数据修改时 `trigger(target, key)` 取出对应 effect 集合，调用 `scheduler` 或直接 `effect.run()`。

**计算属性的特殊处理：** 计算属性有独立 Watcher/effect，`lazy: true` 惰性求值；依赖变化时只标记 `dirty = true`，下次访问才重新计算并缓存。

### 代码示例

```javascript
// Vue2 简化模型
class Dep {
  static target = null
  constructor() { this.subs = [] }
  depend() {
    if (Dep.target) Dep.target.addDep(this)
  }
  notify() {
    this.subs.forEach(w => w.update())
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) dep.depend()
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()
    }
  })
}
```

```javascript
// Vue3 简化模型
const targetMap = new WeakMap()
let activeEffect = null

function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  dep.add(activeEffect)
}

function trigger(target, key) {
  const dep = targetMap.get(target)?.get(key)
  dep?.forEach(effect => effect.scheduler ? effect.scheduler() : effect.run())
}
```

### 面试追问

1. **为什么依赖收集需要全局唯一的 `Dep.target` / `activeEffect`？** 保证同一时刻只有一个 Watcher/effect 在收集依赖，避免嵌套计算（如 computed 内访问其他响应式数据）时依赖归属混乱。
2. **Vue3 的 `WeakMap` 结构有什么好处？** 对象被 GC 后依赖自动释放，避免内存泄漏；按 key 粒度追踪，比 Vue2 全量递归 defineProperty 更高效。

---

## 26. 对 React 和 Vue 的理解，它们的异同

**记忆口诀：**「同：组件化 + 虚拟 DOM；异：Vue 模板响应式自动优化，React JSX 单向流手动优化」

**一句话总结：** 两者都是组件化前端框架，核心差异在于模板 vs JSX、响应式 vs 不可变数据、以及默认更新粒度和优化策略的不同。

### 核心对比表

| 维度 | Vue | React |
| --- | --- | --- |
| 模板 | HTML 模板 + SFC | JSX（JS 超集） |
| 数据流 | 默认双向绑定（v-model） | 单向数据流 |
| 响应式 | 自动依赖追踪（Proxy/ref） | setState/useState 手动触发 |
| 更新粒度 | 组件级，自动精确更新 | 默认整子树重渲染，需 memo/useMemo 优化 |
| 状态管理 | Pinia/Vuex | Redux/Zustand/Jotai 等 |
| 学习曲线 | 模板+选项式较平缓 | JSX+Hooks 概念较多 |
| 跨平台 | Weex、Uni-app 等 | React Native、Expo |
| 构建工具 | Vite（官方推荐） | CRA、Next.js、Vite |

### 详细解答

**相同点：**

- 都采用**虚拟 DOM + Diff** 提升渲染性能。
- 都推崇**组件化**开发，props 向下传递数据。
- 都关注**核心库轻量**，路由、状态管理等交给生态。
- 都有成熟的**SSR/SSG** 方案（Nuxt / Next.js）。
- 都支持 **Tree-shaking** 和按需引入。

**不同点（面试重点）：**

1. **数据变化检测**
   - Vue：mutable 数据 + 响应式系统，精确知道哪个组件依赖了哪个数据，变更时自动触发最小范围更新。
   - React：immutable 理念，setState 后从变更组件向下 reconcile，需 `React.memo`、`useMemo`、`useCallback` 避免无效渲染。

2. **写法哲学**
   - Vue：模板是 HTML 超集，声明式指令（v-if/v-for）分离视图逻辑；Vue3 Composition API 与 React Hooks 趋同。
   - React：All in JS，JSX 中直接用 JS 控制流，灵活但模板与逻辑耦合在同一文件。

3. **组件复用**
   - Vue：mixins（不推荐）→ Composition API（composables）
   - React：HOC → Render Props → Hooks

4. **性能优化默认值**
   - Vue：编译期静态标记（PatchFlags）、静态提升，运行时自动跳过静态节点。
   - React：Fiber 架构 + Concurrent Mode，优化需开发者主动介入较多。

### 代码示例

```vue
<!-- Vue：模板 + 自动响应式 -->
<template>
  <p>{{ count }}</p>
  <button @click="count++">{{ count }}</button>
</template>
<script setup>
import { ref } from 'vue'
const count = ref(0) // 自动追踪，无需手动优化
</script>
```

```jsx
// React：JSX + 手动 setState
function Counter() {
  const [count, setCount] = useState(0)
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
    </>
  )
}
```

### 面试追问

1. **Vue 和 React 的 Virtual DOM Diff 有何差异？** Vue2 双端比较 + 静态节点标记；Vue3 最长递增子序列 + PatchFlags；React Fiber 可中断的链表 Diff + key 优化。
2. **为什么 Vue 说「更快计算出 Virtual DOM 差异」？** 编译期标记动态节点，Diff 时只比较带 PatchFlag 的节点；React 默认需对更多节点做类型/props 比较。

---

## 27. assets 和 static 的区别

**记忆口诀：**「assets 走 webpack 打包加 hash，static/public 原样拷贝不处理」

**一句话总结：** `assets`（或 `src/assets`）中的资源会经过构建工具处理（压缩、hash、路径转换）；`static`（Vue CLI）或 `public`（Vite）中的文件原样复制到输出目录，不参与模块打包。

### 对比表

| 维度 | assets（src/assets） | static / public |
| --- | --- | --- |
| 处理方式 | 被 import/require，走打包流程 | 构建时直接 copy 到输出根目录 |
| URL | 带 contenthash，如 `/assets/logo.a1b2c3.png` | 固定路径，如 `/logo.png` |
| 体积优化 | 小文件 inline（url-loader），大文件压缩 | 不压缩、不优化 |
| 引用方式 | `import img from '@/assets/logo.png'` | `<img src="/logo.png">` 或 `public/logo.png` |
| 适用场景 | 组件内图片、样式、字体 | favicon、第三方已压缩库、不需 hash 的文件 |
| Vue CLI | `src/assets` | `static/` |
| Vite | `src/assets` | `public/`（无 static 目录） |

### 详细解答

**assets 处理流程：**

1. 在 JS/CSS 中通过 `import` 引入。
2. Webpack/Vite 根据文件大小决定 inline 或输出独立文件。
3. 生产环境文件名带 hash，利于长期缓存。
4. 小于阈值（如 4KB）可能转为 base64 内联，减少 HTTP 请求。

**static/public 处理流程：**

1. 构建时不经过 loader/plugin 转换。
2. 原样复制到 `dist/` 根目录。
3. 引用时使用绝对路径 `/xxx`，路径不会随 hash 变化。
4. 适合不需要 webpack 处理的第三方资源（如已压缩的 iconfont.css）。

**最佳实践：**

- 业务组件用到的图片、SVG、字体 → `assets`，享受打包优化。
- `index.html` 直接引用的 favicon、robots.txt、大型第三方 SDK → `public`。
- 需要动态 CDN 路径的资源，可在 `vite.config` / `vue.config` 中配置 `base`。

### 代码示例

```vue
<template>
  <!-- assets：构建后路径会被替换 -->
  <img :src="logoUrl" alt="logo" />
  <!-- public：固定根路径 -->
  <img src="/favicon.ico" alt="icon" />
</template>

<script setup>
import logoUrl from '@/assets/logo.png'
</script>
```

```javascript
// vue.config.js - 修改 assets 输出规则
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif)$/)
      .use('url-loader')
      .loader('url-loader')
      .options({ limit: 4096, name: 'img/[name].[hash:8].[ext]' })
  }
}
```

### 面试追问

1. **Vite 项目中还有 static 目录吗？** 没有，Vite 用 `public/`，其中文件在开发和生产环境均通过根路径 `/` 访问。
2. **为什么 assets 中的图片 import 后路径会变？** 构建工具将资源作为模块处理，输出时添加 hash 并替换 import 路径，实现缓存 busting。

---

## 28. delete 和 Vue.delete 删除数组的区别

**记忆口诀：**「delete 置空 length 不变，Vue.delete 真 splice 触发更新」

**一句话总结：** `delete arr[i]` 仅将索引变为 empty，不改变 length，且不触发 Vue2 响应式；`Vue.delete` / `this.$delete` 通过 splice 真正删除元素并通知依赖更新。

### 对比表

| 操作 | 数组结果 | length | 触发 Vue2 更新 | 视图表现 |
| --- | --- | --- | --- | --- |
| `delete arr[1]` | `[1, empty, 3]` | 不变（3） | ❌ | 可能仍显示旧项 |
| `Vue.delete(arr, 1)` | `[1, 3]` | 减 1（2） | ✅ | 正确移除 |
| `arr.splice(1, 1)` | `[1, 3]` | 减 1 | ✅ | 正确移除 |
| Vue3 直接 `delete arr[1]` | 稀疏数组 | 不变 | ⚠️ 能检测但不推荐 | 建议 splice |

### 详细解答

**`delete` 运算符的行为（ECMAScript 规范）：**

- 对对象属性：删除该 key。
- 对数组索引：将该下标变为「holes」（empty slot），**不会**改变 `length`，也不会移动后续元素。
- `arr[1]` 返回 `undefined`，但 `1 in arr` 为 `false`。
- Vue2 无法检测这种变化，因为未触发 setter 或变异方法。

**`Vue.delete` / `this.$delete` 的实现：**

```javascript
// 简化逻辑
function del(target, key) {
  if (Array.isArray(target) && typeof key === 'number') {
    target.splice(key, 1) // 走变异方法，触发 dep.notify()
  } else {
    // 对象属性删除
    delete target[key]
    ob.dep.notify()
  }
}
```

**Vue3 说明：** Proxy 能检测 `delete` 操作并 trigger，但数组仍建议使用 `splice` 以保持数组结构紧凑、避免稀疏数组带来的迭代问题。

### 代码示例

```javascript
const vm = new Vue({
  data: { list: [1, 2, 3] }
})

// ❌ 错误
delete vm.list[1]
console.log(vm.list)       // [1, empty, 3]
console.log(vm.list.length) // 3
// 视图可能仍显示 3 个 li

// ✅ 正确（Vue2）
vm.$delete(vm.list, 1)
// 或
vm.list.splice(1, 1)

// Vue3
import { reactive } from 'vue'
const list = reactive([1, 2, 3])
list.splice(1, 1) // 推荐
```

### 面试追问

1. **删除对象属性用 `delete obj.key` 和 `this.$delete` 区别？** Vue2 中直接 delete 对象属性同样不触发更新；`$delete` 会 `notify`。Vue3 直接 delete 即可。
2. **为什么 Vue2 不劫持数组索引的直接赋值？** `Object.defineProperty` 无法监听 length 变化和索引新增，只能重写 7 个变异方法 + 用 `$set`/`$delete` 处理边界情况。

---

## 29. Vue 如何监听对象或者数组某个属性的变化

**记忆口诀：**「变异方法自动听，索引新属性 Vue2 用 $set，Vue3 Proxy 全拦截，watch 深监听兜底」

**一句话总结：** Vue2 通过 Object.defineProperty 监听已有属性 getter/setter 和数组 7 个变异方法；索引赋值和新属性需 `$set`；也可用 `watch` 深度监听；Vue3 Proxy 可监听绝大多数变更。

### 监听方式对比

| 方式 | Vue2 | Vue3 | 说明 |
| --- | --- | --- | --- |
| 对象已有属性修改 | ✅ 自动 | ✅ 自动 | 直接赋值 |
| 对象新增属性 | ❌ 需 `$set` | ✅ 自动 | Proxy set trap |
| 数组变异方法 | ✅ 自动 | ✅ 自动 | push/pop/splice 等 |
| 数组索引赋值 | ❌ 需 `$set` | ✅ 自动 | `arr[i] = x` |
| `watch` 浅监听 | ✅ | ✅ | 仅引用变化 |
| `watch` 深监听 | ✅ | ✅ | `deep: true` |
| `watchEffect` | ❌ | ✅ | 自动收集依赖 |

### 详细解答

**Vue2 响应式边界：**

- 初始化时已存在的对象属性 → 自动响应。
- 数组：`push/pop/shift/unshift/splice/sort/reverse` 被重写，自动 notify。
- 不支持：`arr[index] = val`、`arr.length = n`、运行时 `obj.newKey = val`。

**Vue3 改进：** Proxy 拦截 `get/set/deleteProperty`，上述边界情况均可自动追踪。

**watch 监听特定属性：**

```javascript
// Vue2/Vue3 选项式
watch: {
  'user.name'(newVal, oldVal) { /* ... */ },
  list: {
    handler(newVal) { /* ... */ },
    deep: true,    // 深度监听对象/数组内部变化
    immediate: true // 立即执行一次
  }
}

// Vue3 组合式
watch(() => user.name, (newVal, oldVal) => { /* ... */ })
watch(list, (newVal) => { /* ... */ }, { deep: true })
```

**注意：** 深度监听会递归遍历所有属性，大对象有性能开销；能精确监听单个属性就不要 deep。

### 代码示例

```javascript
export default {
  data() {
    return {
      obj: { a: 1 },
      arr: [1, 2, 3]
    }
  },
  watch: {
    'obj.a'(val) {
      console.log('obj.a 变了:', val)
    },
    arr: {
      handler(val) {
        console.log('arr 变了:', val)
      },
      deep: true
    }
  },
  methods: {
    updateObj() {
      // Vue2
      this.$set(this.obj, 'b', 2)
      // Vue3
      // this.obj.b = 2
    },
    updateArr() {
      // Vue2 推荐
      this.$set(this.arr, 0, 100)
      // 或
      this.arr.splice(0, 1, 100)
    }
  }
}
```

```javascript
// Vue3 Composition API
import { reactive, watch, toRefs } from 'vue'

const state = reactive({ user: { name: 'Tom' }, list: [1, 2] })

watch(() => state.user.name, (val) => console.log(val))
watch(() => state.list, (val) => console.log(val), { deep: true })
```

### 面试追问

1. **`watch` 和 `watchEffect` 的区别？** `watch` 需明确监听源，可获取旧值，默认懒执行；`watchEffect` 立即运行并自动收集函数内依赖，无旧值。
2. **如何监听数组某一项？** `watch(() => arr[0], fn)` 或 `watch(() => arr.slice(), fn, { deep: true })`；Vue2 修改该项需 `$set` 才能触发。

---

## 30. Vue 模板编译原理

**记忆口诀：**「parse 成 AST，optimize 标静态，generate 出 render，运行时 _render 执行」

**一句话总结：** Vue 将 template 字符串经解析、优化、代码生成三阶段，编译为 render 函数；运行时执行 render 生成 VNode，再 patch 到真实 DOM。

### 三阶段概览

| 阶段 | 输入 | 输出 | 核心工作 |
| --- | --- | --- | --- |
| parse | template 字符串 | AST | 正则 + 栈解析 HTML 标签、指令、表达式 |
| optimize | AST | 标记后的 AST | 标记静态节点和静态根，跳过 diff |
| generate | AST | render 函数字符串 | 递归 AST 生成 `_c/_v/_s` 等调用代码 |

### 详细解答

**1. Parse（解析）**

- 使用 HTML Parser，逐字符扫描 template。
- 遇到 `<` 开始解析标签名、属性、指令（v-if/v-for/@click 等）。
- 维护 stack 处理嵌套关系，文本节点和插值 `{{ }}` 也转为 AST 节点。
- 输出符合 ESTree 规范的 AST，节点类型包括 Element、Text、Expression 等。

**2. Optimize（优化）**

- 遍历 AST，标记**静态节点**（无动态绑定、无 v-if/v-for 的子树）。
- 标记**静态根**（子树全静态且含多个子节点）。
- 运行时 patch 时可整块跳过静态子树，大幅减少 Diff 开销。
- Vue3 进一步优化为编译期 PatchFlags（动态文本、class、props 等位标记）。

**3. Generate（生成）**

- 递归遍历 AST，拼接 render 函数字符串。
- Vue2 运行时 helper：`_c`（createElement）、`_v`（文本节点）、`_s`（toString）、`_l`（renderList）等。
- Vue3 使用 `createElementVNode`、`createTextVNode`、`resolveComponent` 等。
- 最终通过 `new Function(code)` 或 `with(this){ return function(){...} }` 得到 render。

**编译时机：**

- Vue2：运行时编译（完整版含 compiler）或构建时编译（vue-loader + vue-template-compiler）。
- Vue3：`@vue/compiler-dom` / `@vue/compiler-sfc`，SFC 中 `<template>` 在构建时编译为 render。

### 代码示例

```html
<!-- 模板 -->
<div id="app">
  <p>{{ message }}</p>
  <ul>
    <li v-for="item in list" :key="item.id">{{ item.name }}</li>
  </ul>
</div>
```

```javascript
// 简化后的 render 函数（Vue2 风格）
function render() {
  with (this) {
    return _c('div', { attrs: { id: 'app' } }, [
      _c('p', [_v(_s(message))]),
      _c('ul', _l(list, function (item) {
        return _c('li', { key: item.id }, [_v(_s(item.name))])
      }), 0)
    ])
  }
}
```

```javascript
// Vue3 手动编译示例
import { compile } from '@vue/compiler-dom'

const { code } = compile(`<div>{{ msg }}</div>`, { mode: 'function' })
// code 为 render 函数源码，含 createElementVNode 调用
```

### 面试追问

1. **Vue3 编译优化相比 Vue2 有哪些改进？** 静态提升（hoistStatic）、PatchFlags 标记动态节点、Block Tree 将动态节点收集到 flat array，Diff 时只遍历动态节点。
2. **为什么 Vue 不直接在浏览器解析 template？** 运行时编译增加包体积和首次解析开销；生产环境构建时预编译可 tree-shake 掉 compiler，render 函数执行更快。

---

## 31. 对 keep-alive 的理解，它是如何实现的，具体缓存的是什么？

**记忆口诀：**「抽象组件缓存 VNode，LRU 淘汰超 max，activated 切回 deactivated 切走」

**一句话总结：** keep-alive 是内置抽象组件，通过 LRU 策略缓存子组件的 VNode 实例（含 componentInstance），切换时不销毁组件，命中缓存时跳过 created/mounted，直接 patch 已有 DOM。

### 核心 API

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `include` | string / RegExp / Array | 仅匹配名称的组件被缓存 |
| `exclude` | string / RegExp / Array | 匹配名称的组件不缓存 |
| `max` | number | 最大缓存实例数，超出 LRU 淘汰 |

### 详细解答

**缓存的是什么？**

- 缓存的是组件的 **VNode**，其中 `vnode.componentInstance` 保存了组件实例（含 `$el`、data、computed 等状态）。
- 不是简单缓存 HTML 字符串，而是完整的组件实例 + DOM 引用。
- key 默认规则：`cid + '::' + tag`（无显式 key 时），或组件自身的 `key`。

**实现流程（render 阶段）：**

1. 获取默认 slot 的第一个子组件 VNode。
2. 根据 `include/exclude` 判断是否缓存；不匹配则直接返回 VNode，走正常销毁流程。
3. 计算 cacheKey，查 `this.cache`：
   - **命中**：复用 `cache[key].componentInstance`，将 key 移到 `keys` 数组末尾（LRU 最近使用）。
   - **未命中**：存入 cache，key 入 keys；若超出 max，淘汰 keys[0]（最久未使用）。
4. 设置 `vnode.data.keepAlive = true`，告知 patch 阶段走缓存逻辑。

**patch 阶段差异：**

- 首次渲染：`componentInstance` 为 undefined，正常 `createComponentInstance` + `$mount`。
- 缓存命中：`init` 钩子检测到 `keepAlive && componentInstance`，执行 `prepatch` 而非重新 mount，跳过 created/mounted，直接更新 DOM。

**LRU 策略：** 每次访问缓存组件时将 key 移到队列尾部，超出 max 时删除队列头部（最久未使用）的缓存条目，调用 `$destroy` 清理。

### 代码示例

```vue
<template>
  <keep-alive :include="['PageA', 'PageB']" :max="10">
    <component :is="currentTab" />
  </keep-alive>
</template>

<script>
import PageA from './PageA.vue'
import PageB from './PageB.vue'

export default {
  components: { PageA, PageB },
  data() {
    return { currentTab: 'PageA' }
  }
}
</script>
```

```javascript
// 组件需定义 name 才能被 include 匹配
export default {
  name: 'PageA',
  activated() {
    console.log('从缓存恢复，可刷新数据')
  },
  deactivated() {
    console.log('被缓存，可暂停定时器')
  }
}
```

```vue
<!-- 路由场景 -->
<keep-alive>
  <router-view v-if="$route.meta.keepAlive" />
</keep-alive>
<router-view v-if="!$route.meta.keepAlive" />
```

### 面试追问

1. **keep-alive 缓存的组件什么时候真正销毁？** 超出 max 被 LRU 淘汰、include/exclude 变化导致不匹配、或 keep-alive 组件自身 destroyed 时遍历 cache 全部 prune。
2. **为什么要设置 `abstract: true`？** 抽象组件不参与父组件链和 DOM 渲染，keep-alive 本身不产出 DOM，只管理子组件缓存逻辑。

---

## 32. Vue 中封装的数组方法有哪些，其如何实现页面更新

**记忆口诀：**「七个变异方法被重写，先执行原生再 notify，新增元素 observeArray」

**一句话总结：** Vue2 重写了 `push/pop/shift/unshift/splice/sort/reverse` 七个会改变数组自身的原生方法，在执行原生逻辑后手动 `dep.notify()` 触发视图更新。

### 七个变异方法

| 方法 | 是否可能新增元素 | 特殊处理 |
| --- | --- | --- |
| `push` | ✅ | 对新元素 `observeArray` |
| `unshift` | ✅ | 对新元素 `observeArray` |
| `splice` | ✅（插入参数） | 对 inserted 部分 `observeArray` |
| `pop` | ❌ | 仅 notify |
| `shift` | ❌ | 仅 notify |
| `sort` | ❌ | 仅 notify |
| `reverse` | ❌ | 仅 notify |

### 详细解答

**为什么需要重写？**

`Object.defineProperty` 无法监听：
- 通过索引直接赋值（`arr[0] = x`）
- 修改 `length`
- 数组原型链上的方法调用（不触发 setter）

**实现原理：**

1. 创建 `arrayMethods`，其 `__proto__` 指向 `Array.prototype`（原型链委托）。
2. 响应式数组实例的 `__proto__` 指向 `arrayMethods`，调用方法时走重写版本。
3. 重写逻辑：先 `original.apply(this, args)` 执行原生方法 → 获取 `this.__ob__`（Observer 实例）→ 若有新增元素则 `ob.observeArray(inserted)` → `ob.dep.notify()`。

**Vue3 变化：** Proxy 直接拦截数组索引和 length，不再重写原型方法；但变异方法仍走 `trigger` 通知。

**不触发更新的操作（Vue2）：**

- `arr[index] = value` → 用 `$set`
- `arr.length = 0` → 用 `splice(0)` 或替换整个数组
- `filter/map/concact` 等返回新数组的方法 → 需赋值回响应式变量

### 代码示例

```javascript
// Vue2 源码核心（简化）
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'
]

methodsToPatch.forEach(method => {
  const original = arrayProto[method]
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      const result = original.apply(this, args)
      const ob = this.__ob__
      let inserted
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args
          break
        case 'splice':
          inserted = args.slice(2)
          break
      }
      if (inserted) ob.observeArray(inserted)
      ob.dep.notify()
      return result
    }
  })
})

// 使用时
this.list.push({ id: 4, name: 'new' }) // 自动更新视图
this.list.splice(0, 1)                   // 自动更新视图
```

```javascript
// ❌ Vue2 不触发更新
this.list[0] = { id: 99, name: 'hack' }
this.list.length = 0

// ✅ 正确替代
this.$set(this.list, 0, { id: 99, name: 'hack' })
this.list.splice(0)
// 或
this.list = []
```

### 面试追问

1. **为什么 `filter/map` 等不重写？** 它们返回新数组，不修改原数组，原数组引用未变，Vue2 检测不到变化；应将结果赋值给响应式变量。
2. **Vue3 还需要重写数组方法吗？** 不需要，Proxy 的 set trap 能拦截数组索引赋值和方法触发的内部变更。

---

## 33. 说一下 Vue 的生命周期

**记忆口诀：**「创挂更销四阶段，before 在前 after 在后，setup 替代 beforeCreate+created」

**一句话总结：** Vue 实例从创建、挂载、更新到销毁经历一系列钩子函数，每个阶段 before/after 成对出现，开发者可在合适钩子执行初始化、DOM 操作和清理工作。

### 生命周期钩子一览

| 阶段 | Vue2 钩子 | Vue3 组合式 API | 能否访问 data | 能否访问 DOM |
| --- | --- | --- | :---: | :---: |
| 创建 | `beforeCreate` | `setup()` | ❌/✅ | ❌ |
| 创建 | `created` | `setup()` | ✅ | ❌ |
| 挂载 | `beforeMount` | `onBeforeMount` | ✅ | ❌ |
| 挂载 | `mounted` | `onMounted` | ✅ | ✅ |
| 更新 | `beforeUpdate` | `onBeforeUpdate` | ✅（新值） | ✅（旧 DOM） |
| 更新 | `updated` | `onUpdated` | ✅ | ✅（新 DOM） |
| 销毁 | `beforeDestroy` | `onBeforeUnmount` | ✅ | ✅ |
| 销毁 | `destroyed` | `onUnmounted` | ❌ | ❌ |
| 缓存 | `activated` | `onActivated` | ✅ | ✅ |
| 缓存 | `deactivated` | `onDeactivated` | ✅ | ✅ |
| 错误 | `errorCaptured` | `onErrorCaptured` | ✅ | ✅ |

### 详细解答

**创建阶段：**

- `beforeCreate`：实例初始化之后，data/props 未注入；Vue3 中由 `setup()` 替代此阶段及 created。
- `created`：data、computed、methods 已就绪，但 `$el` 未挂载，适合发请求、初始化非 DOM 逻辑。

**挂载阶段：**

- `beforeMount`：render 函数首次执行，生成 VNode，但未 patch 到 DOM。
- `mounted`：`$el` 已替换占位 DOM，可访问真实 DOM，适合初始化图表、绑定第三方库。

**更新阶段：**

- `beforeUpdate`：响应式数据变化，Virtual DOM 重新 render 后、patch 前；DOM 仍是旧的。
- `updated`：DOM 已更新；**避免在此修改 data**，可能无限循环。

**销毁阶段：**

- `beforeUnmount`/`beforeDestroy`：实例仍可用，适合清理定时器、事件监听、WebSocket。
- `unmounted`/`destroyed`：子组件、事件、Watcher 全部销毁。

**完整流程图：**

```
new Vue() → init → beforeCreate → initState → created
  → 是否有 el → beforeMount → 创建 VNode → patch → mounted
  → 数据变化 → beforeUpdate → 重新 render + patch → updated
  → $destroy → beforeDestroy → 销毁 Watcher/子组件 → destroyed
```

### 代码示例

```vue
<script>
export default {
  beforeCreate() {
    console.log('beforeCreate', this.msg) // undefined
  },
  created() {
    console.log('created', this.msg) // 'hello'
    this.fetchData()
  },
  mounted() {
    console.log('mounted', this.$refs.box) // DOM 元素
    this.initChart()
  },
  beforeUnmount() {
    clearInterval(this.timer)
    window.removeEventListener('resize', this.onResize)
  }
}
</script>
```

```javascript
// Vue3 Composition API
import { onMounted, onUnmounted, onBeforeMount } from 'vue'

export default {
  setup() {
    onBeforeMount(() => console.log('before mount'))
    onMounted(() => console.log('mounted'))
    onUnmounted(() => console.log('cleanup'))
  }
}
```

### 面试追问

1. **父组件和子组件生命周期执行顺序？** 创建：父 beforeCreate → 父 created → 父 beforeMount → 子完整挂载链 → 父 mounted；销毁：父 beforeDestroy → 子 destroyed → 父 destroyed。
2. **`setup` 和 `created` 的执行顺序？** `setup` 在 beforeCreate 之前执行，此时 props 已 resolve 但尚未暴露 this；逻辑迁移到 setup 后不再需要 created。

---

## 34. Vue 子组件和父组件执行顺序

**记忆口诀：**「创建从外到内，挂载从内到外；更新销毁都是先父后子（before），先子后父（after）」

**一句话总结：** 创建阶段父组件先进入 before 钩子，子组件先完成 mounted；挂载完成后父组件才 mounted；更新和销毁遵循「父 before → 子完整流程 → 父 after」。

### 三阶段执行顺序

| 阶段 | 执行顺序 |
| --- | --- |
| **创建挂载** | 父 beforeCreate → 父 created → 父 beforeMount → 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted → **父 mounted** |
| **更新** | 父 beforeUpdate → 子 beforeUpdate → 子 updated → **父 updated** |
| **销毁** | 父 beforeDestroy → 子 beforeDestroy → 子 destroyed → **父 destroyed** |

### 详细解答

**为什么挂载是「子先 mounted，父后 mounted」？**

- 父组件 `beforeMount` 时开始 render，render 过程中递归创建子组件。
- 子组件必须完成 DOM patch（mounted）后，父组件的 `$el` 才包含完整子树。
- 因此父 `mounted` 回调执行时，所有子组件 DOM 已就绪，可安全操作整个组件树。

**为什么创建是「父先 created，子后 created」？**

- 父组件先 `init`，解析 template 发现子组件，再递归 `init` 子组件。
- 父 `created` 时子组件尚未创建；父 `beforeMount` 时才实例化子组件。

**更新顺序同理：** 父组件数据变化导致 re-render，父 beforeUpdate 后递归更新子组件，子 updated 完成后父才 updated。

**keep-alive 特殊情况：** 缓存组件切换时不走 destroy，而是 deactivated/activated。

### 代码示例

```vue
<!-- Parent.vue -->
<template>
  <div>
    <p>Parent</p>
    <Child />
  </div>
</template>

<script>
import Child from './Child.vue'
export default {
  name: 'Parent',
  beforeCreate() { console.log('1. Parent beforeCreate') },
  created() { console.log('2. Parent created') },
  beforeMount() { console.log('3. Parent beforeMount') },
  mounted() { console.log('8. Parent mounted') },
  beforeUpdate() { console.log('Parent beforeUpdate') },
  updated() { console.log('Parent updated') },
  beforeUnmount() { console.log('Parent beforeUnmount') },
  unmounted() { console.log('Parent unmounted') },
  components: { Child }
}
</script>
```

```vue
<!-- Child.vue -->
<script>
export default {
  name: 'Child',
  beforeCreate() { console.log('4. Child beforeCreate') },
  created() { console.log('5. Child created') },
  beforeMount() { console.log('6. Child beforeMount') },
  mounted() { console.log('7. Child mounted') },
  beforeUpdate() { console.log('Child beforeUpdate') },
  updated() { console.log('Child updated') },
  beforeUnmount() { console.log('Child beforeUnmount') },
  unmounted() { console.log('Child unmounted') }
}
</script>
```

### 面试追问

1. **如果在父 mounted 中访问子组件 ref，能拿到吗？** 能。父 mounted 执行时子组件已 mounted，`<Child ref="child" />` 的 ref 已赋值。
2. **多个同级子组件的顺序？** 按 template 中声明顺序依次创建和挂载，遵循深度优先。

---

## 35. created 和 mounted 的区别

**记忆口诀：**「created 有数据无 DOM，mounted 数据 DOM 皆就绪」

**一句话总结：** `created` 在实例创建完成、DOM 挂载前调用，可访问 data 但无 `$el`；`mounted` 在 DOM 挂载完成后调用，可操作真实 DOM。

### 对比表

| 对比项 | created | mounted |
| --- | --- | --- |
| 触发时机 | 初始化 data/methods 完成后 | 首次 patch 完成，`$el` 替换占位节点后 |
| 访问 data/computed | ✅ | ✅ |
| 访问 `$el` / DOM | ❌ | ✅ |
| 访问 `$refs` | ❌（未渲染） | ✅ |
| SSR 支持 | ✅ | ❌（无 DOM 环境） |
| 典型用途 | 请求数据、初始化状态 | 操作 DOM、初始化 ECharts/Swiper |
| Vue3 等价 | `setup()` 主体 | `onMounted()` |

### 详细解答

**created 阶段已完成的工作：**

- `initState`：data、props、computed、watch、methods 全部初始化。
- 响应式系统已建立，可修改 data、发起 API 请求。
- `$el` 尚未生成，template 已编译但 VNode 未 patch 到页面。

**mounted 阶段已完成的工作：**

- render → VNode → patch → 真实 DOM 插入页面。
- `this.$el` 指向组件根 DOM 元素。
- `$refs` 中注册的 DOM/组件引用已可用。
- 子组件也已完成 mounted（父 mounted 在最后）。

**常见误区：**

- 在 created 中用 `document.getElementById` 取组件内元素 → 取不到，DOM 未渲染。
- 在 mounted 发请求 → 可以，但通常不如 created 早，白屏时间更长。
- 在 updated 改 data → 可能触发无限更新循环。

### 代码示例

```vue
<template>
  <div ref="container">
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return { message: 'Hello', chart: null }
  },
  async created() {
    // ✅ 适合：不依赖 DOM 的请求
    const { data } = await fetch('/api/user').then(r => r.json())
    this.message = data.name
  },
  mounted() {
    // ✅ 适合：依赖 DOM 的操作
    console.log(this.$el)              // <div>...</div>
    console.log(this.$refs.container)  // DOM 元素
    this.chart = echarts.init(this.$refs.container)
    this.chart.setOption({ /* ... */ })
  }
}
</script>
```

```javascript
// Vue3
import { ref, onMounted } from 'vue'

const container = ref(null)

onMounted(() => {
  // container.value 此时是 DOM 元素
  console.log(container.value)
})
```

### 面试追问

1. **请求放 created 还是 mounted 更好？** 不依赖 DOM 放 created/setup，尽早请求减少白屏；依赖 DOM 尺寸/第三方库放 mounted。
2. **服务端渲染时 mounted 会执行吗？** 不会。SSR 只有服务端 created/setup 和客户端 hydrate 后的 mounted。

---

## 36. 一般在哪个生命周期请求异步数据

**记忆口诀：**「不依赖 DOM 就 created/setup，依赖 DOM 就 mounted，SSR 只能 created」

**一句话总结：** 推荐在 `created`（Vue2）或 `setup`（Vue3）中发起异步请求，以便尽早获取数据、缩短白屏时间；需要 DOM 时才用 `mounted`。

### 生命周期请求对比

| 钩子 | 推荐度 | 优点 | 缺点 |
| --- | --- | --- | --- |
| `created` / `setup` | ⭐⭐⭐ 最推荐 | 最早可访问 data，请求与渲染并行 | 无法操作 DOM |
| `beforeMount` | ⭐ 较少用 | 同上 | 语义不如 created 清晰 |
| `mounted` | ⭐⭐ 特定场景 | 可操作 DOM | 请求晚启动，白屏更长 |
| `activated` | ⭐⭐ keep-alive | 每次切回可刷新 | 仅缓存组件场景 |

### 详细解答

**为什么优先 created/setup？**

1. **性能**：组件创建后立即发请求，与 Virtual DOM 渲染并行，用户更快看到数据。
2. **SSR 一致**：服务端无 DOM，`mounted` 不执行；created/setup 在服务端和客户端均可用。
3. **逻辑清晰**：数据获取属于「状态初始化」，与 DOM 无关，放在创建阶段更符合关注点分离。

**适合 mounted 的场景：**

- 需要读取 DOM 尺寸后再请求（如根据容器宽度请求不同分辨率图片）。
- 第三方库初始化依赖 DOM（ECharts 初始化后再拉数据渲染）。
- 需要在请求前展示 skeleton，mounted 后测量布局。

**现代最佳实践（Vue3）：**

```javascript
// 方式1：setup 中直接 async（需 Suspense 或手动管理 loading）
// 方式2：onMounted + 请求（依赖 DOM 时）
// 方式3：专门的数据 fetching 库（vue-query、pinia 插件）
```

**keep-alive 组件：** 首次 created/mounted 只执行一次；再次进入时执行 `activated`，可在此刷新列表数据。

### 代码示例

```vue
<script>
export default {
  data() {
    return { list: [], loading: false }
  },
  // ✅ 推荐
  async created() {
    this.loading = true
    try {
      const res = await fetch('/api/list').then(r => r.json())
      this.list = res.data
    } finally {
      this.loading = false
    }
  }
}
</script>
```

```javascript
// Vue3 Composition API + 自定义 hook
import { ref, onMounted } from 'vue'

function useFetch(url) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  onMounted(async () => {
    // 若不依赖 DOM，可直接在 setup 顶层 await（配合 Suspense）
    try {
      data.value = await fetch(url).then(r => r.json())
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })

  return { data, loading, error }
}
```

```javascript
// keep-alive 场景：每次激活刷新
export default {
  activated() {
    this.fetchLatestData()
  }
}
```

### 面试追问

1. **为什么不在 `beforeCreate` 请求？** beforeCreate 时 data 尚未初始化，无法方便地将结果赋给响应式属性（Vue2）；Vue3 setup 替代了 beforeCreate+created。
2. **多个接口请求如何优化？** 使用 `Promise.all` 并行请求；或 `@tanstack/vue-query` 管理缓存、重试、loading 状态。

---

## 37. keep-alive 中的生命周期哪些

**记忆口诀：**「首次 mounted+activated，切走 deactivated，切回 activated，不走 destroy」

**一句话总结：** 被 keep-alive 包裹的组件额外拥有 `activated` 和 `deactivated` 钩子；缓存期间不触发 `beforeDestroy/destroyed`（Vue3：`beforeUnmount/unmounted`）。

### keep-alive 生命周期对照

| 场景 | 触发的钩子 | 不触发的钩子 |
| --- | --- | --- |
| 首次进入 | beforeCreate → created → beforeMount → mounted → **activated** | - |
| 切走（缓存） | **deactivated** | beforeDestroy、destroyed |
| 再次进入（命中缓存） | **activated** | beforeCreate、created、beforeMount、mounted |
| 被 LRU 淘汰或 include 排除 | beforeDestroy → destroyed | activated |

### 详细解答

**activated（激活）：**

- 组件从缓存恢复并插入 DOM 时调用。
- 适合：刷新列表数据、恢复滚动位置、重启定时器/轮询。
- 每次显示都会触发（含首次，首次在 mounted 之后）。

**deactivated（停用）：**

- 组件从 DOM 移除但被缓存时调用。
- 适合：暂停定时器、取消未完成的请求、保存滚动位置。
- 不会销毁实例，data、DOM 状态均保留。

**与 destroy 的关系：**

- 被缓存时组件处于 `inactive` 状态，Watcher 仍存在但不触发更新。
- 只有缓存被清除（max 淘汰、手动清除、keep-alive 销毁）才真正 `$destroy`。

**执行顺序示例：**

```
首次：... → mounted → activated
切走：deactivated
切回：activated（无 mounted）
销毁：deactivated → beforeUnmount → unmounted
```

### 代码示例

```vue
<template>
  <keep-alive :include="['UserList']">
    <router-view />
  </keep-alive>
</template>
```

```javascript
export default {
  name: 'UserList',
  data() {
    return { timer: null, scrollTop: 0 }
  },
  mounted() {
    console.log('首次挂载')
    this.startPolling()
  },
  activated() {
    console.log('组件显示（含首次和切回）')
    this.fetchList()        // 每次显示刷新数据
    this.startPolling()
    this.$el.scrollTop = this.scrollTop
  },
  deactivated() {
    console.log('组件被缓存')
    this.scrollTop = this.$el.scrollTop
    this.stopPolling()
  },
  beforeUnmount() {
    this.stopPolling() // 真正销毁时清理
  },
  methods: {
    startPolling() {
      this.timer = setInterval(() => this.fetchList(), 30000)
    },
    stopPolling() {
      clearInterval(this.timer)
    }
  }
}
```

```javascript
// Vue3
import { onActivated, onDeactivated } from 'vue'

onActivated(() => console.log('activated'))
onDeactivated(() => console.log('deactivated'))
```

### 面试追问

1. **首次进入时 activated 和 mounted 谁先执行？** mounted 先执行，然后 activated；因此 activated 中可安全访问 DOM。
2. **如何在 activated 中区分「首次」和「切回」？** 可用标志位 `isFirst = true`，activated 中判断后置 false；或比较路由参数变化决定是否刷新。

---

## 38. 讲一下 v-if 和 v-for 的优先级

**记忆口诀：**「Vue2 for 优先 if 在内层，Vue3 if 优先会报错，最佳 computed 先过滤」

**一句话总结：** Vue2 中 `v-for` 优先级高于 `v-if`，导致 v-if 在每个循环项上执行；Vue3 中 `v-if` 优先级更高，同元素使用会报错；两者不应写在同一元素上。

### 版本差异对比

| 版本 | 优先级 | 同元素使用后果 |
| --- | --- | --- |
| Vue2 | `v-for` > `v-if` | v-if 在循环内执行，列表大时性能差；无法访问外层 v-if 条件 |
| Vue3 | `v-if` > `v-for` | v-if 先执行，访问不到 v-for 的 `item`，编译/运行报错 |
| 官方建议 | - | **永远不要**在同一元素上同时使用 |

### 详细解答

**Vue2 的问题：**

```html
<!-- Vue2：v-for 优先，相当于对每个 item 判断 item.isShow -->
<li v-for="item in list" v-if="item.isShow" :key="item.id">
  {{ item.name }}
</li>
```

- 即使最终只显示 1 项，v-for 仍遍历整个 list。
- 若 v-if 条件与 item 无关（如 `v-if="isAdmin"`），逻辑错误：isAdmin 被重复判断 N 次。

**Vue3 的问题：**

```html
<!-- Vue3：v-if 优先，此时 item 未定义，报错 -->
<li v-for="item in list" v-if="item.isShow" :key="item.id">
```

Vue3 编译器会警告：`v-if should not be used together with v-for`。

**推荐写法：**

1. **computed 过滤（最推荐）** — 逻辑清晰，性能好，只遍历需要的项。
2. **template 包裹** — 外层 v-for，内层 v-if，语义分离。
3. **v-if 包裹 v-for** — 先判断再渲染整个列表（列表本身需条件显示时）。

### 代码示例

```vue
<template>
  <!-- ✅ 推荐：computed 过滤 -->
  <ul>
    <li v-for="item in visibleList" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- ✅ template 分离 -->
  <template v-for="item in list" :key="item.id">
    <li v-if="item.isShow">{{ item.name }}</li>
  </template>

  <!-- ✅ 整个列表条件渲染 -->
  <div v-if="isAdmin">
    <li v-for="item in list" :key="item.id">{{ item.name }}</li>
  </div>

  <!-- ❌ 避免：同元素 v-if + v-for -->
  <!-- <li v-for="item in list" v-if="item.isShow"> -->
</template>

<script>
export default {
  data() {
    return {
      isAdmin: true,
      list: [
        { id: 1, name: 'A', isShow: true },
        { id: 2, name: 'B', isShow: false }
      ]
    }
  },
  computed: {
    visibleList() {
      return this.list.filter(item => item.isShow)
    }
  }
}
</script>
```

### 面试追问

1. **为什么 Vue3 调整了优先级？** 同元素同时使用是反模式，Vue3 改为 if 优先并在编译期警告，强制开发者用正确写法，避免隐蔽的性能和逻辑 bug。
2. **template v-for 需要 key 吗？** Vue3 要求 key 放在 template 上；Vue2 建议 key 放在真实 DOM 元素上。

---

## 39. Vue-Router 的懒加载如何实现

**记忆口诀：**「动态 import 按需分包，路由跳转才加载，prefetch 空闲预取加速」

**一句话总结：** 路由懒加载通过动态 `import()` 将组件拆分为独立 chunk，访问对应路由时才加载 JS，减少首屏 bundle 体积。

### 实现方式对比

| 方式 | 语法 | 构建工具 | 推荐度 |
| --- | --- | --- | --- |
| 动态 import | `() => import('@/views/Home.vue')` | Webpack / Vite | ⭐⭐⭐ 官方推荐 |
| require 异步 | `resolve => require(['@/views/Home'], resolve)` | Webpack | ⭐⭐ Vue2 旧写法 |
| require.ensure | `r => require.ensure([], () => r(require(...)), 'chunk')` | Webpack 3 | ⭐ 已过时 |
| 命名 chunk | `import(/* webpackChunkName: "home" */ '@/views/Home.vue')` | Webpack | ⭐⭐⭐ 便于调试 |

### 详细解答

**工作原理：**

1. 路由配置中 `component` 传入返回 Promise 的函数，而非静态 import。
2. 构建工具（Webpack/Vite）将每个动态 import 打成独立 JS 文件（code splitting）。
3. 用户首次访问该路由时，Vue Router 调用函数加载 chunk，resolve 后渲染组件。
4. 已加载的 chunk 会被浏览器缓存，再次访问无需重新下载。

**Vue Router 4（Vue3）写法：**

```javascript
const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  }
]
```

**进阶优化：**

- **命名 chunk**：`import(/* webpackChunkName: "about" */ '@/views/About.vue')`，生产环境 DevTools 中可读性更好。
- **prefetch**：`/* webpackPrefetch: true */` 浏览器空闲时预加载，加快后续导航。
- **preload**：`/* webpackPreload: true */` 与当前 chunk 并行加载，适合即将访问的路由。
- **分组打包**：多个路由相同 magic comment chunkName，合并为一个文件。

**Vite 差异：** 原生支持动态 import，无需 webpack magic comment 也能自动分包；chunk 文件名由 Rollup 决定。

### 代码示例

```javascript
// Vue Router 4
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      // 命名 chunk + 预取
      component: () => import(
        /* webpackChunkName: "about" */
        /* webpackPrefetch: true */
        '@/views/About.vue'
      )
    },
    {
      path: '/user/:id',
      name: 'User',
      component: () => import('@/views/User.vue'),
      props: true
    }
  ]
})

export default router
```

```javascript
// 分组：admin 相关路由打成一个包
const AdminLayout = () => import(/* webpackChunkName: "admin" */ '@/layouts/AdminLayout.vue')
const AdminUsers = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Users.vue')
const AdminSettings = () => import(/* webpackChunkName: "admin" */ '@/views/admin/Settings.vue')
```

```javascript
// 加载状态处理（可选）
component: () => import('@/views/Heavy.vue'),
// 配合 Suspense（Vue3）
// <Suspense><router-view /></Suspense>
```

### 面试追问

1. **懒加载的路由组件加载失败怎么办？** 可封装 retry 逻辑：动态 import 失败时重试 N 次；或监听 `router.onError` 提示用户刷新。
2. **Vite 和 Webpack 懒加载有何不同？** 语法相同（动态 import）；Vite 开发环境不打包、直接 ESM 请求；生产环境 Rollup 自动 code split，无需 magic comment 也能分包。

---

## 40. 路由的 hash 和 history 模式的区别

**记忆口诀：**「hash 带 # 不请求后端，history 无 # 需服务端 fallback，pushState 改 URL 不刷新」

**一句话总结：** hash 模式通过 `#` 后路径变化触发 `hashchange`，无需服务端配置；history 模式用 HTML5 History API 实现真实 URL，美观但刷新需服务端支持。

### 核心对比表

| 维度 | hash 模式 | history 模式 |
| --- | --- | --- |
| URL 形态 | `example.com/#/user/1` | `example.com/user/1` |
| 实现原理 | `location.hash` + `hashchange` 事件 | `history.pushState/replaceState` + `popstate` |
| 服务端请求 | `#` 后内容不发送到服务器 | 完整路径发送到服务器 |
| 后端配置 | 不需要 | 需要 fallback 到 index.html |
| 刷新页面 | 正常 | 无配置则 404 |
| SEO | 较差（历史上） | 较好（配合 SSR） |
| 兼容性 | IE8+ | IE10+（需 polyfill） |
| 默认模式 | Vue Router 默认 | 需 `mode: 'history'` 或 `createWebHistory()` |

### 详细解答

**Hash 模式原理：**

- URL 中 `#` 及之后为前端路由路径，如 `#/about`。
- 修改 `location.hash` 不会触发页面刷新，但会触发 `hashchange` 事件。
- 浏览器请求只发送到 `#` 之前，后端无需感知前端路由。
- 缺点：URL 不美观，SEO 不友好（爬虫可能忽略 hash）。

**History 模式原理：**

- 使用 `history.pushState(state, title, url)` 修改 URL 而不刷新页面。
- 浏览器前进/后退触发 `popstate` 事件（注意：pushState 本身不触发 popstate）。
- URL 与传统多页应用一致，更美观，SEO 友好（配合 SSR/预渲染）。
- 刷新 `/user/1` 时浏览器向服务器请求该路径，若 Nginx/Apache 无对应文件则 404。

**History 模式服务端配置（Nginx 示例）：**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**pushState 相比 hash 的优势：**

- 可设置任意同源 URL，不限于 `#` 后片段。
- 可携带 `stateObject` 附加数据。
- 相同 URL 也可入栈（hash 必须不同才触发）。

### 代码示例

```javascript
// Vue Router 4
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

// hash 模式（默认）
const routerHash = createRouter({
  history: createWebHashHistory(),
  routes: [/* ... */]
})

// history 模式
const routerHistory = createRouter({
  history: createWebHistory('/app/'), // 可设 base
  routes: [/* ... */]
})
```

```javascript
// Vue Router 3
const router = new VueRouter({
  mode: 'history', // 默认 'hash'
  base: '/app/',
  routes: [/* ... */]
})
```

```javascript
// 原生 History API 演示
history.pushState({ page: 1 }, '', '/user/1')
window.addEventListener('popstate', (e) => {
  console.log('location:', location.pathname, 'state:', e.state)
})
```

```javascript
// hash 模式原理演示
window.addEventListener('hashchange', () => {
  const path = location.hash.slice(1) || '/'
  console.log('路由变化:', path)
  // 根据 path 渲染对应组件
})
location.hash = '/about'
```

### 面试追问

1. **history 模式部署到子目录 `/app/` 要注意什么？** 配置 `createWebHistory('/app/')` 或 `base: '/app/'`；Nginx 的 try_files 和静态资源 publicPath 也需匹配。
2. **hash 模式下 `#` 变化会发 HTTP 请求吗？** 不会。`#` 及之后内容（fragment）不随 HTTP 请求发送，仅在前端由 `hashchange` 处理。

---

## 41. 如何获取页面的 hash 变化

**记忆口诀：**「Vue 里 watch $route，原生用 hashchange + location.hash」

**一句话总结：** 在 Vue Router 中优先通过 `watch $route` 或 `useRoute()` 监听路由变化；脱离框架时可用 `hashchange` 事件或轮询 `location.hash` 感知 `#` 片段变化。

### 对比表

| 方式 | 适用场景 | 优点 | 缺点 |
| --- | --- | --- | --- |
| `watch $route` / `useRoute()` | Vue Router 项目 | 与路由系统深度集成，可拿到完整路由对象 | 依赖 Vue Router |
| `window.onhashchange` | 原生 hash SPA | 标准 API，无需轮询 | 仅监听 hash 变化，不感知 history 模式 |
| `location.hash` 轮询 | 兼容性兜底 | 兼容极老浏览器 | 性能差，不推荐 |
| `popstate` | history 模式 | 监听前进/后退 | 不监听 `pushState`/`replaceState` 本身 |

### 详细解答

Hash 路由的核心是 URL 中 `#` 后面的片段（fragment）。浏览器在 hash 变化时会触发 `hashchange` 事件，且**不会向服务器发起新请求**，这正是 SPA hash 模式的基础。

在 Vue 项目中，Vue Router 已经封装了 hash 监听逻辑，开发者通常不需要直接操作 `window.onhashchange`。当 hash 变化导致路由匹配结果改变时，`$route` 对象会更新，组件可通过 `watch` 或 Composition API 响应。

需要注意的几点：

1. **Hash 模式 vs History 模式**：History 模式下 URL 无 `#`，应监听 `$route` 或 `popstate`，而非 `hashchange`。
2. **同 hash 不触发**：若新 hash 与旧 hash 相同，不会触发 `hashchange`。
3. **Vue 3 写法**：推荐使用 `watch(() => route.fullPath, ...)` 或 `watch(route, ...)`，比 Options API 的 `$route` 更清晰。
4. **首次加载**：`hashchange` 不会在页面初次加载时触发，需在 `mounted`/`onMounted` 中读取初始 hash。

### 代码示例

```javascript
// ===== 方式一：Vue Router（Options API）=====
export default {
  watch: {
    $route: {
      handler(to, from) {
        console.log('hash/path 变化:', from.fullPath, '→', to.fullPath)
        console.log('当前 hash:', to.hash) // 如 #/user?id=1 中的 #/user
      },
      immediate: true // 首次加载也执行
    }
  }
}

// ===== 方式二：Vue 3 Composition API =====
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    watch(
      () => route.fullPath,
      (newPath, oldPath) => {
        console.log('路由变化:', oldPath, '→', newPath)
      },
      { immediate: true }
    )
  }
}

// ===== 方式三：原生 hashchange（无 Vue Router 时）=====
window.addEventListener('hashchange', (event) => {
  console.log('旧 URL:', event.oldURL)
  console.log('新 URL:', event.newURL)
  console.log('当前 hash:', location.hash) // 如 "#/about"
})

// 手动修改 hash（不刷新页面）
location.hash = '#/dashboard'

// ===== 方式四：history 模式的 popstate =====
window.addEventListener('popstate', (event) => {
  console.log('history 变化, state:', event.state)
})
```

### 面试追问

1. **hashchange 和 popstate 有什么区别？分别在什么路由模式下使用？** `hashchange` 仅在 URL 的 `#` 部分变化时触发，用于 hash 模式；`popstate` 在浏览器前进/后退改变 history 条目时触发，用于 history 模式。注意 `pushState`/`replaceState` 不会触发 `popstate`，Vue Router 在调用这些 API 后手动更新当前路由。
2. **如果用户在地址栏直接修改 hash，Vue Router 是如何感知并更新组件的？** Vue Router 在初始化时监听了 `hashchange` 事件（hash 模式）或 `popstate` 事件（history 模式）。用户手动改 hash 会触发 `hashchange`，Router 在回调中解析新 hash 对应的路由记录，匹配组件并触发渲染更新。

---

## 42. $route 和 $router 的区别

**记忆口诀：**「$route 是只读信息，$router 是操作工具」

**一句话总结：** `$route` 是当前路由的状态快照（信息对象），`$router` 是 Vue Router 实例（工具对象），前者用来读，后者用来跳转和控制导航。

### 对比表

| 对比项 | `$route` | `$router` |
| --- | --- | --- |
| 本质 | 当前激活路由的**信息对象** | Vue Router 的**实例对象** |
| 数据来源 | 路由匹配结果，随 URL 变化自动更新 | 应用初始化时 `createRouter()` 创建 |
| 主要属性/方法 | `path`、`params`、`query`、`hash`、`meta`、`matched`、`name`、`fullPath` | `push()`、`replace()`、`go()`、`back()`、`forward()`、`beforeEach()` 等 |
| 可写性 | **只读**，不应直接修改 | 可调用方法执行导航 |
| Vue 3 等价物 | `useRoute()` | `useRouter()` |
| 典型场景 | 读取参数、判断当前页面、权限 meta | 编程式导航、注册全局守卫 |

### 详细解答

可以把 `$router` 理解为「导航遥控器」，把 `$route` 理解为「当前位置的 GPS 信息」。

**$route 的核心字段：**

- `path`：路径字符串，如 `/user/123`
- `params`：动态路由参数，如 `{ id: '123' }`（来自 `/user/:id`）
- `query`：查询参数，如 `{ tab: 'info' }`（来自 `?tab=info`）
- `hash`：URL 中的锚点，如 `#section-2`
- `meta`：路由元信息，如 `{ requiresAuth: true }`
- `matched`：当前路由匹配到的所有路由记录数组（含嵌套路由）
- `fullPath`：完整路径，含 query 和 hash

**$router 常用 API：**

- `push(location)`：导航到新路由，会在 history 栈中新增记录
- `replace(location)`：替换当前记录，不可后退
- `go(n)` / `back()` / `forward()`：在历史栈中移动
- `beforeEach()` / `afterEach()`：注册全局导航守卫
- `resolve()`：解析路由位置，返回 normalized 后的 route 对象

在 Vue 3 中，由于 `setup()` 中无法访问 `this.$route`，官方提供了组合式 API：`useRoute()` 和 `useRouter()`，它们是 inject 出来的，必须在 `setup` 或 `<script setup>` 中调用。

### 代码示例

```javascript
// Options API
export default {
  mounted() {
    // 读取路由信息
    console.log(this.$route.params.id)
    console.log(this.$route.query.tab)
    console.log(this.$route.meta.title)

    // 执行路由跳转
    this.$router.push({ name: 'UserDetail', params: { id: 1 } })
    this.$router.replace('/login')
    this.$router.go(-1)
  }
}

// Vue 3 Composition API
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()   // 等价于 $route
const router = useRouter() // 等价于 $router

console.log(route.params.id)
router.push('/home')
```

### 面试追问

1. **为什么 `$route` 是只读的？如果直接修改 `$route.params` 会发生什么？** `$route` 是 Vue Router 内部根据当前 URL 匹配计算出的快照对象，直接修改它不会触发导航也不会更新 URL。Vue 2 中直接改会静默失败；Vue 3 中 `useRoute()` 返回的是 `shallowReadonly` 对象，修改会在开发环境抛出警告。正确做法是通过 `router.push/replace` 触发新导航。
2. **`router.push` 和 `router.replace` 在浏览器历史栈上有什么区别？** `push` 调用 `history.pushState`，在历史栈中**新增**一条记录，用户可以点击浏览器后退按钮回到前一页；`replace` 调用 `history.replaceState`，**替换**当前记录，不产生新的历史条目，用户无法后退到被替换的页面。典型场景：登录成功后跳首页用 `replace`，避免用户后退回登录页。

---

## 43. 如何定义动态路由？如何获取传过来的动态参数？

**记忆口诀：**「param 配动态段 `/user/:id`，query 配问号 `?id=1`，分别用 `$route.params` / `$route.query` 取」

**一句话总结：** 动态路由通过在 path 中声明 `:paramName` 占位符来定义，组件内通过 `$route.params` 获取路径参数，通过 `$route.query` 获取查询参数。

### 对比表

| 传参方式 | 路由定义 | 跳转写法 | URL 示例 | 获取方式 | 刷新是否丢失 |
| --- | --- | --- | --- | --- | --- |
| 动态 params | `path: '/user/:id'` | `push({ name: 'user', params: { id: 1 } })` | `/user/1` | `$route.params.id` | 不丢失 |
| query | `path: '/user'` | `push({ path: '/user', query: { id: 1 } })` | `/user?id=1` | `$route.query.id` | 不丢失 |
| 隐式 params | 无动态段 | `push({ name: 'user', params: { id: 1 } })` | `/user` | `$route.params.id` | **会丢失** |

### 详细解答

**1. 动态路由（params）定义**

在路由配置中使用冒号声明动态片段：

```javascript
{ path: '/user/:id', name: 'user', component: UserView }
// 多个动态参数
{ path: '/post/:category/:id', component: PostView }
// 可选参数（Vue Router 4）
{ path: '/user/:id?', component: UserView }
// 正则约束
{ path: '/user/:id(\\d+)', component: UserView } // 只匹配数字
```

**2. 参数传递的三种方式**

- **声明式**：`<router-link :to="{ name: 'user', params: { id: 123 } }">`
- **编程式（name + params）**：`router.push({ name: 'user', params: { id: 123 } })`
- **编程式（path 拼接）**：`router.push('/user/123')`

**3. 重要注意事项：** params 必须配合 `name` 跳转；无动态段时刷新丢失；推荐 `props: true` 映射为组件 props；组件复用时需 `watch $route` 或 `beforeRouteUpdate` 响应参数变化。

### 代码示例

```javascript
// router/index.js
const routes = [
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('@/views/UserView.vue'),
    props: true // 开启 props 映射
  }
]

// UserView.vue — 获取参数
export default {
  props: ['id'], // 来自 props: true
  setup() {
    const route = useRoute()

    // 方式 1：props（推荐）
    // props.id

    // 方式 2：$route.params
    console.log(route.params.id)

    // 方式 3：query 参数
    console.log(route.query.tab) // /user/1?tab=posts

    // 监听参数变化（组件复用时）
    watch(() => route.params.id, (newId) => {
      fetchUser(newId)
    })
  }
}

// 跳转
router.push({ name: 'user', params: { id: '123' }, query: { tab: 'posts' } })
// URL: /user/123?tab=posts
```

### 面试追问

1. **`props: true` 和 `props: route => ({ id: route.params.id })` 有什么区别？** `props: true` 会将 `$route.params` 的所有字段自动映射为组件同名 props；函数形式 `props: route => ({...})` 更灵活，可以做类型转换（如 `Number(route.params.id)`）、合并 query 参数、或传入计算后的值。命名视图中每个视图可独立配置 props。
2. **从 `/user/1` 跳转到 `/user/2`，组件会重新创建吗？如何监听参数变化重新请求数据？** 不会重新创建，Vue Router 会**复用**同一组件实例（性能优化）。方案：① `watch(() => route.params.id, fn)` 监听参数变化；② 使用 `beforeRouteUpdate` 守卫获取新参数并请求数据；③ 给 `<router-view :key="$route.fullPath">` 加 key 强制重建（简单但性能略差）。

---

## 44. Vue-router 路由钩子在生命周期的体现

**记忆口诀：**「Leave → beforeEach → beforeEnter → beforeRouteEnter → Resolve → afterEach → 组件生命周期」

**一句话总结：** 路由导航守卫在组件生命周期之前/之中/之后按固定顺序执行，完整链路是「离开守卫 → 全局前置 → 路由独享 → 进入守卫 → 解析确认 → 后置钩子 → 组件挂载 → enter 回调」。

### 导航守卫执行顺序

| 顺序 | 守卫 | 类型 | 说明 |
| --- | --- | --- | --- |
| 1 | `beforeRouteLeave` | 组件内 | 离开当前组件时 |
| 2 | `beforeEach` | 全局 | 每次导航前 |
| 3 | `beforeRouteUpdate` | 组件内 | 路由复用组件、参数变化时 |
| 4 | `beforeEnter` | 路由独享 | 进入特定路由前 |
| 5 | `beforeRouteEnter` | 组件内 | 进入组件前（无 this） |
| 6 | `beforeResolve` | 全局 | 组件和异步路由解析完成后 |
| 7 | 导航确认 | — | — |
| 8 | `afterEach` | 全局 | 导航完成后（无 next） |
| 9 | 组件生命周期 | — | `beforeCreate` → `created` → `beforeMount` → `mounted` |
| 10 | `beforeRouteEnter` 的 next 回调 | 组件内 | 在 mounted 之后执行 |

### 详细解答

路由导航是一个完整的**异步流程**，从触发导航到渲染新组件，中间穿插多层守卫。理解这个顺序对实现登录鉴权、页面离开确认、数据预取至关重要。

**与生命周期的关系：**

1. **beforeRouteEnter 执行时组件实例尚未创建**，无法访问 `this`，需通过 `next(vm => { ... })` 在 mounted 后访问实例。
2. **afterEach 不接收 next**，不能阻止导航，适合做埋点、改标题、滚动到顶部。
3. **keep-alive 场景**：首次进入走 `mounted` + `activated`；再次进入只走 `activated`；离开走 `deactivated` 而非 `beforeDestroy`。
4. **异步组件**：`beforeResolve` 在异步路由组件加载完成后才执行，适合关闭 loading。

**典型流程（A → B）：** `beforeRouteLeave(A) → beforeEach → beforeEnter(B) → beforeRouteEnter(B) → beforeResolve → afterEach → 组件生命周期(mounted) → enter 的 next 回调`。keep-alive 缓存组件再次进入时走 `activated` 而非重新 mounted。

### 代码示例

```javascript
// 全局守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = to.meta.title || '默认标题'
})

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 此时组件实例未创建，不能访问 this
    fetchData(to.params.id).then(data => {
      next(vm => {
        vm.list = data // mounted 后执行
      })
    })
  },
  beforeRouteUpdate(to, from, next) {
    // /user/1 → /user/2，组件复用
    this.fetchUser(to.params.id)
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('有未保存的修改，确定离开？')
      next(answer ? undefined : false)
    } else {
      next()
    }
  }
}
```

### 面试追问

1. **`beforeRouteEnter` 中为什么不能访问 `this`？有哪些替代方案获取数据？** 因为该守卫在导航确认前调用，此时组件实例**尚未创建**。替代方案：① `next(vm => { vm.data = ... })` 在实例创建后回调中访问；② 在 `beforeEnter` 或 `beforeEach` 中通过 store 存数据，组件 `created/mounted` 时读取；③ Vue 3 Composition API 中用 `onBeforeRouteUpdate` 替代（此时实例已存在）。
2. **keep-alive 缓存的组件再次进入时，会触发哪些路由守卫和生命周期钩子？** 路由守卫正常执行完整链路（`beforeEach` → `beforeEnter` → `beforeRouteEnter` → `beforeResolve` → `afterEach`）。生命周期方面：**不走** `created/mounted`（组件已缓存），只走 `activated`；离开时走 `deactivated` 而非 `unmounted`。`beforeRouteEnter` 的 `next` 回调在 `activated` 之后执行。

---

## 45. Vue-router 跳转和 location.href 有什么区别

**记忆口诀：**「location 刷页面，pushState 不刷新，router.push 最智能」

**一句话总结：** `location.href` 触发整页刷新并销毁 SPA 状态；`router.push` 基于 History/Hash API 无刷新切换组件，完整走导航守卫和生命周期。

### 对比表

| 方式 | 是否刷新页面 | 是否触发 Vue 生命周期 | 是否走导航守卫 | 是否保留 SPA 状态 | 原理 |
| --- | :---: | :---: | :---: | :---: | --- |
| `location.href = url` | ✅ | ❌ | ❌ | ❌ | 浏览器发起完整 HTTP 请求 |
| `location.assign/replace` | ✅ | ❌ | ❌ | ❌ | 同上 |
| `history.pushState()` | ❌ | ❌ | ❌ | 部分 | 仅改 URL 和历史栈 |
| `router.push()` | ❌ | ✅ | ✅ | ✅ | pushState + 路由匹配 + 组件渲染 |

### 详细解答

**location.href 的问题：**

- 整个 HTML 文档重新加载，JS 上下文销毁，Vue 实例、Vuex/Pinia 状态全部丢失。
- 白屏时间长，用户体验差。
- 无法利用 Vue Router 的懒加载、守卫、过渡动画等能力。
- 在 SPA 中应尽量避免，除非需要跳转到外部站点或强制刷新。

**router.push 的优势：**

1. 底层调用 `history.pushState`（history 模式）或修改 `location.hash`（hash 模式）。
2. 触发路由匹配，按需加载对应组件。
3. 执行完整的导航守卫链（beforeEach → ... → afterEach）。
4. 触发组件销毁/创建或 keep-alive 激活/停用。
5. 支持 Promise 化返回值（Vue Router 4），可捕获导航失败。

**何时仍用 location.href：**

- 跳转到不同域名的外部页面。
- 需要强制从服务器拉取最新 HTML（如部署后版本更新提示）。
- 非 Vue 管理的传统多页应用页面。

### 代码示例

```javascript
// ❌ 整页刷新，丢失 SPA 状态
window.location.href = '/dashboard'
window.location.assign('/dashboard')
window.location.replace('/dashboard') // 不可后退

// ⚠️ 只改 URL，Vue 不会切换组件
history.pushState(null, '', '/dashboard')

// ✅ Vue Router 推荐方式
this.$router.push('/dashboard')
this.$router.push({ name: 'Dashboard', query: { from: 'home' } })

// Vue Router 4 — 捕获导航结果
const result = await router.push('/dashboard')
if (result instanceof Error) {
  console.log('导航被守卫取消或出错')
}
```

### 面试追问

1. **`router.push` 返回的 Promise 在什么情况下会被 reject？** Vue Router 4 中 `push` 返回的 Promise 会在以下情况 reject：① 导航守卫中返回 `false` 或抛出错误（`NavigationFailure`）；② 目标路由和当前路由相同（重复导航）；③ 在守卫中重定向到其他路由。可以通过 `isNavigationFailure(err, NavigationFailureType.xxx)` 判断失败类型。
2. **生产环境部署新版本后，如何让用户无感知地加载新资源？为什么单纯 `router.push` 不够？** `router.push` 是 SPA 内路由切换，不会向服务器请求新的 HTML/JS 资源。部署新版本后，旧版 JS chunk 可能已被删除或 hash 已变。方案：① 路由懒加载 chunk 加载失败时捕获错误，调用 `window.location.reload()` 强制刷新；② 轮询版本号接口，发现版本更新后提示用户刷新；③ Service Worker 管理缓存和更新策略。

---

## 46. params 和 query 的区别

**记忆口诀：**「query 走 path 像 GET 显 URL，params 走 name 嵌路径，动态段刷新不丢」

**一句话总结：** query 是 URL 查询字符串（`?key=value`），用 path 跳转；params 是路由参数字典，需配合 name 或动态路由段使用，是否持久化取决于路由是否定义了 `:param`。

### 对比表

| 对比项 | query | params |
| --- | --- | --- |
| URL 形式 | `/user?id=1&name=tom` | `/user/1`（动态段）或不可见（无动态段） |
| 跳转方式 | `push({ path: '/user', query: { id: 1 } })` | `push({ name: 'user', params: { id: 1 } })` |
| 接收方式 | `$route.query.id` | `$route.params.id` |
| 参数类型 | 值均为 **字符串** | 动态段值为字符串 |
| 刷新页面 | 不丢失 | 有动态段不丢失，无动态段丢失 |
| 适用场景 | 筛选条件、分页、搜索关键词 | RESTful 资源 ID、必填路由参数 |
| 类比 | HTTP GET 查询参数 | URL 路径的一部分 |

### 详细解答

**query 特点：**

- 始终显示在 URL 中，便于分享和书签收藏。
- 适合非必填、可变的过滤条件（如 `?page=2&sort=desc`）。
- 值会被自动字符串化，`query: { active: true }` → `?active=true`。
- 同名 key 后者覆盖前者。

**params 特点：**

- 若路由配置了 `path: '/user/:id'`，params 会嵌入 URL 路径。
- 使用 `name + params` 跳转时，params 中未在 path 中声明的字段不会出现在 URL（刷新丢失）。
- Vue Router 4 移除了「无动态段的 params 传参」能力，未声明的参数会被丢弃并警告，推荐改用 query。

**最佳实践：**

- 资源标识（用户 ID、文章 ID）→ 动态 params
- 可选过滤、分页、Tab 切换 → query
- 敏感信息 → 都不放 URL，用 sessionStorage 或状态管理

### 代码示例

```javascript
// query 传参
router.push({
  path: '/search',
  query: { keyword: 'vue', page: 1 }
})
// URL: /search?keyword=vue&page=1
const keyword = route.query.keyword // 'vue'

// params 传参（路由: path: '/user/:id'）
router.push({
  name: 'user',
  params: { id: '123' }
})
// URL: /user/123
const id = route.params.id // '123'

// ❌ 错误：path + params，params 会被忽略
router.push({ path: '/user', params: { id: 1 } })

// 同时传递
router.push({
  name: 'user',
  params: { id: '123' },
  query: { tab: 'posts' }
})
// URL: /user/123?tab=posts
```

### 面试追问

1. **Vue Router 4 为什么废弃了「无动态路由段的 params 传参」？** 因为这类 params 不会体现在 URL 中，页面刷新后丢失，导致状态不一致和难以复现的 bug。Vue Router 4 认为这违反了「URL 应反映当前页面状态」的原则，官方建议改用 query（显示在 URL）、store（内存共享）或 `history.state`（一次性传递）。
2. **query 参数的值类型是什么？如果需要传对象怎么办？** query 参数的值始终是**字符串**（或字符串数组 `?a=1&a=2`）。传递对象方案：① `JSON.stringify` 序列化后放 query，取出时 `JSON.parse`（注意 URL 编码和长度限制）；② 将对象的各字段展开为独立 query 参数；③ 复杂数据不放 URL，改用 store 或 sessionStorage。

---

## 47. Vue-router 导航守卫有哪些

**记忆口诀：**「全局 beforeEach/Resolve/afterEach，路由独享 beforeEnter，组件内 Enter/Update/Leave」

**一句话总结：** Vue Router 提供全局、路由独享、组件内三个层级的导航守卫，分别在导航的不同阶段拦截、确认或收尾，构成完整的访问控制链路。

### 导航守卫分类

| 类型 | 钩子 | 触发时机 | 能否阻止导航 |
| --- | --- | --- | --- |
| 全局 | `beforeEach` | 每次导航前 | ✅（next(false)） |
| 全局 | `beforeResolve` | 组件内守卫和异步组件解析后 | ✅ |
| 全局 | `afterEach` | 导航完成后 | ❌ |
| 路由独享 | `beforeEnter` | 进入该路由配置前 | ✅ |
| 组件内 | `beforeRouteEnter` | 渲染组件前 | ✅ |
| 组件内 | `beforeRouteUpdate` | 路由改变、组件复用时 | ✅ |
| 组件内 | `beforeRouteLeave` | 离开当前组件时 | ✅ |

### 详细解答

**1. 全局守卫**

- `beforeEach(to, from, next)`：最常用，做登录鉴权、权限校验、全局 loading。Vue Router 4 中 `next()` 可选，返回 `false` 或路由路径即可控制导航。
- `beforeResolve(to, from, next)`：在 `beforeRouteEnter` 之后、导航确认之前，适合等待异步数据。
- `afterEach(to, from, failure)`：导航完成后，适合改页面标题、PV 统计、滚动复位。

**2. 路由独享守卫**

- 在路由配置的 `beforeEnter` 字段定义，仅对该路由生效。
- 支持内联函数或外部函数数组（多个守卫依次执行）。

**3. 组件内守卫**

- 直接在组件选项中定义（Options API）或通过 `onBeforeRouteLeave` 等组合式 API 定义。
- `beforeRouteEnter` 是唯一在组件实例创建前执行的钩子。

**4. 路由元信息 meta**

- 常配合守卫使用：`to.meta.requiresAuth`、`to.meta.roles`。
- 嵌套路由中，`to.matched` 会包含所有匹配记录的 meta。

**5. Vue Router 4 变化：** 守卫注册在 router 实例上；组件内可用 `onBeforeRouteLeave`、`onBeforeRouteUpdate` 组合式 API；`next()` 可选，返回 `false` 或路由路径即可控制导航。

### 代码示例

```javascript
// 全局守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

// 路由独享 + 组件内
const routes = [{ path: '/admin', beforeEnter: () => checkRole() || '/403' }]

onBeforeRouteLeave(() => hasUnsavedChanges.value ? !confirm('离开？') : true)
onBeforeRouteUpdate(async (to) => { data.value = await fetchData(to.params.id) })
```

### 面试追问

1. **Vue Router 4 中 `next()` 被废弃了吗？现在如何取消导航？** 没有废弃，仍可使用，但不再是必须的。Vue Router 4 支持直接通过返回值控制导航：返回 `false` 取消导航；返回路由对象重定向；返回 `undefined` 或 `true` 放行。推荐使用返回值写法，更简洁且避免 `next` 多次调用的问题。
2. **如何实现「登录后跳回原来要访问的页面」？** 在 `beforeEach` 中检测未登录时，将目标路径存入 query：`return { path: '/login', query: { redirect: to.fullPath } }`。登录成功后读取 `route.query.redirect` 并跳转：`router.replace(route.query.redirect || '/')`。注意对 redirect 做安全校验，防止开放重定向攻击。

---

## 48. Vuex 的原理

**记忆口诀：**「单一状态树 + 响应式 Store：State 存数据，Getter 算数据，Mutation 同步改，Action 异步提交 Mutation」

**一句话总结：** Vuex 通过单一状态树（Store）集中管理状态，利用 Vue 响应式系统驱动视图更新，并通过 Mutation 作为唯一同步修改入口，实现可预测的单向数据流。

### 核心模块

| 模块 | 职责 | 类比 |
| --- | --- | --- |
| State | 存储应用全局状态 | 数据库表 |
| Getters | 从 State 派生的计算属性 | SQL 视图 / 计算属性 |
| Mutations | **同步**修改 State 的唯一途径 | UPDATE 语句 |
| Actions | 处理异步/复杂逻辑，提交 Mutation | Service 层 |
| Modules | 按功能拆分 Store，支持命名空间 | 分库分表 |

### 详细解答

**1. 数据流（单向数据流）**

```
View → dispatch(action) → Action → commit(mutation) → Mutation → State → View
                ↑                                              ↓
                └──────────── Getters（派生数据）─────────────────┘
```

**2. 响应式原理（Vuex 3 / Vue 2）**

- Store 初始化时将 `state` 传入 `new Vue({ data: { $$state: state } })`，利用 Vue 2 的 `Object.defineProperty` 使 state 具有响应式。
- 组件通过 `store.state.xxx` 或 `mapState` 读取时建立依赖收集，mutation 修改后触发组件更新。

**3. 响应式原理（Vuex 4 / Vue 3）**

- 使用 Vue 3 的 `reactive()` 包装 state，性能更好，支持更多数据类型。

**4. 为什么 Mutation 是唯一修改入口？**

- 保证每次状态变更可追踪，Vue DevTools 可记录 mutation 类型、payload 和时间戳，支持「时间旅行」调试。

### 代码示例

```javascript
import { createStore } from 'vuex'

const store = createStore({
  state: () => ({
    count: 0,
    user: null
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  mutations: {
    INCREMENT(state, payload = 1) {
      state.count += payload
    },
    SET_USER(state, user) {
      state.user = user
    }
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const user = await api.getUser(userId)
      commit('SET_USER', user)
    },
    incrementAsync({ commit }) {
      setTimeout(() => commit('INCREMENT'), 1000)
    }
  }
})

// 组件中使用
store.dispatch('fetchUser', 1)
store.commit('INCREMENT', 2)
```

### 面试追问

1. **Vuex 的 state 是如何变成响应式的？Vue 2 和 Vue 3 实现有何不同？** Vuex 3（Vue 2）内部创建一个隐藏的 Vue 实例 `new Vue({ data: { $$state: state } })`，利用 Vue 2 的 `Object.defineProperty` 使 state 响应式。Vuex 4（Vue 3）改用 `reactive(state)` 包裹，底层是 Proxy。两者都让组件访问 state 时自动收集依赖，state 变化时触发组件重渲染。
2. **Vuex 和 Pinia 的核心差异是什么？为什么 Vue 3 官方推荐 Pinia？** ① Pinia 去掉了 Mutation，直接在 action 或组件中修改 state；② 原生 TypeScript 支持，自动类型推导；③ 无需命名空间，每个 store 独立模块；④ 支持 Composition API 风格的 Setup Store；⑤ 体积更小（~1KB gzipped）；⑥ 支持 SSR 和 Vue DevTools。Pinia 实际上是 Vuex 5 的提案演化而来，已成为 Vue 官方推荐。

---

## 49. Vuex 中 action 和 mutation 的区别

**记忆口诀：**「Mutation 同步改 State 可追踪，Action 异步操作再 commit Mutation」

**一句话总结：** Mutation 是修改 State 的唯一同步入口；Action 处理异步和副作用，最终通过 commit 调用 Mutation，两者分工明确以保证状态变更可追踪。

### 对比表

| 对比项 | Mutation | Action |
| --- | --- | --- |
| 主要职责 | 直接修改 State | 业务逻辑、异步请求，间接修改 State |
| 是否可异步 | ❌ 必须同步 | ✅ 可以异步 |
| 调用方式 | `commit('MUTATION_NAME', payload)` | `dispatch('actionName', payload)` |
| 参数 | `(state, payload)` | `(context, payload)`，context 含 commit/state/getters/dispatch |
| DevTools 追踪 | ✅ 每个 mutation 一条记录 | ✅ 记录 action 触发，但 state 变更仍看 mutation |
| 命名 | 推荐大写常量 `SET_USER` | 小驼峰 `fetchUser` |

### 详细解答

**设计哲学：**

Mutation 类似「事件」：`{ type: 'INCREMENT', payload: 1 }`，每个 mutation 对应 State 的一个确定变更快照。若 mutation 中执行异步操作，DevTools 无法确定 state 何时被修改，时间旅行调试失效。

Action 则像「协调者」：

- 可以包含任意异步操作（API 请求、定时器、Promise 链）。
- 可以在 action 中 dispatch 其他 action，实现逻辑组合。
- 可以 `commit` 多个 mutation（如 START_LOADING → SET_DATA → STOP_LOADING）。

**典型流程：**

```
组件 dispatch('fetchList')
  → action 发起 API 请求
  → 请求成功 commit('SET_LIST', data)
  → 请求失败 commit('SET_ERROR', err)
  → state 变化 → 视图更新
```

**Vuex 4 补充：**

- Action 默认返回 Promise，便于组件 `await store.dispatch('xxx')`。
- 若 mutation 足够简单（如 `count++`），可直接 commit，不必绕 action。

### 代码示例

```javascript
const store = createStore({
  state: { list: [], loading: false, error: null },
  mutations: {
    SET_LOADING(state, val) { state.loading = val },
    SET_LIST(state, list) { state.list = list },
    SET_ERROR(state, err) { state.error = err }
  },
  actions: {
    async fetchList({ commit }) {
      commit('SET_LOADING', true)
      try {
        const res = await axios.get('/api/list')
        commit('SET_LIST', res.data)
      } catch (e) {
        commit('SET_ERROR', e.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    // action 中 dispatch 其他 action
    async refreshAndNotify({ dispatch }) {
      await dispatch('fetchList')
      // 通知逻辑...
    }
  }
})

// 组件
await this.$store.dispatch('fetchList')
```

### 面试追问

1. **什么情况下可以直接 commit mutation，而不经过 action？** 当操作是**纯同步**且不涉及副作用时可以直接 commit，例如 `commit('SET_COUNT', 10)`、切换布尔值、简单的计数器增减等。不需要 API 请求、不需要组合多个 mutation、不需要条件判断的场景，action 只是多余的中间层。
2. **Action 中可以修改 state 吗？为什么不推荐？** 技术上可以在 action 中直接 `state.count++`（非严格模式下不报错），但不推荐：① 严格模式下会抛错（非 mutation 修改）；② DevTools 无法追踪这次变更；③ 破坏了「mutation 是 state 唯一修改入口」的约定，状态变更散落各处难以维护。应始终通过 `commit` 调用 mutation。

---

## 50. Vuex 和 localStorage 的区别

**记忆口诀：**「Vuex 内存响应式刷新丢，localStorage 持久化不响应」

**一句话总结：** Vuex 是内存中的响应式状态管理，适合组件间实时同步；localStorage 是浏览器持久化存储，刷新不丢失但不具备响应式能力。

### 对比表

| 对比项 | Vuex | localStorage |
| --- | --- | --- |
| 存储位置 | 内存（JS 堆） | 浏览器磁盘（同源持久化） |
| 响应式 | ✅ 自动驱动视图更新 | ❌ 需手动读取并赋值 |
| 刷新后 | 数据丢失（除非插件持久化） | 数据保留 |
| 存储类型 | 任意 JS 类型 | 仅字符串（对象需 JSON 序列化） |
| 容量 | 受内存限制 | 约 5MB（因浏览器而异） |
| 跨 Tab 同步 | 默认不跨 Tab | `storage` 事件可跨 Tab 通知 |
| 适用场景 | 应用运行时共享状态 | 持久化 Token、主题、用户偏好 |
| 安全性 | 内存中，相对安全 | 明文存储，不可存敏感信息 |

### 详细解答

**核心差异：响应式**

Vuex 的状态变更会自动触发依赖该状态的组件重新渲染。localStorage 只是静态存储，即使另一个组件修改了 localStorage，其他组件不会自动感知，必须手动监听 `storage` 事件或在适当时机重新读取。

**典型协作模式：**

- 登录 Token 存 localStorage（持久化），同时 commit 到 Vuex（运行时快速访问）。
- 使用 `vuex-persistedstate` 插件自动将部分 state 同步到 localStorage。
- 刷新页面时：从 localStorage 恢复 → 初始化 Vuex state。

**何时可以只用 localStorage？**

- 数据不需要响应式（如「不再提示」开关）。
- 仅跨页面传递一次性数据。
- 小型项目、无复杂状态共享需求。

**何时必须用 Vuex/Pinia？**

- 多个组件共享同一份数据且需实时同步。
- 状态变更链路复杂，需要 mutation 追踪。
- 需要 getters 派生计算。

### 代码示例

```javascript
// Vuex + localStorage 协作
const store = createStore({
  state: {
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token) // 同步持久化
    },
    CLEAR_TOKEN(state) {
      state.token = ''
      localStorage.removeItem('token')
    }
  }
})

// 监听其他 Tab 的 localStorage 变化
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    store.commit('SET_TOKEN', e.newValue || '')
  }
})

// vuex-persistedstate 插件（推荐）
import createPersistedState from 'vuex-persistedstate'

const store = createStore({
  plugins: [
    createPersistedState({
      paths: ['user', 'settings'] // 只持久化部分 state
    })
  ]
})
```

### 面试追问

1. **sessionStorage、localStorage 和 Vuex 分别适合存什么数据？** `sessionStorage`：当前会话临时数据（表单草稿、一次性验证码），关闭标签页即清除。`localStorage`：需要跨会话持久化的非敏感数据（主题、语言偏好、Token）。`Vuex/Pinia`：应用运行时需要跨组件响应式共享的状态（用户信息、购物车、全局 UI 状态）。三者常协作使用。
2. **如何实现 Vuex 状态持久化？有哪些需要注意的坑（如存储大小、敏感信息）？** 主流方案：使用 `vuex-persistedstate` 或 `pinia-plugin-persistedstate` 插件，在 mutation 后自动将指定 state 同步到 localStorage/sessionStorage。坑：① 存储大小限制约 5MB，大量数据需按需持久化（`paths` 配置白名单）；② 敏感信息（Token 等）不应明文存 localStorage，需加密或用 httpOnly Cookie；③ 数据结构变化后旧缓存可能导致 crash，需做版本号校验和迁移；④ SSR 环境 `localStorage` 不存在，需条件判断。

---

## 51. Redux 和 Vuex 有什么区别，它们的共同思想

**记忆口诀：**「Redux 纯函数 Reducer，Vuex Mutation 同步 + Action 异步，都是单向数据流」

**一句话总结：** Redux 和 Vuex 都源于 Flux 架构，强调单一数据源和可预测的状态变更；Redux 用纯函数 Reducer，Vuex 用 Mutation + Action，并深度集成 Vue 响应式系统。

### 对比表

| 对比项 | Redux | Vuex |
| --- | --- | --- |
| 核心变更函数 | Reducer（纯函数） | Mutation（同步）+ Action（异步） |
| 异步处理 | 中间件（redux-thunk/saga） | 内置 Action |
| 数据流 | dispatch(action) → reducer → new state | dispatch → action → commit → mutation → state |
| 响应式更新 | 需 connect / useSelector 手动订阅 | Vue 自动依赖收集，自动更新组件 |
| 代码量 | 相对模板代码多 | 相对简洁 |
| 时间旅行 | ✅ Redux DevTools | ✅ Vue DevTools |
| 模块化 | combineReducers | Modules + 命名空间 |
| 学习曲线 | 概念多（中间件、不可变数据） | 与 Vue 生态贴合，上手快 |

### 详细解答

**共同思想（Flux 架构核心）：**

1. **单一数据源（Single Source of Truth）**：整个应用的状态存储在一个 Store 中，便于调试和回溯。
2. **状态只读（State is Read-Only）**：不能直接修改 state，必须通过 dispatch/commit 触发变更。
3. **纯函数变更（Changes via Pure Functions）**：Redux 的 Reducer 和 Vuex 的 Mutation 都应是可预测的纯函数（Mutation 要求同步）。
4. **单向数据流**：数据流向清晰，便于追踪 bug 和实现时间旅行调试。

**Redux 特点：**

- Action 是描述「发生了什么」的普通对象 `{ type, payload }`。
- Reducer 根据 action type 返回新 state，强调不可变数据（常配合 Immer）。
- 异步逻辑通过中间件扩展，不在 Reducer 中处理。

**Vuex 对 Redux 的改进：**

- Mutation 替代 Reducer 的部分职责，无需 switch-case，直接修改 state（Vue 响应式包装）。
- Action 内置，无需额外引入 thunk 中间件即可处理异步。
- 与 Vue 组件深度集成，`mapState`/`mapGetters` 等辅助函数减少模板代码。
- Vue 的响应式系统自动触发视图更新，无需手动 subscribe。

### 代码示例

```javascript
// Redux
const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + 1 }
    default: return state
  }
}
store.dispatch({ type: 'INCREMENT' })

// Vuex — 等价逻辑
mutations: {
  INCREMENT(state) { state.count++ }
}
actions: {
  increment({ commit }) { commit('INCREMENT') }
}
store.dispatch('increment')
```

### 面试追问

1. **Redux 为什么要求 Reducer 必须是纯函数？** ① **可预测性**：相同 state + action 始终产生相同 new state，便于测试和推理。② **时间旅行**：DevTools 通过重放 action 序列复现任意状态快照，依赖 reducer 无副作用。③ **热重载**：替换 reducer 后可重新计算 state 而不丢失数据。④ **浅比较优化**：React-Redux 用 `===` 比较前后 state，纯函数保证修改则返回新引用，未修改则返回原引用。
2. **Pinia 和 Redux 的设计理念有什么异同？** **相同**：都是单向数据流、集中式状态管理、支持 DevTools 调试。**不同**：① Pinia 拥抱可变数据（直接 `state.count++`），Redux 强制不可变（返回新对象）；② Pinia 无 reducer/middleware 概念，action 直接修改 state；③ Pinia 多 store 设计，按功能拆分自动模块化；④ Redux 依赖中间件生态（thunk/saga），Pinia action 原生支持 async/await。

---

## 52. 为什么要用 Vuex 或者 Redux

**记忆口诀：**「多层传参痛苦，全局单例 + 单向数据流，状态可预测易维护」

**一句话总结：** 当多个组件需要共享状态、状态变更逻辑复杂时，集中式状态管理能避免 prop drilling 和事件总线的混乱，以可预测的单向数据流提升可维护性。

### 需要状态管理的信号

| 问题场景 | 无状态管理的痛点 | 使用 Vuex/Redux 后 |
| --- | --- | --- |
| 深层嵌套组件传参 | prop 逐层传递，中间组件被迫透传 | 任意组件直接访问 Store |
| 兄弟组件通信 | 需通过共同父组件或事件总线 | Store 作为中介 |
| 多页面共享状态 | 路由切换后状态丢失或重复请求 | 全局 Store 持久运行时状态 |
| 复杂异步流程 | 逻辑散落在各组件，难以追踪 | Action 集中管理副作用 |
| 调试困难 | 不知道谁改了数据 | DevTools 时间旅行 |

### 详细解答

**1. 组件通信的演进**

- 父子：`props` + `$emit` — 简单直接，但仅限直接关系。
- 跨级：`provide/inject` — 适合稳定依赖，但数据来源不透明。
- 兄弟/EventBus — 难以追踪，容易造成内存泄漏（Vue 3 已移除 EventBus 推荐）。
- **全局 Store** — 适合中大型应用的复杂共享状态。

**2. 可预测性**

- 所有状态变更通过 mutation/reducer 记录，像 Git 一样有 commit 历史。
- 新成员可通过 Store 结构快速理解数据流。
- 便于编写单元测试（纯函数 mutation/reducer）。

**3. 何时不需要 Vuex/Redux？**

- 小型项目、状态简单：组件内 state + props 足够。
- Vue 3 官方推荐：简单场景用 `provide/inject` 或 Composables。
- 中大型项目或多人协作：状态管理库价值明显。
- 现代替代：Pinia 语法更简洁，是 Vue 3 官方推荐。

**4. 与后端状态的关系**

- Store 管理的是**客户端 UI 状态**（登录态、购物车、表单草稿）。
- 服务端数据仍通过 API 获取，Store 缓存和管理这些数据的前端副本。

### 代码示例

```javascript
// ❌ 没有状态管理：prop drilling
// App → Layout → Sidebar → UserAvatar（需要 user 信息，中间层都要透传）

// ✅ Vuex：任意层级直接访问
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['user'])
  }
}

// ✅ Pinia（Vue 3 推荐）
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
console.log(userStore.name)
```

### 面试追问

1. **什么情况下你会选择 Pinia 而不是 Vuex？什么情况下甚至不需要状态管理库？** 选 Pinia：Vue 3 新项目、需要 TypeScript 强类型、喜欢 Composition API 风格、项目中等规模以上。不需要状态管理库：小型项目组件层级浅、状态简单用 `props/emit` + `provide/inject` 即可覆盖、或使用 composables（自定义组合式函数）+ `ref/reactive` 共享模块级状态。
2. **Vuex 管理的 state 和服务端数据库的数据是什么关系？** Vuex state 是**客户端 UI 状态的内存缓存**，不等于数据库。它缓存从 API 获取的服务端数据副本（用户信息、列表数据），也存储纯前端状态（侧边栏展开、主题色）。数据库是持久化的单一数据源，Vuex 是临时的运行时快照。二者通过 API 同步，需处理过期、并发更新、乐观更新等问题。

---

## 53. Vuex 有哪几种属性？

**记忆口诀：**「State Getter Mutation Action Module，S-G-M-A-M」

**一句话总结：** Vuex Store 包含 State、Getters、Mutations、Actions、Modules 五大核心属性，分别负责存数据、算数据、同步改、异步改和模块化拆分。

### 属性一览

| 属性 | 作用 | 是否必须 | 调用方式 |
| --- | --- | --- | --- |
| State | 存储全局状态数据 | ✅ | `store.state.xxx` |
| Getters | 从 State 派生的计算属性 | 可选 | `store.getters.xxx` |
| Mutations | 同步修改 State | ✅（要有修改能力） | `store.commit('NAME', payload)` |
| Actions | 异步/复杂逻辑，提交 Mutation | 可选 | `store.dispatch('name', payload)` |
| Modules | 拆分 Store 为子模块 | 可选 | `store.state.moduleName.xxx` |

### 详细解答

**State**

- 单一状态树，推荐只维护一个 Store。
- 通过 `store.state` 访问，组件中可用 `mapState` 映射到 computed。

**Getters**

- 类似组件 computed，有缓存，依赖的 state 不变则不重新计算。
- 可接收 `(state, getters)` 访问其他 getter。
- 也支持返回函数：`getUserById: (state) => (id) => state.users.find(u => u.id === id)`。

**Mutations**

- 必须是同步函数，命名推荐 `SET_XXX`、`UPDATE_XXX` 大写常量风格。
- 支持 `payload` 或多个参数（封装为对象）。

**Actions**

- 返回 Promise，支持 async/await。
- 可 `dispatch` 其他 action，可 `rootState`/`rootGetters` 访问根模块。

**Modules**

- 每个 module 拥有自己的 state/mutations/actions/getters。
- `namespaced: true` 开启命名空间，避免命名冲突。
- 支持模块嵌套和动态注册（`store.registerModule`）。

### 代码示例

```javascript
const store = createStore({
  state: { count: 0 },
  getters: {
    doubleCount: state => state.count * 2
  },
  mutations: {
    INCREMENT(state) { state.count++ }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => commit('INCREMENT'), 1000)
    }
  },
  modules: {
    user: {
      namespaced: true,
      state: { info: null },
      mutations: {
        SET_INFO(state, info) { state.info = info }
      }
    }
  }
})

// 访问模块 state
store.state.user.info
// 命名空间 mutation
store.commit('user/SET_INFO', { name: 'Tom' })
```

### 面试追问

1. **Getters 和组件 computed 有什么区别？什么时候应该放在 Getters 里？** 功能上类似，都有缓存。区别：Getters 是**全局共享**的，多个组件访问同一派生数据时用 Getters 避免重复逻辑；组件 computed 是**局部**的，仅服务于当前组件。经验法则：如果两个以上组件需要同一份 state 的派生值（如过滤列表、格式化数据），放 Getters；仅当前组件用的计算逻辑放 computed。
2. **Vuex Module 的命名空间（namespaced）解决了什么问题？** 解决**多模块命名冲突**：不开命名空间时，所有 module 的 mutation/action/getter 注册在全局，同名会覆盖或同时触发。`namespaced: true` 后，调用需加前缀 `'module/MUTATION'`，各模块互不干扰。同时 `createNamespacedHelpers('module')` 可简化组件中的 map 调用。

---

## 54. Vuex 和单纯的全局对象有什么区别？

**记忆口诀：**「全局对象随便改无追踪，Vuex 响应式 + Mutation 唯一入口 + DevTools 时间旅行」

**一句话总结：** 单纯的全局对象缺乏响应式、变更追踪和规范化约束；Vuex 在全局对象基础上增加了 Vue 响应式、mutation 唯一入口和 DevTools 支持，使状态管理可预测、可调试。

### 对比表

| 对比项 | 全局对象 `window.appData = {}` | Vuex Store |
| --- | --- | --- |
| 响应式 | ❌ 需手动触发更新 | ✅ Vue 响应式自动更新视图 |
| 变更方式 | 任意属性直接赋值 | 必须通过 mutation 提交 |
| 变更追踪 | ❌ 无法追踪谁改了什么 | ✅ DevTools 记录每次 mutation |
| 时间旅行调试 | ❌ | ✅ |
| 严格模式 | ❌ | ✅ strict 模式检测非法变更 |
| 模块化 | 需自行组织 | 内置 Modules + 命名空间 |
| 派生数据 | 需自行计算 | 内置 Getters（带缓存） |
| 异步管理 | 逻辑散落各处 | Action 统一处理 |
| 代码规范 | 无约束，易混乱 | 强制单向数据流 |

### 详细解答

**全局对象的问题：**

```javascript
// 任何地方都可以改，无法追踪
window.sharedState.count++
window.sharedState.user = null // 谁改的？什么时候改的？

// 不是响应式的
window.sharedState.count = 10
// 组件不会自动更新，必须手动 forceUpdate 或重新赋值
```

**Vuex 的增强：**

1. **响应式**：state 被 Vue 的 reactive 系统包装，组件读取时自动建立依赖。
2. **Mutation 约束**：所有变更走 commit，DevTools 记录 `{ type, payload, timestamp }`。
3. **严格模式**：非 mutation 修改 state 直接报错，开发阶段捕获不规范写法。
4. **插件生态**：持久化、日志、同步等插件基于 subscribe 机制扩展。

**什么时候全局对象「够用」？**

- 极简单的原型项目。
- 存储不变的配置常量（非响应式需求）。
- 但 production 代码仍推荐 Vuex/Pinia。

### 代码示例

```javascript
// ❌ 全局对象
window.store = { count: 0 }
window.store.count++ // 组件不知道变了

// ✅ Vuex
const store = createStore({
  state: { count: 0 },
  mutations: {
    INCREMENT(state) { state.count++ }
  }
})
store.commit('INCREMENT') // 组件自动更新 + DevTools 有记录
```

### 面试追问

1. **Vuex 的 strict 模式是如何检测「非 mutation 修改 state」的？** Vuex 内部维护一个 `_committing` 布尔标志。每次执行 mutation 前将其设为 `true`，mutation 执行后设回 `false`。同时通过 `$watch`（Vue 2）或 `watch`（Vue 3）深度监听整个 state，一旦检测到 state 变化时 `_committing` 为 `false`，说明修改不是通过 mutation 触发的，立即抛出警告。
2. **Pinia 没有 Mutation 了，它如何保证状态变更可追踪？** Pinia 通过 `$subscribe` API 监听 state 变更，并将每次变更（含 `type`、`storeId`、`payload`）发送给 Vue DevTools。虽然没有 mutation 的显式约束，但 DevTools 仍能记录每次 state 的变更快照。此外 Pinia 的 `$patch` 方法可以批量修改并标记为单次变更，进一步增强可追踪性。

---

## 55. 为什么 Vuex 的 mutation 中不能做异步操作？

**记忆口诀：**「Mutation 同步快照可追踪，异步放 Action 再 commit」

**一句话总结：** Mutation 必须同步是为了让每次状态变更对应一个确定的快照，从而支持 DevTools 时间旅行调试；异步操作应放在 Action 中，完成后 commit Mutation。

### 详细解答

**1. 可追踪性（核心原因）**

Vue DevTools 记录 mutation 时，假设 commit 调用后 state **立即**变更。若 mutation 内有异步：

```javascript
// ❌ 错误示例
mutations: {
  SET_DATA(state) {
    setTimeout(() => {
      state.list = [1, 2, 3] // DevTools 不知道何时生效
    }, 1000)
  }
}
```

DevTools 在 commit 时刻打快照，但 state 实际 1 秒后才变，导致快照与真实 state 不一致，时间旅行调试完全失效。

**2. 单一快照原则**

每个 mutation 应映射 state 从 A → B 的一次原子变更。异步操作可能中途失败、多次修改，无法对应单一快照。

**3. 职责分离**

- Mutation：描述「state 变成了什么」（what）。
- Action：描述「如何获取数据并决定提交哪个 mutation」（how）。

**4. 正确模式**

```javascript
actions: {
  async fetchData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const data = await api.getData()
      commit('SET_DATA', data)      // 同步 mutation
    } catch (e) {
      commit('SET_ERROR', e.message)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}
```

**5. 延伸思考**

- Redux Reducer 同样要求纯函数、同步返回新 state，原因一致。
- Pinia 移除了 mutation 限制，直接在 action 中修改 state，但仍建议保持同步修改的可预测性，DevTools 同样依赖此假设。

### 代码示例

```javascript
// ✅ 正确：异步在 action，同步在 mutation
mutations: {
  SET_USER(state, user) {
    state.user = user // 同步，DevTools 可追踪
  }
},
actions: {
  login({ commit }, credentials) {
    return api.login(credentials).then(user => {
      commit('SET_USER', user)
    })
  }
}
```

### 面试追问

1. **如果 mutation 中用了 async/await 语法但不 await 任何操作，算违规吗？** 严格来说，`async function` 会返回 Promise，但如果函数体内没有 `await`，它的行为与同步函数几乎一致（状态在当前微任务中同步完成修改）。虽然 DevTools 仍能正确追踪，但这是**不规范**的写法：① 后续维护者可能误以为可以添加 await；② 违反约定会增加团队理解成本。建议保持 mutation 为普通同步函数。
2. **Pinia 为什么取消了 Mutation？这算是设计倒退吗？** 不是倒退，而是**务实的简化**。Mutation 存在的核心理由是 DevTools 追踪，但 Pinia 通过 `$subscribe` 和 reactive 代理同样实现了变更追踪。去掉 mutation 后：① 减少一层抽象，代码更简洁；② 不再有「mutation 同步、action 异步」的心智负担；③ `$patch` 提供了批量修改的能力。Vuex 的 mutation vs action 分离在大量实践中被证明是「为了规范而增加的仪式性代码」。

---

## 56. Vuex 的严格模式是什么，有什么作用，如何开启

**记忆口诀：**「strict: true 非 mutation 改 state 就报错，生产环境应关闭」

**一句话总结：** 严格模式通过深度 watch state，在开发环境检测并阻止非 mutation 途径的 state 修改，确保所有变更可追踪，但生产环境应关闭以避免性能开销。

### 详细解答

**严格模式的作用：**

- 在**开发环境**下，任何在 mutation 外部修改 state 的行为都会抛出错误。
- 包括：`store.state.count++`、直接给 state 对象新增属性、在组件中直接修改 store.state 的嵌套对象等。
- 帮助团队在开发阶段养成规范的数据修改习惯。

**实现原理：**

- Vuex 3 内部对 `store._vm.$data.$$state` 启用 `$watch` 深度监听。
- 每次 mutation 执行前后会设置 `store._committing` 标志位。
- 若在非 committing 状态下检测到 state 变化，则 `console.error` 并 throw Error。

**如何开启：**

```javascript
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production', // 推荐写法
  state: { ... },
  mutations: { ... }
})
```

**为什么生产环境要关闭？**

- 深度 watch 整个 state 树有**性能开销**，大型 state 会影响运行时性能。
- 生产环境不需要 DevTools 调试，严格检查的价值不大。
- Vuex 官方文档明确建议：`strict: true` 仅用于开发。

**常见触发严格模式报错的场景：**

```javascript
// ❌ 直接修改
store.state.count++

// ❌ 组件中
this.$store.state.user.name = 'new name'

// ✅ 正确
store.commit('UPDATE_USER_NAME', 'new name')
```

### 代码示例

```javascript
import { createStore } from 'vuex'

const store = createStore({
  strict: import.meta.env.DEV, // Vite 项目
  state: { todos: [] },
  mutations: {
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    }
  }
})

// 开发环境会报错：
// store.state.todos.push({ text: 'hack' })
// Error: do not mutate vuex store state outside mutation handlers

// 正确：
store.commit('ADD_TODO', { text: 'learn vuex' })
```

### 面试追问

1. **严格模式是如何实现的？`_committing` 标志位起什么作用？** Vuex 在 `Store` 构造函数中，若 `strict: true`，会对 `state` 做深度 watch。核心机制：执行 mutation 前 `_committing = true`，执行后 `_committing = false`。watch 回调中检查 `_committing` 标志，若为 `false` 说明 state 变更来源不合法，抛出错误。`_committing` 就是一个「合法修改通行证」，只有 mutation 执行期间才发放。
2. **Vue 3 + Pinia 中还有类似 strict 模式的概念吗？** Pinia 没有严格模式开关，因为它允许在任何地方直接修改 state。但 DevTools 仍然会记录所有变更。如果团队需要约束，可以：① 约定只通过 action 修改 state；② 使用 `$subscribe` 自定义校验逻辑；③ 通过 ESLint 插件限制直接赋值。不过一般认为 Pinia 的设计已足够灵活，不需要严格模式的强制约束。

---

## 57. 如何在组件中批量使用 Vuex 的 getter 属性

**记忆口诀：**「mapGetters 展开进 computed，命名空间加模块名」

**一句话总结：** 使用 `mapGetters` 辅助函数将 Store 中的 getters 批量映射到组件的 computed 属性，支持数组和对象两种形式，命名空间模块需指定命名空间前缀。

### 详细解答

**为什么用 mapGetters？**

- 避免在每个组件中写 `this.$store.getters.xxx`，减少重复代码。
- 将 getter 映射为 computed，保留缓存特性。
- 支持重命名，解决命名冲突。

**三种映射方式：**

1. **数组形式**：getter 名与 computed 属性名相同。
2. **对象形式**：自定义 computed 属性名 → getter 名。
3. **函数形式**：访问局部 computed 或其他数据。

**命名空间模块：**

```javascript
// 模块 user，namespaced: true
// getter: store.getters['user/fullName']

mapGetters('user', ['fullName'])
// 或
mapGetters('user', { myFullName: 'fullName' })
```

**Vue 3 + Pinia 对比：**

- Pinia 直接使用 `storeToRefs(useXxxStore())` 解构 getters（实际是 computed），无需 mapGetters。

### 代码示例

```javascript
import { mapGetters } from 'vuex'

export default {
  computed: {
    // 方式 1：数组 — 同名映射
    ...mapGetters(['doneTodos', 'doneTodosCount']),

    // 方式 2：对象 — 重命名
    ...mapGetters({
      completed: 'doneTodos',
      count: 'doneTodosCount'
    }),

    // 方式 3：命名空间模块
    ...mapGetters('cart', {
      cartTotal: 'totalPrice',
      cartCount: 'itemCount'
    }),

    // 方式 4：混合局部 computed
    ...mapGetters(['doneTodos']),
    localComputed() {
      return this.doneTodos.length > 0
    }
  }
}

// Vue 3 Composition API + Vuex 4
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const doneTodos = computed(() => store.getters.doneTodos)

// 或使用 useMapper 封装
import { createNamespacedHelpers } from 'vuex'
const { mapGetters: mapCartGetters } = createNamespacedHelpers('cart')
```

### 面试追问

1. **`mapGetters` 映射的属性是 computed 还是 methods？为什么？** 映射到 **computed**。因为 getter 本质是 state 的派生数据，具有缓存特性（依赖不变则不重新计算），这与 computed 的语义一致。放 methods 的话每次访问都会重新执行，丧失缓存优势且用法不符合模板的 `{{ getter }}` 直接引用习惯（methods 需要 `getter()`）。
2. **如何在 `<script setup>` 中使用 mapGetters？** `mapGetters` 返回的是对象（需 `this.$store`），无法直接在 `<script setup>` 中使用。替代方案：① 直接 `const xxx = computed(() => store.getters.xxx)`；② 封装一个 `useMapGetters` 组合式函数遍历 getter 名生成 computed 对象；③ 迁移到 Pinia，使用 `storeToRefs(useXxxStore())` 自动解构为 ref。

---

## 58. 如何在组件中重复使用 Vuex 的 mutation

**记忆口诀：**「mapMutations 映射到 methods，this.xxx() 等于 commit」

**一句话总结：** 使用 `mapMutations` 辅助函数将 mutation 批量映射到组件 methods，调用映射后的方法等价于 `this.$store.commit`。

### 详细解答

**mapMutations 的作用：**

- 将 `commit('MUTATION_NAME', payload)` 封装为语义化的方法调用。
- 映射到 `methods`（不是 computed），因为 mutation 是操作而非数据。
- 支持数组、对象重命名、命名空间模块，用法与 `mapGetters` 对称。

**与直接 commit 的对比：**

```javascript
// 直接 commit
this.$store.commit('SET_COUNT', 10)

// mapMutations 后
this.setCount(10) // 更语义化
```

**注意事项：**

- Mutation 必须同步，映射后的方法也不应包含异步逻辑。
- 异步操作应使用 `mapActions` 而非 `mapMutations`。
- 命名空间：`mapMutations('module', ['MUTATION'])` → `this.$store.commit('module/MUTATION')`。

**Vue 3 替代方案：**

- Composition API 中可直接 `store.commit('SET_COUNT', 10)`。
- Pinia 中 action 可直接修改 state，不再需要 mutation 映射。

### 代码示例

```javascript
import { mapMutations } from 'vuex'

export default {
  methods: {
    // 数组形式 — 同名
    ...mapMutations(['INCREMENT', 'DECREMENT']),

    // 对象形式 — 重命名
    ...mapMutations({
      setCount: 'SET_COUNT',
      resetCount: 'RESET_COUNT'
    }),

    // 命名空间
    ...mapMutations('cart', {
      addItem: 'ADD_ITEM',
      removeItem: 'REMOVE_ITEM'
    }),

    handleClick() {
      this.setCount(10)       // ≡ commit('SET_COUNT', 10)
      this.addItem({ id: 1 }) // ≡ commit('cart/ADD_ITEM', { id: 1 })
    }
  }
}

// Vue 3 Composition API
import { useStore } from 'vuex'

const store = useStore()
const setCount = (n) => store.commit('SET_COUNT', n)

// mapActions 同理（处理异步）
import { mapActions } from 'vuex'
methods: {
  ...mapActions(['fetchUser', 'logout'])
}
```

### 面试追问

1. **`mapMutations` 和 `mapActions` 分别映射到什么选项？为什么不同？** 都映射到 **methods**（不是 computed）。因为 mutation 和 action 都是**操作**（调用时执行副作用），不是数据。computed 用于声明式的响应式数据绑定，methods 用于事件处理和主动调用，mutation/action 属于后者。两者区别仅在于：mapMutations 等价于 `commit`，mapActions 等价于 `dispatch`。
2. **能否把 mutation 映射到 computed？会有什么问题？** 技术上不行也不该。`mapMutations` 返回的是普通函数，放 computed 中会在每次依赖变化时执行 mutation（相当于依赖变化就自动改 state），这完全违反了「用户主动触发 → 改变状态」的单向数据流模式。computed 应该是纯计算，不应有副作用。

---

## 59. defineProperty 和 proxy 的区别

**记忆口诀：**「defineProperty 改属性描述符一次一个，Proxy 代理整个对象一劳永逸」

**一句话总结：** `Object.defineProperty` 只能劫持已有属性的 getter/setter，对新增/删除属性和数组部分操作无能为力；`Proxy` 代理整个对象，可拦截增删改查等 13 种操作，是 Vue 3 响应式的基础。

### 对比表

| 对比项 | Object.defineProperty | Proxy |
| --- | --- | --- |
| 劫持粒度 | 单个属性 | 整个对象 |
| 新增/删除属性 | ❌ 需 Vue.set / $delete | ✅ 自动拦截 |
| 数组索引/length | ❌ 需重写数组方法 | ✅ 原生支持 |
| 嵌套对象 | 需递归遍历 defineProperty | 惰性代理（访问时才递归） |
| 兼容性 | IE9+（IE8 部分支持） | 不支持 IE，无 polyfill |
| 拦截操作 | get / set | get/set/has/delete/ownKeys/apply 等 13 种 |
| 原对象 | 被直接修改 | 代理对象与原对象分离 |
| 性能 | 初始化时递归所有 key | 惰性，按需代理 |

### 详细解答

**Object.defineProperty 的局限（Vue 2）：**

1. **无法检测属性新增/删除**：必须在初始化时递归所有 key，新增属性需 `$set`。
2. **数组限制**：无法拦截 `arr[i] = val` 和 `arr.length = 0`，只能重写 `push/pop/splice` 等 7 个方法。
3. **初始化性能**：深层嵌套对象需一次性递归 defineProperty，对象越大初始化越慢。
4. **Map/Set/WeakMap/WeakSet** 不支持。

**Proxy 的优势（Vue 3）：**

1. **拦截整个对象**：`set` trap 可捕获新增属性，`deleteProperty` 捕获删除。
2. **数组完整支持**：索引赋值、length 修改均可拦截。
3. **惰性响应式**：嵌套对象在**被访问时**才创建 Proxy（懒代理），初始化更快。
4. **支持集合类型**：Map、Set 等通过专门的处理器支持。
5. **Reflect 配合**：`Reflect.get/set` 保证 this 指向正确，符合标准规范。

**Proxy 的缺点：**

- 无法 polyfill，不支持 IE11 及以下。
- 代理对象与原对象不同，需注意 `===` 比较。

### 代码示例

```javascript
// Object.defineProperty
let value = 1
const obj = {}
Object.defineProperty(obj, 'count', {
  get() { console.log('get'); return value },
  set(newVal) { console.log('set', newVal); value = newVal }
})
obj.count = 2       // ✅ 触发 set
obj.newProp = 3     // ❌ 新增属性无响应式

// Proxy
const raw = { count: 1, nested: { a: 1 } }
const proxy = new Proxy(raw, {
  get(target, key, receiver) {
    console.log('get', key)
    const result = Reflect.get(target, key, receiver)
    // Vue 3：惰性递归代理
    if (typeof result === 'object' && result !== null) {
      return new Proxy(result, /* 相同 handler */)
    }
    return result
  },
  set(target, key, value, receiver) {
    console.log('set', key, value)
    return Reflect.set(target, key, value, receiver)
  },
  deleteProperty(target, key) {
    console.log('delete', key)
    return Reflect.deleteProperty(target, key)
  }
})

proxy.count = 2       // ✅
proxy.newProp = 3     // ✅ 新增也响应
delete proxy.newProp  // ✅
proxy.nested.a = 10   // ✅（惰性代理后）
```

### 面试追问

1. **Vue 2 是如何绕过数组索引和 length 修改的限制的？** Vue 2 重写了数组原型上的 7 个变异方法（`push`、`pop`、`shift`、`unshift`、`splice`、`sort`、`reverse`），在这些方法执行后手动调用 `ob.dep.notify()` 通知依赖更新。对于索引直接赋值（`arr[0] = val`），提供 `Vue.set(arr, 0, val)` 内部走 `splice` 触发通知。`length` 修改则完全无法拦截，只能用 `splice(newLength)` 替代。
2. **Proxy 的 `get` trap 中为什么要用 `Reflect.get` 而不是直接 `target[key]`？** 两个原因：① **保证 `this` 指向正确**：当属性是 getter（`get` 访问器），`target[key]` 中 `this` 指向原始对象，而 `Reflect.get(target, key, receiver)` 中 `this` 指向代理对象（`receiver`），确保 getter 内部访问其他属性时也走代理拦截。② **符合规范**：Proxy 的 `get` trap 有不变量约束，使用 `Reflect` 能保证返回值与 `Object.getOwnPropertyDescriptor` 一致，避免潜在错误。

---

## 60. Vue 3.0 为什么要用 Proxy

**记忆口诀：**「Proxy 整对象代理，增删改查全拦截，告别 $set，支持 Map/Set」

**一句话总结：** Vue 3 选用 Proxy 替代 Object.defineProperty，解决了属性新增/删除、数组完整监听、初始化性能和集合类型支持等 Vue 2 响应式的根本局限，同时惰性代理提升了大型应用的初始化速度。

### Vue 2 响应式的痛点 → Proxy 的解法

| Vue 2 痛点 | Proxy 解决方案 |
| --- | --- |
| 新增/删除属性不响应 | `set` / `deleteProperty` trap 拦截 |
| 数组索引/length 不响应 | 原生拦截所有数组操作 |
| 初始化递归全部属性，性能差 | 惰性代理，访问时才递归 |
| 不支持 Map/Set | 专门 collection handler |
| 需要 Vue.set / Vue.delete | 不再需要 |
| 每个 key 一个 getter/setter | 一个 Proxy 覆盖整个对象 |

### 详细解答

**1. 编程模型更自然**

Vue 2 中开发者必须知道 `$set`/`$delete` 的特殊 API，否则踩坑。Proxy 对开发者透明，直接 `obj.newKey = val` 即可响应。

**2. 性能优化：惰性响应式**

Vue 2 在 `data()` 返回时递归所有嵌套对象做 defineProperty。Vue 3 只在访问嵌套属性时才创建子 Proxy（`get` trap 中判断），大型对象初始化显著加速。

**3. 数组监听完整**

Vue 2 重写数组变异方法 + 无法监听索引/length。Proxy 统一拦截，不再有边界 case。

**4. 集合类型支持**

Vue 3 可响应式地使用 Map、Set、WeakMap、WeakSet，对复杂数据结构更友好。

**5. 标准化与可维护性**

Proxy 是 ES6 标准，拦截逻辑集中在一个 handler 中，比分散的 defineProperty + 数组 hack 更清晰，源码更易维护。

**6. 代价：放弃 IE 兼容**

Proxy 无法 polyfill，Vue 3 不再支持 IE11。这是有意为之的权衡，现代浏览器均已支持。

**响应式核心流程（与 Vue 2 思想一致）：**

```
get → track（收集依赖）
set/delete → trigger（触发更新）
```

集合类型额外包装 `get/set/add/delete` 等方法，在原方法执行后触发依赖更新。

### 代码示例

```javascript
// Vue 2 — 必须用 $set
this.$set(this.obj, 'newKey', 'value')
this.$set(this.arr, 0, 'newItem') // 或 Vue.set

// Vue 3 — 直接赋值
const state = reactive({ obj: {}, arr: [] })
state.obj.newKey = 'value'  // ✅ 自动响应
state.arr[0] = 'newItem'    // ✅
state.arr.length = 0        // ✅

// 支持 Map/Set
const map = reactive(new Map())
map.set('key', 'value')     // ✅ 触发更新

// readonly 防止意外修改
const original = reactive({ count: 0 })
const copy = readonly(original)
copy.count++ // 开发环境警告，修改无效
```

### 面试追问

1. **Vue 3 的 reactive 和 ref 底层都是 Proxy 吗？它们有什么区别？** `reactive` 直接返回 Proxy 对象，适合对象/数组等引用类型。`ref` 对基本类型用 `class RefImpl` 包裹，通过 `get value()` / `set value()` 做依赖收集和触发更新；当 `ref` 的值是对象时，内部调用 `reactive` 对该对象做 Proxy 代理。所以 ref 的值可以是基本类型或对象，reactive 只能是对象。模板中 ref 自动解包（不需要 `.value`）。
2. **Proxy 的惰性代理（懒递归）是如何实现的？什么情况下会触发子对象的代理创建？** Vue 3 在 `get` trap 中判断返回值：如果 `typeof result === 'object' && result !== null`，才对其调用 `reactive(result)` 创建子 Proxy（并缓存到 `reactiveMap` 避免重复代理）。也就是说，只有**访问嵌套属性时**才懒创建子代理。深层嵌套但未被访问的数据不会被代理，显著减少初始化开销。这与 Vue 2 在 `data()` 返回时递归所有属性做 `defineProperty` 形成鲜明对比。

## 61. Vue 3.0 中的 Vue Composition API

**记忆口诀：「Options 分块写，Composition 函数组合；setup 一次执行，逻辑复用更灵活」**

**一句话总结：** Composition API 是 Vue 3 提供的一套基于函数组合的 API，通过 `setup` 将组件的响应式数据、计算属性、生命周期等逻辑按功能组织在一起，解决 Options API 逻辑分散、复用困难、TypeScript 不友好等问题。

### Options API vs Composition API

| 对比维度 | Options API | Composition API |
| --- | --- | --- |
| 代码组织 | 按选项类型分块（data/methods/computed） | 按业务逻辑功能分块 |
| 逻辑复用 | mixins（命名冲突、来源不明） | composables / 自定义 Hook |
| TypeScript | 依赖 this，类型推断差 | 天然函数式，类型友好 |
| 执行时机 | 各选项分散初始化 | setup 在 beforeCreate 之前执行一次 |
| 适用场景 | 简单组件、快速上手 | 复杂组件、逻辑复用、TS 项目 |

### 详细解答

Composition API 并不是要完全替代 Options API，两者可以共存。其核心思想是**把 Vue 内部的响应式、生命周期等机制直接暴露给开发者**，让你用更接近原生 JavaScript 的方式组织代码。

**setup 函数的执行特点：**
- 在组件实例创建之前执行，此时 `this` 不可用
- 每个组件实例化时只调用一次（与 React Hook 每次 render 都调用不同）
- 返回值会暴露给模板和 `this`（Options API 混用时）

**常用 API 分类：**

| 类别 | API | 对应 Options API |
| --- | --- | --- |
| 响应式 | `ref`、`reactive`、`computed`、`readonly` | data / computed |
| 侦听 | `watch`、`watchEffect` | watch |
| 生命周期 | `onMounted`、`onUpdated` 等 | mounted / updated 等 |
| 依赖注入 | `provide`、`inject` | provide / inject |

`<script setup>` 是 SFC 中的语法糖，编译时自动处理返回值暴露，是目前 Vue 3 项目的主流写法。

### 代码示例

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载，count =', count.value)
})
</script>

<template>
  <button @click="increment">
    Count: {{ count }} (double: {{ doubleCount }})
  </button>
</template>
```

**逻辑复用示例（composable）：**

```js
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

### 面试追问

1. **`<script setup>` 和 `setup()` 函数有什么区别？** `<script setup>` 是编译期语法糖，顶层变量/函数自动暴露给模板，import 的组件自动注册；`setup()` 需要手动 return，灵活性更高但写法更繁琐。
2. **`ref` 和 `reactive` 如何选择？** 基本类型和需要整体替换的引用用 `ref`；复杂对象且不需要替换整个对象用 `reactive`。解构 reactive 会丢失响应式，需 `toRefs` 处理。

---

## 62. Composition API与React Hook很像，区别是什么

**记忆口诀：「Hook 靠顺序和依赖数组，Composition 靠响应式无调用限制」**

**一句话总结：** 两者都解决了逻辑复用和代码组织问题，但 React Hook 依赖调用顺序和手动声明依赖，Composition API 基于 Vue 响应式系统自动追踪依赖，无调用顺序限制，且 setup 只执行一次。

### 核心差异对比

| 对比维度 | React Hooks | Vue Composition API |
| --- | --- | --- |
| 底层机制 | 链表 + 调用顺序 | Proxy 响应式 + effect 依赖追踪 |
| 调用限制 | 不能在条件/循环/嵌套函数中调用 | 无限制，任意位置调用 |
| 执行频率 | 每次 re-render 都重新执行 | setup 只在实例创建时执行一次 |
| 依赖管理 | 手动传入 deps 数组（useEffect/useMemo） | 自动依赖收集（watchEffect） |
| 状态更新 | setState 触发整组件 re-render | 精准触发依赖该数据的 effect/组件 |
| 逻辑复用 | 自定义 Hook（useXxx） | composable 函数（useXxx） |
| 心智模型 | 函数式 + 不可变数据 | 响应式 + 可变 ref/reactive |

### 详细解答

**React Hook 的限制根源：** React 用闭包链表存储 Hook 状态，每次 render 按固定顺序遍历链表。如果在条件语句中调用 Hook，顺序就会错乱，导致 state 对应关系混乱。因此 React 强制「只在顶层调用 Hook」。

**Vue Composition API 无此限制的原因：** Vue 的响应式系统通过 Proxy/getter 在**访问时**自动收集依赖，在**修改时**精准触发更新。setup 中的 `ref`、`watch` 等在创建时就建立了响应式连接，不依赖调用顺序。

**性能差异：**
- React：每次 state 变化 → 函数组件重新执行 → 所有 Hook 重新跑一遍 → 虚拟 DOM diff
- Vue：数据变化 → 仅触发相关 effect 和组件更新 → 虚拟 DOM diff

Vue 的 GC 压力通常更小，因为 setup 不会随每次渲染重复执行。

**相同点：** 都借鉴了「组合优于继承」的思想，用函数提取可复用逻辑，告别 mixin 的隐式合并问题。

### 代码对比

```jsx
// React：必须顶层调用，手动管理依赖
function Counter() {
  const [count, setCount] = useState(0)
  const double = useMemo(() => count * 2, [count]) // 必须声明依赖

  useEffect(() => {
    document.title = `Count: ${count}`
  }, [count]) // 漏写依赖会导致 bug

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

```vue
<!-- Vue：无调用顺序限制，自动依赖追踪 -->
<script setup>
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2) // 自动追踪 count

watchEffect(() => {
  document.title = `Count: ${count.value}` // 自动收集依赖
})

// 可以在条件中使用
if (import.meta.env.DEV) {
  watchEffect(() => console.log('dev mode count:', count.value))
}
</script>
```

### 面试追问

1. **Vue 的 `watchEffect` 和 React 的 `useEffect` 有什么本质区别？** `watchEffect` 立即执行并在运行时自动收集依赖；`useEffect` 在 render 后异步执行，依赖必须手动声明，漏声明是常见 bug 来源。
2. **为什么说 Composition API 设计思想借鉴了 React Hook？** 尤雨溪公开承认受 React Hook 启发，核心都是「用函数组合替代选项式/类式继承来实现逻辑复用」，但底层实现完全不同。

---

## 63. 对虚拟DOM的理解？

**记忆口诀：「JS 对象描述 DOM，diff 找差异，patch 最小更新」**

**一句话总结：** 虚拟 DOM（Virtual DOM）是用 JavaScript 对象对真实 DOM 结构的抽象描述，配合 diff 算法找出变化并批量 patch 到真实 DOM，在保证开发效率的同时提供可接受的渲染性能下限。

### 虚拟 DOM 的本质

| 概念 | 说明 |
| --- | --- |
| VNode | 虚拟 DOM 节点，是一个普通 JS 对象 |
| 核心属性 | `type`（标签/组件）、`props`（属性/事件）、`children`（子节点） |
| 与真实 DOM 关系 | 一一映射，但不直接操作浏览器 DOM |
| 更新流程 | 状态变化 → 生成新 VNode 树 → diff 旧树 → patch 差异到真实 DOM |

### 详细解答

虚拟 DOM 并不是 Vue/React 的发明，Snabbdom、incremental DOM 等更早就有类似概念。现代框架选择虚拟 DOM 主要基于三个考量：

**1. 抽象渲染层，实现跨平台**
虚拟 DOM 本质是 JS 对象，可以渲染到不同目标：
- 浏览器 → 真实 DOM（Vue/React 默认）
- Node.js → HTML 字符串（SSR）
- 小程序 / Native → 各自平台的 UI 组件

**2. 批量更新，减少 DOM 操作**
直接操作 DOM 代价高（可能触发回流重绘）。虚拟 DOM 先在 JS 层完成 diff，将多次变更合并为一次最小化的 DOM 操作批次。

**3. 声明式编程，开发者无需手动操作 DOM**
框架接管 DOM 更新，避免多人协作中因手动 DOM 操作导致的性能问题和状态不一致。

**VNode 对象简化结构：**

```js
// 对应 <div id="app" class="container"><p>Hello</p></div>
{
  type: 'div',
  props: { id: 'app', class: 'container' },
  children: [
    {
      type: 'p',
      props: {},
      children: [{ type: 'text', children: 'Hello' }]
    }
  ],
  el: null // patch 后指向真实 DOM 节点
}
```

### 代码示例

```js
// 简化版 VNode 创建与渲染思路
function h(type, props, children) {
  return { type, props: props || {}, children: children || [] }
}

function render(vnode, container) {
  if (typeof vnode.children === 'string') {
    container.textContent = vnode.children
    return
  }
  const el = document.createElement(vnode.type)
  Object.entries(vnode.props).forEach(([key, val]) => {
    el.setAttribute(key, val)
  })
  vnode.children.forEach(child => {
    const childEl = typeof child === 'string'
      ? document.createTextNode(child)
      : render(child, document.createElement(child.type))
    el.appendChild(childEl)
  })
  container.appendChild(el)
  return el
}
```

### 面试追问

1. **虚拟 DOM 一定比直接操作 DOM 快吗？** 不一定。简单场景下创建 VNode + diff 的开销可能超过直接改 DOM；虚拟 DOM 的价值在于复杂 UI 下的性能下限保障和开发效率。
2. **Vue 3 还有虚拟 DOM 吗？** 有。Vue 3 通过编译期静态标记 + 运行时 patchFlag 优化了 diff 效率，但核心仍是 VNode + patch 机制。

---

## 64. 虚拟DOM的解析过程

**记忆口诀：「模板变 VNode，状态变新树，diff 对比，patch 更新真实 DOM」**

**一句话总结：** 虚拟 DOM 的完整解析流程是：编译模板生成 render 函数 → 执行 render 得到 VNode 树 → 状态变更后生成新 VNode 树 → diff 新旧树 → patch 将差异应用到真实 DOM。

### 完整流程

```
Template / JSX
      ↓ compile（编译）
  render 函数
      ↓ execute（首次渲染）
   VNode 树 ──→ patch ──→ 真实 DOM
      ↓ 状态变化，重新 execute
   新 VNode 树
      ↓ diff（对比新旧）
   差异补丁（patches）
      ↓ patch
   更新真实 DOM
```

### 详细解答

**阶段一：VNode 树的创建（Mount）**

1. 组件首次渲染时，执行 `render()` 或编译后的渲染函数
2. 根据模板结构递归创建 VNode 对象树
3. 调用 `patch(null, vnode, container)` 将 VNode 树挂载到容器
4. 挂载过程中创建真实 DOM 节点，并在 VNode 上记录 `el` 引用

**阶段二：VNode 树的更新（Update）**

1. 响应式数据变化触发组件 re-render
2. 再次执行 render 函数，生成新的 VNode 树
3. 调用 `patch(oldVNode, newVNode, container)` 进行 diff
4. 根据 diff 结果最小化更新真实 DOM

**阶段三：Diff 核心策略**

- **同层比较**：只比较同一层级的节点，不跨层级（O(n) 复杂度）
- **类型不同**：直接替换整个子树
- **类型相同**：对比 props 和 children，递归 diff 子节点
- **列表 diff**：使用 key + 双端对比 / 最长递增子序列优化

**Patch 操作类型：**

| 操作 | 说明 |
| --- | --- |
| CREATE | 新增节点 |
| REMOVE | 删除节点 |
| REPLACE | 替换节点 |
| UPDATE | 更新 props / textContent |
| MOVE | 移动节点位置 |

### 代码示例

```js
// 简化的 patch 过程示意
function patch(n1, n2, container) {
  // 首次挂载
  if (!n1) {
    mount(n2, container)
    return
  }

  // 类型不同，直接替换
  if (n1.type !== n2.type) {
    unmount(n1)
    mount(n2, container)
    return
  }

  // 相同类型，更新
  const el = (n2.el = n1.el) // 复用 DOM 节点

  // 对比 props
  const oldProps = n1.props || {}
  const newProps = n2.props || {}
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      el.setAttribute(key, newProps[key])
    }
  }

  // 对比 children
  diffChildren(n1.children, n2.children, el)
}
```

### 面试追问

1. **为什么 diff 只做同层比较？** 跨层级移动 DOM 在实际业务中极少出现，同层比较将 O(n³) 降为 O(n)，是以「极少出现的场景」换取「绝大多数场景的性能」。
2. **Vue 3 的 Block Tree 是什么？** 编译期将动态节点收集到一个 flat 数组（block），更新时只遍历动态节点，跳过静态子树，进一步减少 diff 范围。

---

## 65. 为什么要用虚拟DOM

**记忆口诀：「保性能下限、跨平台、减少手动 DOM 操作」**

**一句话总结：** 使用虚拟 DOM 不是为了绝对性能最优，而是为了在复杂应用中提供可预期的性能下限、实现跨平台渲染，并让开发者以声明式方式编程而无需手动操作 DOM。

### 三大核心价值

| 价值 | 说明 | 典型场景 |
| --- | --- | --- |
| 性能下限保障 | 框架帮你做批量更新和最小化 DOM 操作 | 复杂列表、频繁状态变更 |
| 跨平台能力 | VNode 可渲染到 DOM / SSR / 小程序 / Native | Nuxt SSR、uni-app |
| 开发效率 | 数据驱动视图，无需手动 querySelector | 所有 Vue/React 项目 |

### 详细解答

**1. 性能下限，而非性能上限**

真实 DOM 操作的开销：
```
解析 HTML → 构建 DOM 树 → 构建 CSSOM → Layout → Paint → Composite
```

频繁修改 DOM 会触发回流（Reflow）和重绘（Repaint），代价极高。虚拟 DOM 的做法是：

```
状态变更 → 生成新 VNode（纯 JS，极快）
         → diff 找出差异（JS 内存操作）
         → 一次性 patch 必要 DOM（最小化真实 DOM 操作）
```

尤雨溪的原话：**框架保证的是，你不手动优化的情况下，依然能有过得去的性能。**

**2. 跨平台渲染**

虚拟 DOM 是平台无关的 JS 对象，渲染器（renderer）决定输出目标：

```
         ┌→ @vue/runtime-dom  → 浏览器 DOM
VNode ───┼→ @vue/server-renderer → HTML 字符串
         └→ @dcloudio/uni-app  → 小程序组件
```

**3. 声明式 vs 命令式**

```js
// 命令式：手动操作 DOM，易出错、难维护
document.getElementById('list').innerHTML = ''
items.forEach(item => {
  const li = document.createElement('li')
  li.textContent = item.name
  document.getElementById('list').appendChild(li)
})

// 声明式：描述状态与视图的关系，框架负责 DOM 更新
// <li v-for="item in items" :key="item.id">{{ item.name }}</li>
```

### 代码示例

```vue
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: '学习 Vue', done: false },
  { id: 2, text: '写面试题', done: true }
])

// 只需修改数据，框架自动 diff + patch
function toggle(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id" @click="toggle(todo.id)">
      <span :class="{ done: todo.done }">{{ todo.text }}</span>
    </li>
  </ul>
</template>
```

### 面试追问

1. **Svelte 不用虚拟 DOM 也很快，Vue 为什么还要用？** Svelte 在编译期生成精确的 DOM 操作指令，适合特定场景；虚拟 DOM 提供了更灵活的运行时能力和更好的跨平台抽象，两者取舍不同。
2. **什么场景下虚拟 DOM 反而是负优化？** 少量节点的高频更新（如 canvas 动画）、静态页面，直接操作 DOM 或 innerHTML 可能更快。

---

## 66. 虚拟DOM真的比真实DOM性能好吗

**记忆口诀：「复杂场景有下限保障，简单场景直接 DOM 更快，需看具体场景」**

**一句话总结：** 虚拟 DOM 并非在所有场景下都比直接操作真实 DOM 快；它在复杂 UI 更新中通过批量 diff 提供性能下限，但在简单、少量节点的操作中，虚拟 DOM 的创建和 diff 开销可能反而更大。

### 性能对比

| 场景 | 虚拟 DOM | 直接操作 DOM | 推荐 |
| --- | --- | --- | --- |
| 复杂列表频繁更新 | 批量 diff，最小化 DOM 操作 | 手动优化困难，易全量重绘 | 虚拟 DOM |
| 单个节点文本更新 | 创建 VNode + diff 有额外开销 | 一行 `textContent = x` 极快 | 直接 DOM |
| 大量静态 + 少量动态 | 编译期静态标记，跳过静态节点 | 需手动判断 | 虚拟 DOM（Vue 3） |
| SSR 首屏 | 需等 JS 下载执行 | 直接输出 HTML | SSR + 虚拟 DOM |
| Canvas / WebGL | 无 DOM 概念 | 直接 API 操作 | 不用虚拟 DOM |

### 详细解答

**虚拟 DOM 快在哪里：**

1. **减少 DOM 操作次数**：100 次状态变更 → 1 次 diff → N 次最小 DOM 操作（N << 100）
2. **减少 Layout Thrashing**：在 JS 中完成所有计算后再统一写 DOM，避免读写交替触发强制回流
3. **精准更新**：配合 key 和 diff 算法，只更新变化的节点

**虚拟 DOM 慢在哪里：**

1. **VNode 创建开销**：每次 render 都要创建完整 JS 对象树
2. **Diff 计算开销**：两棵树对比本身需要 CPU 时间
3. **内存占用**：维护新旧两棵 VNode 树

**Vue 3 的编译期优化缩小了差距：**

- **静态提升（Static Hoisting）**：静态 VNode 只创建一次，后续复用
- **PatchFlag**：编译期标记动态节点类型，运行时只 diff 动态部分
- **Block Tree**：动态节点收集为 flat 数组，跳过静态子树

### 代码示例

```js
// 简单场景：直接 DOM 更快
const el = document.getElementById('counter')
el.textContent = count // 一次操作，无 diff 开销

// 复杂场景：虚拟 DOM 更有优势
// 100 个列表项，每次随机更新 10 个
// 直接 DOM：可能误操作全量 innerHTML
// 虚拟 DOM：diff 后精准更新 10 个节点
```

```vue
<!-- Vue 3 编译优化示例 -->
<template>
  <div>
    <p>静态文本</p>           <!-- 静态节点，编译期提升，不参与 diff -->
    <p>{{ dynamicMsg }}</p>    <!-- patchFlag: TEXT，只对比文本 -->
    <p :class="cls">内容</p>   <!-- patchFlag: CLASS，只对比 class -->
  </div>
</template>
```

### 面试追问

1. **React/Vue 为什么不直接用编译时优化替代虚拟 DOM？** 编译时优化（如 Svelte、SolidJS）需要更多编译期信息，灵活性较低；虚拟 DOM 提供了统一的运行时抽象，更适合复杂组件化和跨平台需求。
2. **如何量化虚拟 DOM 的性能收益？** 使用 Chrome Performance 面板对比「直接 DOM 1000 次操作」vs「虚拟 DOM 1000 次状态变更」，关注 Scripting、Rendering、Painting 各阶段耗时。

---

## 67. Vue Router history 模式为什么刷新出现404

**记忆口诀：「history 刷新走服务器，后端没配 fallback 就 404，try_files 指向 index.html」**

**一句话总结：** History 模式下 URL 是真实路径（如 `/user/123`），浏览器刷新会向服务器请求该路径；若服务器没有对应静态文件且未配置 fallback 到 `index.html`，就会返回 404。

### Hash vs History 模式对比

| 对比维度 | Hash 模式 | History 模式 |
| --- | --- | --- |
| URL 形式 | `example.com/#/user` | `example.com/user` |
| 刷新行为 | `#` 后内容不发送到服务器 | 完整路径发送到服务器 |
| 服务器配置 | 无需特殊配置 | 需要 fallback 到 index.html |
| SEO | 较差（# 后内容） | 较好 |
| 兼容性 | 所有浏览器 | 需 HTML5 History API |

### 详细解答

**根本原因：**

前端路由是「伪路由」——路由切换由 JavaScript 在客户端处理，服务器上并不存在 `/user/123` 这样的物理文件。

```
用户访问 /user/123
  ↓ 客户端路由（JS 处理，正常）
  ↓ 浏览器刷新（F5）
  ↓ 浏览器向服务器发送 GET /user/123
  ↓ 服务器查找 /user/123 文件 → 不存在 → 404
```

Hash 模式不会有这个问题，因为 `#` 及其后面的内容**不会**作为 HTTP 请求发送到服务器。

**解决方案：配置服务器 fallback**

所有路由请求都返回 `index.html`，由前端路由接管：

```nginx
# Nginx 配置
server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```apache
# Apache .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 代码示例

```js
// vue-router 配置
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'), // base 路径需与服务器配置一致
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: UserDetail }
  ]
})
```

### 面试追问

1. **开发环境 webpack-dev-server 为什么不会 404？** dev-server 内置了 `historyApiFallback` 中间件，自动将所有请求 fallback 到 `index.html`。
2. **如果项目部署在子路径 `/app/` 下怎么办？** 需同时配置 `createWebHistory('/app/')` 和服务器的 `try_files` base 路径。

---

## 68. Vue Router history 模式上线需要注意什么事项

**记忆口诀：「后端 fallback、base 配置、兼容性测试、SEO 处理」**

**一句话总结：** History 模式上线需确保服务器 fallback 配置、正确的 base/publicPath、404 页面处理、以及 SEO 和安全性方面的配套措施。

### 上线检查清单

| 事项 | 说明 | 常见错误 |
| --- | --- | --- |
| 服务器 fallback | 所有路由返回 index.html | 刷新 404 |
| base 路径 | 子目录部署需配置 base | 静态资源 404 |
| publicPath | 构建产物资源路径正确 | JS/CSS 加载失败 |
| 404 页面 | 前端路由 + 服务器 404 配合 | 无效路由白屏 |
| HTTPS | pushState 在某些场景需安全上下文 | 路由跳转异常 |

### 详细解答

**1. 后端/服务器配置（必须）**

无论 Nginx、Apache、CDN（Cloudflare/Vercel/Netlify），都需要配置 SPA fallback。云平台的配置方式：

```json
// vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**2. base 与 publicPath 对齐**

```js
// vite.config.js
export default {
  base: '/my-app/', // 部署子路径
}

// router
createWebHistory('/my-app/')
```

**3. 前端 404 路由**

```js
const routes = [
  // ... 其他路由
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]
```

**4. 安全性注意**

History 模式暴露了真实 URL 路径，需确保：
- 服务器不泄露源码目录结构
- API 路由与前端路由不冲突（如 `/api/*` 应代理到后端）
- 敏感路径有权限控制

**5. 兼容性与 SEO**

`history.pushState` 需 HTML5 支持（IE10+），更老浏览器降级 Hash 模式。URL 更友好但 SPA 默认 SEO 有限，内容站需配合 SSR/SSG（Nuxt）或预渲染。

### 代码示例

```js
// vite.config.js + router 对齐 base
export default defineConfig({ base: '/my-app/' })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})
```

```nginx
# Nginx：API 与前端路由分离
location /api/ { proxy_pass http://backend:3000/; }
location /my-app/ { try_files $uri $uri/ /my-app/index.html; }
```

### 面试追问

1. **前端路由和后端 API 路由冲突怎么办？** 在服务器层做路径区分，如 `/api/*` 代理到后端，其余 fallback 到 index.html。
2. **微前端场景下 History 模式有什么额外注意？** 各子应用的 base 路径不能冲突，主应用需协调路由注册和 fallback 规则。

---

## 69. 用vue-router hash模式实现锚点

**记忆口诀：「push({ hash: '#anchor' })，优先用 scrollBehavior 自动滚动」**

**一句话总结：** 在 Vue Router 中通过 `router.push({ hash: '#id' })` 或 `<router-link to="#id">` 跳转锚点，配合 `scrollBehavior` 或 `onMounted` 中的 `scrollIntoView` 实现页面内滚动定位。

### 实现方式对比

| 方式 | 适用场景 | 优点 |
| --- | --- | --- |
| scrollBehavior | 全局统一滚动策略 | 配置一次，路由级控制 |
| router.push + hash | 编程式跳转锚点 | 灵活，可配合路由参数 |
| scrollIntoView | 组件内精确控制 | 可自定义滚动行为 |
| 原生 `<a href="#id">` | 简单静态锚点 | 无需 JS |

### 详细解答

Hash 模式下 URL 形如 `example.com/#/page#section`，路由 hash 和锚点 hash 共存。Vue Router 4 推荐使用 `scrollBehavior` 统一处理。

**scrollBehavior 执行时机：**
- 导航完成后触发
- 接收 `to`、`from`、`savedPosition` 参数
- 返回滚动位置对象或 Promise

**注意事项：**
- 目标元素必须已渲染到 DOM 中（可能在 `nextTick` 或 `onMounted` 后）
- 异步组件/懒加载路由需等待组件挂载
- 固定头部（fixed header）需设置 `scroll-margin-top` 偏移

### 代码示例

```js
// router/index.js — 推荐：scrollBehavior 全局配置
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/docs', component: DocsPage }
  ],
  scrollBehavior(to, from, savedPosition) {
    // 浏览器前进/后退，恢复之前位置
    if (savedPosition) return savedPosition

    // 路由 hash 锚点
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ el: to.hash, behavior: 'smooth', top: 80 })
        }, 300) // 等待 DOM 渲染
      })
    }

    return { top: 0 }
  }
})
```

```vue
<!-- 编程式跳转锚点 -->
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToSection(sectionId) {
  router.push({ path: '/docs', hash: `#${sectionId}` })
}
</script>

<template>
  <nav>
    <button @click="goToSection('intro')">介绍</button>
    <button @click="goToSection('api')">API</button>
  </nav>
</template>
```

```css
/* 固定头部需设置 scroll-margin-top 偏移 */
section { scroll-margin-top: 80px; }
```

### 面试追问

1. **History 模式下如何实现锚点？** 同样用 `scrollBehavior` + `to.hash`，URL 形如 `example.com/docs#intro`。
2. **异步加载的锚点元素找不到怎么办？** 在 `scrollBehavior` 中延迟执行或 `nextTick` 后 `scrollIntoView`，必要时用 `MutationObserver` 等待 DOM。

---

## 70. vue项目中style样式中为什么要添加 scoped

**记忆口诀：「scoped 加 data-v-哈希，样式只作用当前组件，穿透用 :deep()」**

**一句话总结：** `scoped` 通过 PostCSS 为组件模板中的每个元素添加唯一属性选择器（如 `data-v-xxxxx`），使样式只作用于当前组件，避免全局污染和组件间样式冲突。

### scoped 原理

| 步骤 | 说明 |
| --- | --- |
| 编译时 | Vue Loader 为组件生成唯一 scopeId（如 `data-v-f3f3eg9`） |
| 模板 | 每个 HTML 元素自动添加 `data-v-f3f3eg9` 属性 |
| 样式 | `.title` 编译为 `.title[data-v-f3f3eg9]` |
| 结果 | 样式只匹配本组件元素，不影响其他组件 |

### 详细解答

**为什么需要 scoped：**

Vue 单文件组件默认 `<style>` 是全局的。多个组件使用相同 class 名（如 `.container`、`.btn`）会互相覆盖，在大型项目中难以排查。

**scoped 的局限性：**

1. **子组件根元素**会同时有父和子的 scopeId，父组件 scoped 样式可能影响子组件根元素
2. **无法直接影响子组件内部元素**——需用深度选择器
3. **动态插入的内容**（如 v-html）不会添加 scopeId

**深度选择器：**

| 写法 | Vue 版本 | 说明 |
| --- | --- | --- |
| `:deep(.child)` | Vue 3 推荐 | 穿透 scoped，影响子组件内部 |
| `>>>` | Vue 2（原生 CSS） | 深度选择器，部分预处理器不支持 |
| `/deep/` 或 `::v-deep` | Vue 2（Sass/Less） | 深度选择器的预处理器兼容写法 |
| `:slotted(.item)` | Vue 3 | 作用于插槽内容 |
| `:global(.reset)` | Vue 3 | 在 scoped 块中写全局样式 |

**替代方案：**

- **CSS Modules**：`<style module>`，通过 `$style.className` 引用
- **BEM 命名规范**：手动保证 class 唯一性
- **CSS-in-JS**：styled-components 等

### 代码示例

```vue
<template>
  <div class="card">
    <h3 class="title">{{ title }}</h3>
    <ChildComponent class="child" />
  </div>
</template>

<style scoped>
/* 编译后：.card[data-v-abc123] */
.card {
  padding: 16px;
  border: 1px solid #eee;
}

.title {
  color: #333;
}

/* 穿透子组件内部样式 */
:deep(.child .inner-text) {
  font-size: 14px;
  color: #666;
}
</style>
```

```vue
<!-- CSS Modules 替代方案 -->
<template>
  <div :class="$style.card">
    <h3 :class="$style.title">{{ title }}</h3>
  </div>
</template>

<style module>
.card { padding: 16px; }
.title { color: #333; }
</style>
```

### 面试追问

1. **scoped 会影响性能吗？** 编译时一次性处理，运行时无额外开销。但复杂选择器 + 属性选择器可能略微降低 CSS 匹配效率，实际影响可忽略。
2. **为什么子组件根元素会被父组件 scoped 样式影响？** 子组件根元素同时携带父组件传入的 scopeId 和自身的 scopeId，父的选择器 `.xxx[data-v-parent]` 可以匹配到。

---

## 71. mounted生命周期和keep-alive中activated的优先级

**记忆口诀：「首次 mounted + activated，再进只 activated，离开 deactivated」**

**一句话总结：** 被 keep-alive 缓存的组件首次挂载时 `mounted` 和 `activated` 都会触发（先 mounted 后 activated）；之后再次进入只触发 `activated`，离开时触发 `deactivated` 而非 `unmounted`。

### 生命周期执行顺序

| 场景 | 触发钩子 | 执行顺序 |
| --- | --- | --- |
| 首次进入（有 keep-alive） | mounted → activated | mounted 先，activated 后 |
| 再次进入（从缓存恢复） | activated | 不触发 mounted |
| 离开（被缓存） | deactivated | 不触发 unmounted |
| 真正销毁（超出 max / 手动 exclude） | deactivated → unmounted | 先 deactivated 后 unmounted |
| 无 keep-alive | mounted / unmounted | 正常生命周期 |

### 详细解答

**keep-alive 的本质：**

keep-alive 是抽象组件，缓存子组件 VNode 而非销毁实例。被缓存的组件：
- DOM 从文档中移除，但组件实例、状态、DOM 引用都保留
- 再次显示时直接从缓存恢复，跳过 created/mounted

**执行时机详解：**

```
首次渲染（keep-alive 包裹）：
  beforeCreate → created → beforeMount → mounted → activated

切换到其他页面（组件被缓存）：
  deactivated

再次回到该页面（从缓存恢复）：
  activated（跳过 created/mounted）

缓存被清除（超出 max 或 exclude）：
  deactivated → beforeUnmount → unmounted
```

**实际开发建议：**
- 初始化数据放 `created` / `setup`
- 需要访问 DOM 的逻辑放 `mounted`（仅首次）
- 每次页面可见时需要执行的逻辑（如刷新数据、重启定时器）放 `activated`
- 页面不可见时清理逻辑（如暂停定时器）放 `deactivated`

### 代码示例

```vue
<!-- App.vue -->
<template>
  <keep-alive :include="['PageA']">
    <component :is="currentPage" />
  </keep-alive>
</template>
```

```vue
<!-- PageA.vue -->
<script setup>
import { onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'

onMounted(() => {
  console.log('1. mounted — 仅首次挂载')
  fetchInitialData()
})

onActivated(() => {
  console.log('2. activated — 每次页面可见（含首次）')
  refreshData()       // 每次进入刷新
  startPolling()      // 重启轮询
})

onDeactivated(() => {
  console.log('3. deactivated — 页面被缓存隐藏')
  stopPolling()       // 暂停轮询，避免后台运行
})

onUnmounted(() => {
  console.log('4. unmounted — 组件真正销毁')
})
</script>
```

### 面试追问

1. **activated 和 mounted 中都请求数据会重复吗？** 会。首次进入两者都触发，应把「仅首次」放 mounted，「每次可见」放 activated，或只在 activated 中请求。
2. **keep-alive 的 include/exclude 匹配规则是什么？** 匹配组件的 `name` 选项（`<script setup>` 需 `defineOptions({ name: 'MyComp' })`），支持字符串、正则、数组。

---

## 72. Vue 组件之间的通信方式有哪些

**记忆口诀：「父子 props/$emit/$refs，隔代 provide/inject/$attrs，兄弟/全局用 EventBus/Vuex/Pinia」**

**一句话总结：** Vue 组件通信方式按关系可分为父子（props/emit/refs）、跨层级（provide/inject/attrs）、全局（Pinia/Vuex/EventBus），Vue 3 推荐 props + emit + Pinia + composables 组合。

### 通信方式全景

| 方式 | 方向 | 适用关系 | Vue 3 状态 |
| --- | --- | --- | --- |
| props | 父 → 子 | 父子 | ✅ 推荐 |
| emit / v-model | 子 → 父 | 父子 | ✅ 推荐 |
| ref / expose | 父 → 子 | 父子 | ✅ 推荐 |
| $attrs | 父 → 孙（透传） | 跨层 | ✅（$listeners 已合并） |
| provide / inject | 祖先 → 后代 | 跨层级 | ✅ 推荐 |
| Pinia / Vuex | 任意 | 全局 | ✅ Pinia 推荐 |
| EventBus (mitt) | 任意 | 全局事件 | ⚠️ 简单场景 |
| $parent / $root | 任意 | 不推荐 | ⚠️ $children 已废弃 |

### 详细解答

**按场景选择：**

```
父子通信用 props + emit（单向数据流）
需要父调子方法 → ref + defineExpose
跨 2-3 层 → $attrs 透传 或 provide/inject
全局共享状态 → Pinia
一次性事件 → mitt
可复用逻辑 → composable（非通信，但常一起考）
```

**Vue 3 重要变更：**
- `$children` 移除 → 用 `$refs` + template ref
- `$listeners` 移除 → 合并到 `$attrs`
- `$on/$off/$once` 移除 → 用 mitt 等第三方库
- 推荐 Pinia 替代 Vuex

**v-model 本质：**

```vue
<!-- 父组件 -->
<Child v-model="value" />
<!-- 等价于 -->
<Child :modelValue="value" @update:modelValue="value = $event" />

<!-- 多个 v-model -->
<User v-model:name="name" v-model:age="age" />
```

### 代码示例

```vue
<!-- props + emit -->
<Child :count="count" @update:count="count = $event" />
<!-- Child: defineProps + defineEmits(['update:count']) -->
```

```js
// provide/inject — 跨层级
provide('theme', ref('dark'))  // 祖先
const theme = inject('theme')  // 后代

// Pinia — 全局状态
const userStore = useUserStore()
userStore.login('Tom', 'token123')

// mitt — 简单事件
emitter.on('refresh', handler); emitter.emit('refresh')
```

### 面试追问

1. **provide/inject 响应式丢失怎么办？** 传递 `ref`/`reactive` 对象而非原始值；或使用 `provide(key, readonly(state))` 配合 `inject` 后 computed 包装。
2. **Pinia 和 EventBus 怎么选？** 需要持久化、DevTools 追踪、多组件共享状态 → Pinia；一次性事件通知、无状态 → mitt。

---

## 73. Vue2.x 和 Vue3 响应式上的区别？Vue 数据绑定是怎么实现的

**记忆口诀：「Vue2 defineProperty 逐属性 + 数组 hack，Vue3 Proxy 整体代理 + effect 依赖追踪」**

**一句话总结：** Vue 2 用 `Object.defineProperty` 递归劫持每个属性，存在无法监听新增/删除属性、数组变异方法等局限；Vue 3 用 `Proxy` 代理整个对象，配合 effect 依赖追踪，实现更完整、高效的响应式系统。

### Vue 2 vs Vue 3 响应式对比

| 对比维度 | Vue 2 (defineProperty) | Vue 3 (Proxy) |
| --- | --- | --- |
| 劫持方式 | 逐属性 getter/setter | 整个对象代理 |
| 新增/删除属性 | 需 `$set` / `$delete` | 自动响应 |
| 数组操作 | 重写 7 个变异方法 | 原生方法直接监听 |
| 初始化性能 | 递归遍历所有属性，大对象慢 | 懒代理，访问时才递归 |
| 集合类型 | 不支持 Map/Set | 支持 Map/Set/WeakMap/WeakSet |
| 依赖收集 | Dep + Watcher | effect + track/trigger |
| API | `data()` / `Vue.observable` | `ref` / `reactive` / `computed` |

### 详细解答

**Vue 2 响应式流程：**

```
data() 返回对象
  → observe() 递归遍历
  → 每个属性 defineProperty(get/set)
  → getter 中 dep.depend() 收集 Watcher
  → setter 中 dep.notify() 通知更新
  → Watcher → 组件 re-render
```

**Vue 2 的已知缺陷：**
1. 无法检测属性添加/删除 → `$set`/`$delete`
2. 数组索引赋值和 `length` 修改不触发 → `$set(arr, index, val)`
3. 初始化时需递归所有层级，即使用不到

**Vue 3 响应式流程：**

```
reactive(obj) / ref(val)
  → new Proxy(obj, { get, set, deleteProperty })
  → get 中 track(target, key) 收集 effect
  → set 中 trigger(target, key) 触发 effect
  → effect 重新执行 → 组件更新
```

**Vue 3 优化点：**
- **懒响应式**：只有访问到的嵌套对象才会被代理
- **静态标记**：编译期标记动态绑定，减少运行时依赖追踪
- **effect 调度**：批量更新，同一 tick 内多次修改只触发一次渲染

### 代码示例

```js
// Vue 2 局限演示
// this.obj.newKey = 'val'     // ❌ 不响应，需 this.$set(this.obj, 'newKey', 'val')
// this.arr[0] = 'new'         // ❌ 不响应，需 this.$set(this.arr, 0, 'new')
// this.arr.length = 0         // ❌ 不响应

// Vue 3 自动响应
import { reactive, ref } from 'vue'
const state = reactive({ name: 'Vue', items: [1, 2, 3] })

state.age = 25           // ✅ 自动响应
delete state.name        // ✅ 自动响应
state.items.push(4)      // ✅ 自动响应
state.items[0] = 99      // ✅ 自动响应
```

```js
// 简化的 Vue 3 响应式原理
let activeEffect = null
const targetMap = new WeakMap()

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) { track(target, key); return target[key] },
    set(target, key, val) { target[key] = val; trigger(target, key); return true }
  })
}
// track: get 时收集 activeEffect 到 depsMap
// trigger: set 时遍历 deps 重新执行 effect
```

### 面试追问

1. **Vue 3 还需要 `$set` 吗？** 绝大多数情况不需要。Proxy 自动处理新增属性。但替换整个 reactive 对象的引用仍需重新赋值。
2. **`ref` 为什么要 `.value`？** ref 本质是 `{ value: T }` 的 reactive 包装，JS 基本类型无法被 Proxy 代理，需通过对象引用包装实现响应式。

---

## 74. 详解函数式组件

**记忆口诀：「无状态无 this 叫 functional，Vue2 性能优势大，Vue3 差距小」**

**一句话总结：** 函数式组件是无状态（无响应式数据）、无实例（无 this）的组件，只接收 props 并返回 VNode；Vue 2 中用于性能优化，Vue 3 中普通组件性能已足够好，函数式组件主要用于简单动态渲染场景。

### Vue 2 vs Vue 3 函数式组件

| 对比维度 | Vue 2 | Vue 3 |
| --- | --- | --- |
| 声明方式 | `{ functional: true }` 选项 | 普通函数 `(props, ctx) => VNode` |
| 性能优势 | 显著（跳过实例化） | 可忽略 |
| 多根节点 | 函数式组件支持 | 普通组件也支持 |
| 推荐度 | 列表项等性能敏感场景 | 仅简单动态组件 |
| context | `context.props/slots/data` | 第二参数 `{ attrs, slots, emit }` |

### 详细解答

**函数式组件的特点：**
- 没有组件实例 → 无 `this`、无生命周期、无 `data`/`computed`
- 没有响应式系统开销 → 渲染更快
- 通过 `props` 接收数据，通过 `context.slots` 接收插槽

**Vue 2 适用场景：**
- 大量重复的简单展示组件（列表项、图标）
- 纯展示型组件（Button、Tag、Badge）
- 高阶组件（HOC）包装

**Vue 3 的变化：**
- 普通组件初始化开销已大幅降低
- 支持 Fragment（多根节点）
- 官方建议：**除非极简动态组件，否则使用普通组件**

**Vue 3 动态组件典型用例：**

```js
// 动态标题 h1~h6
const DynamicHeading = (props, { slots, attrs }) => {
  return h(`h${props.level}`, attrs, slots.default?.())
}
DynamicHeading.props = ['level']
```

### 代码示例

```js
// Vue 2 函数式组件
Vue.component('my-button', {
  functional: true,
  props: { type: String, disabled: Boolean },
  render(h, context) {
    return h('button', {
      class: ['btn', `btn-${context.props.type}`],
      attrs: { disabled: context.props.disabled },
      on: context.listeners
    }, context.children)
  }
})
```

```js
// Vue 3 函数式组件
import { h } from 'vue'

const DynamicHeading = (props, { slots, attrs }) => {
  return h(`h${props.level}`, attrs, slots.default?.())
}
DynamicHeading.props = { level: { type: Number, required: true } }
export default DynamicHeading
```

```vue
<!-- 使用 -->
<template>
  <DynamicHeading :level="2">章节标题</DynamicHeading>
  <!-- 渲染为 <h2>章节标题</h2> -->
</template>
```

```js
// Vue 2 高阶组件示例
function withLogging(WrappedComponent) {
  return {
    functional: true,
    render(h, context) {
      console.log(`Rendering ${WrappedComponent.name}`)
      return h(WrappedComponent, context.data, context.children)
    }
  }
}
```

### 面试追问

1. **Vue 3 为什么不再推荐函数式组件做性能优化？** Vue 3 重构了组件初始化流程（更轻量的实例、编译优化），函数式组件的性能优势从「显著」变为「可忽略」，维护成本反而更高。
2. **函数式组件能使用 hooks / composable 吗？** 不能。函数式组件没有 setup 上下文，无法使用生命周期和响应式 API。如需逻辑复用，应使用普通组件 + composable。

---

## 75. 详解 Vue 单向数据流

**记忆口诀：「props 向下传，events 向上传，子不直接改父 props」**

**一句话总结：** Vue 的单向数据流指数据从父组件通过 props 向下传递，子组件通过 emit 事件通知父组件修改，子组件不能直接修改 props，以保证数据流向可预测、可追踪。

### 单向 vs 双向

| 概念 | 范围 | 说明 |
| --- | --- | --- |
| 单向数据流 | 组件间通信 | props 下、events 上 |
| 双向绑定 | 表单/特定场景 | v-model 语法糖，本质仍是 props + emit |
| 状态管理 | 全局 | Pinia 单一数据源，mutation/action 修改 |

### 详细解答

**为什么需要单向数据流：**

1. **可预测性**：数据变化路径唯一，便于调试和追踪
2. **可维护性**：父组件是数据的唯一 owner，不会出现多处修改同一数据的混乱
3. **可复用性**：子组件只依赖 props，不依赖外部状态，更易复用和测试

**Vue 如何强制单向数据流：**

- 开发环境修改 props 会 console.warn 警告
- props 在组件内部是只读的（shallowReadonly）
- 子组件应 `emit('update:xxx', newVal)` 通知父组件修改

**v-model 不违反单向数据流：**

```vue
<!-- v-model 是语法糖 -->
<Child v-model="msg" />
<!-- 等价于 -->
<Child :modelValue="msg" @update:modelValue="msg = $event" />
```

数据仍然是「父组件持有 → props 下发 → 事件回传 → 父组件更新」，只是语法上简化了。

**违反单向数据流的危害：**

```js
// ❌ 子组件直接修改 prop 对象
props.user.name = 'new name'  // 父组件其他依赖 user 的地方可能不一致

// ✅ 正确做法
emit('update:user', { ...props.user, name: 'new name' })
```

### 代码示例

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
const todoList = ref([
  { id: 1, text: '学习 Vue', done: false }
])

function handleToggle(id) {
  todoList.value = todoList.value.map(item =>
    item.id === id ? { ...item, done: !item.done } : item
  )
}
</script>

<template>
  <TodoItem
    v-for="todo in todoList"
    :key="todo.id"
    :todo="todo"
    @toggle="handleToggle"
  />
</template>
```

```vue
<!-- TodoItem.vue — 遵循单向数据流 -->
<script setup>
defineProps({ todo: Object })
const emit = defineEmits(['toggle'])
</script>

<template>
  <li :class="{ done: todo.done }" @click="emit('toggle', todo.id)">
    {{ todo.text }}
  </li>
</template>
```

### 面试追问

1. **`.sync` 修饰符和 v-model 什么关系？** Vue 2 的 `.sync` 是 v-model 的前身（`@update:propName`），Vue 3 统一为 v-model 参数语法 `v-model:propName`。
2. **什么时候可以打破单向数据流？** 几乎不应该。如果子组件需要修改数据，应通过 emit 通知父组件，或使用 provide/inject + 响应式对象（明确设计为共享可变状态）。

---

## 76. 详解 Vue template 模板编译

**记忆口诀：「parse 生成 AST，optimize 标记静态，generate 出 render 函数」**

**一句话总结：** Vue 模板编译是将 template 字符串经过 parse（解析为 AST）、optimize（标记静态节点）、generate（生成 render 函数）三个阶段，转换为高效的 JavaScript 渲染函数，配合响应式系统实现数据驱动视图。

### 编译三阶段

| 阶段 | 输入 | 输出 | 核心工作 |
| --- | --- | --- | --- |
| parse | template 字符串 | AST | HTML 解析 + 指令处理 |
| optimize | AST | 优化后的 AST | 标记静态节点/静态根 |
| generate | AST | render 函数代码 | 生成 createElement VNode 代码 |

### 详细解答

**为什么需要编译：**

- 运行时解析 template 字符串开销大
- 编译期可以做大量静态分析优化
- 将模板语法（v-if/v-for/:bind）转换为高效 JS 代码

**Runtime vs Runtime+Compiler：**

| 版本 | 体积 | 能力 | 使用场景 |
| --- | --- | --- | --- |
| runtime-only | ~小 30% | 只能用预编译 render 函数 | 生产环境（SFC + 构建工具） |
| runtime+compiler | 较大 | 可在运行时编译 template 字符串 | 浏览器直接写 template |

**Vue 3 编译优化（相比 Vue 2）：**

1. **静态提升（Static Hoisting）**：静态 VNode 提升到 render 函数外，只创建一次
2. **PatchFlag**：标记动态节点类型（TEXT/CLASS/PROPS 等），运行时精准 diff
3. **Block Tree**：动态子节点收集为 flat 数组，跳过静态子树
4. **事件缓存**：内联事件处理函数缓存，避免重复创建

**Template vs JSX：**

| 维度 | Template | JSX |
| --- | --- | --- |
| 学习成本 | 低（类 HTML） | 中（JS 语法） |
| 编译优化 | 静态分析充分 | 优化空间有限 |
| 灵活性 | 内置指令，逻辑分离 | 完整 JS 能力 |
| 工具支持 | Vue SFC 生态 | 通用 JS 工具链 |

### 代码示例

```vue
<!-- 输入 template -->
<template>
  <div>
    <p>{{ message }}</p>
    <p class="static">静态文本</p>
    <button @click="handleClick">Click</button>
  </div>
</template>
```

```js
// 编译输出（简化示意）
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString } from 'vue'

// 静态节点被提升
const _hoisted_1 = _createElementVNode('p', { class: 'static' }, '静态文本')

export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock('div', null, [
    _createElementVNode('p', null, _toDisplayString(_ctx.message), 1 /* TEXT */),
    _hoisted_1,
    _createElementVNode('button', {
      onClick: _cache[0] || (_cache[0] = (...args) => _ctx.handleClick(...args))
    }, 'Click')
  ]))
}
```

```js
// 手动编译（runtime+compiler 版本）
import { compile } from 'vue/dist/vue.esm-bundler.js'

const template = '<div>{{ msg }}</div>'
const { code } = compile(template)
console.log(code) // 输出 render 函数源码
```

### 面试追问

1. **Vue 3 的 PatchFlag 有哪些类型？** TEXT(1)、CLASS(2)、STYLE(4)、PROPS(8)、FULL_PROPS(16)、NEED_HYDRATION(256) 等，编译期按动态绑定类型组合标记。
2. **withDirectives 是什么？** 编译器为 v-model、v-show 等运行时指令生成的包装函数，在 render 阶段动态应用指令逻辑。

---

## 77. 详解虚拟 DOM 与 Vue DIFF 算法原理

**记忆口诀：「同层比较不跨级，先比 type 再比 key，Vue2 双端四指针，Vue3 最长递增子序列」**

**一句话总结：** Vue 的 diff 算法通过同层比较（O(n)）策略，对比新旧 VNode 树的差异，Vue 2 使用双端四指针对比列表，Vue 3 在此基础上加入最长递增子序列优化移动次数，配合编译期静态标记减少 diff 范围。

### Diff 算法核心策略

| 策略 | 说明 | 目的 |
| --- | --- | --- |
| 同层比较 | 只比较同一层级，不跨层级 | O(n³) → O(n) |
| type + key | 先比节点类型，再比 key | 快速判断复用/替换 |
| 双端对比 | 头头、尾尾、头尾、尾头 | 处理常见增删改 |
| 最长递增子序列 | 找出相对有序的最长子序列 | 最小化 DOM 移动 |
| 静态标记 | 编译期标记静态节点 | 跳过不变节点 |

### 详细解答

**完整 Diff 流程：**

```
1. 对比根节点 type
   ├─ 不同 → 卸载旧树，挂载新树
   └─ 相同 → 对比 props → 对比 children

2. children diff（列表核心）
   ├─ 无 key → 简单逐位对比（性能差）
   └─ 有 key → 双端对比 + LIS 优化
```

**Vue 2 双端四指针：**

```
old: [A, B, C, D]
new: [D, A, B, C]

Step1: 头头 A≠D, 尾尾 D≠C
Step2: 头尾 A≠C, 尾头 D≠D ✓ → patch D, 指针移动
Step3: 头头 A≠A ✓ → patch A
...依次处理
```

**Vue 3 列表 diff 五步：**

1. 从头对比相同节点
2. 从尾对比相同节点
3. 旧节点用完 → 挂载剩余新节点
4. 新节点用完 → 卸载剩余旧节点
5. 都有剩余 → 建立 key → index Map，求最长递增子序列，最小移动

**Key 的作用：**

- 提供节点唯一身份标识
- 避免就地复用导致的 DOM 状态混乱（如 input 输入值、组件状态）
- 帮助 diff 算法精准匹配移动/复用

### 代码示例

```js
// Vue 3 用最长递增子序列（LIS）求最小移动次数
// 例：旧节点索引 [1,3,0,2,4] → LIS 为 [1,3,4]，这些节点不移动，其余才移动
// 实现：贪心 + 二分，时间复杂度 O(n log n)
```

```vue
<!-- key 的正确与错误用法 -->
<template>
  <!-- ✅ 使用唯一稳定 id -->
  <div v-for="item in list" :key="item.id">{{ item.name }}</div>

  <!-- ❌ 使用 index 作为 key（列表会 reorder 时出问题） -->
  <div v-for="(item, index) in list" :key="index">{{ item.name }}</div>
</template>
```

### 面试追问

1. **为什么不用 index 作为 key？** 列表增删/重排时，index 会变化导致 diff 误判为内容变化，可能复用错误 DOM 节点，造成状态混乱和性能浪费。
2. **Vue 3 的 Block Tree 如何配合 diff？** 编译期将动态节点收集到 block 的 flat 数组，patch 时只遍历该数组而非整棵树，静态子树完全跳过。

---

## 78. Vue 性能优化有哪些方案

**记忆口诀：「渲染优化减响应、更新优化减重绘、构建优化减体积」**

**一句话总结：** Vue 性能优化可从三个维度入手：渲染加载（减少响应式开销、虚拟列表、SSR）、更新渲染（v-memo、shallowRef、合理 key、keep-alive）、构建部署（路由懒加载、Tree-shaking、包体积分析）。

### 优化方案全景

| 分类 | 优化手段 | 适用场景 |
| --- | --- | --- |
| **渲染加载** | 非响应式数据、Object.freeze、虚拟列表 | 大数据列表、首屏加载 |
| **渲染加载** | SSR / SSG | SEO、首屏速度 |
| **更新渲染** | v-once / v-memo | 静态/半静态内容 |
| **更新渲染** | shallowRef / shallowReactive | 大型不可变数据 |
| **更新渲染** | v-for + key、避免 v-if/v-for 同用 | 列表渲染 |
| **更新渲染** | keep-alive | 频繁切换的 tab/页面 |
| **构建优化** | 路由懒加载 | 减小首屏 bundle |
| **构建优化** | Tree-shaking、按需引入 | 减小总体积 |
| **构建优化** | 生产环境关闭 SourceMap | 构建速度 + 安全 |

### 详细解答

**1. 减少响应式开销**

不需要响应式的数据不要放入 `data`/`reactive`：

```js
// Vue 3：非响应式数据
const rawData = markRaw({ huge: 'object' })

// Vue 2：挂载到实例但不在 data 中
beforeCreate() { this.timer = null }
```

**2. 列表优化三板斧**

- `Object.freeze()` 冻结纯展示数据
- 虚拟滚动（vue-virtual-scroller）只渲染可视区域
- 稳定唯一 `key`

**3. 更新与构建优化**

- `v-memo="[depA]"` 依赖不变跳过子树 diff；`shallowRef` 处理大型不可变数据
- 路由懒加载 `() => import('./Page.vue')`；`lodash-es` 替代 `lodash`
- `keep-alive` 缓存频繁切换组件；`onUnmounted` 清理定时器/监听器

### 代码示例

```vue
<div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
  <span>{{ item.name }}</span>
</div>
```

```js
const bigList = shallowRef([])
bigList.value = await fetchHugeList() // 整体替换才触发更新
```

```js
// Object.freeze 冻结纯展示数据（Vue2 中不做响应式劫持）
export default {
  data() {
    return {
      frozenList: Object.freeze([{ id: 1, name: '...' }, /* ... 10000 items */])
    }
  }
}
```

```js
// 非响应式数据不放 data/reactive
import { markRaw, shallowRef } from 'vue'

// 大型第三方实例不需要响应式
const chart = markRaw(echarts.init(container))

// 组件卸载时清理资源
onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', onResize)
  chart?.dispose()
})
```

```js
// 虚拟列表示例（vue-virtual-scroller）
import { RecycleScroller } from 'vue-virtual-scroller'
// <RecycleScroller :items="bigList" :item-size="50" key-field="id">
//   <template #default="{ item }">
//     <div>{{ item.name }}</div>
//   </template>
// </RecycleScroller>
```

### 面试追问

1. **v-if 和 v-show 性能差异？** 首次渲染 v-if 开销大（条件为 false 不渲染）；频繁切换 v-show 更优（只切换 display）。Vue 3 中 v-if 优先级高于 v-for，不要写在同一元素上。
2. **什么时候该用 SSR？** 首屏速度影响转化率（电商、内容站）→ SSR/SSG；内部管理系统 → CSR 足够。SSR 代价是服务器负载和部署复杂度。

---

## 79. Vue 中如何对一个组件进行扩展

**记忆口诀：「逻辑扩展用 mixins/extends/Composition API，内容扩展用 slot」**

**一句话总结：** Vue 组件扩展分为逻辑扩展（mixins、extends、composables/HOC）和内容扩展（插槽体系），Vue 3 推荐使用 Composition API 组合函数实现逻辑复用，用插槽实现 UI 扩展。

### 扩展方式对比

| 方式 | 类型 | Vue 3 推荐度 | 说明 |
| --- | --- | --- | --- |
| Composition API | 逻辑 | ⭐⭐⭐ 强烈推荐 | 函数组合，无命名冲突 |
| 插槽 (slot) | 内容 | ⭐⭐⭐ 强烈推荐 | UI 扩展的标准方式 |
| mixins | 逻辑 | ❌ 不推荐 | 命名冲突、来源不明 |
| extends | 逻辑 | ❌ 不推荐 | 只能继承一个 |
| 高阶组件 (HOC) | 逻辑 | ⚠️ 特定场景 | 包装增强组件 |
| 插件 (plugin) | 全局 | ✅ 全局能力 | app.use() 注册 |

### 详细解答

**逻辑扩展演进：**

```
mixins（Vue 2 主流，问题多）
  → extends（单继承，仍有冲突）
    → Composition API（Vue 3 标准，组合优于继承）
```

**mixins 的问题：**
- 多个 mixin 可能有同名 data/methods
- 无法追踪属性/方法来自哪个 mixin
- TypeScript 支持差

**内容扩展 — 四种插槽：**

| 插槽类型 | 语法 | 用途 |
| --- | --- | --- |
| 默认插槽 | `<slot>` | 父组件自定义默认内容 |
| 具名插槽 | `<slot name="header">` | 多区域内容分发 |
| 作用域插槽 | `<slot :item="item">` | 子传数据，父决定渲染 |
| 动态插槽 | `<slot :name="dynamicName">` | 运行时决定插槽名 |

**其他扩展方式：**
- **app.component()** 全局注册组件
- **app.directive()** 注册自定义指令
- **app.use(plugin)** 插件扩展（Vue Router、Pinia 等）

### 代码示例

```js
// 1. Composition API 逻辑复用（推荐）
export function useFetch(url) {
  const data = ref(null), loading = ref(false)
  async function execute() {
    loading.value = true
    data.value = await fetch(url).then(r => r.json())
    loading.value = false
  }
  return { data, loading, execute }
}
```

```vue
<!-- 2. 作用域插槽 — UI 扩展 -->
<!-- 子组件：<slot name="row" :item="item" /> -->
<!-- 父组件：<template #row="{ item }"><td>{{ item.name }}</td></template> -->
```

```js
// 3. 插件扩展（全局能力）
export default {
  install(app) {
    app.config.globalProperties.$toast = (msg) => { /* ... */ }
    app.provide('toast', (msg) => { /* ... */ })
  }
}
app.use(ToastPlugin)
```

### 面试追问

1. **Composition API 和 mixin 的本质区别？** Composition API 是显式函数调用，数据来源清晰、无命名冲突、TS 友好；mixin 是隐式合并，多个 mixin 冲突时难以调试。
2. **如何实现一个高阶组件？** Vue 3 中可用函数式组件或包装组件：外层组件接收 props/slots，增强逻辑后渲染内层组件 `<InnerComp v-bind="$attrs">` + `defineOptions({ inheritAttrs: false })`。

