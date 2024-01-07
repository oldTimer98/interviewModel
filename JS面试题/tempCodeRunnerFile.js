function memorize(fn) {
  const cache = {}
  function foo(args) {
    const key = JSON.stringify(args)
    let result = cache[key]
    if (!result) {
      cache[key] = args
      result = fn(args)
    }
    return { cache, result }
  }
  foo.cache = cache
  return foo
}

function add(a) {
  return a + 1
}

const added = memorize(add)
console.log("", added(1))
console.log("", added(2))
console.log("", added(3))
console.log("", added(4))