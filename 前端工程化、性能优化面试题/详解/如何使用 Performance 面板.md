![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1653800987832-b94ccbb4-e8bc-4af7-b7e8-cf379bff530c.png)

- chrome 性能分析工具，同类还有 web vitals、Lighthouse、memory 等，performance 面板能力非常综合且detail，优点是充分展现性能数据的所有细节，有助于排查具体卡点；缺点是数据量大，概念很多，上手、分析难度都比较大，一般可搭配 Lighthouse 等工具使用
- 用法

1. 开启匿名模式
2. 打开 performance 面板，可设置适当的 throttling，模拟移动端环境
3. 点击 record 按钮，开始记录

- 学习重点：

- 学会观察面板数据，推断“是否有问题”，重点：

- FPS 判断是否掉帧
- script 耗时是否过高

- 学会观察细节面板，推断“问题出在那”

- summary 面板，查看各个环节需要的时间（rendering、scripting）
- main 面板，查看各个 js 函数需要的时间

- 面板概览

- FPS：单次渲染不应该超过16ms —— 60fps

- 绿色：表示帧率，越高越好
- 红色：表示有需要长时间绘制的帧，可能会导致帧率降低
- 问题：

- 为什么帧率会变化？需要渲染 vs 能渲染

- CPU 面板

- 绿色：表示 paiting 使用的时间
- 黄色：JS 执行时间
- 紫色：布局时间
- 蓝色：资源加载 loading 时间，
- 灰色表示其它

- network：网络图
- frames：展示每一帧状态，可能包含：

- idle frame: 空闲帧，啥都没做
- frame：绿色，for 正常帧，表示符合预期的帧
- dropped frame：红色，丢帧
- partially presented frames: 黄色，部分渲染帧，可能只能渲染这一帧的一部分，例如滚动时
- 重点关注黄色、红色的

- main：主线程面板，[demo](https://activitytabs.glitch.me/)

- 具体行为下的函数调用栈
- 点击事件，查看改事件下的时间消耗
- 特别关注长任务
- activity

- event，click、hover 等
- animation frame fired
- timer: settimeout/setInterval
- paint：渲染
- style caculating：为 dom 计算出需要 apply 的样式规则

- memory: 内存消耗看板
- 统计面板：

- summary：各阶段耗时

- loading：网络通讯和 html 解析
- scripting: js 相关处理，包括：触发事件、编译代码、执行代码、js 代码执行
- rendering：layout、Recalculate style、scroll
- painting：Composite Layers、Image Decode、Image Resize、Paint
- idel：空闲时间

- bottom up：根据事件耗时长短，反向列出事件列表，有分类可选

- 可以根据该面板推断出那部分操作耗时较长

- raster：光栅化线程耗时
- GPU：
- compositor：合成线程执行记录

- 难点：

- 各种专业术语看不懂，例如 timer fired、compile script、evaluate script，解决方案是收集相关词典
- 很难从各种细节事件中，推断出具体那个动作更耗时，所以需要抓大放小，可以配合 lighthouse 等工具使用

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1653822878937-030b70b2-ea91-4291-98ff-8ee1c7104bc5.png)

资料：

- https://googlechrome.github.io/devtools-samples/jank/
-  https://developer.chrome.com/docs/devtools/evaluate-performance/
- https://www.debugbear.com/blog/devtools-performance#overview-of-the-the-performance-tab
- https://juejin.cn/post/7067332850927796238#heading-6
- https://developer.chrome.com/docs/devtools/evaluate-performance/performance-reference/#common_timeline_event_properties