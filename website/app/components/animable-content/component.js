import Component from '@ember/component';
import { observer } from '@ember/object';
import { later } from '@ember/runloop';

export default Component.extend({
  classNameBindings: ['shake'],
  shake: false,

  shakeObs: observer('shake', function() {
    if (this.get('shake')) {
      later(() => {
        this.set('shake', false);
      }, 800);
    }
  })
});
