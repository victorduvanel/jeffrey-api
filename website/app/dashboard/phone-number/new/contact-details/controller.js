import { inject as service }                from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { alias }                            from '@ember/object/computed';

export default Controller.extend({
  ajax: service(),
  currentUser: service(),
  user: alias('currentUser.user'),

  confirmController: controller('dashboard.phone-number.new.confirm'),
  paymentDetailsController: controller('dashboard.payment-details'),

  actions: {
    contactDetailsValidated({
      firstName,
      lastName,
      city,
      postalCode,
      region,
      street
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
            street,
            region: region.name
          }
        })
        .then((res) => {
          if (res.success) {
            const addressId = res.address_id;
            const confirmController = this.get('confirmController');
            confirmController.set('addressId', addressId);

            if (this.get('user.paymentDetailsNeedToBeUpdated')) {
              const paymentDetailsController = this.get('paymentDetailsController');
              paymentDetailsController.set('redirectTo', 'dashboard.phone-number.new.confirm');
              this.transitionToRoute('dashboard.payment-details');
            } else {
              this.transitionToRoute('dashboard.phone-number.new.confirm');
            }
          }
        });
    }
  }
});
