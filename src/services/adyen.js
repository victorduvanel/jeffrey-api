import uuid    from 'uuid';
import request from 'request-promise';
import config  from '../config';

const retreiveCardDetails = async (shopperReference) => {
  const res = await request({
    method: 'POST',
    json: true,
    uri: 'https://pal-test.adyen.com/pal/servlet/Recurring/listRecurringDetails',
    headers: {
      'X-API-key': config.adyen.apiKey
    },
    body: {
      shopperReference,
      merchantAccount: config.adyen.merchantAccount,
    }
  });

  console.log(res);

  const details = res.details[0].RecurringDetail;

  return {
    type: details.paymentMethodVariant,
    lastFour: details.card.number,
    holderName: details.card.holderName,
    expMonth: details.card.expiryMonth,
    expYear: details.card.expiryYear
  };
};

const createCard = async (user, req, cardDetails) => {
  const id = uuid.v4();

  const res = await request({
    method: 'POST',
    json: true,
    uri: 'https://pal-test.adyen.com/pal/servlet/Payment/authorise',
    headers: {
      'X-API-key': config.adyen.apiKey
    },
    body: {
      merchantAccount: config.adyen.merchantAccount,
      amount: {
        value: 0,
        currency: 'EUR'
      },
      additionalData: {
        'card.encrypted.json': cardDetails
      },
      reference: id,
      shopperEmail: user.get('email'),
      shopperIP: req.ip,
      shopperReference: user.get('id'),
      recurring: {
        contract: 'RECURRING'
      }
    }
  });

  if (res.resultCode === 'Authorised') {
    const details = await retreiveCardDetails(user.get('id'));
    return {
      ...details,
      id: id
    };
  }
};

export default { createCard };
