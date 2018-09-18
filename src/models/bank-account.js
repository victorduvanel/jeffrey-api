import bookshelf     from '../services/bookshelf';
import Base          from './base';

const Business = Base.extend({ }, { });

export default bookshelf.model('Business', Business);
