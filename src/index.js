import request from 'request';
import Debug from 'debug';
import WXBizDataCrypt from './WXBizDataCrypt';

const debug = new Debug('weapp-auth:index:');

const WX_HEADER_CODE = 'x-wx-code';
const WX_HEADER_ENCRYPTED_DATA = 'x-wx-encrypted-data';
const WX_HEADER_IV = 'x-wx-iv';

export default class WeappAuth {
  constructor(ops) {
    if (ops) {
      ['appid', 'secret'].map(key => {
        if (!ops[key]) {
          throw new Error('WeappAuth require appid & secret');
        }
      });

      this.appid = ops.appid;
      this.secret = ops.secret;
    }

    return this.middleware.bind(this);
  }

  /**
   * AppID 参数两种配置方式
   * 1. 构造方法
   * 2. 中间件传递: ctx.weapp_config{ appid, secret }
   *
   * @param {*} ctx
   * @param {*} next
   */
  async middleware(ctx, next) {
    /**
     * 配置 AppID & Secret
     */
    if ((!this.appid || !this.secret) && !ctx.weapp_config) {
      const error = new Error(
        `weapp's appid & secret is required, but you not config`,
      );
      error.status = 400;
      throw error;
    }
    const { appid, secret } = ctx.weapp_config || {};
    this.appid = this.appid || appid;
    this.secret = this.secret || secret;

    // take code, encrypt_data, iv from headers X-WX-Code, X-WX-Encrypted-Data, X-WX-IV
    const code = ctx.headers[WX_HEADER_CODE];
    const encrypt_data = ctx.headers[WX_HEADER_ENCRYPTED_DATA];
    const iv = ctx.headers[WX_HEADER_IV];

    debug('code: ', code);
    debug('encrypt_data: ', encrypt_data);
    debug('iv: ', iv);

    const session_key = await jscode2session(code, this.appid, this.secret);

    const wxdc = new WXBizDataCrypt(this.appid, session_key);
    const decoded = wxdc.decryptData(encrypt_data, iv);
    debug('user_info: ', decoded);

    // decoded is below
    // {
    //   "openId":"",
    //   "nickName":"",
    //   "gender":1,
    //   "language":"zh_CN",
    //   "city":"Chaoyang",
    //   "province":"Beijing",
    //   "country":"China",
    //   "avatarUrl":"",
    //   "watermark":{
    //     "timestamp":1503487849,
    //     "appid":""
    //   }
    // }

    ctx.weapp_auth = {
      code,
      encrypt_data,
      iv,
      session_key,
      user_info: decoded,
    };

    await next();
  }
}

function jscode2session(js_code, appid, secret) {
  debug('js_code: ', js_code);
  debug('appid: ', appid);
  debug('secret: ', secret);
  return new Promise((resolve, reject) =>
    request(
      {
        uri: 'https://api.weixin.qq.com/sns/jscode2session',
        qs: {
          appid,
          secret,
          js_code,
          grant_type: 'authorization_code',
        },
      },
      (err, resp, body) => {
        if (err) return reject(err);

        try {
          if (typeof body === 'string') {
            body = JSON.parse(body);
          }
        } catch (e) {
          return reject(e);
        }

        if (body.errcode) {
          const error = new Error(
            `换取SESSION_KEY失败: ${body.errcode} => ${body.errmsg}`,
          );
          error.status = 400;
          return reject(error);
        }

        return resolve(body.session_key);
      },
    ),
  );
}
