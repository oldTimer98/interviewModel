var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for (let i = 0; i < arr.length; i++) {
  const randomIndex = Math.floor(Math.random() * (arr.length - 1) - i) + i
  ;[arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]]
}

const sum = arr.reduce((total, i) => (total += i), 0)
console.log("sum", sum)