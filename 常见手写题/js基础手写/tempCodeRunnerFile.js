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