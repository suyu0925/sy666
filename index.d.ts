export interface IOption {
  account: string
  key: string
  url: string
  retUrl: string
}

export enum ErrorCode {
  Ok = 1,
  AccountNotExist = -100,
  Sign = -101
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

export default class Sy666 {
  private option: IOption

  constructor(option: IOption)

  public getBalance(): Promise<number>

  public charge(phone: string, packageSize: number, outTradeNo: string, roaming: boolean): Promise<string>

  public queryOrder(outTradeNo: string): Promise<Status>

  public parseCallback(body: object): ICallbackRequest

  public feedback(done: boolean): string
}
