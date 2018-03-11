import bookshelf           from '../services/bookshelf';
import Base                from './base';

const Service = Base.extend({
  tableName: 'services',
});

export default bookshelf.model('Service', Service);
