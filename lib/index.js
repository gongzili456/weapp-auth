'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _WXBizDataCrypt = require('./WXBizDataCrypt');

var _WXBizDataCrypt2 = _interopRequireDefault(_WXBizDataCrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = new _debug2.default('weapp-auth:index:');

const WX_HEADER_CODE = 'x-wx-code';
const WX_HEADER_ENCRYPTED_DATA = 'x-wx-encrypted-data';
const WX_HEADER_IV = 'x-wx-iv';

class WeappAuth {
  constructor(ops) {
    if (ops) {
      ;['appid', 'secret'].map(key => {
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
  middleware(ctx, next) {
    var _this = this;

    return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var error, _ctx$weapp_config, appid, secret, code, encrypt_data, iv, session_key, wxdc, decoded;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!((!_this.appid || !_this.secret) && !ctx.weapp_config)) {
              _context.next = 4;
              break;
            }

            error = new Error(`weapp's appid & secret is required, but you not config`);

            error.status = 400;
            throw error;

          case 4:
            _ctx$weapp_config = ctx.weapp_config;
            appid = _ctx$weapp_config.appid, secret = _ctx$weapp_config.secret;

            _this.appid = _this.appid || appid;
            _this.secret = _this.secret || secret;

            // take code, encrypt_data, iv from headers X-WX-Code, X-WX-Encrypted-Data, X-WX-IV
            code = ctx.headers[WX_HEADER_CODE];
            encrypt_data = ctx.headers[WX_HEADER_ENCRYPTED_DATA];
            iv = ctx.headers[WX_HEADER_IV];


            debug('code: ', code);
            debug('encrypt_data: ', encrypt_data);
            debug('iv: ', iv);

            _context.next = 16;
            return jscode2session(code, _this.appid, _this.secret);

          case 16:
            session_key = _context.sent;
            wxdc = new _WXBizDataCrypt2.default(_this.appid, session_key);
            decoded = wxdc.decryptData(encrypt_data, iv);

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
              user_info: decoded
            };

            _context.next = 23;
            return next();

          case 23:
          case 'end':
            return _context.stop();
        }
      }, _callee, _this);
    }))();
  }
}

exports.default = WeappAuth;
function jscode2session(js_code, appid, secret) {
  debug('js_code: ', js_code);
  debug('appid: ', appid);
  debug('secret: ', secret);
  return new _promise2.default((resolve, reject) => (0, _request2.default)({
    uri: 'https://api.weixin.qq.com/sns/jscode2session',
    qs: {
      appid,
      secret,
      js_code,
      grant_type: 'authorization_code'
    }
  }, (err, resp, body) => {
    if (err) return reject(err);

    try {
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
    } catch (e) {
      return reject(e);
    }

    if (body.errcode) {
      const error = new Error(`换取SESSION_KEY失败: ${body.errcode} => ${body.errmsg}`);
      error.status = 400;
      return reject(error);
    }

    return resolve(body.session_key);
  }));
}
module.exports = exports['default'];