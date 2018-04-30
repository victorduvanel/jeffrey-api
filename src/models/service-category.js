import bookshelf           from '../services/bookshelf';
import Base                from './base';

const ServiceCategory = Base.extend({
  tableName: 'service_categories',

  subCategories() {
    return ServiceCategory
      .forge({
        parentId: this.get('id')
      })
      .fetchAll();
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function({ id, parentId, slug, ordinalPosition }) {
    await bookshelf.knex.raw(
      `INSERT INTO service_categories
        (id, slug, parent_id, ordinal_position, created_at, updated_at)
        VALUES (:id, :slug, :parentId, :ordinalPosition NOW(), NOW())
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
  },

  graphqlDef: function() {
    return `
      type ServiceCategory {
        id: ID!
        slug: String!
        subCategories: [ServiceCategory]
      }
    `;
  },

  resolver: {
    ServiceCategory: {
      subCategories: async ({ id }) => {
        const categories = await ServiceCategory
          .query((qb) => {
            qb.where('parent_id', '=', id);
            qb.orderBy('ordinal_position');
          })
          .fetchAll();

        return categories.toArray().map(category => ({
          id: category.get('id'),
          slug: category.get('slug')
        }));
      }
    },
    Query: {
      serviceCategory: async (_, { categoryId: id }) => {
        const category = await ServiceCategory.find(id);

        return {
          id: category.get('id'),
          slug: category.get('slug')
        };
      },

      serviceCategories:  async function() {
        const categories = await ServiceCategory
          .query((qb) => {
            qb.orderBy('ordinal_position');
          })
          .fetchAll();
        const rootCategories = categories.filter(category => category.get('parentId') === null);

        const categoryMapper = (category) => {
          return {
            id: category.get('id'),
            slug: category.get('slug'),
            subCategories: categories.filter(subCat => subCat.get('parentId') === category.get('id')).map(categoryMapper)
          };
        };

        return rootCategories.map(categoryMapper);
      }
    }
  }
});

export default bookshelf.model('ServiceCategory', ServiceCategory);
