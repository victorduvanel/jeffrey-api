import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ajax: service(),

  actions: {
    contactDetailsValidated({
      firstName,
      lastName,
      city,
      postalCode,
      addressFirstLine,
      addressSecondLine,
      companyName,
      vatNumber
    }) {
      this.set('isLoading', true);

      return this.get('ajax')
        .request('/contact-details', {
          method: 'POST',
          data: {
            first_name: firstName,
            last_name: lastName,
            city,
            postal_code: postalCode,
            address_first_line: addressFirstLine,
            address_second_line: addressSecondLine,
            company_name: companyName,
            vat_number: vatNumber
          }
        })
        .then(() => {
          this.transitionToRoute('dashboard.phone-number.new.payment-details');
        });
    }
  }
});
