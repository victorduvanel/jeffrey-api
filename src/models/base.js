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

  serialize() {
    console.warn(`You should not use bookshelf::Model::serialize (${this.__proto__.tableName})`);
    return bookshelf.Model.prototype.serialize.apply(this, arguments);
  },

  toJSON(options) {
    let attrs = bookshelf.Model.prototype.toJSON.call(this, options);

    //delete attrs.createdAt;
    //delete attrs.updatedAt;

    return this.format(attrs);
  }
}, {
  find: function(id) {
    return this.forge({ id })
      .fetch();
  }
});
