import bookshelf from '../services/bookshelf';
import Base      from './base';

const ServiceCategory = Base.extend({
  tableName: 'service_categories',

  subCategories() {
    return ServiceCategory
      .forge({
        parentId: this.get('id')
      })
      .fetchAll();
  },

  serialize() {
    return {
      id: this.get('id'),
      color: this.get('color'),
      slug: this.get('slug')
    };
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function({ id, parentId, slug, ordinalPosition = null }) {
    await bookshelf.knex.raw(
      `INSERT INTO service_categories
        (id, slug, parent_id, ordinal_position, created_at, updated_at)
        VALUES (:id, :slug, :parentId, :ordinalPosition, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET
          slug = EXCLUDED.slug,
          parent_id = EXCLUDED.parent_id,
          updated_at = NOW()
      `,
      {
        id,
        slug,
        parentId,
        ordinalPosition
      }
    );

    return this.find(id);
  }
});

export default bookshelf.model('ServiceCategory', ServiceCategory);
