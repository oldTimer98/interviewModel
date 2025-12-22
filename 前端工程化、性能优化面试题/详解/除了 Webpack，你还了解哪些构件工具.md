说起前端构建，大家一定首先想到 Webpack，确实它是前端构建的老大哥了，大而全，什么场景都能满足，社区生态爆炸。但除了 webpack 之外，社区近几年陆续还出现了许多新的构建工具：

## Parcel

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751928911-b3caf0fe-6f99-4d6f-8c88-7f5c8599a71c.png)

一个号称**「0 配置」**的打包工具，开箱即用，同时默认使用 Worker 进程充分发挥多核 cpu 优势来提升构建速度，因此在打包效率上还是不错的，而且 Parcel 2.0 在 SWC 基础上用 Rust 改写了 JS/CSS Transformer，进一步提升了构建效率。

Parcel 代码实现得非常「模块化」，有非常多内置的插件来完成各种各样的工作，用户可以针对自己的需求来使用不同的内置插件，只要在 .parcelrc 文件里配置即可，parcel 会自动读取这个配置文件，不过要注意 .parcelrc 是 JSON5 格式的文件。

### 文件类型

与 Webpack 不同的是，在 Parcel 中，所有文件都是一等公民，一视同仁，因此不需要用户去针对不同类型的文件配置各种 Loader，Parcel 会帮你做好不同类型文件的处理。

- 支持 JS/TS/JSX/TSX，Parcel 2.0 开始使用了 Rust 实现的 JS Transformer，能更高效地进行转译，同时也支持转译到 ES5，对于 React17 新的 JSX 也能支持。另外 Minification，Tree Shaking 等也是支持的。
- 支持 CSS，功能基本上对齐 CSS Loader，还支持各种 CSS 预处理语言，支持 Tree Shaking，Minification 等。另外支持以文本形式引入 CSS 资源，方便用户手动将 css 放入 Style Tag 中，值得一提的是，Parcel2.0 还用 Rust 实现了 CSS 的 Transformer。
- 支持 HTML。
- 支持 Vue，完全支持 Vue3 语法。
- 支持图片，丰富的图片文件处理，支持图片类型的转换以及裁剪。
- ...

### 构建特性

- 支持 Code Splitting，不过和 esbuild 一样只能支持比较有限的分割逻辑，被多个入口引用的共用模块或者使用 import() 动态引入的模块会被分割成单独的 Chunk。
- 支持 Tree Shaking。
- 支持 Scope Hoist。
- 支持 Minification。
- 支持 Compression，可生成 [Gzip](https://en.wikipedia.org/wiki/Gzip) 和 [Brotli](https://en.wikipedia.org/wiki/Brotli) 两种压缩格式的产物。
- 支持内联 Bundle，即可以以文本或者其他格式引入转译后的资源，例如上面提到的以文本格式引入编译后的 CSS 文件，亦可以直接以 dataURL 的格式引入二进制文件等。
- 支持开发阶段的 DevServer，HMR 等。
- 支持浏览器缓存，产物文件名默认带上文件内容 hash。
- 支持差异化构建，默认会同时构建出 ESM 的产物以及非 ESM 的产物。
- ...

### 优点

零配置，告别繁琐的工程化配置，能够满足大多数场景。在 JS 和 CSS 的转译上使用了 Rust ，效率上会有所提升。

### 缺点

扩展性不强，几乎没有类似 Webpack 的那种开放性插件特性，因此如果遇到 Parcel 现阶段无法实现或有 Bug 的东西，用户无能为力，只能等 Parcel 去补齐。

### 使用对比

打包 React + Threejs 项目，Webpack：

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751928922-e146148a-d646-442b-a5c1-d7d7087cffca.png)

Parcel 首次构建：

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751928932-468b6daf-29a5-4db6-996b-65c2b9f13b76.png)

Parcel 非首次构建：

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751928955-981dd2c8-e252-49f7-872d-a94810e6baf5.png)

Parcel 每次构建完都会生成 .parcel-cache 文件记录各种模块的依赖关系，可以大大节省后续构建的用时，不过这个缓存能力在 Webpack 5.0 也内置了，不算是什么独特的能力。

在产物体积上，双方大致打平。

### 总结

目前 Parcel 最大的卖点就在于无需配置，使用体验也确实不错，性能方面在使用 Rust 改造后相信未来也能得到更大的提升，开箱即用可以满足许多场景，但是封装性好带来的副作用就是扩展性差，因此对于有大量定制化构建需求的大型项目来说 Parcel 现阶段或许不算是一个很好的选择。



## Rollup

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751928928-9aad0a55-03bf-4da2-89a0-9fcb9784b1b1.png)

Rollup 是当前流行的库打包器，它比 Webpack 晚几年出现，也是在 ESM 之后出现的，主打的特点是能够支持并且提倡开发者使用 ESM 模块语法进行开发。

### 文件类型

几乎只支持 JS，其他类型的文件均需要使用插件来处理。

### 特点

Rollup 推崇 ESM 模块标准开发，这个特点也是借助浏览器对 ESM 的支持，Rollup 打包的产物对比 Webpack 会干净很多。例如同一个项目打包产物：

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751930377-4f5245cc-6c15-4e6d-8b5c-34829483970f.png)![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751931362-9487f53e-c8a1-4e90-b67a-a4a0cc590c96.png)

 Webpack 产物

 Rollup 产物

可以看到 Webpack 产物里是有大量的诸如 __webpack_require__之类的代码，这些都是 Webpack 自身 Polyfill 的在运行时的模块加载，就是为了让产物代码在所有浏览器都能运行，因为 wepack 出现的时候还没有 ESM ，当时的模块标准还很混乱，Webpack 抹平了差异。用 IIFE 实现模块之间的隔离，并且用__webpack_require____webpack_exports__ 等 Polyfill 实现在浏览器环境里模拟 CJS 模块加载，所以我们用 Webpack 打包后的代码实际上更像是跑在 Webpack 给我们实现的“虚拟 Runtime”上。

而 Rollup 诞生在 ESM 模块标准出来之后，所以 Rollup 完全遵从 ESM 标准，也就不需要像 Webpack 那样做很多 Runtime Polyfill，完全把代码交给浏览器运行。对于一些项目里依赖的老旧的 CJS 的包，也可以通过插件来对这些依赖处理。

**Rollup** **精简的产物在体积上也是要比** **webpack** **来的小。**

另外对于多入口打包或动态引入的包也会做分包，我们可以直接使用 [output.manualChunks](https://rollupjs.org/guide/en/#outputmanualchunks) 来自定义分包。

### 插件系统

Rollup 提供了从 读取参数 到 构建 到 输出产物共计 25 种 Hook，足以满足绝大多数场景，而且目前社区里的插件数量也非常多，几乎该有的都有了，因为 Rollup 本身只认识 Javascript，所以实际使用过程中我们会需要配置比较多的插件来满足我们的场景，尤其是项目文件类型比较多样的情况下。

### 总结

Rollup 总体而言是非常优秀的打包工具，产物精简，符合 ESM 标准，丰富的插件系统，社区生态也很不错，是个很现代化 Web Bundler。不过相应的，他需要支持 ESM 标准的浏览器，因此对于低版本浏览器也实在没办法（愿天堂没有低版本浏览器🙏）。

因此对于打包 Web App，使用 Webpack 还是主流，干啥都行，哪儿都能跑。

打包库，推荐使用 Rollup，反正产物最终也是当成依赖引入，浏览器兼容性的事情交给引入方去解决了。

## Snowpack

Snowpack 主打的是 Unbundle，极速的开发体验，在生产环境也同样能依赖 Rollup 打包出产物。

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751933755-28496f5e-ee15-4a15-86d1-5db0f8e74c86.png)

他主要的做法就是利用了浏览器对 ESModule 的支持，而对于项目用到的依赖，为了防止依赖没采用 ESM 模块规范，Snowpack 会把从依赖入口开始把依赖打包成一个文件，并确保产物是符合 ESM 标准且可以运行在浏览器中的，而这里主要是依赖了 [esinstall](https://www.npmjs.com/package/esinstall) 库，esinstall 又是通过 rollup 来做这个事情的。

### 文件类型

- JavaScript (.js, .mjs)
- TypeScript (.ts, .tsx)
- JSON (.json)
- JSX (.jsx, .tsx)，默认使用 ESBuild 来转译，虽然 ESBuild 已经有办法处理新的 JSX 语法了，但 snowpack 似乎没有兼容上，需要降级到 babel 来处理。
- CSS (.css)：对于预处理语言似乎仅支持 Sass，对于代码里 import 进来的 css 文件，snowpack 会把它处理成 .proxy.js 后缀的 js 文件，且在 js 文件里的逻辑就是创建 style 标签把 css 内容填进去。
- CSS Modules (.module.css)
- Images & Assets (.svg, .jpg, .png, etc.)
- WASM (.wasm)

### 插件系统

Snowpack 的插件系统也是利用 snowpack 运行的生命周期中提供的 hooks。且这套是沿袭了 Rollup 的那套插件系统。

- load: 这个 hook 会在加载特定后缀文件的时候触发，通常用于将浏览器无法处理的文件类型转化成浏览器能运行的文件，除了可以更改文件内容外，也可以更改最终输出的文件类型。例如插件@snowpack/plugin-vue 对 .vue 文件的处理就是使用这个 hook 来做的。
- transform: 在所有文件都过完 load 之后，会来到 transform hook，这里可以对文件内容进行更改。
- optimize：snowpack 本身是不做打包的，但前面说到它也可以支持生产环境的打包，这里就是依赖插件来做的打包，而插件则是利用的 optimize 这个 hook，在这个 hook 里可以用户指定打包工具例如 webpack, rollup, parcel 等进行代码的 bundle。

### 优点

Unbundle 可以提供很快速的开发体验，另外插件接口设计不错，开发者可以借此扩展许多应用场景。

### 缺点

官方文档不是特别的完善，对于一些配置项没有很清楚的解释，而且项目维护者没什么精力去维护这个项目，导致 Snowpack 发展比较缓慢。

另外插件部分也有一些不足，主要表现为社区活跃度不够，生态不是很完善，可能缺少处理某些场景的插件，甚至一些现存的插件在实现上也不是很完善。使用体验不够好。

### 总结

由于是采用 Unbundle 的，Snowpack 本身做的东西就不如 Bundle 方案的那些工具多，实际上它主要要做的事情就是帮我们处理好项目依赖，让那些项目依赖能跑在浏览器上就行了。因此它也比较轻量，但还是上面说到的未来发展的问题，目前更新缓慢，未来会不会继续维护也成问题。

## Esbuild

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751934181-03b5629d-9e17-4684-8447-82c271fdc0fe.png)

它是 Figma 的 CTO 主导，使用 Go 语言编写的打包工具，熟悉 Vite 的同学对它应该不陌生，Vite 中使用 esbuild 做了许多事情，例如转译 JSX, TS, TSX；预编译模块等。

esbuild 提供两类 API：Transform 和 Build。

### Transform

- 支持转译的内容类型有：JS、JSX、TS、TSX、JSON、CSS、二进制、Text、Base64，不同类型的内容需要使用不同的 loader （这里指 esbuild 内置的 loader）。
- 支持压缩。
- 支持 SourceMap。
- 支持指定 Target：转译成 js 或 css 时可指定目标语法版本，默认 esnext，即使用最新的特性。
- 支持 Tree shaking：主要针对 declaration-level。

### Build

Build 实际上是包含了 Transform 过程的，因此在 Transform 中可以配置的字段都能在 Build 中配置。

- 支持 Bundle：默认不启用 Bundle。
- 支持 Watch：监听文件变动，重新构建。
- 支持 DevServer。
- 支持 Code Splitting。
- 支持自定义JS plugin：社区已经有不少 plugin 了 https://github.com/esbuild/community-plugins。

### 优点

不用多说，就是快，压缩效率也不错。

### 缺点

1. 没有提供 AST 级别的 API，用户无法干涉 Transform 过程，加上 Transform 不能完全支持转译到 ES5 语法，如果代码需要运行到低版本浏览器或者项目有依赖 Babel Plugin 的话，就不要用 esbuild 了。
2. 对 CSS 的支持较为单一，仅支持纯 CSS，CSS Modules 在规划中了，对于 Less，PostCSS 等预处理语言则需要用 Plugin 来处理。
3. Code Splitting 的功能尚未完善，目前只有当产物是 ESM 的时候才能使用这个特性，而且还有一些 import 顺序导致的[问题](https://github.com/evanw/esbuild/issues/399)。
4. 对 TS 的支持也不够完全，且对 React 17 新的 JSX 处理也还不支持。
5. 虽然有 Plugin 机制，但是提供的钩子数量不多，功能也不够强大，并且 JS Plugin 会在一定程度上拖慢效率。

### 总结

目前在业务项目里单独拿 esbuild 做构建或者转译其实都有不少场景是无法支持到的，不过 esbuild 也在不断完善，我们需要扬之长避之短，现阶段在 library 打包场景还是可以用上 ESBuild 的，或者业务项目里如果没有依赖太多的 Babel 插件的情况下倒是可以利用一下 esbuild 的 Transform 能力，比如像 Vite 那样。

目前前端社区也有使用 esbuild 结合 Webpack 的实践，也正是使用 esbuild 的 Transform 能力作为JS/TS/JSX/TSX 的 loader https://github.com/privatenumber/esbuild-loader。

这里那一个小项目试了下，左边是常规使用 babel-loader，右边使用 esbuild-loader，构建时间缩短了近一半。

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751937580-e362abde-7549-46cd-8c0a-9a8e0e240ae6.png)![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751939560-9d9b69b5-6592-4fdc-885d-603cc3a56b06.png)

## SWC

全称 Speedy Web Complier，实际上它并不是构建工具，它是基于 Rust 实现的 Complier 工具，但是似乎也有做 Bundle 的规划，这里顺带一起介绍了。

得益于 Rust 语言的高效，SWC 的 transform 效率最高可以是 Babel 的 70 倍（官网说的）

SWC is **20x faster than Babel** on a single thread and **70x faster** on four cores.

SWC官方给出以下几种包：

@swc/cli：swc 的命令行工具，可以通过命令行直接对文件进行转译。

@swc/core：swc 的 js 库，可以在 node 环境中执行。

@swc/wasm-web：swc 的 wasm 版，可以在浏览器环境中执行。

@swc/jest：服务 Jest 框架。

### 能力一览

- 支持转译 JavaScript、TypeScript、J(T)SX、值得注意的是，它还支持转译 React 17 版本的新 JSX，也能支持**转译到 ES5 语法**。
- 支持 ESM 或 CJS 等各种模块标准。
- 支持 Minification。
- 支持 SourceMap。
- 支持插件。
- ...

SWC 也有自己的插件系统，并且同时**开放了** **Rust** **侧和** **JS** **侧的** **AST** **级别的** **API**，所以目前来说 Rust 实际上可以做到任何 Babel 能做的事情。但是目前用户量还不够大，可能会存在一些 bug，生态也还不够完善。

但是从它开放了 Rust 侧的 API 这点来说还是很诱人的，使用 Rust 开发的插件在运行效率上比 JS 必然会高出不少。

比起 ESBuild， SWC 是更细粒度的一个工具，可定制化程度也更大，因此目前市面上许多工具譬如 Next.js、Parcel、Deno 都选择基于 SWC 来做代码的转译。

### 优点

除了快以外，关键 SWC 还开放了 Rust 侧 AST 级别的 API，在考虑拓展性的同时还把转译效率上限提高了，可谓是杀手锏了。

### 缺点

- 目前用户量还不够大，深入开发使用的时候难免踩坑。
- 生态不够完善，短期内想要替代 Babel 还有些困难。
- Rust 学习困难。
- ...

### 总结

作为 Transformer，SWC 的潜力很大，难怪众多工具都押宝 SWC。但是目前来说 SWC 还处于比较早期，会有一些坑要踩，并且如果单纯使用 JS 来开发插件会是转译效率大打折扣，因为涉及到不同语言之间 AST 的转换，具体可以看这里 https://github.com/swc-project/swc/issues/2175，因此要发挥最好的效果势必要学习 Rust，这个学习曲线可能比较陡峭。

另外 SWC 也提供了 [swc-loader](https://github.com/swc-project/swc-loader) 用作 Webpack 的 loader，有兴趣可以尝试一下。

## Vite

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693751940544-cbcad00e-06c1-4e07-95f3-559495ef0ce4.png)

最后简要介绍一下 Vite，许多人对他也不陌生了。与 snowpack 类似，他开发阶段采用 unbundle 模式，并且使用 esbuild 做依赖预构建（snowpack 是用的 rollup），生产阶段利用 rollup 做构建。至于跟 snowpack 的区别和优劣，官网也有介绍，这里就不赘述了。 https://cn.vitejs.dev/guide/comparisons.html#snowpack

但毋庸置疑的是，Vite 比 snowpack 更成熟，未来发展趋势也更好，Vite 目前可以稳定用于生产环境的。前面我们说到 rollup 会需要高版本浏览器支持，那使用 rollup 做生产构建的 Vite 是不是也会受同样限制？实际上 Vite 提供了[@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) 插件来让产物可以运行在低版本浏览器上，保证了它作为成熟可用于生产环境的工具的稳定性。

为什么不展开介绍，就是因为他已经能满足几乎场景了，该有的能力都有。当前关键还是看社区生态，现在 Vite 大大小小的插件也有上百种，未来经过更多实际业务的考验想必能跟 webpack 碰一碰。

## 参考资料

https://esbuild.github.io/

https://swc.rs/docs/getting-started

https://jishuin.proginn.com/p/763bfbd6c888

https://parceljs.org/blog/rc0/

[前端社区 Native 工具链调研与展望](https://bytedance.feishu.cn/wiki/wikcnRrR8M8kiextbQociCDMzrh#4OqfIH)

https://juejin.cn/post/7054752322269741064

------