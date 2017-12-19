import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import SweetAlertMixin from 'ember-sweetalert/mixins/sweetalert-mixin';

export default Controller.extend(SweetAlertMixin, {
  ajax: service(),
  currentUser: service(),

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

    },


  }
});
