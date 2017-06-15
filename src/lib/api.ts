'use strict'

import * as request from './request'

export { ErrorCode, ICallbackRequest, IOption, Status } from './request'

export async function getBalance(option: request.IOption) {
  const result = await request.getBalance(option)
  if (result.errorCode !== request.ErrorCode.Ok) {
    throw new Error(result.errorDesc)
  }
  return result.agentBalance
}

export async function charge(
  option: request.IOption,
  phone: string, packageSize: number, outTradeNo: string, roaming: boolean
) {
  const chargeReq = {
    orderId: outTradeNo,
    package: packageSize,
    phone,
    type: roaming ? request.FlowPackageType.NationalMonth : request.FlowPackageType.ProvinceMonth
  } as request.IChargeOption
  const result = await request.charge(option, chargeReq)
  return result.chargeId
}

export async function queryOrder(option: request.IOption, outTradeNo: string) {
  const result = await request.queryOrder(option, outTradeNo)
  return result.orderStatuInt
}

export function parseCallback(option: request.IOption, body: object) {
  return request.parseCallback(option, body)
}

export function feedback(done: boolean) {
  return request.feedback(done)
}
