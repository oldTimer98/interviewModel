## 基本概念

- 是什么：HTML5 引入的，用于实现客户端-服务器之间全双工通讯的网络协议，一旦连接成功，后续服务端、客户端都可以主动向对方发送消息1
- 为什么：

- 有很多实时应用场景，需要双工交互
- http 只支持由客户端发起的通讯，导致无法由服务端主动推送一些消息；在过往这个问题可能会以轮询通讯方式实现

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1668269584273-e12cc1c4-a911-4b64-be4a-729f991bd55e.png)

- 但：占用更多资源(cpu/内存/网络)、响应不及时

- 应用场景：

- web 端游戏
- 在线教育
- webpack devServer
- 协同编辑
- 等等



## 深入理解

- 重点：

- 握手过程：复用 http 协议，借助 101 响应码实现协议升级(**复用 http、https 默认端口**)

- 客户端发送链接请求

```plain
GET / HTTP/1.1
Host: localhost:8080
Origin:http: //127.0.0.1:3000
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: w4v7O6xFTi36lq3RNcgctw==
```

- Sec-WebSocket-Key：一个随机字符串，服务器端会用这些数据来构造出一个 SHA-1 的信息摘要，避免恶意链接 or 错误连接

- 服务端返回协议升级响应

```plain
HTTP/1.1 101 Switching Protocols
Connection:Upgrade
Upgrade: websocket
Sec-WebSocket-Accept: Oy4NRAQ13jhfONC7bP8dTKb4PTU=
```

- Sec-WebSocket-Accept：服务端根据 websocket-key 计算出来的摘要值，计算方式：
- 将Sec-WebSocket-Key跟 258EAFA5-E914-47DA-95CA-C5AB0DC85B11 拼接；
- 通过SHA1计算出摘要，并转成base64字符串。

- 客户端收到服务端的握手包之后，验证报文格式时候符合规范，以上一步中同样的方式计算Sec-WebSocket-Accept并与服务端握手包里的值进行比对。

- 如果是 wss，前置还需要走一次 tls 握手

- 数据交换：

- 分片：通过 ws 发送的消息，会被拆分为多个消息分片
- 组装：对方接收到数据帧后，判断帧内 FIN 是否为 1，以此判断单个消息是否发送完毕

- 心跳：双向通信，需要确保客户端、服务端之间的TCP通道保持连接没有断开

- 优点：

- 更好的二进制支持
- 更少的协议头开销
- 支持扩展(自定义子协议)
- 支持跨域(???)
- http 轮询：占用更多资源、响应不及时等，切换到 ws 能节约许多性能成本

- 缺点：

- 客户端 & 服务器需要长久维护一条连接，有一定性能开销
- 兼容性
- 与 http 的 request-response 模型差异较大，初学者需要适当转换思维模式
- ws 不会携带 cookie，需要自行维护：

- 最佳实践：

- 使用 wss
- 处理好断线重连逻辑
- 使用开源组件库，例如 socket.io(支持向后兼容)