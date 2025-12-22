核心点：

1. 理解 Cookie vs LocalStroage vs SessionStroage 三者的差异，各自的优缺点
2. 理解什么是 IndexedDB，一些常见的使用场景

## Cookie vs LocalStroage vs SessionStroage 三者的差异

三者都是浏览器存储，对于它们各自的特点优势，可以梳理成表格进行记忆

| 分类         | Cookie                                                       | LocalStroage                               | SessionStroage                                               |
| ------------ | ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| 生命周期     | 默认保存在内存中，随浏览器关闭失效（如果设置过期时间，在到过期时间后失效） | 理论上永久有效的，除非主动清除。           | 仅在创建 sessionStorage 的当前标签页有效，这意味着即使是同一站点的不同标签页也不能共享；且关闭页面或浏览器后会被清除。 |
| **存储容量** | 4KB                                                          | 4.98MB（不同浏览器情况不同，safari 2.49M） | 4.98MB（部分浏览器没有限制）                                 |
| 存储位置     | 保存在客户端                                                 | 保存在客户端                               | 保存在客户端                                                 |
| http请求     | 每次请求时都会带上                                           | 不与服务端交互。节省网络流量               | 不与服务端交互。节省网络流量                                 |

## 理解什么是 IndexDB

无论是 Cookie、LocalStroage、SessionStroage，它们的存储空间都是有限的。

IndexDB 是一个运行在浏览器上的**非关系型数据库**。既然是数据库了，那就不是 5M、10M 这样小打小闹级别了。理论上来说，IndexDB 理论上是没有存储上限的（一般来说不会小于 250M）。

它不仅可以存储字符串，还可以存储二进制数据。



主要特点：

1. **键值对储存：** IndexedDB 内部采用对象仓库（object store）存放数据。所有类型的数据都可以直接存入，包括 JavaScript 对象。对象仓库中，数据以"键值对"的形式保存，每一个数据记录都有对应的主键，主键是独一无二的，不能有重复，否则会抛出一个错误。
2. **异步**：IndexedDB 操作时不会锁死浏览器，用户依然可以进行其他操作，这与 LocalStorage 形成对比，后者的操作是同步的。异步设计是为了防止大量数据的读写，拖慢网页的表现。
3. **支持事务：**IndexedDB 支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，数据库回滚到事务发生之前的状态，不存在只改写一部分数据的情况。
4. **同源限制：**IndexedDB 受到同源限制，每一个数据库对应创建它的域名。网页只能访问自身域名下的数据库，而不能访问跨域的数据库。
5. **支持二进制储存：**IndexedDB 不仅可以储存字符串，还可以储存二进制数据（ArrayBuffer 对象和 Blob 对象。
6. **储存空间大：**IndexedDB 的储存空间比 LocalStorage 大得多，一般来说不少于 250MB，甚至没有上限。储 存 在 电 脑 上 中 的 位 置 为 *C:\Users\当 前 的 登 录 用 户\AppData\Local\Google\Chrome\User Data\Default\IndexedDB*



举一个实际应用场景：

结合[大文件上传](https://www.yuque.com/u1598738/vqazlv/tx93taqxlzs1ng8e)这个项目，当我们要实现刷新页面的断点续传，对于超大文件，在第一次选择文件时，就需要分片后存储在 indexedDB 中。（Cookie vs LocalStroage 存储空间太小）



## Cookie vs LocalStroage vs SessionStroage、 IndexDB各自优缺点

1. Cookie：

作用：Cookie主要用于在客户端（浏览器）和服务器之间存储少量的数据，用于识别用户、实现会话状态管理和记录用户偏好等功能。

- 优点：

- 支持跨域访问。
- 数据在浏览器和服务器之间传递。

- 缺点：

- 存储容量有限，通常最大为4KB。
- 每次请求都会携带Cookie数据，增加网络流量。
- 存储在Cookie中的数据可以被用户修改或删除。
- 只能存储字符串类型的数据。

1. LocalStorage：

作用：LocalStorage是HTML5引入的机制，用于在浏览器端长期存储数据，供同一域名下的页面共享。

- 优点：

- 存储容量较大，通常为5MB或更大。
- 数据存储在客户端，不会随每次请求发送到服务器。
- 支持存储复杂的数据类型，如对象和数组。

- 缺点：

- 仅在同一域名下共享数据。
- 数据存储在客户端，可能存在安全风险。
- 无法跨域访问。

1. SessionStorage：

作用：SessionStorage与LocalStorage类似，但是数据在浏览器会话期间有效，关闭页面后数据会被清除。

- 优点：

- 存储容量较大，通常为5MB或更大。
- 数据在浏览器会话期间有效，关闭页面后清除，适合存储临时数据。
- 支持存储复杂的数据类型。

- 缺点：

- 仅在同一浏览器窗口或标签页中共享数据。
- 无法跨域访问。

1. IndexedDB：

作用：IndexedDB是一个高级的客户端数据库系统，提供了异步操作和丰富的查询能力，用于在浏览器中存储大量结构化数据。

- 优点：

- 存储容量较大，通常为数百MB或更大。
- 支持大规模、高性能的数据操作和查询。
- 可以存储复杂的数据结构，支持事务。

- 缺点：

- 学习曲线较陡，API复杂。
- 不同浏览器的兼容性存在差异。

### 这些机制之间的异同点如下：

- Cookie、LocalStorage和SessionStorage都是基于键值对的存储方式，而IndexedDB更接近关系型数据库。
- Cookie具有跨域访问的能力，LocalStorage 仅在同一域名下共享数据，而SessionStorage和IndexedDB不支持跨域访问。
- Cookie在客户端和服务器之间传递数据，而LocalStorage、SessionStorage和IndexedDB存储在客户端。
- Cookie的存储容量较小，LocalStorage和SessionStorage一般较大，而IndexedDB容量更大。
- Cookie可以设置过期时间，而LocalStorage、SessionStorage和IndexedDB的数据在不被主动清除的情况下会一直存在。
- LocalStorage和SessionStorage是针对浏览器存储，关闭页面后重新打开仍然有效，而SessionStorage数据在会话结束时会被清除。

### 进阶链接：

1. [HTML 5 Web 存储](https://link.juejin.cn/?target=http%3A%2F%2Fwww.w3school.com.cn%2Fhtml5%2Fhtml_5_webstorage.asp)
2. [localStorage和sessionStorage详解](https://link.juejin.cn/?target=http%3A%2F%2Fblog.csdn.net%2Fmafan121%2Farticle%2Fdetails%2F60133107)
3. [详说 Cookie, LocalStorage 与 SessionStorage](https://link.juejin.cn/?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000002723469)