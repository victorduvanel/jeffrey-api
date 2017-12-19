import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import config from 'prestine/config/environment';

export default Controller.extend({
  currentUser: service(),

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
