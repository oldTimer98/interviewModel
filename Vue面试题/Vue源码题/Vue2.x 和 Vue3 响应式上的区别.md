核心点：

1. 了解 Vue 2.x 版本使用的是基于 **Object.defineProperty** 实现的响应式系统
2. 了解 Vue 3.x 版本使用的是基于 **ES6 Proxy** 实现的响应式系统
3. 了解 **Object.defineProperty** 存在的问题，而 **ES6 Proxy 是如何解决它们的（两者间的异同）**
4. **了解** Vue 怎么用 vm.$set() 解决对象新增属性不能响应的问题 ？



### 总体回答

Vue 2.x 版本使用的是基于 Object.defineProperty 实现的响应式系统，而 Vue 3.x 版本使用的是基于 ES6 Proxy 实现的响应式系统，两者在实现上有很大的区别。

在 Vue 2.x 中，当一个对象被设置为响应式对象时，会通过 Object.defineProperty() 方法把每个属性都转换成 getter 和 setter，当属性值发生变化时，会触发 setter，进而通知所有引用该属性的组件更新视图。

而在 Vue 3.x 中，通过 ES6 Proxy 对象代理实现了对对象的监听和拦截，可以更加细粒度地控制对象属性的读取和赋值行为，也提供了更好的性能表现。

1. Vue 3.x 中对于新增属性和删除属性的响应式处理更加完善和高效，无需使用 [Vue.set](http://vue.set/)()方法，而 Vue 2.x 中需要手动使用这些方法才能保证新增或删除属性的响应式效果。
2. Vue 3.x 中使用了递归遍历 Proxy 对象的属性，因此在访问嵌套属性时会更加方便和高效，而 Vue 2.x 则需要通过 watch 或 computed 等方式才能实现嵌套属性的响应式。
3. Vue 3.x 中的响应式系统支持了 reactive() 和 readonly() 等 API，方便开发者创建只读或可变的响应式对象。而在 Vue 2.x 中则没有这些 API。

总的来说，Vue 3.x 中的响应式系统在使用上更加方便、高效和完善。



### **Object.defineProperty 实现数据响应式的一些问题**

#### 只能劫持对象属性

Object.defineProperty 只能劫持对象属性的 getter 和 setter 方法，无法对对象本身进行劫持，且需要对每个属性单独设置，导致代码冗余和效率低下。

譬如下述代码，实现了对对象单个属性进行 set 和 get 监听：

```javascript
let person = {}
let personName = 'lihua'

//在person对象上添加属性namep,值为personName
Object.defineProperty(person, 'namep', {
  //但是默认是不可枚举的(for in打印打印不出来)，可：enumerable: true
  //默认不可以修改，可：wirtable：true
  //默认不可以删除，可：configurable：true
  get: function () {
    console.log('触发了get方法')
    return personName
  },
  set: function (val) {
    console.log('触发了set方法')
    personName = val
  }
})

//当读取person对象的namp属性时，触发get方法
console.log(person.namep)

//当修改personName时，重新访问person.namep发现修改成功
personName = 'liming'
console.log(person.namep)

// 对person.namep进行修改，触发set方法
person.namep = 'huahua'
console.log(person.namep)
```

所以，在 Vue2 使用 **Object.defineProperty** 进行数据响应式处理的时候有几个弊端：

1. **只能劫持对象属性**
2. **所以如果需要对整个对象进行劫持代理， 或者需要监听对象上的多个属性，则需要额外****需要配合 Object.keys(obj) 进行遍历。**
3. **如果对象的层级不止一层，需要深度监听一个对象，则在上述的遍历操作下，还需要叠加递归处理的思想。因此，整个代码量和复杂度都是非常高的**

#### **无法监听数组变化**

那么如果对象的属性是一个数组呢？我们要如何实现监听？请看下面一段代码：

```javascript
let arr = [1, 2, 3]
let obj = {}
//把arr作为obj的属性监听
Object.defineProperty(obj, 'arr', {
  get() {
    console.log('get arr')
    return arr
  },
  set(newVal) {
    console.log('set', newVal)
    arr = newVal
  }
})
console.log(obj.arr) //输出get arr [1,2,3]  正常
obj.arr = [1, 2, 3, 4] //输出set [1,2,3,4] 正常
obj.arr.push(3) //输出get arr 不正常，监听不到push
```

由于数组的 push、pop、splice 等方法不会触发长度属性的 setter 方法，不能被 Object.defineProperty 监听到，因此需要使用额外的方法进行监听。

我们发现，通过 push 方法给数组增加的元素，set方法是监听不到的。

事实上，通过索引访问或者修改数组中已经存在的元素，是可以出发 get 和 set 的，但是对于通过 push、unshift 增加的元素，会增加一个索引，这种情况需要手动初始化，新增加的元素才能被监听到。另外， 通过 pop 或 shift 删除元素，会删除并更新索引，也会触发 setter 和 getter 方法。

在 Vue2.x 中，通过重写 Array 原型上的方法解决了这些问题：

```javascript
// 重写数组原型上的方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'splice', ...].forEach(function (method) {
  // 缓存原始方法
  const original = arrayProto[method];

  // 在重写的方法中添加响应式处理逻辑
  def(arrayMethods, method, function mutator() {
    // 调用原始方法
    const result = original.apply(this, arguments);

    // 触发响应式更新操作
    // ...
  
    return result;
  });
});

// 设置数组的 __proto__ 属性为重写后的 arrayMethods
const arr = [];
arr.__proto__ = arrayMethods;

// 对 arr 进行赋值操作时，就会触发响应式更新
```

上述代码中，我们通过 Object.create 方法创建了一个具有 Array 原型的对象 arrayMethods，并循环遍历需要重写的数组方法，然后在重写的方法中添加了响应式处理逻辑。最后，将数组的 __proto__ 属性指向重写后的 arrayMethods 对象。

通过这种方式，当我们对数组进行 push、pop、splice 等操作时，就能触发响应式系统的相应更新，从而实现了数组的响应式效果。

需要注意的是，这种方式仅解决了数组方法的响应式问题，而不会处理数组元素自身的响应式。

如果需要对数组元素进行响应式处理，还需要使用 Vue 提供的 $set 或 Vue.set 方法进行操作。

举个例子：

```javascript
// 假设有如下数据对象
data: {
  obj: {
    name: 'Alice',
    age: 20
  },
  arr: [1, 2, 3]
}

// 添加或修改对象属性
this.$set(this.obj, 'gender', 'female');
// 或者使用 Vue.set 方法
Vue.set(this.obj, 'gender', 'female');

// 修改数组元素
this.$set(this.arr, 1, 4);
// 或者使用 Vue.set 方法
Vue.set(this.arr, 1, 4);

// 删除对象属性
this.$delete(this.obj, 'age');
// 或者使用 Vue.delete 方法
Vue.delete(this.obj, 'age');

// 删除数组元素
this.$delete(this.arr, 0);
// 或者使用 Vue.delete 方法
Vue.delete(this.arr, 0);
```

在上述代码中，我们可以看到使用 $set 或 Vue.set 方法时需要传入两个参数：目标对象和要操作的属性名（或数组索引）。如果是对对象属性进行添加或修改操作，还需要提供新的属性值。而对于数组，第二个参数是数组索引，第三个参数是要设置的新值。

当我们调用 $set 或 Vue.set 方法时，它会在内部使用 Object.defineProperty 的方式对目标对象进行劫持，并触发相应的更新操作。这样，即使是新添加的属性或数组元素，也能正常触发视图更新，保证了数据的响应式特性。

同样地，对于删除对象属性或数组元素的操作，Vue 也提供了 $delete 或 Vue.delete 方法。它们用于从目标对象中删除指定的属性或数组元素，并触发相应的更新操作。

总之，使用 $set、$delete 或 Vue.set、Vue.delete 方法能够确保对已有对象和数组以及新增的属性或元素进行响应式的操作，从而实现数据的动态变化和视图的更新。

#### **初始化性能开销大**

基于上述的两个特点的描述，不难看出，使用 Object.defineProperty  的方式由于需要对每个属性都进行 setter 和 getter 的定义，因此在对象较大时，初始化的性能开销较大，影响用户体验。

### Proxy 实现数据响应式

在上面使用 Object.defineProperty 的时候，我们遇到的问题有：

1. 一次只能对一个属性进行监听，需要遍历来对所有属性监听
2. 在遇到一个对象的属性还是一个对象的情况下，需要递归监听
3. 对于对象的新增属性，需要手动监听
4. 对于数组通过 push、unshift 方法增加的元素，也无法监听
5. 性能开销大

与 Object.defineProperty 比起来，Proxy 有非常明显的优势：

1. **支持监听整个对象以及数组变化**：通过 Proxy，可以对整个对象或数组进行劫持，不需要对每个属性单独设置，同时可以自动处理数组变化。
2. **性能开销更小**：在初始化时，Proxy 只需要在对象上设置一个代理即可，避免了 Object.defineProperty 额外的属性设置操作和中间层的缓存数组，因此性能更加高效。
3. **支持隐藏属性**：使用 Proxy 对象可以隐藏一些不需要观察的属性，从而保护数据的安全性。

在 Vue 中体现最为明显的一点就是：Proxy 代理对象之后不仅可以拦截对象属性的读取、更新、方法调用之外，对整个对象的新增、删除、枚举等也能直接拦截，而 Object.defineProperty 只能针对对象的已知属性进行读取和更新的操作拦截。

看一个最简单的例子学会原理：

```javascript
const obj = { name: 'MiyueFE', age: 28 };
const proxyObj = new Proxy(obj, {
  get(target, property) {
    console.log(`Getting ${property} value: ${target[property]}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`Setting ${property} value: ${value}`);
    target[property] = value;
  },
  deleteProperty(target, property) {
    console.log(`Deleting ${property} property`);
    delete target[property];
  },
});

console.log(proxyObj.name); // Getting name value: MiyueFE, 输出 "MiyueFE"
proxyObj.name = 'MY'; // Setting name value: MY
console.log(proxyObj.name); // Getting name value: MY, 输出 "MY"
delete proxyObj.age; // Deleting age property
console.log(proxyObj.age); // undefined
```



### Vue 怎么用 vm.$set() 解决对象新增属性不能响应的问题 ？

vm.$set 是一个非常实用的API，因为 Vue2 实现响应式的核心是利用了 ES5 的Object.defineProperty，当我们通过直接修改数组下标更改数组或者给对象添加新的属性，这个时候 Object.defineproperty 是监听不到数据的变化的，这时候就可以使用 $set，让修改的操作也实现进行响应式响应。

通过 vm.$set() 方法可以解决对象新增属性不能响应的问题。vm.$set() 方法是 Vue 实例的一个方法，用于向响应式对象添加新属性，并确保这个新属性是响应式的。

使用vm.$set()的语法如下：

```javascript
vm.$set(object, key, value)
```

其中，object是要添加属性的对象，key是要添加的属性名，value是要添加的属性值。

以下是一个示例：

```javascript
// 定义一个响应式对象
data: {
  user: {
    name: 'John',
    age: 25
  }
},

// 向user对象添加新属性
methods: {
  addUserProperty() {
    this.$set(this.user, 'gender', 'male');
  }
}
```

在上述示例中，this.$set(this.user, 'gender', 'male') 将向 user 对象添加一个名为 gender 的新属性，并将其值设置为 'male'。由于使用了 vm.$set() 方法，这个新增的属性将会是响应式的，当该属性发生改变时，相关的组件也会进行更新。 需要注意的是，只有在 Vue 实例创建之后，才能使用 vm.$set() 方法。

当我们调用 $set 或 Vue.set 方法时，它会在内部使用 Object.defineProperty 的方式对目标对象进行劫持，并触发相应的更新操作。这样，即使是新添加的属性或数组元素，也能正常触发视图更新，保证了数据的响应式特性。

同样地，对于删除对象属性或数组元素的操作，Vue 也提供了 $delete 或 Vue.delete 方法。它们用于从目标对象中删除指定的属性或数组元素，并触发相应的更新操作。

在 Vue3 中，由于引入了 Proxy 作为默认的响应式实现机制，对于大部分情况来说，不再需要使用$set() 来解决对象新增属性不能响应的问题。

Proxy 能够自动追踪对象属性的访问和修改，并实现响应式更新。当我们直接给一个对象添加新属性时，新属性会被 Proxy 自动转换为响应式属性，无需额外调用 $set() 方法。

例如，在 Vue3 中可以这样操作：

```javascript
const obj = reactive({ name: 'John', age: 25 });
obj.gender = 'male'; // 新增属性
```

上述代码中，通过 reactive 函数将 obj 对象转换为响应式对象，当我们直接给 obj 添加 gender 属性时，Proxy 会自动将其转换为响应式属性，并触发更新。

尽管如此，仍然有一些特殊情况下可能需要使用 $set()。例如，当我们需要在 reactive 或 ref 创建的响应式对象中，给嵌套对象添加新属性时，仍然需要使用 $set() 进行手动响应式包裹。

总之，在绝大多数情况下，Vue3 中不再强制需要使用 $set() 来处理对象新增属性的响应问题。