function memorize(fn) {
  const cache = {}
  return function (...args) {
    const key = JSON.stringify(args)
    // console.log('cache',cache);
    return cache[key] || (cache[key] = fn.apply(fn, args))
  }
}

function add(a) {
  console.log('a',a);
  return a + 1
}

const adder = memorize(add)

adder(1) // 输出: 2    当前: cache: { '[1]': 2 }
adder(1) // 输出: 2    当前: cache: { '[1]': 2 }
adder(2) // 输出: 3    当前: cache: { '[1]': 2, '[2]': 3 }
adder(3) // 输出：5