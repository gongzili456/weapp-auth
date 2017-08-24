# Usage

```
const Koa = require('koa')

const app = new Koa()

app.use(new WeappAuth({
  appid: 'your appid',
  secret: 'your secret'
}))

```

Or

```
const Koa = require('koa')

const app = new Koa()

const weappAuth = new WeappAuth({
  appid: 'your appid',
  secret: 'your secret'
})

app.use(weappAuth.middleware)

```

# Response
this middleware assembly `weapp_auth` to `ctx`

```
  app.use(async (ctx, next) => {
    console.log(ctx.weapp_auth)
  })
```

# Timing diagram
![](https://github.com/gongzili456/weapp-auth/blob/master/weapp-auth-flow.png)
