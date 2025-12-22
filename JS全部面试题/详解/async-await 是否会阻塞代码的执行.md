## 基础

`async-await` 在 JavaScript 中用于简化异步操作的处理，但它本身并不会阻塞代码执行,它允许以一种看似同步的方式编写异步代码，而实际上只是在特定函数的上下文中暂停执行，而不会阻塞整个程序的运行。

```javascript
async function asyncFunction() {
    console.log('Async function starts');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Async function ends after waiting');
}

console.log('Script starts');
asyncFunction();
console.log('Script continues after calling asyncFunction');
```

对应输出：

```javascript
Script starts
Async function starts
Script continues after calling asyncFunction
(等待2秒)
Async function ends after waiting
```

注意代码第 9 行，在执行 `asyncFunction` 后，输出 `Async function starts`，但遇到第 3 行的 `await`语句后，立即“脱离”函数逻辑，并执行第 9 行代码，输出 `Script continues after calling asyncFunction`，再往后，等待 `await` 后面的 promise 执行完毕后，再输出第 4 行内容。

因此，async-await 并不阻塞代码整体流程，而是借助 JS 的时间循环机制(微任务)，脱离当前函数，交出 cpu 控制权，执行函数后面的逻辑。



## 进阶

### 背景

`async-await` 是 JavaScript ES2017 新增的一种处理异步编程的方式，在此之前，我们的通常使用“回调”处理异步回调，但这种方式非常容易陷入回调地狱，例如：

```javascript
getData(function(a){
    getMoreData(a, function(b){
        getMoreData(b, function(c){ 
            getMoreData(c, function(d){ 
                getMoreData(d, function(e){ 
                    // 在这里处理结果e
                });
            });
        });
    });
});
```

而 `Promise`出现后，JavaScript 有了一种更标准通用的异步处理方式：

```javascript
// 链式调用
fetchUser(1)
    .then(user => processUser(user)) // 处理用户
    .then(processedUser => saveLog(processedUser)) // 保存日志
    .then(result => console.log(result)) // 输出最终结果
    .catch(error => console.error('Error:', error)); // 统一处理错误
```

但依然不够直观清晰，因此 ES2017 之后