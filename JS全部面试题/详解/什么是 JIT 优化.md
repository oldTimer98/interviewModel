## 是什么

just-in-time compilation，即时编译，本质上就是一种一边将代码编译成机器码，一边执行这些机器码的技术，特别适用于动态解释型语言(javascript)；

## 为什么

js 是一种动态类型语言，因此执行过程中引擎需要不断判断变量类型，确定是否允许执行相关操作，这个过程会非常耗时

## 怎么做

许多 js 引擎都支持 jit 优化，例如 v8，它会在运行过程中持续记录代码语句执行情况，以及变量类型的变化情况，若推测代码执行次数较多(热点代码)且变量类型较固定时，则调用优化器优化这部分代码，缓存这部分机器码 + 跳过这部分类型判断逻辑，从而实现性能优化

- 最佳实践：

- 尽可能保持变量类型统一，包括普通变量、函数参数等；
- 保持类型结构统一，尽可能不变
- 使用 ts

## 什么是类型推导

那么接下来，我们来看看所谓的类型推测

- 使用 d8：clone v8 源码，编译出 d8 工具
- v8 执行基本过程：

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663690968596-b5bac40b-5f27-4f78-a5a2-eebf63dc94a7.png)

- 代码转译成 ast
- 调用 Ignition 的 `BytecodeGenerator` 将 ast 转译成字节码
- 执行字节码，过程中收集代码执行情况
- 命中优化策略后，调用 TurboFan，生成优化后的机器码
- 执行机器码

- ast：`--print-ast`
- bytecode: `--print-bytecode`

- 字节码是一种接近机器码的抽象代码，可以理解为夹在高级语言与机器汇编指令之间的一层抽象，能够被用于实现移植复用，在高级语言如 java、c# 等都有类似设计

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663691664307-8c1bffaf-2ec1-4250-b704-e4f4091d2de1.png)

- `ldar` 将寄存器a1的值加载到累加器寄存器中
- `add` 两个值相加
- `return` 返回结果

- 推测优化：热点代码

- 执行 `add` ：

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663693222067-c26d3c72-92ab-4f92-af2d-a057e8b01273.png)

- 类型判断：

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663693240191-687acd00-8768-4a87-b096-00275b1e015b.png)

- 解决方案：Feedback Vendor(通过闭包方式与函数产生关联)

- ![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663693262368-7e1f2639-46dc-4e98-b8b9-c83af1ca489d.png)
- Ignition 会持续收集每一个变量内容性质，推测变量类型，并收集到 vendor 的 BinaryOp 中
- ![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663693516833-182b15a8-5538-4b77-8f49-1889e430c6e4.png)
- 这是一张有向图，只能向前不能往后退
- 每次 BinaryOp 发生变化，都会导致 turbo 优化代码失效，需要重新收集变量内容状态
- any 代表变量是多态的，通常意味着无法被优化
- 可以通过 `%DebugPrint(add);`查看 vendor 内容

```bash
 - feedback vector: 0x3a6500293dfd: [FeedbackVector] in OldSpace
 - ...

 - slot #0 BinaryOp BinaryOp:SignedSmall {
     [0]: 1
  }
```

- 优化：`--print-opt-code`

- 经过优化后：

- `slot #0 BinaryOp BinaryOp:SignedSmall`

- 优化：

- 跳过诸多类型检查逻辑；
- 将代码编译为机器码，缓存到内存，后续不需要重复执行 bytecode => 机器码的转换

- 回退：

- 变量 shape 一旦变化，优化失败，回退到解释器执行

- 完整指令：`out/x64.debug/d8 --print-opt-code --allow-natives-syntax add.js`





资料：

- https://medium.com/dailyjs/understanding-v8s-bytecode-317d46c94775
- https://tehub.com/a/8xrFpcc1Yg
- https://v8.dev/docs/d8
- https://juejin.cn/post/6863269040300032008
- https://ponyfoo.com/articles/an-introduction-to-speculative-optimization-in-v8
- https://bibliography.selflanguage.org/_static/pics.pdf