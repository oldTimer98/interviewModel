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
