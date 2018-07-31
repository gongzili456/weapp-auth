# Install

```
npm install weapp-auth
```

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

app.use(weappAuth)
```

Or pass middleware set config used key `ctx.weapp_config`

```
const Koa = require('koa')

const app = new Koa()

app.use(async (ctx, next) => {
  ctx.weapp_config = {
    appid: 'acb',
    secret: 'ddd',
  }
  await next()
})

app.use(new WeappAuth())
```

# Response

this middleware assembly `weapp_auth` to `ctx`

```
  app.use(async (ctx, next) => {
    console.log(ctx.weapp_auth)
  })
```

example:

```
{  
   code,
   encrypt_data,
   iv,
   session_key,
   user_info:{  
      openId,
      nickName,
      gender:1,
      language:'zh_CN',
      city:'Chaoyang',
      province:'Beijing',
      country:'China',
      avatarUrl,
      watermark:{  
         timestamp:1503576077,
         appid
      }
   }
}
```

# Timing diagram

![](https://github.com/gongzili456/weapp-auth/blob/master/weapp-auth-flow.png)
