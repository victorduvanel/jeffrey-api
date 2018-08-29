import braintree from 'braintree';
import config    from '../config';

const gateway = braintree.connect({
  environment: braintree.Environment[config.braintree.environment],
  merchantId: config.braintree.merchantId,
  publicKey: config.braintree.publicKey,
  privateKey: config.braintree.privateKey
});

export default gateway;
