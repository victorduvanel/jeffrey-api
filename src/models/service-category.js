import ProviderPrice from './provider-price';
import bookshelf     from '../services/bookshelf';
import Base          from './base';

const ServiceCategory = Base.extend({
  tableName: 'service_categories',

  rootCategory() {
    return this.belongsTo('ServiceCategory', 'root_id');
  },

  parentCategory() {
    return this.belongsTo('ServiceCategory', 'parent_id');
  },

  subCategories() {
    if (this._subcategories) {
      return this._subcategories;
    }

    return ServiceCategory
      .where({
        parent_id: this.get('id')
      })
      .fetchAll();
  },

  async avgPrice({ currency }) {
    const res = await bookshelf.knex
      .avg('price')
      .from('provider_prices')
      .where('service_category_id', this.id)
      .where('currency', currency);

    if (res.length && res[0].avg) {
      return {
        amount: parseInt(res[0].avg, 10),
        currency
      };
    }

    return null;
  },

  color() {
    return this.get('color');
  },

  slug() {
    return this.get('slug');
  },

  async parent() {
    if (!this.get('parentId')) {
      return null;
    }
    await this.load(['parentCategory']);
    return this.related('parentCategory');
  },

  async root() {
    if (!this.get('rootId')) {
      return null;
    }
    await this.load(['rootCategory']);
    return this.related('rootCategory');
  },

  async providerPrice(_, { user }) {
    if (user) {
      if (user.providerPricesCache) {
        if (user.providerPricesCache[this.id]) {
          return user.providerPricesCache[this.id];
        } else {
          return null;
        }
      }

      const price = await ProviderPrice
        .query((qb) => {
          qb.where('user_id', user.id);
          qb.where('service_category_id', this.id);
        })
        .fetch();
      if (price) {
        return {
          amount: price.get('price'),
          currency: price.get('currency')
        };
      }
    }
    return null;
  },

  async attrs(lang) {
    if (lang) {
      const res = await bookshelf.knex('service_category_attributes')
        .where({
          service_category_id: this.get('id'),
          lang
        });
      if (res.length) {
        return {
          name: res[0].name,
          icon: res[0].icon
        };
      }
    }

    const res = await bookshelf.knex('service_categories')
      .select(
        'service_category_attributes.name',
        'service_category_attributes.icon'
      )
      .leftJoin('service_category_attributes', 'service_categories.default_attibutes_id', 'service_category_attributes.id')
      .where({
        'service_categories.id': this.get('id')
      });

    if (res.length) {
      return {
        name: res[0].name,
        icon: res[0].icon
      };
    }

    return {
      name: null,
      icon: null
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
