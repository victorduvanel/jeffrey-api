import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  focused: false,

  inputId: computed(function() {
    return this.get('elementId') + '-input';
  }),

  focusObserver: on('init', observer('focused', function() {
    if (this.get('focused')) {
      next(() => {
        $('#' + this.get('inputId')).focus();
        this.set('focused', false);
      });
    }
  }))
});
