## 基础

- 相同点：

- 模块打包器：核心流程都是从入口文件(entry)开始，将模块解析成 ast，递归找出依赖，最后将所有依赖模块打包在一起
- 都支持 plugin
- 都cmd、amd、hmr、code split 。。。核心功能都差不多了

- rollup: 用来打包 esm 模块的工具，更适合打包 library；学习成本比较低，功能比较弱

- 原生只支持 esm，默认打包出来的也是 esm 模块代码
- 假设：会使用上下文环境提供的 es6 特性 —— 不会注入 polyfill，运行时很轻 —— 最终包体会更小
- 社区插件比较多
- 配置项更直观，容易理解，文档会写的特别好

- webpack：学习曲线特别陡峭，但是功能性更强，更适合打包 web 应用、小程序、桌面应用。。。

- 原生支持 esm、cjs、umd，也支持这些方案的混用；默认打包出来的是类似于 cmd 的模块化；也支持打包成 esm，但是还是实验功能
- 默认吧所有东西都打包进来 —— 包括一套模块化方案，兼容性更强；缺点运行时很重 `__webpack_require__.e/o/xx`
- 官方插件比较多
- webpack 。。。非常绕，很烂

## 进阶

- 原生 rollup 不支持 hmr 、code-split 等；
- webpack 内置了一套兼容性很强的 runtime 代码；rollup 轻量很多，可能要手动补充一些 polyfill
- webpack5 支持 lazyCompilation；rollup 不支持；
- rollup 不支持 动态导入模块 `const {a,b} = await import('./a.js')` DCE；webpack 可以
- 。。。
- rollup 配置项比较精简；webpack。。。特别多
- 性能对比：

- webpack 构建性能比 rollup 强；
- webpack 产物体积会比 rollup 大很多；

- 扩展：

- rollup 只支持 插件；而 webpack 支持 loader & plugin；
- 两者都基于 hook 实现扩展，rollup 的hook 是声明式的；webpack 是命令式的

```javascript
// rollup
export default function myExample() {
  return {
    name: 'my-example', // 名字会在 warnings 和 errors 中显示
    resolveId(source) {
      if (source === 'virtual-module') {
        return source; // 这表明 rollup 不应该询问其他插件或检查文件系统来寻找这个 ID。
      }
      return null; // 其他的 ID 应该按照通常的方式处理
    },
    load(id) {
      if (id === 'virtual-module') {
        return 'export default "This is virtual!"'; // "virtual-module" 的源码
      }
      return null; // 其他的 ID 应该按照通常的方式处理
    },
  };
}

// webpack
export default class xxxPlugin {
  construcor(options){}
  apply(compiler){
    compiler.hooks.thisCompilation.tap('xxxPlugin', (compilation)=>{
      // ...
    })
  }
}
```

- rollup 的hook数量有限，构建、生成 hook，逻辑很清晰；webpack hook 数量很多，200+，
- ![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1658765601935-3bdc38c4-62eb-4935-952f-54da20655858.png)![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1658765628442-3ee87b56-4f53-47fc-ac1d-8caf64f1ba7b.png)
- rolluo hook 参数比较直白易懂；webpack 参数很复杂，module、chunk
- rollup 插件文档很清晰，webpack 文档很蛋疼

### 源码分析

- 代码风格：

- rollup 使用 ts + esm 风格开发；webpack 使用 js + cjs
- rollup 更多是 promise； webpack 有无数的 callback；
- rollup 内部，对象跟对象之间的交互方法调用 + 事件(emit)方式；webpack 应用 hook，流程非常绕，不直观

- 数据结构：rollup 内部，只有一个 graph 对象，包含了入口、各种模块依赖关系，缓存；webpack 内部有：chunkgraph、DependencyGraph、ModuleGraph、InnerGraph。。。queue，一大堆数据结构
- 事件流：rollup 有9中 hook 加载函数，同步、异步、串行、并行、reduce 等；webpack 有6，实现同步、异步、熔断、瀑布流、循环。。。