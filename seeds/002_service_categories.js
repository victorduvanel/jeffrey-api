import Promise    from 'bluebird';
import categories from './service-categories';

exports.seed = (knex) => {
  return knex.transaction((trx) => {
    const insert = (props) => {
      return knex.raw(
        `INSERT INTO service_categories
          (id, country_id, slug, parent_id, root_id, ordinal_position, color, created_at, updated_at)
          VALUES (:id, :countryId, :slug, :parentId, :rootId, :ordinalPosition, :color, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            slug = EXCLUDED.slug,
            parent_id = EXCLUDED.parent_id,
            country_id = EXCLUDED.country_id,
            root_id = EXCLUDED.root_id,
            ordinal_position = EXCLUDED.ordinal_position,
            updated_at = NOW()
        `,
        props
      ).transacting(trx);
    };

    const saveService = (services, countryId, rootId = null, parentId = null, proms = []) => {
      services.forEach(svc => {
        proms.push(insert({
          id: svc.id,
          slug: svc.slug,
          countryId,
          color: svc.color,
          parentId,
          rootId,
          ordinalPosition: svc.ordinalPosition !== undefined ? svc.ordinalPosition : null
        }));

        if (svc.services) {
          saveService(svc.services, countryId, rootId || svc.id, svc.id, proms);
        }
      });
      return Promise.all(proms);
    };

    return Promise.map(Object.keys(categories.services), async (countryCode) => {
      const countries = await knex('countries')
        .where('code', countryCode);

      if (countries) {
        const country = countries[0];
        return saveService(categories.services[countryCode], country.id);
      }
    });

  });
};
