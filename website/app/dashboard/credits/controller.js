import Controller from '@ember/controller';
import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import SweetAlertMixin from 'ember-sweetalert/mixins/sweetalert-mixin';

export default Controller.extend(SweetAlertMixin, {
  ajax: Ember.inject.service(),
  currentUser: service(),
  user: computed.alias('currentUser.user'),

  actions: {
    purchase() {
      const sweetAlert = this.get('sweetAlert');
      sweetAlert({
        title: 'Confirmer mon achat',
        titleText: 'Votre compte sera crédité de 10€',
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Créditer mon compte'
      }).then((confirm)=> {
        sweetAlert({
          showCancelButton: false,
          onOpen: () => {
            sweetAlert.showLoading();

            this.get('ajax').post('/credits', { })
              .then((res) => {
                if (res.success) {
                  this.get('user').set('credit.amount', res.credits);
                }

                sweetAlert.close();

                sweetAlert({
                  title: 'Votre compte a bien été crédité',
                  type: 'success',
                  confirmButtonText: 'OK'
                }).then((confirm)=> {

                });
              });
          }
        }).then((confirm)=> {
          // ...
        });
      });
    },

    enableCreditAutoReload() {
      sweetAlert({
        showCancelButton: false,
        onOpen: () => {
          sweetAlert.showLoading();
          this.get('ajax').patch('/me', {
            data: {
              credit_auto_reload: true
            }
          })
            .then((res) => {
              console.log(res);

              sweetAlert.close();

              sweetAlert({
                title: 'Le rechargement automatique a bien été activé',
                type: 'success',
                confirmButtonText: 'OK'
              }).then((confirm)=> {

              });
            });
        }
      });
    },

    disableCreditAutoReload() {

    },


  }
});
