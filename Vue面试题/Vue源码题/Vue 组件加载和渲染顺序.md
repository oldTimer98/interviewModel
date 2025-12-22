问题：

1. 文档内容不够深度，最好有一些到源码级别的剖析，甚至可以配合一些 debug 视频

#### 点题收敛

首先我们来说组件的加载顺序是自上而下的，也就是先加载父组件，再加载子组件。当父组件被加载时，它会递归地加载其所有子组件，并按照顺序依次渲染它们。

组件的渲染顺序是由组件的深度优先遍历决定的，也就是先渲染最深层的子组件，再依次向上渲染其父组件。



#### 案例理解

下面是一个简单的示例代码，展示了组件的加载和渲染顺序：

```vue
<template>
  <div>
    <parent-component></parent-component>
  </div>
</template>

<script>
  import ParentComponent from './ParentComponent.vue'

  export default {
    components: {
      ParentComponent
    }
  }
</script>
```



在上面的代码中，父组件中引入了一个名为 ParentComponent 的子组件。当父组件被加载时，它会递归地加载 ParentComponent 组件，然后按照深度优先遍历的方式先渲染 ChildComponent，再渲染ParentComponent。



下面是ParentComponent的代码：

```vue
<template>
  <div>
    <child-component></child-component>
  </div>
</template>

<script>
  import ChildComponent from './ChildComponent.vue'

  export default {
    components: {
      ChildComponent
    }
  }
</script>
```



在ParentComponent中，又引入了一个名为ChildComponent的子组件。当ParentComponent被加载时，它会递归地加载ChildComponent组件，并先渲染ChildComponent，再渲染ParentComponent。



下面是ChildComponent的代码：

```vue
<template>
  <div>
    <p>This is child component</p>
  </div>
</template>

<script>
export default {

}
</script>
```

在 ChildComponent 中，只有一个简单的 <p> 标签，用来显示一个文本信息。当 ChildComponent 被加载时，它会被直接渲染出来。

综上所述，Vue 中组件的加载和渲染顺序是先加载父组件，再递归地加载子组件，然后按照深度优先遍历的方式渲染子组件，再依次向上渲染父组件。