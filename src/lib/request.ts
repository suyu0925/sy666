'use strict'

import * as crypto from 'crypto'
import * as debug from 'debug'
import * as iconv from 'iconv-lite'
import * as qs from 'querystring'
import * as request from 'request'
import { default as getChargeCash } from './package'
import * as utils from './utils'

const log = debug('sy666')
const error = log

type Action = 'YE' | 'CX' | 'CZ'

export enum ErrorCode {
  Ok = 1,
  AccountNotExist = -100,
  Sign = -101
}

export enum ChargeType {
  Mobile = 0, // 手机充值
  Traffic = 1, // 流量充值
  Telephone = 2, // 固话充值
  Net = 3, // 宽带充值
  QQ = 4, // QQ|游戏充值
  Game = 4, // QQ|游戏充值
  Life = 5, // 水电气缴费
  Gas = 6 // 加油卡充值
}

export enum FlowPackageType {
  NationalMonth = 0, // 国内月包
  ProvinceMonth = 1, // 省内月包
  NationalDay = 2, // 国内日包
  ProvinceDay = 3 // 省内日包
}

export enum Status {
  Waitting = 0,
  Pending = 1,
  Doing = 2,
  Charing = 6,
  Done = 11,
  Charged = 16,
  Canceling = 20,
  CancleFailed = 21,
  ChargeFailed = 26,
  Freezed = 99
}

export interface IOption {
  account: string
  key: string
  url: string
  retUrl: string
}

export interface IBusiBody {
  action: Action
}

export interface IYEBusiBody extends IBusiBody {
  action: 'YE'
}

export interface ICZBusiBody extends IBusiBody {
  action: 'CZ'
  orderId: string  // 接入方定单号，请确保唯一
  chargeAcct: string // 手机号码
  chargeCash: number // 充值金额，单位为元，整数
  chargeType: ChargeType
  // 仅chargeType=1需要提交
  flowPackageType?: FlowPackageType
  flowPackageSize?: number // 流量包大小，以M为单位.如 500M，请传入整数500，1G请传入整数1024，2G-2048，3G-3072，4G-4096，依此类推。
  // 仅chargeType=[4,5]需要提交
  qqProvince?: string // 例如 广东省、福建省。
  chargeAmount?: number // 整数 QB/QD充值数量 会员月数。
  productSn?: string // Q币:755001 Q点:755002。联调时由服务方提供各项目代码。
  // 充值固话、宽带、加油卡时必填
  ispName?: string // 移动|联通|电信|广电|石化|石油。
  // 回调地址，注意需要使用urlencode
  retUrl?: string // 交易结果回调地址，不需回调者请留空；使用UrlEncode或者由json转义。
}

export interface ICXBusiBody extends IBusiBody {
  action: 'CX'
  orderId: string
}

export interface IRequest {
  agentAccount: string
  busiBody: IBusiBody
  sign: string
}

export interface IYERequest extends IRequest {
  busiBody: IYEBusiBody
}

export interface ICZRequest extends IRequest {
  busiBody: ICZBusiBody
}

export interface ICXRequest extends IRequest {
  busiBody: ICXBusiBody
}

export interface IResponse {
  action: Action
  agentAccount: string
  errorCode: ErrorCode
  errorDesc: string
}

export interface IYEResponse extends IResponse {
  action: 'YE'
  agentBalance: number
  agentProfit: number
  agentName: string
}

export interface ICZResponse extends IResponse {
  action: 'CZ'
  orderId: string // 定单号，原值返回
  chargeId: string // 交易流水号
}

export interface ICXResponse extends IResponse {
  action: 'CX'
  agentBalance: number
  orderId: string
  chargeId: string
  orderStatuInt: Status
  orderStatuText: string
  orderPayment: number
}

export interface IChargeOption {
  orderId: string
  package: number
  phone: string
  type: FlowPackageType
}

export interface ICallbackRequest {
  Action: 'CX'
  AgentAccount: string
  Agentbalance: string
  Orderid: string
  Chargeid: string
  Orderstatu_int: Status
  Orderstatu_text: string
  TransCash: string
  OrderPayment: string
  Errorcode: ErrorCode
  Errormsg: string
  Sign: string
}

export type CallbackResponse = 'OK' | 'Not OK'

async function $post(option: IOption, req: IRequest) {
  return new Promise((resolve, reject) => {
    request({
      body: JSON.stringify(req),
      encoding: null,
      method: 'post',
      url: option.url
    }, (err, res, buffer: Buffer) => {
      const body: IResponse = JSON.parse(iconv.decode(buffer, 'GBK'))
      if (err) {
        reject(err)
      } else if (res.statusCode !== 200) {
        reject(new Error(`wrong statusCode: ${res.statusCode}`))
      } else {
        if (body.errorCode !== ErrorCode.Ok) {
          reject(new Error(`get error ${body.errorCode}: ${body.errorDesc}`))
        } else {
          resolve(body)
        }
      }
    })
  }) as Promise<IResponse>
}

export async function getBalance(option: IOption): Promise<IYEResponse> {
  const req: IYERequest = {
    agentAccount: option.account,
    busiBody: {
      action: 'YE'
    },
    sign: undefined
  }
  req.sign = utils.getSign(req.busiBody, option.key)
  return (await $post(option, req)) as IYEResponse
}

export async function charge(account: IOption, option: IChargeOption): Promise<ICZResponse> {
  // orderId can have space character
  if (option.orderId.indexOf(' ')) {
    throw new Error('orderId can not contain space character')
  }
  const chargeCash = await getChargeCash(option.package, option.phone)
  // tslint:disable:object-literal-sort-keys
  const req: ICZRequest = {
    agentAccount: account.account,
    busiBody: {
      action: 'CZ',
      orderId: option.orderId,
      chargeAcct: option.phone,
      chargeCash,
      chargeType: ChargeType.Traffic,
      flowPackageType: option.type,
      flowPackageSize: option.package,
      retUrl: account.retUrl ? qs.escape(account.retUrl) : ''
    },
    sign: undefined
  }
  // tslint:enable:object-literal-sort-keys
  req.sign = utils.getSign(req.busiBody, account.key)
  return (await $post(account, req)) as ICZResponse
}

export async function queryOrder(option: IOption, orderId: string): Promise<ICXResponse> {
  const req: ICXRequest = {
    agentAccount: option.account,
    busiBody: {
      action: 'CX',
      orderId
    },
    sign: undefined
  }
  req.sign = utils.getSign(req.busiBody, option.key)
  return (await $post(option, req)) as ICXResponse
}

export function parseCallback(option: IOption, body: object) {
  const req = body as ICallbackRequest
  if (utils.verifySign(req, option.key)) {
    return req
  } else {
    return null
  }
}

export function feedback(done: boolean): CallbackResponse {
  return done ? 'OK' : 'Not OK'
}
