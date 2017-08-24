const WeappAuth = require('../lib')

const Koa = require('koa')

const app = new Koa()

app.use(new WeappAuth({
  // appid: 'your appid',
  // secret: 'your secret'
}))

app.use(async (ctx, next) => {
  console.log('weapp_auth: ', ctx.weapp_auth);
})

app.listen(8080, () => console.log('Server listen on 8080'))
