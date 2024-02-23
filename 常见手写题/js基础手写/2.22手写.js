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
  for (let i = 0; i < arr.length; i++) {
    params = callback.apply(this, [params ? params : 0, arr[i], i, arr])
  }
  return params
}
console.log(
  [1, 1, 2, 2, 3, 5, 4, 4].MyReduce((pre, cur, index, arr) => {
    return (pre += cur)
  })
)
// 1、冒泡排序---前一个和后一个进行比较，交换位置
function bubbleSort(arr) {
  let len = arr.length
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j + 1]
        arr[j + 1] = arr[j]
        arr[j] = temp
      }
    }
  }
  return arr
}
let arr1 = [64, 34, 25, 12, 22, 11, 90]
console.log(bubbleSort(arr1)) // [11, 12, 22, 25, 34, 64, 90]

// 2、快速排序---取出中间值，进行递归
function quickSort(arr) {
  if (arr.length <= 1) return arr
  let mainIndex = parseInt(arr.length / 2)
  let mainItem = arr.splice(mainIndex, 1)[0]
  let left = []
  let right = []
  arr.forEach(item => {
    if (item > mainItem) {
      right.push(item)
    } else {
      left.push(item)
    }
  })
  return quickSort(left).concat([mainItem], quickSort(right))
}
const arr2 = [64, 34, 25, 12, 22, 11, 90]
console.log(quickSort(arr2))
// 3、插入排序---前一个和后一个进行比较，交换位置
function insertionSort(arr) {
  let len = arr.length
  for (let i = 0; i < len; i++) {
    let key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j = j - 1
    }
    arr[j + 1] = key
  }
  return arr
}
var arr3 = [64, 34, 25, 12, 22, 11, 90];
console.log(insertionSort(arr3));
