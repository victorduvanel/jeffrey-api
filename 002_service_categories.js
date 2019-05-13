import Promise    from 'bluebird';
import _          from 'lodash';
import categories from './service-categories';

const ids = [];
const attrsIds = [];

// import uuid from 'uuid/v4';
//
// const updateIds = (svc) => {
//   svc.id = uuid();
//   const defaultAttibutesId = svc.defaultAttibutesId;
//   Object.keys(svc.attributes).forEach((key) => {
//     const attr = svc.attributes[key];
//     if (attr.id === defaultAttibutesId) {
//       attr.id = uuid();
//       svc.defaultAttibutesId = attr.id;
//     } else {
//       attr.id = uuid();
//     }
//   });
//
//   if (svc.services) {
//     svc.services.forEach(updateIds);
//   }
// };
//
// categories.services.CH.forEach(updateIds);

const onError = (err) => {
  console.error(err);
  process.exit(1);
};

exports.seed = (knex) => {
  return knex.transaction((trx) => {
    const insertAttrs = async (props) => {
      if (attrsIds.indexOf(props.id) !== -1) {
        console.error(`${props.id} already inserted`);
      }
      attrsIds.push(props.id);

      return trx.raw(
        `INSERT INTO service_category_attributes
          (id, lang, name, icon, service_category_id, created_at, updated_at)
          VALUES (:id, :lang, :name, :icon, :serviceCategoryId, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            lang = EXCLUDED.lang,
            name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            updated_at = NOW()
        `,
        props
      );
    };

    const updateDefaultAttributes = (serviceId, attributesId) => {
      return trx.raw(
        `UPDATE service_categories
          set default_attibutes_id = :attributesId, updated_at = NOW()
          where id = :serviceId
        `,
        {
          serviceId,
          attributesId
        }
      );
    };

    const insertService = (props) => {
      if (ids.indexOf(props.id) !== -1) {
        console.error(`${props.id} already inserted`);
      }
      ids.push(props.id);

      return trx.raw(
        `INSERT INTO service_categories
          (id, country_id, slug, parent_id, root_id, ordinal_position, color, icon, created_at, updated_at)
          VALUES (:id, :countryId, :slug, :parentId, :rootId, :ordinalPosition, :color, :icon, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            slug = EXCLUDED.slug,
            color = EXCLUDED.color,
            icon = EXCLUDED.icon,
            parent_id = EXCLUDED.parent_id,
            country_id = EXCLUDED.country_id,
            root_id = EXCLUDED.root_id,
            ordinal_position = EXCLUDED.ordinal_position,
            updated_at = NOW()
        `,
        props
      );
    };

    const saveService = (services, countryId, rootId = null, parentId = null, proms = []) => {
      services.forEach(svc => {
        proms.push(insertService({
          id: svc.id,
          slug: svc.slug,
          countryId,
          color: svc.color || null,
          icon: svc.icon || null,
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
            const d = _.find(svc.attributes, (svcAttrs) => {
              return svcAttrs.id === svc.defaultAttibutesId;
            });
            if (!d) {
              console.error(`Invalid default attribute id for ${svc.id}`);
            }

            proms.push(updateDefaultAttributes(svc.id, svc.defaultAttibutesId));
          }
        }

        if (svc.services) {
          saveService(svc.services, countryId, rootId || svc.id, svc.id, proms);
        }
      });
      // return Promise.all(proms);
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
