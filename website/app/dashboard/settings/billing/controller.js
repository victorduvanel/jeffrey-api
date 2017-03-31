import Ember from 'ember';
import config from '../../../config/environment';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),

  actions: {
    openInvoicePopup(invoice) {
      this.get('currentUser')
        .getSingleUseToken()
        .then((token) => {
          token = encodeURIComponent(token);
          const apiHost = config.APP.API_HOST;

          const invoiceId = encodeURIComponent(invoice.get('id'));
          const url = `${apiHost}/invoices/${invoiceId}?access_token=${token}`;

          window.open(url);
        });
    }
  }
});
