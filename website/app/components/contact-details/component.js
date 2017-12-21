import Component from '@ember/component';

export default Component.extend({
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  street: '',
  region: '',

  regions: [{
    code: 'FR-ARA',
    name: 'Auvergne-Rhône-Alpes',
  }, {
    code: 'FR-BFC',
    name: 'Bourgogne-Franche-Comté'
  }, {
    code: 'FR-BRE',
    name: 'Bretagne',
  }, {
    code: 'FR-CVL',
    name: 'Centre-Val de Loire',
  }, {
    code: 'FR-COR',
    name: 'Corse',
  }, {
    code: 'FR-GES',
    name: 'Grand Est',
  }, {
    code: 'FR-HDF',
    name: 'Hauts-de-France',
  }, {
    code: 'FR-IDF',
    name: 'Île-de-France',
  }, {
    code: 'FR-NOR',
    name: 'Normandie',
  }, {
    code: 'FR-NAQ',
    name: 'Nouvelle-Aquitaine',
  }, {
    code: 'FR-OCC',
    name: 'Occitanie',
  }, {
    code: 'FR-PDL',
    name: 'Pays de la Loire',
  }, {
    code: 'FR-PAC',
    name: 'Provence-Alpes-Côte d’Azur',
  }, {
    code: 'FR-GP',
    name: 'Guadeloupe'
  }, {
    code: 'FR-GF',
    name: 'Guyane'
  }, {
    code: 'FR-MQ',
    name: 'Martinique'
  }, {
    code: 'FR-RE',
    name: 'La Réunion'
  }, {
    code: 'FR-YT',
    name: 'Mayotte'
  }],

  actions: {
    createContactDetails() {
      const contactDetails = this.getProperties(
        'firstName',
        'lastName',
        'city',
        'postalCode',
        'street',
        'region'
      );

      const onValidated = this.get('onValidated');

      if (onValidated) {
        onValidated(contactDetails);
      }
    }
  }
});
