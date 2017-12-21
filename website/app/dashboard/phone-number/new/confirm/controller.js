import Controller, { inject as controller } from '@ember/controller';
import { inject as service }                from '@ember/service';
import { alias }                            from '@ember/object/computed';

export default Controller.extend({
  ajax: service(),
  currentUser: service(),
  user: alias('currentUser.user'),

  dashboardController: controller('dashboard'),

  addressId: null,
  phoneNumber: null,
  isLoading: false,

  reset() {
    this.setProperties({
      phoneNumber: null,
      isLoading: false
    });
  },

  actions: {
    confirmPurchase() {
      this.set('isLoading', true);

      this.get('ajax')
        .request('/phone-numbers', {
          method: 'POST',
          data: {
            address_id: this.get('addressId')
          }
        })
        .then((res) => {
          const phoneNumberId = res.phone_number_id;
          return this.get('store')
            .findAll('phone-number')
            .then((phoneNumbers) => {
              this.set('phoneNumber', phoneNumbers.findBy('id', phoneNumberId));
              this.get('dashboardController').set('phoneNumbers', phoneNumbers);
            });
        })
        .finally(() => {
          this.set('isLoading', false);
        });
    }
  }

});
