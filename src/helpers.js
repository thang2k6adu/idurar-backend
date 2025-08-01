/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/
import currency from 'currency.js'

export const calculate = {
  add: (firstValue, secondValue) => {
    return currency(firstValue).add(secondValue).value
  },
  sub: (firstValue, secondValue) => {
    return currency(firstValue).subtract(secondValue).value
  },
  multiply: (firstValue, secondValue) => {
    return currency(firstValue).multiply(secondValue).value
  },
  divide: (firstValue, secondValue) => {
    return currency(firstValue).divide(secondValue).value
  },
}

export const escapeRegex = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')