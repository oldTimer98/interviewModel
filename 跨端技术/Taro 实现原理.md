当一个语言的能力不足，而当前环境下又没有其他选择时，那么它最终会变成编译的目标语言

## 基础

- Taro 是什么：一个支持 vue、react dsl 的小程序/h5 转译框架
- 为什么会出现 taro：原生小程序存在很多问题：语法不兼容、工程化能力弱等，严重影响开发效率，因此必然会出现许多基于成熟语言、框架、工具链构建小程序的方案
- 基本原理：

- taro3 之前是一个重编译，轻运行时的方案，简单理解就是会在编译时将 dsl 转译为平台兼容的代码，再放到平台上跑，这种方式有一些硬伤：jsx 支持程度不高、和 react dsl 强绑定等
- taro3 之后则彻底重构底层架构，修改为轻编译，重运行时的方案，直接在运行环境中注入模拟 dom、bom api，抹平平台差异，让代码能够无缝迁移到不同环境中运行

## 进阶

### 核心原理：

将小程序相关操作抽象模拟为 dom & bom 接口，确保能正常生成 vdom 树，之后基于 template 标签递归渲染 vdom 树

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1664900834094-de61a9ff-cd62-46a1-ba25-0a1533eb8516.png)

- 虚拟 dom 树：

- 实现一堆适配小程序的 dom/bom 接口
- 实现 react-reconciler 的 hostConfig 配置，即在 hostConfig 的方法中调用对应的 Taro BOM/DOM 的 API；
- 实现 render 函数（类似于 ReactDOM.render）方法，可以看成是创建 Taro DOM Tree 的容器；

- 渲染虚拟 dom 树：在 template 中递归渲染 vdom 数据

- 将组件生成为小程序 template 模板代码：

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1664901262458-5a91a75d-35ca-4ab4-9398-473702d2c13a.png)

- 递归遍历虚拟 dom 树，根据节点类型动态渲染对应 template 代码

- 为什么需要这么绕？

- 本质上是需要抹平命令式的 dom 接口与声明式的小程序 dsl 之间的差异

- 优点：

- 无 DSL 限制：无论是你们团队是 React 还是 Vue 技术栈，都能够使用 Taro 开发
- 模版动态构建：和之前模版通过编译生成的不同，Taro Next 的模版是固定的，然后基于组件的 template，动态 “递归” 渲染整棵 Taro DOM 树。
- 新特性无缝支持：由于 Taro Next 本质上是将 React/Vue 运行在小程序上，因此，各种新特性也就无缝支持了。
- 扩展性强：不同平台只需要修改 dom/bom api 即可

### taro3 的问题：

- 引入 react、vue 包，运行时较大
- 动态渲染，性能较差
- 需要从 js 线程通过 setData 接口，向渲染线程传输 vdom 树数据，这个数据很大，在跨线程通讯场景下可能造成性能问题
- 产物与源码结构差异极大，调试难度高
- 组件代码重复打包。。。

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1664902734990-73e74e46-0821-4cea-a2e0-2f0d63100220.png)



资料：

- [https://juejin.cn/post/6844904036743774216](https://juejin.cn/post/6844904036743774216#heading-11)