import Promise    from 'bluebird';
import categories from './service-categories';

exports.seed = (knex) => {
  return knex.transaction((trx) => {
    const insert = (props) => {
      return knex.raw(
        `INSERT INTO service_categories
          (id, slug, parent_id, root_id, ordinal_position, color, created_at, updated_at)
          VALUES (:id, :slug, :parentId, :rootId, :ordinalPosition, :color, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            slug = EXCLUDED.slug,
            parent_id = EXCLUDED.parent_id,
            root_id = EXCLUDED.root_id,
            ordinal_position = EXCLUDED.ordinal_position,
            updated_at = NOW()
        `,
        props
      ).transacting(trx);
    };

    const saveService = (services, rootId = null, parentId = null, proms = []) => {
      services.forEach(svc => {
        proms.push(insert({
          id: svc.id,
          slug: svc.slug,
          color: svc.color,
          parentId,
          rootId,
          ordinalPosition: svc.ordinalPosition !== undefined ? svc.ordinalPosition : null
        }));

        if (svc.services) {
          saveService(svc.services, rootId || svc.id, svc.id, proms);
        }
      });
      return Promise.all(proms);
    };

    return saveService(categories.services);
  });
};
