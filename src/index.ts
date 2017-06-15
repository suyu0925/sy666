'use strict'

import * as api from '../src/lib/api'

export { ErrorCode, ICallbackRequest, IOption, Status } from '../src/lib/api'

export default class Sy666 {
  private option: api.IOption

  constructor(option: api.IOption) {
    this.option = option
  }

  public async getBalance() {
    return await api.getBalance(this.option)
  }

  public async charge(phone: string, packageSize: number, outTradeNo: string, roaming: boolean) {
    return await api.charge(this.option, phone, packageSize, outTradeNo, roaming)
  }

  public async queryOrder(outTradeNo: string) {
    return await api.queryOrder(this.option, outTradeNo)
  }

  public parseCallback(body: object) {
    return api.parseCallback(this.option, body)
  }

  public feedback(done: boolean) {
    return api.feedback(done)
  }
}
