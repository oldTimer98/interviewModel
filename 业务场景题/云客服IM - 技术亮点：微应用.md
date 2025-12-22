### 云客服 IM

项目背景：

云客服 IM SaaS 是支付宝服务链路的重要一环，是服务蚂蚁生态商家，围绕“沟通”和“运营”能力重点打造的一站式、多端互通、可定制化的智慧商客沟通平台
服务对象是：基金、保险、证券、银行等偏金融行业的公司

业务模式是：主要是B to C，B端是业务方的客服小二，C端就是支付宝上的用户(载体：H5 + 支付宝小程序)

业务规模：目前上千家头部金融公司 + 上百万的长尾的中小商家接入到支付宝里，每天有上亿条的IM消息量

云客服目标：1 支付宝里行业场景的覆盖量(次要指标: 服务量)  

​                  2 机器人的自助解决率 (智能能力) 

​                  3 提升服务体验 (解决 B2C 的各种难点)

业务痛点: 针对不同行业，不同规模的公司，满足他们的需求，提升服务体验

短期规划: 1 业务能力拆分，PaaS化对外输出技术  2 技术在 AIGC方向突破 (提升智能化chatGPT)
长期规划: 1 业务上打通更多场景，建立更多链接(钉钉、HKPay)  

​              2 多模态交互(AR/VR等)



### 角色-困难-解决 RPSE

**R：****角色**

负责云客服IM主应用框架的搭建，以及业务模块的拆分

知识库、机器人自助等模块的重构与维护

整体项目工程化、性能优化等

P：困难

1 业务在正常推进，又抽时间技术改造，工作量很大

2 qiankun V1.0版本还要踩坑

3 系统服务的是基金证券保险银行等客户，对系统稳定性要求很高，所以承受的精神压力也大

S：解决

1 保障业务正常推进，子应用上架前，代码需要同步到子应用

2 制定子应用上架的降级方案，测试同学也帮忙验证功能

3 人力紧张：就云动了其他小组的前端同学帮忙进行技术栈的升级

E：经验

1 业务不忙的时候，再进行技术改造，组员们在身体、心理上更能接受

2 改造前，需要前瞻性的考虑各种突发状况，制定解决预案

3 考虑ROI是否划算，非核心功能模块能正常跑就行(稳定是第一位的)，新业务才上新技术



### 微应用 STAR

(技术的架构是什么？我在这里面的位置？我做了什么事情？解决了谁的什么问题？取得了什么结果？沉淀了什么东西？)

**S：****情况**

主要是基于2方面的原因：

1 业务: 业务整合需要 (iframe 隔离性太好了，但是有点笨重)

2 技术:

1: 老版云客服是一个4年+的前端项目，功能多、体积大，编译打包速度很慢 

2: 技术栈是roadhog版本，比较老，难升级，在音视频通话、编辑器的支持上不友好 

3: 基础链路代码与业务模块强耦合，代码臃肿 

4: 测试、预发环境抢占频繁，发版时间难以协调，代码回滚影响面大



**T**：**目标**

0 满足业务整合需要

1 IM的各个功能模块解偶，能独立开发、部署

2 业务方定制化代码拆离

3 项目框架升级

4 整个项目的性能优化



**A：****行动**

1 用qiankun微应用，把项目拆分成主应用+6个独立的功能模块，各模块体积只有以前的1/7 

2 性能优化 -  FCP

3 按模块功能进行SplitChunk(maxSize/minSize)，应用间的公共模块单独打包，利用CDN直接共享(MF模块联邦)

4 主子应用内合并压缩js、css

5 分页加载、懒加载、虚拟列表等



**R：****结果**

**业务上的价值**

1 使用 qiankun 对系统进行微应用改造，使 IM 工作台可插拔的接入其他系统的页面，或者云客服的功能模块独立部署，插入商户的系统中运行，提升了整个系统间集成的灵活度，帮助 300+ 大型金融服务公司入住支付宝
(**简单路由配置+通信接口api 就能无开发迭代的整合业务方的页面**)

**技术上的价值**

2: 老版云客服是一个 5 年的单页面应用，系统存在功能耦合严重，体积大、编译慢、测试预发环境抢占频繁等问题， 通过微应用拆分和构建优化，使开发编译速度显著提升(50s -> 5s)；
通过资源优化、服务端优化、页面渲染优化、 升级技术栈、IM 消息通信优化等手段, 减少 IM 首屏的渲染时间(4s -> 2s)，首屏用户留存率提高(65% -> 90%) 



### 微前端的优缺点

微前端优点：

1 技术栈无关: 主框架不限制接入应用的技术栈，子应用可自主选择技术栈,降低了技术选型的难度和成本。

2 独立开发/部署: 各个团队之间可以仓库独立、单独部署、测试、发版，微应用之间运行时互不依赖，有独立的状态管理，提高了单个应用的可维护性和可扩展性。

3 增量升级: 当一个应用庞大之后，技术升级或重构相当麻烦，而微应用具备渐进式升级的特性

4 提升效率: 应用越庞大，越难以维护，协作效率越低下。微应用可以进行拆分，从而实现团队自治，提升协同开发效率



微前端缺点：

1 应用的拆分基础依赖于基础设施的构建，当多个应用依赖于同一基础设施，那么后续的维护工作需要慎重

2 子应用拆分的粒度越小，便意味着架构会变得复杂、维护成本变高，微前端适用于大型Web应用，但对于小型应用程序，可能会带来过度的复杂度和不必要的开销

3 技术栈一旦多样化，便意味着技术栈可能会变的混乱

4 性能问题：微前端需要在运行时动态加载模块，可能会影响应用程序的性能和响应速度



### 为什么用微前端

玉伯：微前端的前提，有一个主体应用，然后就是微组件或微应用，解决的是可控体系下的前端协同开发问题(包含：空间分离带来的协作和时间延续带来旧应用的升级维护)



微应用的核心价值：技术栈无关

1 不限制技术栈，接入范围广 

2 向后兼容年久的旧应用

3 向前兼容：架构稳定，面向未来



**微应用都需要解决的3个核心问题：路由、隔离、通信**



### 为什么选 qiankun

主要有两个方面的考量：

第一步：分析我们的需求：

1 业务上：云客服 IM 需要融合其他公司的应用页面，需要一个支持多技术栈、灵活可插拔页面的架构

2 技术上：云客服已经由一个简单的 single-spa 单页面应用，逐步迭代成为了一个巨石应用，开发维护困难。

第二步：各种方案的优劣势对比

1 考虑到云客服的金融服务属性，对系统稳定性要求很高，qiankun是蚂蚁技术中台开源的框架，线上有成熟的项目，即便出了问题，也能及时定位问题和解决。

2 市面上有一些模块化的解决方案，比如npm、web Component、动态script方案都有各自的优缺点，不能完全满足项目需要。qiankun是微应用的一个系统解决方案

综合权衡比较下来，qiankun最符合项目需求



### 方案一 模块化方案

NPM包：将微应用打包成独立的NPM包，然后在主应用中安装和使用；

Web Components：将微应用封装成自定义组件，在主应用中注册使用；

Webpack5 模块联邦：借助的Module Federation把资源分块打包,页面组件动态加载；

动态Script：在主应用中动态切换微应用的 Script 脚本来实现微前端；

micro-app： webcomponent + qiankun 沙箱

hel-micro ：基于webpack5 模块联邦 + npm 包的一个运行时的微模块方案：共享组件



### 方案二 iframe

优点：

1 原生就支持js、css、dom隔离，iframe页面之间互不影响

2 每个iframe独立开发、部署，相当于一个独立的应用

缺点：

0 页面刷新一下，路由的状态丢失，iframe上的url状态就丢失了

1 iframe启动，都是需要重新加载资源, 容易白屏

2 iframe之间做交互、信息共享、数据更新等，通信繁琐

3 弹框，iframe页面需要resize成整个页面，影响页面展示

4 对iframe页面的生命周期的状态较难获取，比如iframe子应用加载、预渲染、渲染后、卸载、卸载后、加载报错等情况



### 方案三 无界(tx)

无界微前端是一款基于 Web Components + iframe 微前端框架.

具备成本低、速度快、原生隔离等一系列优点。

其能够完善的解决适配成本、样式隔离、运行性能、页面白屏、子应用通信、子应用保活、多应用激活、vite框架支持、应用共享等

**参考无界官网**：

![img](https://cdn.nlark.com/yuque/0/2023/png/1566145/1702866162854-19f0403d-14e7-4145-a94f-75d32ca42ea1.png)

![img](https://cdn.nlark.com/yuque/0/2023/png/1566145/1703417105126-6e33e564-4686-46fc-9ad7-926f63aaa30f.png)

### 方案四 qiankun

qiankun 是一个基于 single-spa的微前端框架，具备 js 沙箱、样式隔离、HTML Loader、预加载 等微前端系统所需的能力。

主要完成：初始化、注册子应用、设置配置全局状态、设置默认进入子应用、启动应用。



#### js 沙箱隔离：proxySandbox

基于ES6的 Proxy 的 沙箱能力

proxySandbox 代理沙箱：
解析 script 标签，用 with 语句包裹起来，然后把 Proxy 包装的 fakeWindow 作为第一个参数传进去。
（with做的是扩展语句的作用域链，也就是将 Proxy (fakeWindow) 添加到作用域链的顶部），让子应用有一个独立的作用域。


其中，createFakeWindow 基于原始 window 伪造了一个新的 window 对象，同时借助 Proxy 对象定义了该伪造 window 的基本操作的行为，包括：set、get 等等

setter：这里就是把对 window 属性的修改，全局属性的操作代理到 fakeWindow 上。

getter：就是对于属性值的获取做了一些限制，防止逃离沙箱环境获取到真正的 window。

所有全局变量就会被挂载到了 fakeWindow 上，而不是真正的全局 window 上，当应用被卸载时，对应的 Proxy 会被清除，所以不会导致全局污染。

- SnapshotSandbox（qiankun 2.0 版本支持）：在不支持 proxy 特性的浏览器（IE11）上，使用快照模式来保证兼容性。



SanpshotSandbox：快照沙箱

原理：**把主应用的window对象做浅拷贝，将window的键值对存成一个Hash Map。之后无论微应用对window做任何改动，当要在恢复环境时，把这个Hash Map又应用到window上就可以了**



LegacySandbox

**通过监听对window的修改来直接****记录Diff****内容，****反推出****原来环境的window**



#### 样式隔离：shadowDOM +  Scoped CSS

ShadowDOM 允许将隐藏的 DOM 树附加到常规的 DOM 树中——它以 shadow root 节点为起始根节点，在这个根节点的下方，可以是任意元素，和普通的 DOM 元素一样

- 将微应用插入到 qiankun 创建好的 shadow Tree 中，微应用的样式（包括动态插入的样式）都会被挂载到这个 shadow Host 节点下，最终整个应用的所有 DOM 都会被绘制成一颗shadow tree。

**原理：**Shadow DOM 内部所有节点的样式对树外面的节点是无效的，因此微应用的样式只会作用在 Shadow Tree 内部，就实现了样式隔离。

![img](https://cdn.nlark.com/yuque/0/2022/png/25494641/1644398729903-b547b862-bf11-475a-a11f-74560cca1583.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25494641/1644398741920-a35c10ae-f134-4877-9b84-e05a0e743409.png)



#### qiankun 优点 缺点

![img](https://cdn.nlark.com/yuque/0/2023/png/1566145/1702866191024-2fc3ae83-2324-4d6c-ad2f-c0980c3420cb.png)



#### modal 弹框样式丢失

核心问题就是modal是默认挂载在body根节点下的，当主子应用UI样式不一样时，就会出现Modal样式被覆盖的情况

解法：子应用写个方法来覆盖弹框的body.appendChildren 方法，然后让弹框就在子应用单独的一个div上(一直在子应用上)



#### 微应用间的通信机制

1 基于 URL 

2 CustomEvent 浏览器的事件总线

3 基于 props

简单概括下：通过主应用创建一个全局的共享状态 gloabalState ，各个子应用可以获取到 props 全局状态，并监听其变化

简单来讲就是发布-订阅模式，就是通过订阅全局变量的修改状态来实现通信 （onGlobalStateChange、setGlobalState）



#### 资源加载：映射表

如果子应用比较多，就会存在之间重复依赖的场景？

在主应用中维护一个语义化版本的映射表，在运行时动态加载，能确保最大程度的依赖复用

公共资源抽离，指向同一个 cdn 地址；



#### qiankun 加载子应用时做了什么

当我们配置子应用的 entry 后，qiankun 会去通过 fetch 获取到子应用的 html 字符串（这就是为什么需要子应用资源允许跨域） 拿到 html 字符串后，会调用 processTpl 方法通过一大堆正则去匹配获取 html 中对应的 js(内联、外联)、css(内联、外联)、注释、入口脚本 entry 等等



### 微应用 优点：

1  增量升级（影响范围小）

2 支持多框架（灵活）

3 独立部署（安全）

4 共享组件库（便捷）（babel-plugin-import 插件 抽离公共组件，按需加载）

5 团队自治（沟通成本小）

![img](https://cdn.nlark.com/yuque/0/2022/png/25494641/1644388003996-15266f33-2549-4d6c-aa48-110d1efe0b9b.png)



### 微应用 缺点

1有效的负载变大 (框架和依赖项更加复杂)

2 管理的复杂性 （一个应用一个库、部署、迭代、版本管理）



### systemjs

[systemjs](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fsystemjs%2Fsystemjs) 是一个标准的模块加载器，single-spa 项目中可以通过 systemjs 在浏览器中下载并执行子应用



### root config（根配置）

root config 就是运行一个微应用的核心功能，称之为 桥接器，通过 systemsjs 设置每一个微应用的导入文件(js/css)

```javascript
<script type="systemjs-importmap">
  {
  "imports": {
    "@spa/spa": "//localhost:8500/spa-spa.js"
  }
}
</script>
```

再通过 single-spa registerApplication **注册** 每一个微应用

```javascript
// single-spa-config.js
import { registerApplication, start } from 'single-spa';

// Simple usage
registerApplication(
  'app2',
  () => import('src/app2/main.js'),
  (location) => location.pathname.startsWith('/app2'),
  { some: 'value' }
);

// Config with more expressive API
registerApplication({
  name: 'app1',
  app: () => import('src/app1/main.js'),
  activeWhen: '/app1',
  customProps: {
    some: 'value',
  }
);
start();
```

生成一个 import-maps，从而达到通过 桥接器 串联每一个微应用, 实现一个完整应用的效果



### 应用的生命周期

在一个 single-spa 页面，注册的应用会经过下载(loaded)、初始化(initialized)、挂载(mounted)、卸载(unmounted) 和 unloaded（移除）等过程。single-spa 会通过“生命周期”为这些过程提供钩子函数。



生命周期函数使用 props 传参

```javascript
function bootstrap(props) {
  const {
    name,        // 应用名称
    singleSpa,   // singleSpa实例
    mountParcel, // 手动挂载的函数
    customProps  // 自定义属性
  } = props;     // Props 会传给每个生命周期函数
  return Promise.resolve();
}
```

可能使用到的场景：

- 各个应用共享一个公共的 access token
- 下发初始化信息，如渲染目标
- 传递对事件总线（event bus）的引用，方便各应用之间进行通信

注意如果没有提供自定义参数，则 props.customProps 默认会返回一个空对象。



#### 下载



#### 初始化

#### (自定义参数)

```javascript
// root.application.js
singleSpa.registerApplication({
  name: 'app1',
  activeWhen,
  app,
  customProps: { authToken: "d83jD63UdZ6RS6f70D0" }
});
singleSpa.registerApplication({
  name: 'app1',
  activeWhen,
  app,
  customProps: (name, location) => {
    return { authToken: "d83jD63UdZ6RS6f70D0" };
  }
});


export function mount(props) {
  console.log(props.authToken); // 可以在 app1 中获取到authToken参数
  return reactLifecycles.mount(props);
}
```



#### 挂载

每当应用的activity function返回 true，但该应用处于未挂载状态时，挂载的生命周期函数就会被调用。调用时，函数会根据URL来确定当前被激活的路由，创建DOM元素、监听DOM事件等以向用户呈现渲染的内容。任何子路由的改变（如hashchange或popstate等）不会再次触发mount，需要各应用自行处理

```javascript
export function mount(props) {
  return Promise
    .resolve()
    .then(() => {
      // Do framework UI rendering here
      console.log('mounted!')
    });
}
```

#### 卸载

每当应用的 activity function 返回 false，但该应用已挂载时，卸载的生命周期函数就会被调用。卸载函数被调用时，会清理在挂载应用时被创建的DOM元素、事件监听、内存、全局变量和消息订阅等。

```javascript
export function unmount(props) {
  return Promise
    .resolve()
    .then(() => {
      // Do framework UI unrendering here
      console.log('unmounted!');
    });
}
```

#### 移除

“移除”生命周期函数的实现是可选的，它只有在 unloadApplication 被调用时才会触发。如果一个已注册的应用没有实现这个生命周期函数，则假设这个应用无需被移除。

移除的目的是各应用在移除之前执行部分逻辑，一旦应用被移除,它的状态将会变成 NOT_LOADED，下次激活时会被重新初始化。

移除函数的设计动机是对所有注册的应用实现“热下载”，不过在其他场景中也非常有用，比如想要重新初始化一个应用，且在重新初始化之前执行一些逻辑操作时



#### 超时

默认情况下，所有注册的应用遵循 全局超时配置，但对于每个应用，也可以通过在主入口文件导出一个timeouts 对象来重新定义超时时间。millis 指的是最终控制台输出警告的毫秒数，warningMillis 指的是将警告打印到控制台(间隔)的毫秒数

```javascript
export function bootstrap(props) {...}
export function mount(props) {...}
export function unmount(props) {...}
export const timeouts = {
  bootstrap: {
    millis: 5000,
    dieOnTimeout: true,
    warningMillis: 2500,
  },
  mount: {
    millis: 5000,
    dieOnTimeout: false,
    warningMillis: 2500,
  },
  unmount: {
    millis: 5000,
    dieOnTimeout: true,
    warningMillis: 2500,
  },
  unload: {
    millis: 5000,
    dieOnTimeout: true,
    warningMillis: 2500,
  },
};
```



#### Parcels

是一个与框架无关的组件，由一系列功能构成，可以被应用手动挂载，无需担心由哪种框架实现。Parcels 和注册应用的api一致，不同之处在于parcel组件需要手动挂载，而不是通过activity方法被激活。



一个 parcel 可以大到一个应用，也可以小至一个组件，可以用任何语言实现，只要能导出正确的生命周期事件即可。在 single-spa 应用中，SPA可能会包括很多个注册应用，也可以包含很多 parcel。通常情况下我们建议在挂载 parcel 时传入应用的上下文，因为parcel可能会和应用一起卸载。

```javascript
// 快速示例
// parcel 的实现
const parcelConfig = {
  bootstrap() {
    // 初始化
    return Promise.resolve()
  },
  mount() {
    // 使用某个框架来创建和初始化dom
    return Promise.resolve()
  },
  unmount() {
    // 使用某个框架卸载dom，做其他的清理工作
    return Promise.resolve()
  }
}
// 如何挂载parcel
const domElement = document.getElementById('place-in-dom-to-mount-parcel')
const parcelProps = {domElement, customProp1: 'foo'}
const parcel = singleSpa.mountRootParcel(parcelConfig, parcelProps)
// parcel 被挂载，在mountPromise中结束挂载
parcel.mountPromise.then(() => {
  console.log('finished mounting parcel!')
  // 如果我们想重新渲染parcel，可以调用update生命周期方法，其返回值是一个 promise
  parcelProps.customProp1 = 'bar'
  return parcel.update(parcelProps)
})
.then(() => {
  // 在此处调用unmount生命周期方法来卸载parcel. 返回promise
  return parcel.unmount()
})
```



### 布局引擎 single-spa-layout

布局引擎提供了一个路由API，用于控制您的顶级路由，应用程序和dom元素。使用 single-spa-layout 可以更轻松地完成以下任务：

- DOM放置和应用程序排序。
- 下载应用程序时加载UI。
- 未找到/ 404页的默认路由。
- 路线之间的转换（执行中）。



布局引擎执行两项主要任务：

- 从HTML元素和/或JSON对象生成 single-spa 注册配置。
- 侦听路由事件，以确保在安装 single-spa 应用程序之前正确布置所有DOM元素。



```jsx
<single-spa-router>
  <route path="product-detail/:productId">
    <div class="product-content">
      <route path="reviews"></route>
      <route path="images"></route>
    </div>
    <!-- 评论和图片路线是同级，因为它们共享最近的父路线 -->
    <!-- 当URL与评论或图片不匹配时，默认路由将激活 -->
    <route default>
      <h1>Unknown product page</h1>
    </route>
  </route>
</single-spa-router>
```