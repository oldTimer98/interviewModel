function uniqueArray(arr) {
  let map = {}
  let res = []
  for (let i = 0; i < arr.length; i++) {
    if (!map.hasOwnProperty(arr[i])) {
      map[arr[i]] = 1
      res.push(arr[i])
    }
  }
  console.log("res,map", res, map)
  return res
}
console.log("", uniqueArray([1, 2, 3, 5, 1, 5, 9, 1, 2, 8]))