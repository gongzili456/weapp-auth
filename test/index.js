const WeappAuth = require('../lib')

const Koa = require('koa')

const app = new Koa()

// app.use(async (ctx, next) => {
//   ctx.weapp_config = {
//     appid: 'acb',
//     secret: 'ddd',
//   }
//   await next()
// })

app.use(new WeappAuth())

app.use(async (ctx, next) => {
  console.log('weapp_auth: ', ctx.weapp_auth)
})

app.listen(8080, () => console.log('Server listen on 8080'))
