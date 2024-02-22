// instanceof
function MyInstanceof(left, right) {
  if (typeof right !== "function") {
    throw new Error("error")
  }
  let prototype = right.prototype
  let proto = Object.getPrototypeOf(left)
  while (true) {
    if (!proto) return false
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}

function unique(arr) {
  // let result = []
  // arr.forEach(i => {
  //   // if (result.indexOf(i) === -1) {
  //   //   result.push(i)
  //   // }
  // })
  // return result
  return [...new Set(arr)]
}

const arr = [1, 1, 2, 2, 3, 5, 4, 4]

// console.log(unique(arr))

// arr.reduce((pre,cur)=>{
//   return pre += cur
// })
console.log(
  arr.reduce((pre, cur, index, arr) => {
    return (pre += cur)
  })
)
Array.prototype.MyReduce = function (callback, params) {
  const arr = this
  let current = params
  for (let i = 0; i < arr.length; i++) {
    current = !current && arr[0]
    if (i === 0) {
      params = callback.apply(this, [current, arr[i + 1], i + 1, arr])
    } else {
      params = callback.apply(this, [params, arr[i], i, arr])
    }
  }
  return params
}
console.log(
  [1, 1, 2, 2, 3, 5, 4, 4].MyReduce((pre, cur, index, arr) => {
    return (pre += cur)
  })
)
