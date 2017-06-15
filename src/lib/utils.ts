'use strict'

import * as crypto from 'crypto'
import * as qs from 'querystring'

export function md5(content: string) {
  return crypto.createHash('md5').update(content).digest('hex')
}

export function getSign(json: object, key: string) {
  return md5(JSON.stringify(json) + key)
}

export function verifySign(req: { [k: string]: any }, key: string) {
  // tslint:disable:object-literal-sort-keys
  const content = qs.stringify({
    Orderid: req.Orderid,
    Chargeid: req.Chargeid,
    Orderstatu_int: req.Orderstatu_int,
    Errorcode: req.Errorcode,
    Password: key
  }, null, null, {
      encodeURIComponent: (str: string) => {
        return str
      }
    })
  // tslint:enable:object-literal-sort-keys
  const sign = md5(content)
  return req.Sign === sign
}
