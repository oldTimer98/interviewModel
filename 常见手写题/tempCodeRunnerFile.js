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