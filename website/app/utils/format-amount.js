 const formatAmount = (amount, currency) => {

  const symbols = {
    EUR: '€'
  };

  const separator = ',';

  const value = amount.toString();
  const major = value.slice(0, -2) || 0;
  const minor = value.slice(-2);

  let symbol = symbols[currency];

  return `${major}${separator}${minor} ${symbol}`;
};

export default formatAmount;
