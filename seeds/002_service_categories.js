import Promise    from 'bluebird';
import categories from './service-categories';

const onError = (err) => {
  console.error(err);
  process.exit(1);
};

exports.seed = (knex) => {
  return knex.transaction((trx) => {
    const insertAttrs = async (props) => {
      return knex.raw(
        `INSERT INTO service_category_attributes
          (id, lang, name, icon, symbol, service_category_id, created_at, updated_at)
          VALUES (:id, :lang, :name, :icon, :symbol, :serviceCategoryId, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            lang = EXCLUDED.lang,
            name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            symbol = EXCLUDED.symbol,
            updated_at = NOW()
        `,
        props
      )
        .transacting(trx)
        .catch(onError);
    };

    const updateDefaultAttributes = (serviceId, attributesId) => {
      return knex.raw(
        `UPDATE service_categories
          set default_attibutes_id = :attributesId, updated_at = NOW()
          where id = :serviceId
        `,
        {
          serviceId,
          attributesId
        }
      )
        .transacting(trx)
        .catch((err) => {
          onError(err);
        });
    };

    const insertService = (props) => {
      return knex.raw(
        `INSERT INTO service_categories
          (id, country_id, slug, parent_id, root_id, ordinal_position, color, created_at, updated_at)
          VALUES (:id, :countryId, :slug, :parentId, :rootId, :ordinalPosition, :color, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            slug = EXCLUDED.slug,
            color = EXCLUDED.color,
            parent_id = EXCLUDED.parent_id,
            country_id = EXCLUDED.country_id,
            root_id = EXCLUDED.root_id,
            ordinal_position = EXCLUDED.ordinal_position,
            updated_at = NOW()
        `,
        props
      )
        .transacting(trx)
        .catch(onError);
    };

    const saveService = (services, countryId, rootId = null, parentId = null, proms = []) => {
      services.forEach(svc => {
        proms.push(insertService({
          id: svc.id,
          slug: svc.slug,
          countryId,
          color: svc.color || null,
          parentId,
          rootId,
          ordinalPosition: svc.ordinalPosition !== undefined ? svc.ordinalPosition : null
        }));

        if (svc.attributes) {
          const langs = Object.keys(svc.attributes);

          langs.forEach(lang => {
            const attrs = svc.attributes[lang];

            proms.push(insertAttrs({
              id: attrs.id,
              name: attrs.name,
              icon: attrs.icon || null,
              symbol: attrs.symbol || null,
              lang,
              serviceCategoryId: svc.id
            }));
          });

          if (svc.defaultAttibutesId) {
            proms.push(updateDefaultAttributes(svc.id, svc.defaultAttibutesId));
          }
        }

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
