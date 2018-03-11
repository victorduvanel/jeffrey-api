import Base from './base';

const Provider = Base.extend({
  tableName: 'providers',
});

export default bookshelf.model('Provider', Provider);
