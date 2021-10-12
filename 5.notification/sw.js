const CACHE_NAME = 'cache_v2'

self.addEventListener('install', async event => {
  // cache对象
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll([
    '/',
    '/manifest.json',
    '/index.css'
  ])
  // 跳过等待
  await self.skipWaiting()
})

self.addEventListener('activate', async event => {
  // 清除旧资源
  const keys = await caches.keys()
  keys.map(key => {
    if (key !== CACHE_NAME) {
      caches.delete(key)
    }
  })

  await self.clients.claim()
})

self.addEventListener('fetch', event => {
  // 断网时读取cache
  const req = event.request

  // 如果非同源则不继续
  const url = new URL(req.url)
  if (url.origin !== self.origin) {
    return
  }

  // 静态资源使用缓存优先    获取数据信息使用请求优先
  // 没有接口测试这里就不做判断了 统一网络优先
  event.respondWith(networkFirst(req))
})


// 网络优先
async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const fresh = await fetch(req)

    // 获取到的数据应该再保存到cache
    cache.put(req, fresh.clone()) // 克隆一份再保存，不然就无法返回响应fresh了

    return fresh
  } catch (e) {
    // 如果网络请求失败则读cache
    const cached = await cache.match(req)
    return cached
  }
}


// cache优先
async function cacheFirst(req){
  // ...
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(req)
  if (cached) {
    return cached
  } else {
    const fresh = await fetch(req)
    return fresh
  }
}