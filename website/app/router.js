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
      this.route('phone-number', { path: '/:phone_number_id' }, function() {
        this.route('cancel');
      });
      this.route('new', function() {
        this.route('payment-details');
        this.route('confirm');
      });
    });
    this.route('conversations', function() {
      this.route('conversation', { path: '/:conversation_id' });
    });
  });
  this.route('reset-password', { path: '/reset-password/:token' });
  this.route('activate', function() {
    this.route('index', { path: '/' });
  });
  this.route('forgot-password');
  this.route('not-found', { path: '/*path' });
});

export default Router;
