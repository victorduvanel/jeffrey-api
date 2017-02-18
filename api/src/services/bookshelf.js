import knex      from './knex';
import Bookshelf from 'bookshelf';

const bookshelf = Bookshelf(knex);

bookshelf.plugin('registry');

export default bookshelf;
