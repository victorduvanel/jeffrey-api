import _         from 'lodash';
import bookshelf from '../services/bookshelf';

export default bookshelf.Model.extend({
  hasTimestamps: ['createdAt', 'updatedAt'],

  format(attr) {
    let rt = {};
    _.forEach(attr, (value, key) => {
      rt[_.snakeCase(key)] = value;
    });
    return rt;
  },

  parse(attr) {
    let rt = {};
    _.forEach(attr, (value, key) => {
      rt[_.camelCase(key)] = value;
    });
    return rt;
  },

  toJSON(options) {
    let attrs = bookshelf.Model.prototype.toJSON.call(this, options);

    delete attrs.createdAt;
    delete attrs.updatedAt;

    return this.format(attrs);
  }
}, {
  find: function(id) {
    return this.forge({ id })
      .fetch();
  }
});
