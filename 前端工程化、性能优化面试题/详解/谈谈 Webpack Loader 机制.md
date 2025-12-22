- 初阶：知道 Loader 是什么，以及怎么配置，怎么用

- 最最核心的功能，就是做内容翻译，例如可以将 图片 转译成 Base64

- 中阶：对 Loader 机制有认知

- 为什么需要 Loader？因为 webpack 只能处理标准 JS 内容(Webpack 5 之后，原生支持图片、JSON 等常见资源文件)
- 性能可能会有问题
- 什么是 Pitch 函数，有什么作用，为什么要这么设计
- Loader 链式调用的核心逻辑是怎么样的

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1648384517478-9596a81b-c13a-426f-a2fa-942da1771be2.png)

- 高阶：知道怎么开发一个 Loader

- Loader 与 Plugin 的区别
- 怎么开发一个 Loader  —— `function(content: String | AST) => String | AST | undefined`
- 有哪些常见的 Loader 开发工具 —— 单元测试工具、Loader-utils、schema-utils 等



知识点：

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1648308093788-0285bec8-a2f6-4807-95ec-77b0cc0d7f14.png)

- 本质上是一种带副作用的内容转移器
- 建议多看几个常用 Loader 的源码，包括 img-loader、file-loader、ts-loader、babel-loader、eslint-loader 等