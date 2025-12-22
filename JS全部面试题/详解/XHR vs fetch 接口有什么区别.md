## 基础

- 两者都用于异步加载数据
- xhr 只支持事件风格，且接口前后调用有顺序要求，比较难用，过往也一直通过 jQuery、axios 等方式包装一下，让它更好用；
- fetch 支持配置 + promise 回调风格，能够简化用法，避免回调地狱等；
- xhr 兼容性会更好；fetch 是h5之后提出的api

## fetch 深入解析

### 用法

- fetch 支持 promise 风格，并且把http通讯过程信息拆解为 Header、Request、Response 等对象族；

1. `Request`：表示一个HTTP请求的对象。可以使用 `new Request()` 构造函数创建一个请求对象，也可以使用现有的请求对象进行操作和创建新的请求对象。请求对象包含请求的URL、方法、头部、身份验证信息等。
2. `Headers`：表示HTTP请求或响应的头部信息的对象。可以使用 `new Headers()` 构造函数创建一个头部对象，也可以使用现有的头部对象进行操作和创建新的头部对象。头部对象允许您添加、删除、获取和操作请求或响应的头部字段。
3. `Response`：表示HTTP响应的对象。它包含了响应的状态码、头部、响应体等信息。响应对象可以通过fetch()方法返回的Promise进行创建，也可以通过其他方式创建（例如，通过new Response()构造函数）。
4. `Body`：表示HTTP请求或响应的主体部分的对象。它提供了许多方法来处理请求或响应的主体数据，例如读取、写入、序列化和解析数据。请求和响应对象都继承了Body对象。

- xhr 则把这些概念全部耦合到 XMLHttpRequest 对象中，只是通过不同属性做区分；
- 大部分情况下，fetch 更清晰简洁

```javascript
fetch('xxx', {options}).then();

const req = new XMLHttpRequest();
req.addEventListener("load", (r)=>{console.log(r)});
req.open("GET", "./d");
req.send();
```

- header:

```javascript
fetch('./d',{headers:{'x-token':'xxx'}})

const req = new XMLHttpRequest();
req.addEventListener("load", (r)=>{console.log(r)});
req.open("GET", "./d");
// 必须放在open之后
req.setRequestHeader('x-token', 'xxx')
req.send();
```

- 进度：

```javascript
// Step 1: start the fetch and obtain a reader
let response = await fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits?per_page=100');

const reader = response.body.getReader();

// Step 2: get total length
const contentLength = +response.headers.get('Content-Length');

// Step 3: read the data
let receivedLength = 0; // received that many bytes at the moment
let chunks = []; // array of received binary chunks (comprises the body)
while(true) {
  const {done, value} = await reader.read();

  if (done) {
    break;
  }

  chunks.push(value);
  receivedLength += value.length;

  console.log(`Received ${receivedLength} of ${contentLength}`)
}


// 简洁很多
const req = new XMLHttpRequest();
req.addEventListener("progress", (r)=>{console.log(r)});
req.open("GET", "./d");req.setRequestHeader('x-token', 'xxx')
req.send();
```

- 取消：

```javascript
const controller = new AbortController();
fetch('xxx', { signal: controller.signal })
.then((response) => {
  console.log('Download complete', response);
})
.catch((err) => {
  console.error(`Download error: ${err.message}`);
});

controller.abort();

const req = new XMLHttpRequest();
req.addEventListener("load", (r)=>{console.log(r)});
req.open("GET", "./d");
req.send();
req.abort()
```

### 安全

fetch 接口有更完整的安全模型：

- fetch 的 credentials 支持：omit、include、same-origin 三种值，更适合实际场景；xhr 的 withCredentials 只支持 true/false

```javascript
fetch('https://www.baidu.com',{credentials:'omit'})
```

1. **"omit"**：默认值。该值表示在请求中不包含凭据，不会自动发送或接收任何与凭据相关的信息。
2. **"same-origin"**：表示仅在当前域名下发送请求时包含凭据。如果请求的 URL 与当前页面的域名相同，则会自动发送凭据。对于跨域请求，不会包含凭据。
3. **"include"**：表示无论跨域与否，都会包含凭据。无论请求的 URL 是否与当前页面的域名相同，都会自动发送凭据。
4. **"require"**：类似于 "same-origin"，但要求请求始终包含凭据。如果请求的 URL 与当前页面的域名不同，则会引发异常。

- fetch 支持 mode，用于设置跨域请求特性(cors/no-cors/same-origin)，特别注意 no-cors，效果如同请求跨域 img，不过你不能读取响应的内容

1. **"same-origin"**：默认值。该值表示请求的模式为同源请求，即请求只能在当前域名下进行。
2. **"cors"**：表示请求的模式为跨域请求（Cross-Origin Resource Sharing）。使用该模式可以发送跨域请求，但需要**服务器设置正确的 CORS 响应头**。
3. **"no-cors"**：表示请求的模式为跨域请求，但是不需要服务器设置 CORS 响应头。在该模式下，请求只能进行简单的跨域请求，且只能访问响应的一些基本信息，例如响应的类型、状态和头部，不能访问真正的响应体。
4. **"navigate"**：表示请求的模式用于页面导航。通常用于发送 GET 请求以导航到指定的 URL。
5. **"websocket"**：表示请求的模式用于 WebSocket 连接。
6. **"no-referrer"**：表示在请求中不包含引用来源（referrer）信息。

- fetch 支持通过 integrity 属性设置 hash 校验，设置后浏览器会自动校验资源内容的 hash 值，确保内容未被三方篡改，这在文件下载场景中非常有用：

```typescript
fetch('https://example.com/my-resource.js', {
  integrity: 'sha256-K4jf9w2n4n4j2...'
})
  .then(response => {
    // 处理响应
  })
  .catch(error => {
    // 处理错误
  });
```

- fetch 支持通过 redirect 属性设置是否允许跳转



### 性能

- fetch 支持设置 `keepalive`属性，显式控制 tcp 连接是否断开(默认情况下，页面关闭后 tcp 连接依然存活直到过期，这其实有点资源浪费)
- fetch 支持流式处理响应数据：

```javascript
// Step 1: start the fetch and obtain a reader
let response = await fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits?per_page=100');

const reader = response.body.getReader();

// Step 2: get total length
const contentLength = +response.headers.get('Content-Length');

// Step 3: read the data
let receivedLength = 0; // received that many bytes at the moment
let chunks = []; // array of received binary chunks (comprises the body)
while(true) {
  const {done, value} = await reader.read();

  if (done) {
    break;
  }

  chunks.push(value);
  receivedLength += value.length;

  console.log(`Received ${receivedLength} of ${contentLength}`)
}
```

- fetch 可以定制http请求的缓存策略：

```javascript
const url = 'https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/e08da34488b114bd4c665ba2fa520a31.svg';

fetch(url,{cache:'no-store'})
fetch(url, {cache:'force-cache'})
```

- "default": 默认值。浏览器将根据默认的缓存策略进行处理。如果存在缓存，则返回缓存的响应；否则发起实际的网络请求。
- "no-store": 完全绕过缓存，每次请求都会发起实际的网络请求，并忽略现有的缓存。
- "reload": 忽略缓存，每次请求都会发起实际的网络请求，并且不使用现有的缓存响应。
- "no-cache": 发起实际的网络请求，但在请求期间仍会使用缓存。服务器可以根据缓存的验证标头（例如 ETag 或 Last-Modified）决定是否返回实际的响应或 304 Not Modified。
- "force-cache": 如果存在缓存，则返回缓存的响应，否则发起实际的网络请求。即使缓存过期，也会返回缓存的响应，不会进行验证



### 问题

- fetch 不能设置超时时间
- xhr 支持同步调用
- xhr 支持 progress 进度事件，兼容上传和下载过程；fetch 没有相关接口，但可以通过 `response.body` 迂回解决

```javascript
// Step 1: start the fetch and obtain a reader
let response = await fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits?per_page=100');

const reader = response.body.getReader();

// Step 2: get total length
const contentLength = +response.headers.get('Content-Length');

// Step 3: read the data
let receivedLength = 0; // received that many bytes at the moment
let chunks = []; // array of received binary chunks (comprises the body)
while(true) {
  const {done, value} = await reader.read();

  if (done) {
    break;
  }

  chunks.push(value);
  receivedLength += value.length;

  console.log(`Received ${receivedLength} of ${contentLength}`)
}
```




视频讲解：

此处为语雀视频卡片，点击链接查看：[XHR vs fetch 接口有什么区别.mp4](https://www.yuque.com/u1598738/zqco83/eg4765614t8av3ta#mLWMx)