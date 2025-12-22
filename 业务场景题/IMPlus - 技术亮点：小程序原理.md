# IM Plus 技术亮点：小程序原理

---

## IM Plus STAR

### 项目背景

IM Plus 是智能服务 SaaS 系统智能能力的下沉，把整个系统拆分成一个个独立的功能模块，对外输出。

- **服务对象是**：主要是各行各业的中小微商家
- **业务模式是**：主要是 B to C，B端是业务方的客服小二，C端就是支付宝上的用户（载体：H5 + 支付宝小程序）

### S：情况

智能服务 SaaS 业务增长到了瓶颈期，需要新的增涨点

### T：目标

为了把智能能力进一步帮助中小微商家

### A：解决

功能模块拆分

### R：结果

1. 智能服务对外的业务能力更加多样了（SaaS系统 - 页面 - 功能 api）

---

## 角色-困难-解决 RPSE

### R：角色

PC、H5、支付宝小程序、微信小程序端 SDK 的开发

### P：困难

1. 微信小程序的音视频互通功能受限于平台限制
2. 核心 IM 消息链路的多端连接调试
3. 功能模块的插件化打包配置

### S：解决

1. 通过阿里云绕开平台管控限制（金融云-腾讯云）
2. 优雅降级处理多端的兼容性问题（IM + websocket 连接超限：视频通话 -> 音视频文件）
3. 动态引入功能打包

### E：经验

1. 深入理解整个业务单个功能逻辑的运转
2. 多端适配业务经验

---

## webview 的弊端

js 可以通过操作 DOM，直接获取小程序内部的一些敏感数据，比如用户的信息，商家信息等等，那么小程序将毫无安全可言。

---

## 如何解决传统 H5 的安全管控问题

为了解决安全管控问题，小程序阻止开发者使用一些浏览器提供的比如页面跳转、操作 DOM、动态执行脚本等功能。因为 javascript 实在是太灵活了，浏览器的接口也很丰富，很容易就遗漏一些危险的接口，而且就算是禁用掉了所有感觉到危险的接口，也势必防不住浏览器内核的下次更新。指不定又会出现一些漏洞。

所以，要彻底解决这个问题，必须提供一个**沙箱环境**来运行开发者的 js 代码。这个沙箱环境没有任何浏览器相关接口，只提供纯 js 的解释执行环境。

---

## 从小程序说起，小程序解决了什么问题？

1. 性能高于 h5（base app）
2. 微信开放了统一入口，管理菜单
3. 微信提供登录
4. 微信提供全面分享引流
5. 快速的加载
6. 原生的体验
7. 易用且安全的微信数据开放
8. 开发简单和高效

---

## 小程序的双线程架构设计

小程序的架构模型有别与传统 web 单线程架构，小程序为**双线程架构**。

微信小程序的渲染层与逻辑层分别由两个线程管理，渲染层的界面使用 webview 进行渲染；逻辑层采用 JSCore 运行 JavaScript 代码。

由于渲染层与逻辑层分开，一个小程序有多个界面，所以渲染层对应存在多个 webview。这两个线程之间由 Native 层进行统一处理。无论是线程之间的通讯、数据的传递、网络请求都由 Native 层做转发。

```mermaid
flowchart TB
    subgraph 渲染层
        W1["Webview 1"]
        W2["Webview 2"]
        W3["Webview N"]
    end
    
    subgraph 逻辑层
        JS["JSCore\nJavaScript 代码"]
    end
    
    subgraph Native层
        N["Native 层\n统一处理"]
    end
    
    W1 <--> N
    W2 <--> N
    W3 <--> N
    JS <--> N
    
    style W1 fill:#4a9eff,stroke:#333,color:#fff
    style W2 fill:#4a9eff,stroke:#333,color:#fff
    style W3 fill:#4a9eff,stroke:#333,color:#fff
    style JS fill:#26a69a,stroke:#333,color:#fff
    style N fill:#ff9800,stroke:#333,color:#fff
```

多个 webview 就更加接近原生应用 APP 的用户体验。多个 webview 可以理解为多页面应用，有别于单页面应用 SPA，SPA 渲染页面是通过路由识别随后动态将页面挂载到 root 节点中去，如果单页面应用打开一个新的页面，需要先卸载掉当前页面结构，并且重新渲染。很显然原生 APP 并不是这个样子，比较明显的特征为从页面右侧向左划入一个新的页面，并且我们可以同时看到两个页面。

---

## 双线程对比单线程的优势在哪里？

### Native 层在双线程架构中起到怎样的作用？

双线程的好处不仅仅是一分为二而已，还有强大的 Native 层做背后支撑。

Native 层除了做一些资源的动态注入，还负责着很多的事情，请求的转发，离线存储，组件渲染等等。界面主要由成熟的 Web 技术渲染，辅之以大量的接口提供丰富的客户端原生能力。同时，每个小程序页面都是用不同的 WebView 去渲染，这样可以提供更好的交互体验，更贴近原生体验，也避免了单个 WebView 的任务过于繁重。此外，界面渲染这一块还定义了一套内置组件以统一体验，并且提供一些基础和通用的能力，进一步降低开发者的学习门槛。值得一提的是，内置组件有一部分较复杂组件是用客户端原生渲染的，以提供更好的性能。

---

## 为什么不用 HTML 语法和 WebComponents 来实现渲染，而是选择自定义？

- **管控与安全**：web 技术可以通过脚本获取修改页面敏感内容或者随意跳转其它页面
- **能力有限**：会限制小程序的表现形式
- **标签众多**：增加理解成本

所以，小程序不能直接使用 html 标签渲染页面，其提供了 10 多个内置组件来收敛 web 标签，并且提供一个 JavaScript 沙箱环境来避免 js 访问任何浏览器 api。

---

## webview-pageFrame 设计原理

pageFrame 注入的脚本与 pages/index 渲染层 webview 是一样的。正式因为 pageFrame 快速启动技术，就像一个工厂一样，可以快速生成 webview 的基础格式。在这其中 pageFrame 就是业务 webview 的模板。

### pageframe.html 快速打开新页面

小程序每个视图层页面内容都是通过 pageframe.html 模板来生成的，包括小程序启动的首页：

- 首页启动时，即第一次通过 pageframe.html 生成内容后，后台服务会缓存 pageframe.html 模板首次生成的 html 内容。
- 非首次新打开页面时，页面请求的 pageframe.html 内容直接走后台缓存
- 非首次新打开页面时，pageframe.html 页面引入的外链 js 资源，走本地缓存

这样在后续新打开页面时，都会走缓存的 pageframe 的内容，避免重复生成，快速打开一个新页面。

### 既然每个视图层页面由 pageframe 模板生成，那么小程序每个页面独有的页面内容如 dom 和样式等如何生成呢？

这主要是利用 nw.js 的 executeScript 方法来执行一段 js 脚本来**注入**当前页面相关的代码，包括当前页面的配置，注入当前页的 css 以及当前页面的 virtual dom 的生成。

视图页面生成的 dom 结构中，document.body 已无 pageframe.html 模板中对应 body 中的 script 内容，这是因为视图层的 WAWebview.js 在通过 virtual dom 生成真实 dom 过程中，它会挂载到页面的 document.body 上，覆盖掉 pageframe.html 模板中对应 document.body 的内容。

---

## WebComponent 原理

抽离自定义组件为了提高复用率，提升开发效率。

自定义元素类必须继承自 window 内置的 HTML 相关类，这些类位于 `window.<HTML*Element>`，他们都继承自 HTMLElement 类。

---

## Exparser 原理

Exparser 是微信小程序的组件组织框架，内置在小程序基础库中，为小程序提供各种各样的组件支撑。内置组件和自定义组件都由 Exparser 组织管理。

### Exparser 的主要特点包括以下几点：

- **基于 Shadow DOM 模型**：模型上与 WebComponents 的 Shadow DOM 高度相似，但不依赖浏览器的原生支持，也没有其他依赖库；实现时，还针对性地增加了其他 API 以支持小程序组件编程。
- **可在纯 JS 环境中运行**：这意味着逻辑层也具有一定的组件树组织能力。
- **高效轻量**：性能表现好，在组件实例极多的环境下表现尤其优异，同时代码尺寸也较小。

在自定义组件的概念基础上，我们可以把所有组件都进行分离，这样，各个组件也将具有各自独立的逻辑空间。每个组件都分别拥有自己的独立的数据、setData 调用。

整个页面节点树实质上被拆分成了若干个 ShadowTree（页面的 body 实质上也是一个组件，因而也是一个 ShadowTree）最终组成了小程序中的 **Composed Tree**。

小程序中，所有节点树相关的操作都依赖于 Exparser，包括 WXML 到页面最终节点树的构建、createSelectorQuery 调用和自定义组件特性等。

---

## 为什么要实现 wxs 页面快速计算实时性？

如果业务场景为手势识别之类的，监听事件不断的触发，数据不断的改变。这样的业务场景中，可以想像，如果坐标值不断改变的话，在逻辑与视图分开的双线程架构中，线程与线程之间的通讯是非常频繁的，会有很大的性能问题。所以微信开放了一个标记 `<WXS>`，可以在渲染层写部分 js 逻辑。这样话就可以在渲染层单独处理频繁改变的数据，这样的话就避免了线程与线程之间频繁通讯导致的性能和延时问题。

---

## WXSS 编译-加载

WXSS 文件编译后成 wxss.js 文件，index.wxss 文件会先通过 **WCSC** 可执行程序文件编译成 js 文件。并不是直接编译成 css 文件。

在渲染层的一个 `<script>` 标签中，编译后的代码是通过 eval 方法注入执行的。

---

## WXML -- VirtualDOM 渲染流程

generateFunc 就是接受动态数据，并生成虚拟 DOM 树的函数：

- 如果没有 generateFunc 那么 body 标记内部展示 `decodeName + "not found"`，并输出错误日志
- 如果有，检查 window 或 global 环境中自定义事件 CustomEvent 是否存在
- document.dispatchEvent 触发自定义事件，将 generateFunc 当作参数传递给底层渲染库
- 在触发自定义事件的时候，添加当前时间节点，可以理解为生命周期 `pageFrame_generateFunc_ready`

---

## 小程序事件

- 事件是视图层到逻辑层的通讯方式。
- 事件可以将用户的行为反馈到逻辑层进行处理。
- 事件可以绑定在组件上，当达到触发事件，就会执行逻辑层中对应的事件处理函数。
- 事件对象可以携带额外信息，如 id、dataset、touches 等等。

小程序的事件都是和 js 原生事件相互转换的，小程序的 tap 事件底层是由 web 的 mouseup 事件转换来的。小程序 tap 事件的触发分为几个过程，首先底层实现是用 web 的 mouseup 事件触发了 tap 事件，底层为 window 绑定捕获阶段的 mouseup 事件。

---

## 通信系统的设计

内置组件中有部分组件是利用到客户端原生提供的能力，既然需要客户端原生提供的能力，那就会涉及到渲染层与客户端的交互通信。这层通信机制在 iOS 和安卓系统的实现方式并不一样，iOS 是利用了 WKWebView 的提供 messageHandlers 特性，而在安卓则是往 WebView 的 window 对象注入一个原生方法，最终会封装成 **WeiXinJSBridge** 这样一个兼容层。在微信开发者工具中则是使用了 websocket 进行了封装。

在微信小程序执行过程中，Native 层，也就是客户端层分别向渲染层与逻辑层注入 WeixinJSBridge 以达到线程通讯的目的，WeixinJSBridge 的 `<script>` 标记注入。

### WeixinJSBridge 提供了如下几个方法：

- **invoke** - 调用 Native API，以 api 方式调用开发工具提供的基础能力，并提供对应 api 执行后的回调。
- **invokeCallbackHandler** - Native 传递 invoke 方法回调结果
- **on** - 用来收集小程序开发者工具触发的事件回调
- **publish** - 渲染层发布消息，用来向逻辑业务层发送消息，也就是说要调用逻辑层的事件方法
- **subscribe** - 订阅逻辑层消息
- **subscribeHandler** - 视图层和逻辑层消息订阅转发
- **setCustomPublishHandler** - 自定义消息转发

---

## 生命周期

每个页面都是一个 webview 实例，所以我们一共有多少页面，理论上来讲最多就会有多少个 webview 实例。

在逻辑层就不一样了，内部只有**一个 APP 实例**，所有页面里面的写的逻辑都在一个逻辑线程中执行。

```mermaid
flowchart TB
    subgraph 渲染层
        W1["Webview 1\n页面1"]
        W2["Webview 2\n页面2"]
        WN["Webview N\n页面N"]
    end
    
    subgraph 逻辑层
        APP["唯一 APP 实例\n所有页面逻辑"]
    end
    
    W1 <--> APP
    W2 <--> APP
    WN <--> APP
    
    style W1 fill:#4a9eff,stroke:#333,color:#fff
    style W2 fill:#4a9eff,stroke:#333,color:#fff
    style WN fill:#4a9eff,stroke:#333,color:#fff
    style APP fill:#26a69a,stroke:#333,color:#fff
```

---

## 小程序路由设计

采用多个 webview 这种方式类似于多页面应用，因为多页面应用可以保留前一个页面的状态，所以路由的内部是基于多页应用的架构实现的。

在逻辑层中有打开新页面 navigateTo、重定向 redirectTo、页面返回 navigateBack 等，开发者通过官网提供的 API 触发。

无论是渲染层用户触发的行为，还是逻辑层 API 触发的行为，这个行为都会被发送到 Native 层，有 Native 层统一控制路由。

对于 webview 的添加或删除都会有一个**路由栈**来维护。

### 小程序场景中路由变化相对应的栈变化：

- **小程序初始化**的时候需要推入首页，新页面入栈。
- **打开新页面**对应 navigateTo，新页面入栈
- **页面重定向** redirectTo，当前页面出栈，而后新页面入栈。
- **页面回退** navigateBack，页面一直出栈，到达指定页面停止。
- **Tab 切换** switchTab，页面全部出栈，只留下新的 Tab 页面。
- **重新加载** reLaunch，页面全部出栈，只留下新的页面。

---

## 渲染层基础库 WAWebview

1. **core-js 模块**：负责初始化框架 js 代码，编译 js，加载业务逻辑 js 等功能
2. **Foundation**：基础模块，里面包含了一些 api，有 EventEmitter 事件的发布订阅，配置的 Ready 事件，基础库 Ready 事件，Bridge Ready 事件，env、global 环境变量。其中 EventEmitter 的核心就是事件触发与事件监听器功能的封装。
3. **WeixinJSBridge**：通讯模块，包含有 on、publish、invoke、subscribe、invokeCallbackHandler、subscribeHandler。只是对 Native 注入通讯 api 的封装，便于内部调用。
4. **异常监听模块**：基础库内针对 promise 或者 js 等异常事件的监听处理
5. **日志打印模块**：包含 wxNativeConsole、__webviewConsole__、wxConsole、wxPerfConsole 等
6. **系统函数和第三方函数模块**：调用系统函数、包装系统函数、调用小程序或插件函数
7. **Report 信息上报模块**：内部包含了非常多种类的上报 api 及异常监听 api
8. **Exparser 组件系统模块**：WXML 文件经过 WCC 编译器编译成 js 文件，生成 $gwx() 函数，$gwx() 函数接收文件路径和动态数据生成 virtualDOM，Exparser 组件系统就是将 virtualDOM 转化成 HTML 标记
9. **VirtualDOM 模块**：主要模拟了 DOM 接口上面的 element() 对象
10. **默认样式注入模块**

---

## 逻辑层基础库 WAService

1. **core-js 模块**
2. **Foundation**：基础模块
3. **WeixinJSBridge**：通讯模块
4. **NativeBuffer 模块**：javascript 语言自身只有字符串数据类型，没有二进制数据类型。但在处理像 TCP 流或文件流时，必须使用到二进制数据。因此在微信小程序中，定义了一个 NativeBuffer 模块，该模块用来创建一个专门存放二进制数据的缓存区。
5. **日志打印模块**
6. **WeixinWorker 模块**：包含创建 worker、结束当前 worker、发送数据请求、监听回调等方法
7. **JSContext 模块**：JsContext 是 js 代码执行的上下文对象，相当于一个 webview 中的 window 对象
8. **appServiceEngine 模块**：提供了 App、Page、Component、Behavior、getApp、getCurrentPages 等框架的基本对外接口
