'use strict'

import * as dotenv from 'dotenv'
dotenv.config()

import * as debug from 'debug'
import * as iconv from 'iconv-lite'
import * as moment from 'moment'
import * as qs from 'querystring'
import { default as Sy666, IOption } from '../src/index'
import * as utils from '../src/lib/utils'

const log = debug('test:index')
const option: IOption = {
  account: process.env.account,
  key: process.env.key,
  retUrl: process.env.retUrl,
  url: process.env.url
}
const chargeEnable = process.env.charge === 'true'
const chargePhone = process.env.phone
const cancelingOutTradeNo = process.env.cancelingOutTradeNo
const doneOutTradeNo = process.env.doneOutTradeNo

function createOrder(): string {
  return moment().format('YYYY-MM-DD_HH:mm:ss') + Math.floor(Math.random() * 1000)
}

describe('index', () => {
  let sy666: Sy666

  beforeAll(() => {
    sy666 = new Sy666(option)
  })

  test('getBalance', async () => {
    const balance = await sy666.getBalance()
    log('getBalance: %d', balance)
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  test('charge', async () => {
    if (chargeEnable) {
      const result = await sy666.charge(chargePhone, 30, createOrder(), false)
      log('charge: %j', result)
    } else {
      log('skip charge')
    }
  })

  test('queryOrder:Canceling', async () => {
    if (!cancelingOutTradeNo) {
      log('skip canceling queryOrder')
    } else {
      const status = await sy666.queryOrder(cancelingOutTradeNo)
      log(`status: ${status}`)
    }
  })

  test('queryOrder:Done', async () => {
    if (!doneOutTradeNo) {
      log('skip done queryOrder')
    } else {
      const status = await sy666.queryOrder(doneOutTradeNo)
      log(`status: ${status}`)
    }
  })
})

describe('utils', () => {
  test('verifySign', () => {
    // tslint:disable:object-literal-sort-keys
    const data = {
      Action: 'CX',
      AgentAccount: 'api_test',
      Agentbalance: '98981.00',
      Orderid: 'SH2009_05150001',
      Chargeid: '2893131209',
      Orderstatu_int: '16',
      Orderstatu_text: '缴费成功',
      OrderPayment: '3.00',
      Errorcode: '0000',
      Errormsg: '',
      Sign: '59976d41950c16007e35a2886203564f'
    }
    // tslint:enable:object-literal-sort-keys
    const key = '0FE8E43F53BB5848'
    const valid = utils.verifySign(data, key)
    expect(valid).toBe(true)
  })
})
