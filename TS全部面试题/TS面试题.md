 * ## 前言

 - 本文将简要介绍一些工具泛型使用及其实现, 这些泛型接口定义大多数是语法糖(简写), 你可以在 typescript 包中的 lib.es5.d.ts 中找到它的定义, 我们项目的版本 "typescript": "^3.9.7"，

 ## 关键字

    > 在了解这这些内置帮助类型之前，我们先聊一聊一些关键字，有助于了解，因为这些关键字和js中的意识还是有出入的，我当时就一脸懵逼

 ### extends

  - 可以用来继承一个class,interface,还可以用来判断有条件类型(很多时候在ts看到extends，并不是继承的意识)
    - 示例：

 ```ts
 T extends U ? X : Y;
 ```

    - 上面的类型意思是，若 T 能够赋值给 U，那么类型是 X，否则为 Y。 原理是令 T' 和 U' 分别为 T 和 U 的实例，并将所有类型参数替换为 any，如果 T' 能赋值给 U'，则将有条件的类型解析成 X，否则为Y。 上面的官方解释有点绕，下面举个栗子：
    
    
```ts
 type Words = 'a'|'b'|"c";

 type W<T> = T extends Words ? true : false;
    
```

```ts
type WA = W<'a'>; // -> true

type WD = W<'d'>; // -> false
```
 ```

 - a 可以赋值给 Words 类型，所以 WA 为 true，而 d 不能赋值给 Words 类型，所以 WD 为 false。

 ### infer
 
 - 表示在extends条件语句中待推断得类型变量(可结合后面的returnType)
 
 ```ts
 type Union<T> = T extends Array<infer U> ? U: never
 ```

 - 如果泛型参数T满足约束条件Array 那么就返回这个类型变量U
 - 有点懵逼再来一个

 ```ts
 type ParamType<T> = T extends (param: infer P) => any ? P: T;
 // 解析如果T能赋值给(param: infer P) => any 类型，就返回P，否则就返回T
 
 interface IDog {
     name: string;
     age:number;
 }
 
 type Func = (dog:IDog) => void;
 
 type Param = ParamType<Func>; // IDog
 type TypeString = ParamType<string> // string
 ```

 ### keyof

 - keyof 可以用来取得一个对象接口的所有 key 值：
 - 示例：

 ```ts
 interface IDog {
     name: string;
     age: number;
     sex?: string;
 }
 
 type K1 = keyof Person; // "name" | "age" | "sex"
 type K2 = keyof Person[];  // "length" | "push" | "pop"  ...
 type K3 = keyof { [x: string]: Person };  // string | number
 ```

 ### typeof

 - 在 JS 中 typeof 可以判断数据类型，在 TS 中，它还有一个作用，就是获取一个变量的声明类型，如果不存在，则获取该类型的推论类型。
 - 示例：

 ```ts
 interface IDog {
   name: string;
   age: number;
   sex?: string;
 }
 
 const jack: IDog = { name: 'jack', age: 100 };
 type Jack = typeof jack; // -> IDog
 
 function foo(x: number): Array<number> {
   return [x];
 }
 
 type F = typeof foo; // -> (x: number) => number[]
 - Jack 这个类型别名实际上就是 jack 的类型 Person，而 F 的类型就是 TS 自己推导出来的 foo 的类型 (x: number) => number[]。
 ```

 ## 内置帮助类型

 ### Partial

 ```ts
 /**
  * Make all properties in T optional
  * 让T中的所有属性都是可选的
  */
 type Partial<T> = {
     [P in keyof T]?: T[P];
 };
 ```

 - 在某些情况下，我们希望类型中的所有属性都不是必需的，只有在某些条件下才存在，我们就可以使用Partial来将已声明的类型中的所有属性标识为可选的。
 - 示例：

 ```ts
 interface Dog {
  age: number;
  name: string;
  price: number;
 }
  
 type PartialDog = Partial<Dog>;
 // 等价于
 type PartialDog = {
  age?: number;
  name?: string;
  price?: number;
 }
  
 let dog: PartialDog = {
  age: 2,
  name: 'xiaobai'
 };
 ```

 - 在上述示例中由于我们使用Partial将所有属性标识为可选的，因此最终dog对象中虽然只包含age和name属性，但是编译器依旧没有报错，当我们不能明确地确定对象中包含哪些属性时，我们就可以通过Partial来声明。

 ### Required 

 ```ts
 /**
  * Make all properties in T required
  * 使T中的所有属性都是必需的
  */
 type Required<T> = {
     [P in keyof T]-?: T[P];
 };
 ```

 - Required 的作用刚好跟 Partial 相反，Partial 是将所有属性改成可选项，Required 则是将所有类型改成必选项：
 - 其中 -? 是代表移除 ? 这个 modifier 的标识。
 - 与之对应的还有个 +? , 这个含义自然与 -? 之前相反, 它是用来把属性变成可选项的，+ 可省略，见 Partial。
 - 示例：

 ```ts
 interface Dog {
  age: number;
  name: string;
  price: number;
 }
  
 type RequiredDog = Required<Dog>;
 // 等价于
 type RequiredDog = {
  age: number;
  name: string;
  price: number;
 }
  
 let dog: RequiredDog = {
  age?: 2,
  name?: 'xiaobai'
 };
 ```

 ### Readonly

 ```ts
 /**
  * Make all properties in T readonly
  * 将所有属性设置为只读
  */
 type Readonly<T> = {
     readonly [P in keyof T]: T[P];
 };
 ```

 - 给子属性添加 readonly 的标识，如果将上面的 readonly 改成 -readonly， 就是移除子属性的 readonly 标识。
 - 示例：

 ```ts
 interface IDog{
     name: string;
     age: number;
 }
 type TDog = Readonly<IDog>;
 class TestDog {
     run() {
         let dog: IDog = {
             name: 'dd',
             age: 1
         };
         person.name = 'cc';
         let dog1: TDog = {
             name: 'read',
             age: 1
         };
         // person2.age = 3; 报错,不能赋值
     }
 }
 ```

 ### Pick

 ```ts
 /**
  * From T, pick a set of properties whose keys are in the union K
  * 从T中，选择一组键在并集K中的属性
  */
 type Pick<T, K extends keyof T> = {
     [P in K]: T[P];
 };
 ```

 - 从源码可以看到 K 必须是 T 的 key，然后用 in 进行遍历, 将值赋给 P, 最后 T[P] 取得相应属性的值。
 - 示例：

 ```ts
 interface IDog {
  name: string;
  age: number;
  height: number;
  weight: number;
 }
  
 type PickDog = Pick<IDog, "name" | "age" | "height">;
 // 等价于
 type PickDog = {
  name: string;
  age: number;
  height: number;
 };
  
 let dog: PickDog = {
  name: 'wangcai',
  age: 3,
  height: 70
 };
 ```

 - 在上述示例中，由于我们只关心IDog对象中的name，age和height是否存在，因此我们就可以使用Pick从IDog接口中拣选出我们关心的属性而忽略其他属性的编译检查。

 ### Record

 ```ts
 /**
  * Construct a type with a set of properties K of type T
  * 构造一个具有一组属性K(类型T)的类型
  */
  
 type Record<K extends keyof any, T> = {
     [P in K]: T;
 };
 ```

 - 可以根据 K 中的所有可能值来设置 key，以及 value 的类型
 - 示例：

 ```ts
 let dog = Record<string, string | number | undefined>; // -> string | number | undefined
 ```

 该类型可以将 K 中所有的属性的值转化为 T 类型，并将返回的新类型返回给dog，K可以是联合类型、对象、枚举…

 - 示例：

 ```ts
 type petsGroup = 'dog' | 'cat';
 interface IPetInfo {
     name:string,
     age:number,
 }
 
 type IPets = Record<petsGroup, IPetInfo>;
 
 const animalsInfo:IPets = {
     dog:{
         name:'wangcai',
         age:2
     },
     cat:{
         name:'xiaobai',
         age:3
     },
 }
 ```

 ### Exclude

 ```ts
 /**
  * Exclude from T those types that are assignable to U
  * 从T中排除那些可分配给U的类型
  */
 type Exclude<T, U> = T extends U ? never : T;
 ```

 - 与Pick相反，Pick用于拣选出我们需要关心的属性，而Exclude用于排除掉我们不需要关心的属性
 - 示例：

 ```ts
 interface IDog {
  name: string;
  age: number;
  height: number;
  weight: number;
  sex: string;
 }
  
 type keys = keyof IDog; // -> "name" | "age" | "height" | "weight" | "sex"
  
 type ExcludeDog = Exclude<keys, "name" | "age">;
 // 等价于
 type ExcludeDog = "height" | "weight" | "sex";
 ```

 - 在上述示例中我们通过在ExcludeDog中传入我们只关心的height、weight、sex属性，Exclude会帮助我们将不需要的属性进行剔除。留下的属性id，name和gender即为我们需要关心的属性。
 - 示例：

 ```ts
 type T = Exclude<1 | 2, 1 | 3> // -> 2
 ```

 - 很轻松地得出结果 2根据代码和示例我们可以推断出 Exclude 的作用是从 T 中找出 U 中没有的元素, 换种更加贴近语义的说法其实就是从T 中排除 U
 - 一般来说，Exclude很少单独使用，可以与其他类型配合实现更复杂更有用的功能。

 ### Extract

 ```ts
 /**
  * Extract from T those types that are assignable to U
  * 从T中提取可分配给U的类型
  */
 type Extract<T, U> = T extends U ? T : never;
 ```

 - Extract 的作用是提取出 T 包含在 U 中的元素，换种更加贴近语义的说法就是从 T 中提取出 U
 - 以上语句的意思就是 如果 T 能赋值给 U 类型的话，那么就会返回 T 类型，否则返回 never，最终结果是将 T 和 U 中共有的属性提取出来
 - 示例：

 ```ts
 type test = Extract<'a' | 'b' | 'c' | 'd', 'a' | 'c' | 'f'|'g'>;  // -> 'a' | 'c'
 ```

 - 可以看到 T 是 'a' | 'b' | 'c' | 'd' ，然后 U 是 'a' | 'c' | 'f'|'g' ，返回的新类型就可以将 T 和 U 中共有的属性提取出来，也就是 'a' | 'c' 了。

 ### Omit

 ```ts
 /**
  * Construct a type with the properties of T except for those in type K.
  * 构造一个除类型K之外的T属性的类型
  */
  type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
 ```

 - 在上一个用法中，我们使用Exclude来排除掉其他不需要的属性，但是在上述示例中的写法耦合度较高，当有其他类型也需要这样处理时，就必须再实现一遍相同的逻辑，使用Omit可以避免这些问题，老版本ts未内置，TypeScript 3.5已经内置：
 - 示例：

 ```ts
 interface IDog {
 name: string;
 age: number;
 height: number;
 weight: number;
 sex: string;
 }
 
 // 表示忽略掉User接口中的name和age属性
 type OmitDog = Omit<IDog, "name" | "age">;
 // 等价于
 type OmitDog = {
 height: number;
 weight: number;
 sex: string;
 };
 
 let dog: OmitDog = {
 height: 1,
 weight: 'wangcai',
 sex: 'boy'
 };
 ```

 - 在上述示例中，我们需要忽略掉IDog接口中的name和age属性，则只需要将接口名和属性传入Omit即可，对于其他类型也是如此，大大提高了类型的可扩展能力，方便复用

 ### NonNullable

 ```ts
 /**
  * Exclude null and undefined from T
  * 从T中排除null和undefined
  */
 type NonNullable<T> = T extends null | undefined ? never : T;
 ```

 - 这个类型可以用来过滤类型中的 null 及 undefined 类型。
 - 示例：

 ```ts
 type test = string | number | null;
 type test1 = NonNullable<test>; // -> string | number;
 ```

 ### Parameters

 ```ts
 /**
  * Obtain the parameters of a function type in a tuple
  * 在元组中获取构造函数类型的参数
  */
 type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
 ```

 - 该类型可以获得函数的参数类型组成的元组类型。
 - 示例：

 ```ts
 function foo(x: number): Array<number> {
   return [x];
 }
 
 type P = Parameters<typeof foo>; // -> [number]
 ```

 - 此时 P 的真实类型就是 foo 的参数组成的元组类型 [number]。

 ### ConstructorParameters

 ```ts
 /**
  * Obtain the parameters of a constructor function type in a tuple
  * 在元组中获取构造函数类型的参数
  */
 type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;
 ```

 - 该类型的作用是获得类的参数类型组成的元组类型
 - 示例：

 ```ts
 class Person {
   private firstName: string;
   private lastName: string;
   
   constructor(firstName: string, lastName: string) {
       this.firstName = firstName;
       this.lastName = lastName;
   }
 }
 
 type P = ConstructorParameters<typeof Person>; // -> [string, string]
 ```

 - 此时 P 就是 Person 中 constructor 的参数 firstName 和 lastName 的类型所组成的元组类型 [string, string]。

 ### ReturnType

 ```ts
 /**
  * Obtain the return type of a function type
  * 获取函数类型的返回类型
  */
 type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
 ```

 - 该类型的作用是获取函数的返回类型。
 - 其实这里的 infer R 就是声明一个变量来承载传入函数签名的返回值类型, 简单说就是用它取到函数返回值的类型方便之后使用
 - 实际使用的话，就可以通过 ReturnType 拿到函数的返回类型
 - 示例：

 ```ts
 function foo(x: number): Array<number> {
   return [x];
 }
 
 type fn = ReturnType<typeof foo>; // -> number[]
 ```

 ### InstanceType

 ```ts
 /**
  * Obtain the return type of a constructor function type
  * 获取构造函数类型的返回类型
  */
 
 type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
 ```

 - 该类型的作用是获取构造函数类型的实例类型。

 ```ts
 class ConstructorType {
     x = 0;
     y = 0;
 }
 type test1 = InstanceType<typeof ConstructorType>;  // ConstructorType
 
 type test1 = InstanceType<any>;  // any
 ```

 ### ThisType

 ```ts
 /**
  * Marker for contextual 'this' type
  * 上下文“this”类型的标记
  */
 interface ThisType<T> { }
 ```

 - 这个类型是用于指定上下文对象类型的。
 - 这类型怎么用呢，举个例子：

 ```ts
 interface Cat {
     name: string;
     age: number;
 }
 const obj: ThisType<Person> = {
   mimi() {
     this.name // string
   }
 }
 ```

 - 这样的话，就可以指定 obj 里的所有方法里的上下文对象改成 Person 这个类型了。

 ```ts
 // 没有ThisType情况下
 const dog = {
     wang() {
          console.log(this.age); // error，在dog中只有wang一个函数，不存在a
     }
 }
 // 使用ThisType
 const dog: { wang: any } & ThisType<{ age: number }> = {
     wang() {
          console.log(this.wang) // error，因为没有在ThisType中定义
          console.log(this.age); // ok
     }
 }
 dog.wang // ok 正常调用
 dog.age // error，在外面的话，就跟ThisType没有关系了,这里就是没有定义age了
 ```

 - 从上面的代码中可以看到，ThisType的作用是：提示其下所定义的函数，在函数body中，其调用者的类型是什么。

 ### 参考

 - [segmentfault.com/a/119000001…](https://link.juejin.cn/?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000018514540%3Futm_source%3Dtag-newest)
 - 深入理解typescript
