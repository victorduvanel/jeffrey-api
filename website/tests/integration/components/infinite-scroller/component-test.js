import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('infinite-scroller', 'Integration | Component | infinite scroller', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{infinite-scroller}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#infinite-scroller}}
      template block text
    {{/infinite-scroller}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
