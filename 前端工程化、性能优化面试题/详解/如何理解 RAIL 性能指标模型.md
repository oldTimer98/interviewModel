主要考察 Web 页面性能综合知识，一般会伴随具体的

## 是什么

RAIL => response/animation/idle/load

- response：在 100 毫秒内完成由用户输入发起的转换，让用户感觉交互是即时的。

- 交互（点击/输入/触屏）后立即（100ms）得到响应
- 如果无法立即作出响应，也应该提供加载状态等中间态

- animation：

- 目标为流畅的视觉效果。用户会注意到帧速率的变化，理想情况下应保持做60fps
- 在 10 毫秒或更短的时间内生成动画的每一帧。从技术上来讲，每帧的最大预算为 16 毫秒（1000 毫秒/每秒 60 帧≈16 毫秒），但是，浏览器需要大约 6 毫秒来渲染一帧，因此，准则为每帧 10 毫秒。
- 视觉动画/滚动（虚拟滚动）/拖拽

- idle：最大限度增加空闲时间以提高页面在 50 毫秒内响应用户输入的几率
- load：

- 根据用户的设备和网络能力优化相关的快速加载性能。目前，对于首次加载，在使用速度较慢 3G 连接的中端移动设备上，理想的目标是在 [5 秒或更短的时间](https://web.dev/performance-budgets-101/#establish-a-baseline)内[实现可交互](https://web.dev/tti/)。
- 对于后续加载，理想的目标是在 2 秒内加载页面。

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1653729872546-e34b0e63-0335-45eb-9504-d5f655e00a4a.png)

## 怎么优化

Rail 模型提供了关于性能思考等方法论，我们不可能把时间都花在性能优化上，只能尽量把时间花在刀刃上，所以需要有一个性能模型，告诉我们该尽量优化那些方面，我们需要追求各个维度都尽量满足 RAIL 阈值

- response：

- 事件处理函数在50ms内完成，考虑到idle task的情况，事件会排队，等待时间大概在50ms。适用于click，toggle，starting animations等，不适用于drag和scroll。
- 复杂的js计算尽可能放在后台，如web worker/settime，避免对用户输入造成阻塞
- 超过50ms的响应，一定要提供反馈，比如倒计时，进度百分比等。

- animation

-  在一些高压点上，比如动画，不要去挑战cpu，尽可能地少做事，如：取offset，设置style等操作。尽可能地保证60帧的体验。
- 在渲染性能上，针对不同的动画做一些特定优化
- 优化滚动效率，如虚拟滚动

- idle

- 用空闲时间来完成一些延后的工作，如先加载页面可见的部分，然后利用空闲时间加载剩余部分，此处可以使用 [requestIdleCallback API](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWindow%2FrequestIdleCallback)
- 在空闲时间内执行的任务尽量控制在50ms以内，如果更长的话，会影响input handle的pending时间
- 如果用户在空闲时间任务进行时进行交互，必须以此为最高优先级，并暂停空闲时间的任务

-  load

- 在手机设备上测试加载性能，选用中配的3G网络（400kb/s，400ms RTT），可以使用 [WebPageTest](https://link.juejin.cn/?target=https%3A%2F%2Fwww.webpagetest.org%2Feasy) 来测试
- 要注意的是，即使用户的网络是4G，但因为丢包或者网络波动，可能会比预期的更慢
- [禁用渲染阻塞的资源，延后加载](https://link.juejin.cn/?target=https%3A%2F%2Fweb.dev%2Frender-blocking-resources%2F)，async/defer
- 可以采用 [lazy load](https://link.juejin.cn/?target=https%3A%2F%2Fweb.dev%2Fnative-lazy-loading%2F)，[code-splitting](https://link.juejin.cn/?target=https%3A%2F%2Fweb.dev%2Freduce-javascript-payloads-with-code-splitting%2F) 等 [其他优化](https://link.juejin.cn/?target=https%3A%2F%2Fweb.dev%2Ffast%2F) 手段，让第一次加载的资源更少



资料：

-  https://web.dev/i18n/zh/rail/