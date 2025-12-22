核心点：

1. 理解什么是 Vue 的生命周期，它解决了什么问题？
2. 了解 Vue2/Vue3 有哪些生命周期钩子？
3. Vue3 在生命周期的演化上有什么不一样的地方？（选项式 API 和 组合式 API 上，生命周期存在的差异）
4. 什么是 Vue3 调试钩子？



### 什么是 Vue 的生命周期？

每个 Vue 组件实例被创建后都会经过一系列初始化步骤，比如，它需要数据观测，模板编译，挂载实例到 DOM 上，以及数据变化时更新 DOM。这个过程中会运行叫做**生命周期钩子的函数**，以便用户在特定阶段有机会添加他们自己的代码。

Vue2 生命周期总共可以分为 8 个大阶段：

- **创建前后,**
- **挂载前后**
- **更新前后**
- **销毁前后**
- 以及一些特殊场景的生命周期

而 Vue3 引入了 组合式 API，生命周期的表现有所差异，详见下表：

| 生命周期v2    | [生命周期v3](https://cn.vuejs.org/api/composition-api-lifecycle.html) | 描述                                     |
| ------------- | ------------------------------------------------------------ | ---------------------------------------- |
| beforeCreate  | - （setup）                                                  | 组件实例被创建之初                       |
| created       | - （setup）                                                  | 组件实例已经完全创建                     |
| beforeMount   | onbeforeMount                                                | 组件挂载之前                             |
| mounted       | onmounted                                                    | 组件挂载到实例上去之后                   |
| beforeUpdate  | onbeforeUpdate                                               | 组件数据发生变化，更新之前               |
| updated       | onupdated                                                    | 数据数据更新之后                         |
| beforeDestroy | **onbeforeUnmount**                                          | 组件实例销毁之前                         |
| destroyed     | **onunmounted**                                              | 组件实例销毁之后                         |
| activated     | onactivated                                                  | keep-alive 缓存的组件激活时              |
| deactivated   | ondeactivated                                                | keep-alive 缓存的组件停用时调用          |
| errorCaptured | onerrorCaptured                                              | 捕获一个来自子孙组件的错误时被调用       |
| -             | **renderTracked**                                            | 调试钩子，响应式依赖被收集时调用         |
| -             | **renderTriggered**                                          | 调试钩子，响应式依赖被触发时调用         |
| -             | **serverPrefetch**                                           | ssr only，组件实例在服务器上被渲染前调用 |

通过一张图进行加深记忆与理解（下面这张是 Vue 官方的图）：

![img](https://cdn.nlark.com/yuque/0/2023/png/311219/1696992675306-a0ff5435-9d4b-4bd4-8329-25d8e1296a6b.png)

社区里面一张更好理解的图（结合了 Vue2、Vue3）：

![img](https://cdn.nlark.com/yuque/0/2023/png/311219/1696993596263-00deede0-0590-4efc-83cc-267437d0dbdd.png)

### 如何使用

#### 在选项式 API 中使用 Vue2 生命周期钩子

使用 选项API，生命周期钩子是被暴露 Vue实例上的选项。我们不需要导入任何东西，只需要调用这个方法并为这个生命周期钩子编写代码。

例如，假设我们想访问 mounted() 和 updated() 生命周期钩子，可以这么写：

```javascript
// 选项 API
<script>     
   export default {         
      mounted() {             
         console.log('mounted!')         
      },         
      updated() {             
         console.log('updated!')         
      }     
   }
</script> 
```

#### 在组合式 API 中使用 Vue3 生命周期钩子

在组合 API 中，我们需要将生命周期钩子导入到项目中，才能使用，这有助于保持项目的轻量性。

```javascript
// 组合 API
<script>
import { onMounted } from 'vue'

export default {
   setup () {
     onMounted(() => {
       console.log('mounted in the composition api!')
     })
   }
}
</script>
```

### 

### 常见生命周期的应用场景

- **beforeCreate**：通常用于插件开发中执行一些初始化任务
- **created**：组件初始化完毕，可以访问各种数据，获取接口数据等
- **mounted**：dom已创建，可用于获取访问数据和dom元素；访问子组件等。
- **beforeUpdate**：此时view层还未更新，可用于获取更新前各种状态
- **updated**：完成view层的更新，更新后，所有状态已是最新
- **beforeunmount**：实例被销毁前调用，可用于一些定时器或订阅的取消
- **unmounted**：销毁一个实例。可清理它与其它实例的连接，解绑它的全部指令及事件监听器



### 选项式 API 和组合式 API 上，生命周期存在的差异

组合式 API 的生命周期钩子函数命名发生了一些变化，并且去掉了 created 和 destroyed 钩子函数，而是分别使用 onBeforeMount 和 onBeforeUnmount 代替。这样的变化是为了更好地配合 Vue 3 中的 setup 函数使用。

**需要注意，在 Vue3 中，****setup 中没有 beforeCreate 和 created 的生命周期钩子。**这是因为因为在组合式 API 中，Vue 3 将组件的创建过程进行了一些调整和简化。 

在 Vue 2 的选项式 API 中，beforeCreate 生命周期钩子函数在组件实例被创建之前调用，在这个阶段，组件实例已经被创建，但是还没有完成数据的响应式处理、事件的初始化等。而 created 生命周期钩子函数则在组件实例创建完成后调用，此时已经能够访问到组件实例中的数据和方法。 

而在组合式 API 中，Vue 3 引入了一个新的入口函数 setup，它代替了 Vue 2 中的 beforeCreate 和 created 钩子函数。setup 函数在组件实例创建的早期被调用，这意味着在 setup 函数内部仍然可以进行一些初始化的操作，例如创建响应式数据、执行副作用代码、定义计算属性等。 

通过将初始化逻辑放在 setup 函数中，使得组合式 API 更加灵活和可组合，同时也减少了生命周期钩子函数的数量和复杂性。



### Vue3 调试钩子

这是重点，也是跟 vue2 存在大差异的点

Vue3 为我们提供了两个可用于调试目的的钩子。**这两个钩子仅在开发模式下可用，且在服务器端渲染期间不会被调用。**

1. onRenderTracked
2. onRenderTriggered

这两个事件都带有一个 debugger event，此事件告诉你哪个操作跟踪了组件以及该操作的目标对象和键。

以 onRenderTracked 为例。钩子接收 debugger event 作为参数。**此钩子事件能够实现当组件渲染时，追踪到响应式依赖的调用。**

```javascript
<div id="app">
  <button v-on:click="addToCart">Add to cart</button>
  <p>Cart({{ cart }})</p>
</div>

const app = Vue.createApp({
  data() {
    return {
      cart: 0
    }
  },
  renderTracked({ key, target, type }) {
    console.log({ key, target, type })
    /* 当组件第一次渲染时，这将被记录下来:
    {
      key: "cart",
      target: {
        cart: 0
      },
      type: "get"
    }
    */
  },
  methods: {
    addToCart() {
      this.cart += 1
    }
  }
})

app.mount('#app');
```

而 onRenderTriggered 此钩子事件告诉你**是什么操作触发了重新渲染，以及该操作的目标对象和键**。

```javascript
<div id="app">
  <button v-on:click="addToCart">Add to cart</button>
  <p>Cart({{ cart }})</p>
</div>

const app = Vue.createApp({
  data() {
    return {
      cart: 0
    }
  },
  renderTriggered({ key, target, type }) {
    console.log({ key, target, type })
  },
  methods: {
    addToCart() {
      this.cart += 1
      /* 这将导致renderTriggered调用
        {
          key: "cart",
          target: {
            cart: 1
          },
          type: "set"
        }
      */
    }
  }
})

app.mount('#app')
```
