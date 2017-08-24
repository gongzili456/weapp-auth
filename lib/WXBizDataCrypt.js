'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = new _debug2.default('weapp-auth:WXBizDataCrypt:');

function WXBizDataCrypt(appId, sessionKey) {
  this.appId = appId;
  this.sessionKey = sessionKey;
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode
  const sessionKey = new Buffer(this.sessionKey, 'base64');
  encryptedData = new Buffer(encryptedData, 'base64');
  iv = new Buffer(iv, 'base64');

  let decoded = null;

  try {
    // 解密
    const decipher = _crypto2.default.createDecipheriv('aes-128-cbc', sessionKey, iv);
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);

    decoded = decipher.update(encryptedData, 'binary', 'utf8');
    decoded += decipher.final('utf8');

    debug('decoded: ', decoded);

    decoded = JSON.parse(decoded);
  } catch (err) {
    throw err;
  }

  if (!decoded || decoded.watermark.appid !== this.appId) {
    throw new Error('Illegal Buffer');
  }

  return decoded;
};

exports.default = WXBizDataCrypt;
module.exports = exports['default'];