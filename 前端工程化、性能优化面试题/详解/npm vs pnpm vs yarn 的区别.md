## **npm - 先锋**

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412973684-28e94f3a-9010-4d93-ad26-f596f3e01816.png)

2010 年 1 月，一款名为 npm 的包管理器诞生。

很多人认为 npm 是 node package manager 的缩写，其实不是，而且 npm 根本也不是任何短语的缩写。

npm 官方辟谣： 

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412973636-41ac9b7f-7854-4d0b-af73-118580729d19.png)

它的前身其实是名为 pm（pkgmakeinst） 的 bash 工具，它可以在各种平台上安装各种东西。

硬要说缩写的话，也应该是 node pm 或者 new pm。

### **嵌套的 node_modules 结构**

npm 在早期采用的是**嵌套的 node_modules 结构**，直接依赖会平铺在 node_modules 下，子依赖嵌套在直接依赖的 node_modules 中。

比如项目依赖了A 和 C，而 A 和 C 依赖了不同版本的 B@1.0 和 B@2.0，node_modules 结构如下：



```javascript
node_modules
├── A@1.0.0
│   └── node_modules
│       └── B@1.0.0
└── C@1.0.0
    └── node_modules
        └── B@2.0.0
```

复制

如果 D 也依赖 B@1.0，会生成如下的嵌套结构：



```javascript
node_modules
├── A@1.0.0
│   └── node_modules
│       └── B@1.0.0
├── C@1.0.0
│   └── node_modules
│       └── B@2.0.0
└── D@1.0.0
    └── node_modules
        └── B@1.0.0
```

复制

可以看到同版本的 B 分别被 A 和 D 安装了两次。

### **依赖地狱 Dependency Hell**

在真实场景下，依赖增多，冗余的包也变多，node_modules 最终会堪比黑洞，很快就能把磁盘占满。而且依赖嵌套的深度也会十分可怕，这个就是**依赖地狱**。

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412973810-46680870-ea16-41b7-9652-3b16e2657370.png)

### **扁平的 node_modules 结构**

为了将嵌套的依赖尽量打平，避免过深的依赖树和包冗余，npm v3 将子依赖「提升」(hoist)，采用**扁平的 node_modules 结构**，子依赖会尽量平铺安装在主依赖项所在的目录中。



```javascript
node_modules
├── A@1.0.0
├── B@1.0.0
└── C@1.0.0
    └── node_modules
        └── B@2.0.0
```

复制

可以看到 A 的子依赖的 B@1.0 不再放在 A 的 node_modules 下了，而是与 A 同层级。

而 C 依赖的 B@2.0 因为版本号原因还是嵌套在 C 的 node_modules 下。

这样不会造成大量包的重复安装，依赖的层级也不会太深，解决了依赖地狱问题，但也形成了新的问题。

### **幽灵依赖 Phantom dependencies**

幽灵依赖是指在 package.json 中未定义的依赖，但项目中依然可以正确地被引用到。

比如上方的示例其实我们只安装了 A 和 C：



```javascript
{
  "dependencies": {
    "A": "^1.0.0",
    "C": "^1.0.0"
  }
}
```

复制

由于 B 在安装时被提升到了和 A 同样的层级，所以在项目中引用 B 还是能正常工作的。

幽灵依赖是由依赖的声明丢失造成的，如果某天某个版本的 A 依赖不再依赖 B 或者 B 的版本发生了变化，那么就会造成依赖缺失或兼容性问题。

### **不确定性 Non-Determinism**

不确定性是指：同样的 package.json 文件，install 依赖后可能不会得到同样的 node_modules 目录结构。

还是之前的例子，A 依赖 B@1.0，C 依赖 B@2.0，依赖安装后究竟应该提升 B 的 1.0 还是 2.0。



```javascript
node_modules
├── A@1.0.0
├── B@1.0.0
└── C@1.0.0
    └── node_modules
        └── B@2.0.0
```



```javascript
node_modules
├── A@1.0.0
│   └── node_modules
│       └── B@1.0.0
├── B@2.0.0
└── C@1.0.0
```



取决于用户的安装顺序。

如果有 package.json 变更，本地需要删除 node_modules 重新 install，否则可能会导致生产环境与开发环境 node_modules 结构不同，代码无法正常运行。

### **依赖分身 Doppelgangers**

假设继续再安装依赖 B@1.0 的 D 模块和依赖 @B2.0 的 E 模块，此时：

- A 和 D 依赖 B@1.0
- C 和 E 依赖 B@2.0

以下是提升 B@1.0 的 node_modules 结构：



```javascript
node_modules
├── A@1.0.0
├── B@1.0.0
├── D@1.0.0
├── C@1.0.0
│   └── node_modules
│       └── B@2.0.0
└── E@1.0.0
    └── node_modules
        └── B@2.0.0
```

复制

可以看到 B@2.0 会被安装两次，实际上无论提升 B@1.0 还是 B@2.0，都会存在重复版本的 B 被安装，这两个重复安装的 B 就叫 doppelgangers。

而且虽然看起来模块 C 和 E 都依赖 B@2.0，但其实引用的不是同一个 B，假设 B 在导出之前做了一些缓存或者副作用，那么使用者的项目就会因此而出错。

## **yarn - 创新**

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412973585-e9fbd0ac-02f1-49d2-ae7b-add25f5ae13b.png)

2016 年，yarn 发布，yarn 也采用**扁平化 node_modules 结构**。它的出现是为了解决 npm v3 几个最为迫在眉睫的问题：依赖安装速度慢，不确定性。

### **提升安装速度**

在 npm 中安装依赖时，安装任务是串行的，会按包顺序逐个执行安装，这意味着它会等待一个包完全安装，然后再继续下一个。

为了加快包安装速度，yarn 采用了并行操作，在性能上有显著的提高。而且在缓存机制上，yarn 会将每个包缓存在磁盘上，在下一次安装这个包时，可以脱离网络实现从磁盘离线安装。

### **lockfile 解决不确定性**

yarn 更大的贡献是发明了 yarn.lock。

在依赖安装时，会根据 package.josn 生成一份 yarn.lock 文件。

lockfile 里记录了依赖，以及依赖的子依赖，依赖的版本，获取地址与验证模块完整性的 hash。

即使是不同的安装顺序，相同的依赖关系在任何的环境和[容器](https://cloud.tencent.com/product/tke?from_column=20065&from=20065)中，都能得到稳定的 node_modules 目录结构，保证了依赖安装的确定性。

所以 yarn 在出现时被定义为快速、安全、可靠的依赖管理。而 npm 在一年后的 v5 才发布了 package-lock.json。

### **与 npm 一样的弊端**

yarn 依然和 npm 一样是扁平化的 node_modules 结构，没有解决**幽灵依赖**和**依赖分身**问题。

## **pnpm - 后浪**

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412973687-eeb4b0cd-a433-47cc-9660-82499f9a1ad6.png)

pnpm - performant npm，在 2017 年正式发布，定义为快速的，节省磁盘空间的包管理工具，开创了一套新的依赖管理机制，成为了包管理的后起之秀。

### **内容寻址存储 CAS**

与依赖提升和扁平化的 node_modules 不同，pnpm 引入了另一套依赖管理策略：内容寻址存储。

该策略会将包安装在系统的全局 store 中，依赖的每个版本只会在系统中安装一次。

在引用项目 node_modules 的依赖时，会通过硬链接与符号链接在全局 store 中找到这个文件。为了实现此过程，node_modules 下会多出 .pnpm 目录，而且是非扁平化结构。

- **硬链接 Hard link**：硬链接可以理解为**源文件的副本**，项目里安装的其实是副本，它使得用户可以通过路径引用查找到全局 store 中的源文件，而且这个副本根本不占任何空间。同时，pnpm 会在全局 store 里存储硬链接，不同的项目可以从全局 store 寻找到同一个依赖，大大地节省了磁盘空间。
- **符号链接 Symbolic link**：也叫软连接，可以理解为**快捷方式**，pnpm 可以通过它找到对应磁盘目录下的依赖地址。

还是使用上面 A，B，C 模块的示例，使用 pnpm 安装依赖后 node_modules 结构如下：



```javascript
node_modules
├── .pnpm
│   ├── A@1.0.0
│   │   └── node_modules
│   │       ├── A => <store>/A@1.0.0
│   │       └── B => ../../B@1.0.0
│   ├── B@1.0.0
│   │   └── node_modules
│   │       └── B => <store>/B@1.0.0
│   ├── B@2.0.0
│   │   └── node_modules
│   │       └── B => <store>/B@2.0.0
│   └── C@1.0.0
│       └── node_modules
│           ├── C => <store>/C@1.0.0
│           └── B => ../../B@2.0.0
│
├── A => .pnpm/A@1.0.0/node_modules/A
└── C => .pnpm/C@1.0.0/node_modules/C
```

<store>/xxx 开头的路径是硬链接，指向全局 store 中安装的依赖。

其余的是符号链接，指向依赖的快捷方式。

pnpm 官方图片也清晰地解释了这套机制：

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412975755-a15ad8a9-57ff-4c6b-af0c-6ce447d02332.png)

### **未来可期**

这套全新的机制设计地十分巧妙，不仅兼容 node 的依赖解析，同时也解决了：

1. 幽灵依赖问题：只有直接依赖会平铺在 node_modules 下，子依赖不会被提升，不会产生幽灵依赖。
2. 依赖分身问题：相同的依赖只会在全局 store 中安装一次。项目中的都是源文件的副本，几乎不占用任何空间，没有了依赖分身。

同时，由于链接的优势，pnpm 的安装速度在大多数场景都比 npm 和 yarn 快 2 倍，节省的磁盘空间也更多。

但也存在一些弊端：

1. 由于 pnpm 创建的 node_modules 依赖软链接，因此在不支持软链接的环境中，无法使用 pnpm，比如 Electron 应用。
2. 因为依赖源文件是安装在 store 中，调试依赖或 patch-package 给依赖打补丁也不太方便，可能会影响其他项目。

## **yarn Plug’n’Play - 探索**

![img](https://cdn.nlark.com/yuque/0/2023/png/32786640/1693412976125-8f2ec866-80ad-4656-b0bb-ee6c5d24d942.png)

2020 年 1 月，yarn v2 发布，也叫 yarn berry（v1 叫 yarn classic）。它是对 yarn 的一次重大升级，其中一项重要更新就是 Plug’n’Play（Plug'n'Play = Plug and Play = PnP，即插即用）。

npm 与 yarn 的依赖安装与依赖解析都涉及大量的文件 I/O，效率不高。开发 Plug’n’Play 最直接的原因就是依赖引用慢，依赖安装慢。

### **抛弃 node_modules**

无论是 npm 还是 yarn，都具备缓存的功能，大多数情况下安装依赖时，其实是将缓存中的相关包复制到项目目录中 node_modules 里。

而 yarn PnP 则不会进行拷贝这一步，而是在项目里维护一张静态映射表 `pnp.cjs`。

pnp.cjs 会记录依赖在缓存中的具体位置，所有依赖都存在全局缓存中。同时自建了一个解析器，在依赖引用时，帮助 node 从全局缓存目录中发现依赖，而不是查找 node_modules。

这样就避免了大量的 I/O 操作同时项目目录也不会有 node_modules 目录生成，同版本的依赖在全局也只会有一份，依赖的安装速度和解析速度都有较大提升。

pnpm 在 2020 年底的 v5.9 也支持了 PnP。

### **脱离 node 生态**

pnp 比较明显的缺点是脱离了 node 生态。

- 因为使用 PnP 不会再有 node_modules 了，但是 Webpack，Babel 等各种前端工具都依赖 node_modules。虽然很多工具比如 pnp-webpack-plugin 已经在解决了，但难免会有兼容性风险。
- PnP 自建了依赖解析器，所有的依赖引用都必须由解析器执行，因此只能通过 yarn 命令来执行 node 脚本。

## **总结**

目前还没有完美的依赖管理方案，可以看到在依赖管理的发展过程中，出现了：

- 不同的 node_modules 结构，有嵌套，扁平，甚至没有 node_modules，不同的结构也伴随着兼容与安全问题。
- 不同的依赖存储方式来节约磁盘空间，提升安装速度。
- 每种管理器都伴随新的工具和命令，不同程度的可配置性和扩展性，影响开发者体验。
- 这些包管理器也对 monorepo 有不同程度的支持，会直接影响项目的可维护性和速度。

库与开发者能够在这样优化与创新的发展过程中互相学习，站在巨人的肩膀上继续前进，不断推动前端工程领域的发展。