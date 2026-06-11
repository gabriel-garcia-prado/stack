import { factory } from '#factory'

export const loggerMiddleware = factory.createMiddleware(async (c, next) => {
  const start = Date.now()
  console.log('\n[REQUEST]', `${c.req.method} ${URL.parse(c.req.raw.url)?.pathname} ${new Date(start).toISOString()}`)

  c.set('logger', (type, message) => (data) => {
    switch (type) {
      case 'info': {
        console.info(`\u001B[34m[INFO] ${message}:\u001B[0m`, JSON.stringify(data))
        break
      }
      case 'error': {
        console.error(`\u001B[31m[ERROR] ${message}:\u001B[0m`, JSON.stringify(data))
        break
      }
      case 'success': {
        console.log(`\u001B[32m[SUCCESS] ${message}:\u001B[0m`, JSON.stringify(data))
        break
      }
      default: {
        console.log(`[LOG] ${message}:`, JSON.stringify(data))
      }
    }
  })
  await next()
  const delta = Date.now() - start
  const time = delta < 1000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`
  console.log('[RESPONSE]', `${c.res.status} ${time} ${JSON.stringify(Object.fromEntries(c.res.headers))}`)
})
