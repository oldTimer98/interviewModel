1. ## 基础 

  - 是什么：

  ```javascript
  <template>
     <div v-for="item in arr" v-if v-model></div>
  ```

  - 为什么：主要用解决一些，需要直接操作 dom 元素的场景，（本质上，就是一种命令式的 dom 操作接口）
  - 怎么做：
  
  - 指令调用语法：指令名、参数(binding.arg)、装饰符、表达式，4 重元素组成
  - 以 vue3 来说： 事件回调以及事件发生的时机
  
  - created、beforeMount、mounted、beforeUpdate、updated、beforeUnmount、unmounted
  
  - 事件回调中，会传递四个参数：
  
  - 绑定了指令的节点元素
  - 绑定指，里面包含了表达式、值、旧值、vue 实例对象。。。
  - vnode 节点
  - 变更之前的 vnode 节点
  
  ```javascript
  app.directive("blue", {
    created(el){},
    mounted(el,binding,vnode,preVnode) {
      el.style.color = "blue"
      console.log(binding)
    }
  })
  
  <div v-on:click.stop="handleClick">
  ```
  
  - 指令是用来处理一些，声明式成本较高的场景，触发不同生命周期事件，我们可以在事件中拿到真实的 dom 节点元素，直接操作该节点
  
  ## 进阶
  
  ### 实现原理(vue3)
  
  - 入口：使用指令后，setup 函数中的组件渲染逻辑会被包裹进 `withDirectives`函数
  
  ```javascript
  const _sfc_main$1 = {
    expose: [],
    props: {
      msg: String
    },
    setup(__props) {
      reactive({ count: 0 });
      return (_ctx, _cache) => {
        const _directive_test = resolveDirective("test");
        return withDirectives((openBlock(), createBlock("div", null, [
          _hoisted_1
        ], 512)), [
          [_directive_test, __props.msg]
        ]);
      };
    }
  };
  
  const _sfc_main = {
    expose: [],
    setup(__props) {
      return (_ctx, _cache) => {
        return openBlock(), createBlock(_sfc_main$1, { msg: "Hello Vue 3 + Vite" });
      };
    }
  };
  ```
  
  - `withDirectives`：给 vnode 挂载 dirs 属性，记录改节点的所有指令调用
  - `render 文件中`：在渲染过程的不同阶段，触发不同的指令生命周期钩子
  
  - 创建element 之后，立即触发 created 钩子
  
  ### 应用场景：
  
  1. 需要对真实 dom 做操作的时候，推荐一些微调场景；2. 希望剥离组件渲染逻辑跟一些功能(权限)逻辑的话
  
  - 元素级别的权限控制
  - 图像按需加载
  - 无限滚动
  - 自定义埋点
  - 按钮防抖节流
  - 下拉菜单，点击菜单之外的区域关闭菜单
  - 。。。
  
  ### 设计意图：
  
  - vue 提供 sfc 模板当中，template 是 html 的超集，通过自定义指令方式，补齐这种 for、if 的能力；相对的，jsx 是 js 的超集，天然自带 if、for 这些能力，所以不需要指令；
  - mvvm 这种声明式的 ui 开发场景下，会比命令式简洁的多，也清晰的多，但是实践中，这种方式本身也会有缺陷，所以 vue 跟 react 其实都有提供一个口子，让我们直接操作 dom
  
  - vue 就是指令，这种高内聚低耦合方式，将 dom 操作相关逻辑收敛到同一个地方，相对来说更可控，代码结构也更顺畅，容易理解
  - react 里面就是直接给我们节点的引用，组件的“声明”逻辑跟 dom 的操作逻辑，是混在一起
  
  - 实践：
  
  - vue3 之后不推荐直接用在自定义组件上，因为自定义组件可能会有多个根节点，此时指令失效
  - 指令中不推荐直接修改组件状态，因为指令与组件逻辑上就应该是解耦的
