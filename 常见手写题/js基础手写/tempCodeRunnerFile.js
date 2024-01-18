let a = [{ b: 1 }, { b: 2 }, { b: 3 }, { b: 4 }]
a.forEach(item => {
  item.b += 1
})
console.log("a", a)