## 是什么

ES6之后引入，用于实现异步编程的特殊对象；衍生开来，ES7 后被用于实现 async-await 语法。

## 为什么

在 promise 之前，异步操作通常通过注册 **callback 回调方式**处理异步结果，很容易带来回调地狱问题，最终造成代码结构非常不清晰，不直观，维护成本较高(**回调地狱**)

```javascript
fs.readdir(source, function (err, files) {
  if (err) {
    console.log('Error finding files: ' + err)
  } else {
    files.forEach(function (filename, fileIndex) {
      console.log(filename)
      gm(source + filename).size(function (err, values) {
        if (err) {
          console.log('Error identifying file size: ' + err)
        } else {
          console.log(filename + ' : ' + values)
          aspect = (values.width / values.height)
          widths.forEach(function (width, widthIndex) {
            height = Math.round(width / aspect)
            console.log('resizing ' + filename + 'to ' + height + 'x' + height)
            this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {
              if (err) console.log('Error writing file: ' + err)
            })
          }.bind(this))
        }
      })
    })
  }
})
```

## 怎么用

```javascript
const fetchData = ()=>{
  return new Promise((resolve, reject)=>{
    const data= fs.readdir('xxx', (err, data)=>{
      if(err){
        reject(err)
        return;
      }
      resolve(data);
    });
  })
}

fetchData().then(()=>{xxx}).catch(()=>{xxx})
// 或者 ES7 之后
const data=await fetchData();
console.log(data)
```

- 定义：

- promise 构造函数中定义异步逻辑的主体(同步代码)
- 主体逻辑执行结束后，调用 resolve、reject 函数切换 promise 实例**状态**，声明流程结束

- 使用：

- 调用函数，并注册 then/catch 回调，注册异步流程结束的“回调”(基于微任务队列的异步回调)
- 使用 async-await 语法糖注册回调

- Promise 接受异步任务并立即执行，在任务完成后，将状态标记为最终结果（成功或失败）。

## 深入理解

- 接口简单，但规则有点绕

- 状态：pending=>fullfill/rejected，状态不可逆
- 链式调用：`then/catch` 函数执行后应该返回一个**新的 promise 对象**

- 上一个 then 的 return 值会传递到下一个 then 作为 resolve 结果

```javascript
new Promise((resolve) => {
  resolve(1)
}).then((data) => {
  return data + 1; =>data===1
}).then((data) => {
  console.log(data) => 2
}).catch(err=>{
  // 前面出现的所有异常都可以捕获到
  // 
}).catch(()=>{});

const fetchData=()=>xxxx;

async function(){
  try{
    const data= await fetchData()
  }catch(err){
    console.log(err.message)
  }
}

window.onunhandlerejection = (err)=>{
  reportError(err);
}
```

- 记住，每次 then/catch 之后都是一个新的 promise，与原来那个不一样

- 异常处理：

- then 的第二个参数，但 then 的异常不能被捕获（不推荐使用这种方法）
- catch，但不能处理最后一个 catch 异常（问题不大）
- 推荐：

- 配合 async-await 的 try-catch 语句，但不能处理 catch 异常
- 全局的 onunhandlerejection，兜底

- 全局工具方法：

- Promise.all：=> 返回一个新的 promise

- 全部 fulfill 时 fulfill，任意 **reject 都会 reject**

- Promise.allSettled：全部 fulfill 或 reject 后 fulfill
- Promise.any：任意一个 fulfill 时 fulfill，若全部reject 则抛出异常，个别几个出现 reject 的时候也会被忽略
- Promise.race：任意一个 fulfill 或 reject 时结束

## 最佳实践

- 避免过度封装(`fetch('/users')`本来就已经返回了 promise，还非得包装一次)

```javascript
const fetchUser =()=>{
  return new Promise((r,j)=>{
    fetch('/users').then(data=>{
      r(data);
    })
    .catch(e=>{j(e)})
  })
}
```

- 避免过度嵌套（回到回调地狱风格），要学会灵活应用链式调用规则！

```javascript
// 错误用法
request(opts)
  .catch(err => {
    if (err.statusCode === 400) {
      return request(opts)
             .then(r => r.text())
             .catch(err2 => console.error(err2))
    }
  })

// 正确用法
request(opts)
.catch(err => {
  if (err.statusCode === 400) {
    return request(opts);
  }
  return Promise.reject(err);
})
.then(r => r.text())
.catch(err => console.erro(err));
```

- 使用 catch 而非 then 捕获异常状态；但最后一个 catch 抛出的异常可能不会被 catch，此时可以注册全局 `window.onunhandledrejection`

```javascript
xxx()
	.catch((err)=>{
    throw new Error()
  })
	.catch(err=>{throw new Error()})

window.onunhandledrejection = function(err){}
```

- 尽可能使用 `Promise.all` 并发执行异步操作（页面性能优化技巧）

```javascript
const data1 = await fetchData1();
const data2 = await fetchData2();
const data3 = await fetchData3();

// 推荐用法：
const [data1, data2, data3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3()
])
```

- 技巧：
- 缓存异步数据，适用于基础字典型数据中（类似的，可以用于提前加载数据）

```javascript
let p=null

const fetchUser=(force=false)=> {
  // 异常处理？
  // 强制刷新？
  
  if(force === false && !!p){
    // 第二次之后
    return p;
  }
  // 第一次
  p = fetch('xxx');
  return p;
}
```

- 可以分离复杂计算逻辑

```javascript
// doSometing
await Promise.resolve();
// 继续 doSomething
```

- 将传统回调封装为 promise 风格
- 中断请求(fetch 场景建议使用 `AbortController`接口)：

```javascript
function wrapPromiseWithCancel(originP) {
  let cancel = null
  const cancelP = new Promise(function (_, reject) {
    cancel = () => reject(new Error('Cancel'))
  });
  const groupedP = Promise.race([originP, cancelP])
    .catch(err => {console.log(err.message)
      if (err.message === 'Cancel') {
        // 主动取消时，不触发外层的 catch
        return Promise.resolve({message: '请求已取消'})
      }
      throw err
    });
  return Object.assign(groupedP, {
    cancel
  });
}

// 使用如下
const p = wrapPromiseWithCancel(fetch('https://juejin.cn/'));
p.then((data) => {
  console.log('回调数据', data);
});
p.cancel(); 
```

- 历史：

- callback 异步回调，带来回调地狱
- co、blubird 等异步协作库，很好地解决了回调地狱问题，后来社区逐渐提出 A+ 等 promise 草案（革命性，但不够简洁）
- 到后面，w3c 吸收 a+ 等草案内容，组织成完整的 promise 规范(ES2015)
- 配合生成器推出 **async-await**(ES7)，终于可以将同步异步代码愉快放在一起编写



资料：

- https://juejin.cn/post/6844904063570542599
- https://promisesaplus.com/