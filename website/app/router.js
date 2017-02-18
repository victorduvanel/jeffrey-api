import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('signup');
  this.route('dashboard', { path: '/' }, function() {
    this.route('settings', function() {
      this.route('password');
      this.route('billing');
      this.route('account');
      this.route('payment-methods');
    });
    this.route('phone-number', function() {
      this.route('phone-number', { path: '/:phone_number_id' });
      this.route('new');
    });
  });
  this.route('reset-password');
  this.route('activate', function() {
  });
});

export default Router;
