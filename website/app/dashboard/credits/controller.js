import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import SweetAlertMixin from 'ember-sweetalert/mixins/sweetalert-mixin';

export default Controller.extend(SweetAlertMixin, {
  ajax: service(),
  currentUser: service(),

  user: alias('currentUser.user'),

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
        if (confirm.dismiss === 'cancel') {
          return;
        }

        sweetAlert({
          showCancelButton: false,
          onOpen: () => {
            sweetAlert.showLoading();

            this.get('ajax').post('/credits', { })
              .then((res) => {
                if (res.success) {
                  this.get('currentUser').load();
                }

                sweetAlert.close();

                sweetAlert({
                  title: 'Votre compte a bien été crédité',
                  type: 'success',
                  confirmButtonText: 'OK'
                });
              });
          }
        });
      });
    },

    enableCreditAutoReload() {
      const sweetAlert = this.get('sweetAlert');
      sweetAlert({
        showCancelButton: false,
        onOpen: () => {
          sweetAlert.showLoading();
          this.get('ajax').patch('/me', {
            data: {
              credit_auto_reload: true
            }
          })
            .then(() => {
              this.set('user.creditAutoReload', true);
              sweetAlert.close();

              sweetAlert({
                title: 'Le rechargement automatique a bien été activé',
                type: 'success',
                confirmButtonText: 'OK'
              });
            });
        }
      });
    },

    disableCreditAutoReload() {
      const sweetAlert = this.get('sweetAlert');
      sweetAlert({
        showCancelButton: false,
        onOpen: () => {
          sweetAlert.showLoading();
          this.get('ajax').patch('/me', {
            data: {
              credit_auto_reload: false
            }
          })
            .then(() => {
              this.set('user.creditAutoReload', false);
              sweetAlert.close();

              sweetAlert({
                title: 'Le rechargement automatique a bien été désactivé',
                type: 'success',
                confirmButtonText: 'OK'
              });
            });
        }
      });
    },


  }
});
