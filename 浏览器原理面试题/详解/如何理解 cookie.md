## 视频讲解

此处为语雀视频卡片，点击链接查看：[如何理解 cookie.mp4](https://www.yuque.com/u1598738/zqco83/lg131wur9oka0lql#SPSO3)

##     是什么

一段 key-value 形式的文本片段，通讯时服务器可通过 http header 下发 cookie 信息记录到用户浏览器；浏览器在后续通讯时会自动带上。

```javascript
document.cookie = "username=John Doe; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/";
```

## 为什么

http 本身是一种无状态协议，服务器无法单纯从网络协议层面判定用户身份，因此需要通过 cookie 方式持久化用户凭证，让服务器能映射回用户信息



## 怎么用

可通过服务器 response 的 set-cookie 头下发；也可以在 js 中写入；后续浏览器会自动帮我们带上；

~~~javascript
```javascript
// 设置cookie
function setCookie(name, value) {
    document.cookie = `${name}=${value};path=/`;
}

// 获取cookie
function getCookie(name) {
    let cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        let cookiePair = cookies[i].split('=');
        if (name == cookiePair[0]) {
            return cookiePair[1];
        }
    }
    return null;
}

// 使用示例
setCookie('name', 'John'); // 设置一个名为 'name' 的 cookie，值为 'John'
console.log(getCookie('name')); // 获取并输出 'name' 的 cookie 值
```
HTTP/1.1 200 OK
Content-type: text/html
Set-Cookie: name=John; Expires=Wed, 09 Jun 2021 10:18:14 GMT
~~~



![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663429075519-68ad78a3-9b6f-4923-a20d-53418aeb4a8b.png)

cookie 过往可能会被用于记录很多乱七八糟的信息；现在则主要用于实现记录用户登录态、浏览器行为跟踪

## 进阶

### Cookie 安全性

cookie 常被用于记录用户登录态，那自然而然的，安全性非常非常重要！！！

```bash
Set-Cookie: id=a3fWa; Max-Age=2592000; Path=/; Domain=somecompany.co.uk; Secure; HttpOnly; SameSite=Lax; Expires=Wed, 21 Oct 2015 07:28:00 GMT
```

- Max-age：cookie 有效期
- expires：cookie 过期时间
- path：cookie 生效路径,(当前： http://ww.baidu.com； path: /foo/bar)
- secure：仅在 https 环境中生效
- HttpOnly：无法通过 `docuemnt.cookie` 获取 cookie，主要用于防止 xss
- domain：指定 cookie 可以送达的域名，也就是这个 cookie 能在哪些地方用；默认为当前 页面 所在域名； 可有效防止 csrf

- 有一个细节，`xxx.com` 为严格域名；`.xxx.com` 为宽松域名，对子域名也能生效，但 fetch 时需要带上 `credentials": "include`

- samesite：用于设置 cookie 在跨站请求场景中的行为，可用于防御 csrf 攻击，支持：

- strict：仅同源请求发送 cookie，但过于严格，通常不太会用(例如，当前网页有一个 GitHub 链接，用户点击跳转就不会带有 GitHub 的 Cookie，跳转过去总是未登陆状态。)
- lax：稍微宽松，也限定为仅同源请求发送 cookie，但链接跳转的 get 请求除外
- none：不作限制，但要求同时设置 `Secure`
- 问题：假设 `domain=.juejin.com; samesite=strict` ，在 `api.juejin.com`访问，会否发送 cookie？

![img](https://cdn.nlark.com/yuque/0/2022/png/26698409/1663433007028-f71f2a5c-59cc-46c3-9f31-1c0c49f9dd1f.png)

### 使用 Cookie 存储用户登录态

- 用户打开网页后，服务端生成随机、唯一会话标识符(session_id)，当然了，通常还会设置超时时间
- 用户登录后，服务端记录 session_id 到 user 的关联关系（内存、redis、持久化数据库等）
- 用户再次发送请求后，服务端通过 session_id 找到对应 user 信息，从而实现 session 到 user 的映射
- 所以，理想方案下 cookie 并不记录用户(这也是一个安全问题)，而是记录当前会话
- 优点：

- 应用简单，几乎不需要额外配置
- 非常标准，几乎所有服务端框架都支持

- 问题：

- 应尽可能减少 cookie 的使用，应用会带来网络负担
- 仅在浏览器可用，app 等场景下使用 http 时不生效
- 服务端需要记录 cookie 到用户信息的映射，压力大
- 分布式服务器场景下，需要在多服务器间共享用户态，对服务端压力较大
- 大小有限制

- 最佳实践：

- 不要在 cookie 存储敏感信息
- 强制启动 secure；建议启动 HttpOnly

### 其他用户态方案

- jwt：

- 基本过程：用户登录后返回 token，浏览器存储在 localstorage 中，下次发送请求时通过 js 主动带上 token 数据，服务端解析 token 内容，验证、还原用户状态
- 优点：

- 服务端不需要存储用户登录态，天然的分布式认证方案，不需要 server 做任何信息存储，可用于分布式集群场景
- 适配 app 等无 cookie 场景
- 具有防篡改能力
- 天然能预防 csrf 攻击

- 缺点：

- 需要js 手动执行 token 的附加发送
- 数据发散分布在用户端，服务器无法主动撤销 token 签发，这意味着不作额外处理时，jwt 下用户无法主动注销登录态