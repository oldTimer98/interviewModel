## 基础概念

- 是什么：用于**预加载资源**的 html 指令，相当于告诉浏览器：我在当前页面马上要用到这个资源，需要你尽快帮我加载回来
- 为什么：网页中有非常多外联资源，js、css、图片等等，使用前总需要先等待资源的下载，如果我们能做到预先加载资源，那在资源执行的时候就不必等待网络的开销
- 怎么用：

```javascript
<link rel="preload" 
  href="https://example.com/fonts/font.woff" 
  as="font" 
  crossorigin 
  onload="handleOnload()" 
  onerror="handlepreloadError()"/>
```

- href: 资源地址
- as：声明资源的类型，支持大多数常见文件类型；不同类型有不同优先级
- crossorigin：声明是否跨域
- onload：加载成功时触发
- onerror：加载失败时触发



## 深入理解

- 深入理解

- 作用：

- 借助 preload，开发者可以明确声明需要预加载的资源列表
- 资源被 preload 后，会被首先放入浏览器缓存

- 实践：

- 对 preload 使用 “as” 属性，否则浏览器无法识别资源类型，可能导致二次加载(预加载失效)
- 对跨域资源表明 `crossorigin`，否则同样导致二次加载(http 请求的 header 不同)

- 问题：

- preload 的资源不一定都被用到，可能造成无效的预加载，在移动端下需要特别注意

- 除了 preload 外，浏览器还支持如下预加载指令：

- prefetch：**声明将来很可能需要用到的资源**

- preload 会以高优先级执行，通常用于处理**当前页面需要用到的重要资源**；
- prefetch 优先级较低，一直等到整个页面所有资源都加载完毕后才有可能执行，加载成功后会将资源放入缓存等待消费，通常用于处理“跳转”时需要用到的资源
- 两者主要差异：1. 优先级；2. 一个是必定用到的资源，一个是可能用到的资源
- Tips：页面关闭后，会停止 preload 资源加载；但不会停止 prefetch

- dns-prefetch：实验特性，dns 预解析
- preconnect：预建立 tcp 连接

- 使用时需要慎重！浏览器有并发 tcp 并发连接数限制，过多 preconnect 在 http 下可能影响其它资源建立链接的速度

- prerender：预渲染下一页内容，这意味它不仅仅加载 html，还有对应的 css、js、多媒体资源，并且提前渲染了
- modulepreload：**实验特性**，ESM 版本的 preload 指令，用于预加载 ESM 模块与模块的依赖，不过这个还是一个很新的指令，不建议在生产环境使用

- 某种程度上，这是 preload 指令的特化版本，因为 preload 指令无法声明这是一个 ESM Module，浏览器无法分辨也就无法提前解析模块依赖，也就无法有效预加载 esm

- 资源加载优先级：

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1670084852757-c9b96e26-262b-4566-abcf-187eab801b30.png)



资料：

- https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
- https://blog.fundebug.com/2019/04/11/understand-preload-and-prefetch/
- [延迟加载视频](https://web.dev/lazy-loading-video/)