import Ember from 'ember';
import config from '../../../config/environment';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  actions: {
    openInvoicePopup(invoice) {
      this.get('ajax')
        .request('/oauth/single-use-token', {
          method: 'POST'
        })
        .then((res) => {
          const token = encodeURIComponent(res.access_token);
          const apiHost = config.APP.API_HOST;

          const invoiceId = encodeURIComponent(invoice.get('id'));
          const url = `${apiHost}/invoices/${invoiceId}?access_token=${token}`;

          window.open(url);
        });
    }
  }
});
