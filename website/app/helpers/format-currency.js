import Ember from 'ember';

export function formatCurrency(params, hash) {
  let value = params[0].toString();
  const currency = hash.currency;

  const symbols = {
    eur: '€'
  };

  const major = value.slice(0, -2);
  const minor = value.slice(-2);

  let symbol = symbols[currency];

  return `${major}.${minor} ${symbol}`;
}

export default Ember.Helper.helper(formatCurrency);
