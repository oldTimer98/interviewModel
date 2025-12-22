核心点：

1. 理解 iframe 是什么？理解什么是可替换元素
2. 理解 iframe 常见使用场景及一些特殊使用场景
3. 了解常见的微前端方案，理解 iframe 在现代微前端中扮演的角色



## iframe 是什么？

<iframe> 它提供了一种将整个 web 页嵌入到另一个网页的方法，看起来就像那个 web 页是另一个网页的一个 <img> 或其他元素一样。

iframe 属于可替换元素，与之类似的还有 Canvas、IMG、Video 元素。

- 一个内容不受 CSS 渲染控制，CSS 渲染模型并不考虑对此内容的渲染，且元素本身一般拥有固有尺寸例如宽度、高度、宽高比等的元素，被称之为替换元素。对于可替换元素，浏览器会根据元素的标签和属性，来决定元素的具体显示内容。
- 可替换元素的内容不受当前文档的样式的影响，CSS 可以影响可替换元素的位置，但不会影响到可替换元素自身的内容。对于某些可替换元素，例如<iframe>元素，可能具有自己的样式表，但它们不会继承父文档的样式。

<iframe> 元素旨在允许你将其他 Web 文档嵌入到当前文档中。这很适合将第三方内容嵌入你的网站，你可能无法直接控制，也不希望实现自己的版本——例如来自在线视频提供商的视频，Disqus 等评论系统，在线地图提供商，广告横幅等。

例如：

```html
<iframe
  src="https://developer.mozilla.org/zh-CN/docs/Glossary"
  width="100%"
  height="500"
  frameborder="0"
  allowfullscreen
  sandbox
>
  <p>
    <a href="https://developer.mozilla.org/zh-CN/docs/Glossary">
      Fallback link for browsers that don't support iframes
    </a>
  </p>
</iframe>
```

此示例包括使用以下所需的 <iframe> 基本要素：

1. [allowfullscreen](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-allowfullscreen): 如果设置，<iframe>则可以通过[全屏 API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fullscreen_API) 设置为全屏模式（稍微超出本文的范围）。
2. [frameborder](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-frameborder): 如果设置为 1，则会告诉浏览器在此框架和其他框架之间绘制边框，这是默认行为。0 删除边框。不推荐这样设置，因为在 [CSS 中](https://developer.mozilla.org/zh-CN/docs/Glossary/CSS)可以更好地实现相同的效果。[border](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border): none;
3. [src](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-src): 该属性与 [](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video) / 元素表示文档中的图像。[](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img)一样包含指向要嵌入文档的 URL 路径。
4. [width](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-width) 和 [height](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-height): 这些属性指定你想要的 iframe 的宽度和高度。
5. sandbox: 该属性可以限制 iframe 内容的权限，防止恶意脚本的执行。可以根据具体需求设置不同的值，如 sandbox="allow-scripts" 只允许脚本执行，而禁止其他权限。



### iframe 的安全隐患

iframe 元素在网页开发中可以用来嵌入其他网页或者外部资源。然而，由于 iframe 的特性，它可能存在一些安全隐患，包括以下几个方面：

1. 跨域脚本攻击（Cross-Site Scripting, XSS）：如果在嵌入的网页中存在恶意脚本，这些脚本可以窃取用户数据、操纵页面内容或进行其他恶意操作。
2. 点击劫持（Clickjacking）：攻击者可以利用 iframe 来创建一个看不见的透明层，覆盖在诱使用户点击的可见元素上，以达到欺骗和劫持用户点击的目的。
3. CSRF 攻击（Cross-Site Request Forgery）：在某些情况下，iframe 可以被用来诱使用户执行未经用户授权的操作，例如在用户登录了一个网站后，该网站又通过 iframe 嵌套了其他网站，并在该 iframe 页面中自动触发一些操作。



为了减轻 iframe 带来的安全风险，有几个常见的安全措施可以采取：

1. 使用 sandbox 属性：该属性可以限制 iframe 内容的权限，防止恶意脚本的执行。可以根据具体需求设置不同的值，如 sandbox="allow-scripts" 只允许脚本执行，而禁止其他权限。
2. 设置 X-Frame-Options HTTP 头：该头部可以阻止页面被嵌入到 iframe 中，提供一定的点击劫持保护。可以设置为 X-Frame-Options: DENY 来完全阻止页面被嵌入到 iframe 中。
3. 使用 Content Security Policy（CSP）：CSP 可以限制页面中允许加载的资源，包括嵌入的 iframe。通过配置 CSP，可以阻止恶意加载和执行外部资源。
4. 验证和过滤嵌入内容：在使用 iframe 嵌入第三方网页时，应该谨慎验证和过滤嵌入内容，确保只嵌入可信任的来源，并避免嵌入恶意或不受信任的内容。



## iframe 的应用场景

iframe 的常见使用场景包括：

1. 嵌入其他网页：最常见的使用方式是嵌入一个外部网页，让用户能够在当前页面中直接查看其他网站的内容。这可以在博客、新闻网站或电子商务网站中应用。
2. 集成第三方服务和组件：通过将第三方服务或组件嵌入到 iframe 中，可以实现功能的扩展和增强。例如，嵌入地图服务、支付系统或社交媒体的分享按钮等。
3. 广告展示：某些广告网络使用 iframe 来提供广告内容，以实现更好的隔离和可控性。这样可以确保广告不会影响到主页面的布局和性能。
4. 加载网页片段：有时候我们只需要加载并展示网页中的某个特定部分，而不是整个页面。通过使用 iframe 可以选择性地加载和渲染指定的网页片段。



iframe 的一些有意思的特殊用法：

1. 单页应用（Single-Page Application, SPA）：在某些 SPA 实现中，可以使用 iframe 来加载并展示不同的页面，以实现对页面的动态加载和切换。
2. **安全隔离**：在一些安全敏感的环境中，可以使用 iframe 来实现对来自外部源的内容进行隔离和限制。通过将外部内容嵌入到iframe中，可以确保它们无法直接访问主页面的 DOM 或执行恶意操作。
3. 文档预览：一些在线文档编辑器或云存储服务使用 iframe 来实现文档的预览功能。用户可以通过 iframe 在当前页面中查看文档的内容，而无需离开编辑器或云存储界面。

\------

1. **使用 iframe 进行跨域**：使用 iframe 进行跨域请求的方式主要有两种：

1. 通过设置 document.domain 
2. 使用 HTML5 的跨域消息传递机制。

下面我将为你详细介绍这两种方式：

1. 设置 document.domain： 当两个页面具有相同的父级域名（如 [a.example.com](http://a.example.com/) 和 [b.example.com](http://b.example.com/)），但子域名不同，可以通过设置 document.domain 来进行跨域通信。具体步骤如下：

- 在两个页面的脚本中都设置 document.domain 为相同的父级域名（例如 document.domain = "example.com";）。
- 在页面 A 中创建一个 iframe，并将 iframe 的 src 设置为页面 B 的 URL。
- 页面 A 和页面 B 就可以通过 JavaScript 直接访问彼此的全局对象和变量，实现跨域通信。

这种方法的前提是两个页面具有相同的父级域名，并且需要在两个页面中都设置 document.domain。同时，这种方式只适用于子域名不同，而根域名相同的情况。

1. 使用 HTML5 跨域消息传递机制： HTML5 引入了一种安全的跨域通信方式，即 postMessage() 方法，它允许在不同的窗口或 iframe 之间发送消息。该方法提供了一种受控、安全的跨域通信机制，用于在不同页面之间传递数据。具体步骤如下：

- 在页面 A 中，使用 postMessage() 方法向页面 B 发送消息。例如：otherWindow.postMessage(message, targetOrigin);，其中 otherWindow 是指 iframe 的 contentWindow 对象，message 是要发送的消息，targetOrigin 表示目标页面的域名。
- 在页面 B 中，通过监听 message 事件来接收并处理来自页面 A 的消息。例如：

```plain
javascriptCopy Codewindow.addEventListener('message', function(event) {
  // 处理来自页面 A 的消息
});
```

使用 postMessage() 方法可以实现跨窗口和跨域通信，但需要明确指定目标窗口的域名，并谨慎处理接收到的消息，以防止安全漏洞。



## iframe 在现代微前端中扮演的角色

首先，什么是微前端？

微前端：微前端是一种软件架构模式，旨在将大型前端应用程序拆分成更小、更可管理的部分。它的核心思想是将前端应用程序划分为多个独立的功能模块，每个模块负责自己的开发、部署和生命周期管理，同时可以独立地进行更新和扩展。

传统的单体前端应用程序往往随着规模的增长变得复杂和难以维护。微前端通过将应用程序划分为独立的功能模块，使团队能够更好地分工合作、提高开发效率，并且能够更加灵活地进行部署和升级。

现在，业界比较常见的微前端方案有：

1. **Single-SPA**：Single-SPA 是一个流行的开源微前端框架，支持多个技术栈和框架之间的集成。它采用路由来协调各个子应用之间的跳转和通信，可以方便地进行懒加载和模块化管理。
2. **qiankun**：qiankun 是一个基于 Single-SPA 的微前端框架，也是一个开源项目。它支持 Vue、React 和 Angular 等框架，并提供了更加简单、易用、灵活的 API 和插件机制。
3. **Module Federation**：基于 webpack 的 MF 微前端架构是一种通过 webpack 模块化管理和打包应用程序的微前端方案。核心思想是使用 webpack 的模块化功能来隔离和打包应用程序的不同部分，同时利用 webpack 的插件和 loader 来支持动态加载和代码分割。这样可以实现懒加载和增量更新，提高应用程序的性能和可维护性。

再有，就是能直接利用 iframe 进行微前端设计：[《为iframe正名，你可能并不需要微前端》](https://juejin.cn/post/7185070739064619068?searchId=20230919104238602CEE0D25876F70F8C6)

![img](https://cdn.nlark.com/yuque/0/2023/png/311219/1695092661295-e7f603f6-a8ec-449a-8cf4-e147aa5e3625.png)