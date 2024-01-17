let obj = {
  a: 1,
  b: 2,
  c: 3,
}

// obj[Symbol.iterator] = function () {
//   let keys = Object.keys(obj) //  ["a", "b", "c"]
//   let count = 0
//   return {
//     next() {
//       if (count < keys.length) {
//         return { value: obj[keys[count++]], done: false }
//       } else {
//         return { value: undefined, done: true }
//       }
//     },
//   }
// }
obj[Symbol.iterator] = function* () {
  const keys = Object.keys(obj)
  for (const k of keys) {
    yield [k, obj[k]]
  }
}
for(var [k,v] of obj){
  console.log(k,v);
}
