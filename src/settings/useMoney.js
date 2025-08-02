import currency from 'currency.js'

export const useMoney = ({ settings }) => {
  const {
    currency_symbol, // $, €, £, etc.
    currency_position, // before ($1,000.00) or after (1,000.00$)
    decimal_sep, // . (1,000.50) or , (1.000,50)
    thousand_sep, // , (1,000.50) or . (1.000.50)
    cent_precision, // 2 (1,000.50) or 0 (1,000)
    zero_format, // true (0) or false (0.00)
  } = settings

  const currencyFormat = (amount) => {
    // .dollars() returns the amount in dollars ( eg: 1.99 -> 1)
    return currency(amount).dollars() > 0 || !zero_format
      ? currency(amount, {
          separator: thousand_sep,
          decimal: decimal_sep,
          symbol: '',
          precision: cent_precision,
        }).format()
      : 0 +
          currency(amount, {
            separator: thousand_sep,
            decimal: decimal_sep,
            symbol: '',
            precision: cent_precision,
          }).format()
  }

  const moneyFormatter = ({ amount = 0 }) => {
    return currency_position === 'before'
      ? currency_symbol + ' ' + currencyFormat(amount)
      : currencyFormat(amount) + ' ' + currency_symbol
  }

  const amountFormatter = ({ amount = 0 }) => {
    return currencyFormat(amount)
  }

  return {
    moneyFormatter,
    amountFormatter,
    currency_symbol,
    currency_position,
    decimal_sep,
    thousand_sep,
    cent_precision,
    zero_format,
  }
}
