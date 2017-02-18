import Ember from 'ember';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  session: Ember.inject.service(),
  host: config.APP.API_HOST,
  authorizer: 'authorizer:oauth2'
});
