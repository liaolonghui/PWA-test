const CACHE_NAME = 'cache_v1'

self.addEventListener('install', async event => {
  // cache对象
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll([
    '/',
    '/manifest.json',
    '/index.css',
    '/images/logo.jpeg'
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
  // 使用请求优先
  event.respondWith(networkFirst(req))
})


// 网络优先
async function networkFirst(req) {
  try {
    const fresh = await fetch(req)
    return fresh
  } catch (e) {
    // 如果网络请求失败则读cache
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(req)
    return cached
  }
}


// cache优先
async function cacheFirst(req){
  // ...
}