核心点：

1. 理解什么是 Vue 中的双向绑定，带来的好处是什么？
2. 单向绑定和双向绑定的优缺点是什么？
3. 理解 Vue 中，对于 input、checkbox、radio、自定义组件的双向绑定实现细节
4. 能够回答出 v-model 和 sync 修饰符有什么区别



## 什么是 Vue 中的双向绑定

Vue 中双向绑定是一个指令 v-model，可以绑定一个响应式数据到视图。

1. 相应式数据的改变，会立即同步更新到视图
2. 同时如果在视图中改变该值，该值的变化能同步给对应的响应式数据。

因此称为**双向绑定**。

v-model 的本质其实是一个语法糖，默认情况下相当于:value 和 @input。使用 v-model 可以减少大量繁琐的事件处理代码，提高开发效率。

```html
<input v-model="xxx">

<!-- 上面的代码等价于 -->

<input :value="xxx" @input="xxx = $event.target.value">
<!-- 双向绑定 = 单向绑定 + UI事件监听 -->
```

v-model 是一个指令，它的神奇魔法实际上是 Vue 的编译器完成的。包含 v-model 的模板，转换为渲染函数之后，实际上还是是 value 属性的绑定以及 input 事件监听，事件回调函数中会做相应变量更新操作。

编译器根据表单元素的不同会展开不同的 DOM 属性和事件对，比如 

1. text 类型的 input 和 textarea 会展开为 value 和 input 事件
2. checkbox 和 radio 类型的 input 会展开为 checked 和 change 事件
3. select 用 value 作为属性，用 change 作为事件

v-model 指令还可以结合 .lazy、.number、.trim 对 v-mode 的行为做进一步限定。v-model 用在自定义组件上时又会有很大不同，Vue3 中它类似于 sync 修饰符，最终展开的结果是 modelValue 属性和 update:modelValue事件；

### 单向绑定和双向绑定的优缺点是什么？

- **单向绑定**：数据流也是单向的，对于复杂应用来说是实施统一状态管理（如redux）的前提。
- **双向绑定**：在一些需要实时反应用户输入的场合会非常方便（如多级联动菜单）。但常认为复杂应用中这种便利比不上引入状态管理带来的优势。因为不知道状态什么时候发生改变，是谁造成的改变，数据变更也不会通知。



## 从编译看双向绑定的实现原理

这里说的原理不是指的数据响应式的原理，数据响应式原理看这篇 - [Vue2.x 和 Vue3 响应式上的区别](https://www.yuque.com/u1598738/vqazlv/qzmb81dvk8r09qpm)

这里的原理指的 Vue 中双向数据绑定 `v-model` 的原理。

我们通过观察 type=input，type=checkbox 的 input 表单元素和 select 表单元素的编译，加深理解什么是数据的双向绑定。

### *<input type="text" v-model="foo">*

譬如 `<input v-model="val" type="text">`，其本质就是` <input type="text" :value="val" @input="val=$event.target.value" />`。

再看看完整编译后的内容：

```javascript
// <input type="text" v-model="foo">
// 编译后的代码
_c('input', { 
  directives: [{ name: "model", rawName: "v-model", value: (foo), expression: "foo" }], 
  attrs: { "type": "text" }, 
  domProps: { "value": (foo) }, 
  on: { 
    "input": function ($event) { 
      if ($event.target.composing) return; 
      foo = $event.target.value 
    } 
  } 
})
```

### *<input type="checkbox" v-model="bar">*

```javascript
// <input type="checkbox" v-model="bar">
// 编译后的代码
_c('input', { 
  directives: [{ name: "model", rawName: "v-model", value: (bar), expression: "bar" }], 
  attrs: { "type": "checkbox" }, 
  domProps: { 
    "checked": Array.isArray(bar) ? _i(bar, null) > -1 : (bar) 
  }, 
  on: { 
    "change": function ($event) { 
      var $$a = bar, $$el = $event.target, $$c = $$el.checked ? (true) : (false); 
      if (Array.isArray($$a)) { 
        var $$v = null, $$i = _i($$a, $$v); 
        if ($$el.checked) { $$i < 0 && (bar = $$a.concat([$$v])) } 
        else { 
          $$i > -1 && (bar = $$a.slice(0, $$i).concat($$a.slice($$i + 1))) } 
      } else { 
        bar = $$c 
      } 
    } 
  } 
})
```

### *<select>*

```javascript
// <select v-model="baz">
//     <option value="vue">vue</option>
//     <option value="react">react</option>
// </select>
_c('select', { 
  directives: [{ name: "model", rawName: "v-model", value: (baz), expression: "baz" }], 
  on: { 
    "change": function ($event) { 
      var $$selectedVal = Array.prototype.filter.call(
        $event.target.options, 
        function (o) { return o.selected }
      ).map(
        function (o) { 
          var val = "_value" in o ? o._value : o.value; 
          return val 
        }
      ); 
      baz = $event.target.multiple ? $$selectedVal : $$selectedVal[0] 
    } 
  } 
}, [
  _c('option', { attrs: { "value": "vue" } }, [_v("vue")]), _v(" "), 
  _c('option', { attrs: { "value": "react" } }, [_v("react")])
])
```

可以看到，v-model 语法糖最终都是通过默认表单元素的 :value 和对应的一个 change 事件实现的（可能是 @change 也可能是 @input）。

### Vue 中 v-model 和 sync 修饰符有什么区别

.sync 修饰符可以实现子组件与父组件的双向绑定，并且可以实现**子组件同步修改父组件的值**。

sync 修饰符是 Vue 2.x 中的特性，在 Vue 3 中已被移除。它用于实现父子组件之间的双向数据绑定。通过在子组件中使用 this.$emit('update:propName', newValue)，可以触发父组件中对应的更新事件。在父组件中，可以使用 :propName.sync="dataValue" 的语法糖来实现自动监听子组件变化并更新父组件数据。

```javascript
// 正常父传子： 
<son :a="num" :b="num2"></son>

// 加上sync之后父传子： 
<son :a.sync="num" .b.sync="num2"></son> 

// 它等价于
<son
  :a="num" @update:a="val=>num=val"
  :b="num2" @update:b="val=>num2=val"></son> 

// 相当于多了一个事件监听，事件名是update:a，回调函数中，会把接收到的值赋值给属性绑定的数据项中。
```

在 Vue 3 中，可以使用 v-bind 和 v-on 来手动实现类似的双向数据绑定效果，而不再需要 sync 修饰符。
