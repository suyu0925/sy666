import { Operator, queryOperator, Type } from 'geo-mobile'

export const CMCC = {
  10: 3,
  30: 5,
  50: 5,
  70: 10,
  100: 10,
  150: 20,
  200: 20,
  300: 20,
  500: 30,
  1024: 50,
  2048: 70,
  3072: 100,
  4096: 130,
  6144: 180,
  11264: 280
} as { [k: number]: number }

export const CTCC = {
  5: 1,
  10: 2,
  30: 5,
  50: 7,
  100: 10,
  150: 10,
  200: 15,
  500: 30,
  1024: 50
} as { [k: number]: number }

export default async function getChargeCash(packageSize: number, phone: string) {
  const operator = await queryOperator(phone)
  let chargeCash: number
  if (operator.type === Type.CMCC) {
    chargeCash = CMCC[packageSize]
  } else if (operator.type === Type.CTCC) {
    chargeCash = CTCC[packageSize]
  }
  if (!chargeCash) {
    throw new Error('no fitted channel')
  }
  return chargeCash
}
