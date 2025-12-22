## 基础

在Vue中，keep-alive是一个抽象组件，它可以将其包裹的组件进行缓存，从而在切换组件时可以避免重复创建和销毁组件，提高页面性能和用户体验。



当一个组件被包裹在keep-alive中时，该组件会被缓存起来，而不是销毁。当这个组件再次被使用时，它会被从缓存中取出来并重新挂载到页面上。keep-alive提供了两个钩子函数：`activated`和 `deactivated`，用来在组件被激活或停用时执行一些逻辑，比如在组件被激活时执行一些数据初始化或者异步操作。

keep-alive提供了一些配置属性，包括include、exclude、max和min等。其中，include和exclude用于指定需要缓存或排除的组件名称；max和min用于指定缓存的最大和最小数量。



## 进阶

使用keep-alive可以有效地提高页面性能和用户体验，特别是在页面中包含大量组件的情况下。但是，需要注意的是，由于keep-alive会缓存组件，因此在使用keep-alive时需要注意数据的更新和组件的生命周期，以免出现不必要的问题。

#### 案例

```vue
<template>
  <div>
    <keep-alive>
      <component v-bind:is="currentTabComponent"></component>
    </keep-alive>
    <button v-for="tab in tabs" v-bind:key="tab" v-bind:class="{'is-active': currentTab === tab}" v-on:click="currentTab = tab">
      {{ tab }}
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'Home',
      tabs: ['Home', 'Posts', 'Archive']
    }
  },
  computed: {
    currentTabComponent() {
      return 'tab-' + this.currentTab.toLowerCase()
    }
  }
}
</script>
```



在这个示例代码中，我们使用keep-alive包裹了一个动态组件，并且根据currentTab的值动态加载组件。当切换tab时，相应的组件会被缓存起来，当再次切换到这个tab时，缓存中的组件会被取出并重新挂载到页面上，从而提高了页面的性能和用户体验。