import Component from '@ember/component';

export default Component.extend({
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  addressFirstLine: '',
  addressSecondLine: '',
  companyName: '',
  vatNumber: '',

  actions: {
    createContactDetails() {
      const contactDetails = this.getProperties(
        'firstName',
        'lastName',
        'city',
        'postalCode',
        'addressFirstLine',
        'addressSecondLine',
        'companyName',
        'vatNumber'
      );

      const onValidated = this.get('onValidated');

      if (onValidated) {
        onValidated(contactDetails);
      }
    }
  }
});
