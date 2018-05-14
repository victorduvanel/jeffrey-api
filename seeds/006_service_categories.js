import Promise from 'bluebird';

const categories = {
  services: [
    {
      slug: 'professional-services',
      ordinalPosition: 6,
      name: {
        'en-GB': 'Professional Services',
        'en-US': 'Professional Services',
        'fr-FR': 'Services Professionels',
        'fr-CH': 'Services Professionels',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [],
      id: 'ba860883-f748-4eb7-ab2f-d1e2a21a1d18'
    },
    {
      slug: 'animals',
      ordinalPosition: 5,
      name: {
        'en-GB': 'Animals',
        'en-US': 'Animals',
        'fr-FR': 'Animaux',
        'fr-CH': 'Animaux',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [
        {
          slug: 'grooming',
          name: {
            'en-GB': 'Grooming',
            'en-US': 'Grooming',
            'fr-FR': 'Toilettage',
            'fr-CH': 'Toilettage',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '7cdf79ae-775c-4903-a749-9d642fb22730'
        },
        {
          slug: 'caretaking',
          name: {
            'en-GB': 'Caretaking',
            'en-US': 'Caretaking',
            'fr-FR': 'Gardiennage',
            'fr-CH': 'Gardiennage',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '605daf0a-b2bb-44c1-84a4-bcdb6e6a45ff'
        },
        {
          slug: 'feed',
          name: {
            'en-GB': 'Feed',
            'en-US': 'Feed',
            'fr-FR': 'Nourrir',
            'fr-CH': 'Nourrir',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'c56022e7-596d-4fa6-a0dd-a3f1e8b102b7'
        },
        {
          slug: 'walk',
          name: {
            'en-GB': 'Walk',
            'en-US': 'Walk',
            'fr-FR': 'Promenade',
            'fr-CH': 'Promenade',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '2888b2e3-cbea-467c-bc21-fc286494cbba'
        }
      ],
      id: '50cc84de-71b2-4e32-a160-180821cc8eef'
    },
    {
      slug: 'gardening',
      ordinalPosition: 4,
      name: {
        'en-GB': 'gardening',
        'en-US': 'gardening',
        'fr-FR': 'Jardinage',
        'fr-CH': 'Jardinage',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [
        {
          slug: 'spray',
          name: {
            'en-GB': 'spray',
            'en-US': 'spray',
            'fr-FR': 'Arrosage',
            'fr-CH': 'Arrosage',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'f1fd55cc-3f63-40c1-980e-0ec269186f9c'
        },
        {
          slug: 'rake',
          name: {
            'en-GB': 'Rake',
            'en-US': 'Rake',
            'fr-FR': 'Ramasser végétaux',
            'fr-CH': 'Ramasser végétaux',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '7f297fda-3dcb-432e-aff7-b86a03e161e3'
        },
        {
          slug: 'plant',
          name: {
            'en-GB': 'Plant',
            'en-US': 'Plant',
            'fr-FR': 'Planter des plantes / fleurs',
            'fr-CH': 'Planter des plantes / fleurs',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'c350dff1-0e65-406f-873c-701fd5ea2003'
        },
        {
          slug: 'mow',
          name: {
            'en-GB': 'Mow',
            'en-US': 'Mow',
            'fr-FR': 'Tondre la pelouse / Taille de haie',
            'fr-CH': 'Tondre la pelouse / Taille de haie',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '3d2a65c1-a2b7-4957-adfa-6128e704ae87'
        }
      ],
      id: '8c47eff2-0313-47ef-898e-2dee01fb98bd'
    },
    {
      slug: 'purchase-and-delivery',
      ordinalPosition: 2,
      name: {
        'en-GB': 'Purchase & Delivery',
        'en-US': 'Purchase & Delivery',
        'fr-FR': 'Achats & Livraisons',
        'fr-CH': 'Achats & Livraisons',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [
        {
          slug: 'heavy-packages',
          name: {
            'en-GB': 'Heavy Packages',
            'en-US': 'Heavy Packages',
            'fr-FR': 'Colis volumineux',
            'fr-CH': 'Colis volumineux',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '15062b64-de68-454a-af06-23e1d7a00819'
        },
        {
          slug: 'light-packages',
          name: {
            'en-GB': 'Light Packages',
            'en-US': 'Light Packages',
            'fr-FR': 'Colis légers',
            'fr-CH': 'Colis légers',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '9393d450-45ce-4fa6-ae84-44fc634bd80d'
        },
        {
          slug: 'groceries',
          name: {
            'en-GB': 'Groceries',
            'en-US': 'Groceries',
            'fr-FR': 'Faire mes courses',
            'fr-CH': 'Faire mes courses',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '841b5b35-07be-4f3c-98a3-83aff8520faf'
        },
        {
          slug: 'groceries-pick-up-and-delivery',
          name: {
            'en-GB': 'Pick up and deliver my groceries',
            'en-US': 'Pick up and deliver my groceries',
            'fr-FR': 'Récupérer et livrer mes courses',
            'fr-CH': 'Récupérer et livrer mes courses',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'c076ebe8-e262-40bf-9df4-d231be6274ca'
        },
        {
          slug: 'food',
          name: {
            'en-GB': 'Food',
            'en-US': 'Food',
            'fr-FR': 'Nourriture',
            'fr-CH': 'Nourriture',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '857bdfd2-7762-421c-a756-1adcad23c6f6'
        }
      ],
      id: '4f1e8494-a5f7-4109-ae4c-d88efe827d1a'
    },
    {
      slug: 'cleanning',
      ordinalPosition: 3,
      name: {
        'en-GB': 'Cleanning',
        'en-US': 'Cleanning',
        'fr-FR': 'Nettoyages',
        'fr-CH': 'Nettoyages',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [
        {
          slug: 'house-cleanning',
          name: {
            'en-GB': 'House cleanning',
            'en-US': 'House cleanning',
            'fr-FR': 'Nettoyage maison / appartement',
            'fr-CH': 'Nettoyage maison / appartement',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '2b92aa5c-4fb4-4a70-9392-6e50530f78e6'
        },
        {
          slug: 'cellar-garage-cleanning',
          name: {
            'en-GB': 'Cellar and garage cleanning',
            'en-US': 'Cellar and garage cleanning',
            'fr-FR': 'Nettoyage cave ou garage',
            'fr-CH': 'Nettoyage cave ou garage',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'f6923889-1547-4fdb-8055-db0e5d33e9be'
        },
        {
          slug: 'car-washing',
          name: {
            'en-GB': 'Car washing',
            'en-US': 'Car washing',
            'fr-FR': 'Nettoyage voiture',
            'fr-CH': 'Nettoyage voiture',
            'ko-KR': '',
            'ja-JP': ''
          },
          services: [
            {
              slug: 'jeffrey-car-washing',
              name: {
                'en-GB': 'Hire a Jeffrey',
                'en-US': 'Hire a Jeffrey',
                'fr-FR': 'Faire appel à un Jeffrey',
                'fr-CH': 'Faire appel à un Jeffrey',
                'ko-KR': '',
                'ja-JP': ''
              },
              id: '4c7fe354-11fd-4036-9974-06a1d74ab74f'
            },
            {
              slug: 'cleancar-car-washing',
              name: {
                'en-GB': 'CleanCar',
                'en-US': 'CleanCas',
                'fr-FR': 'Faire appel à CleanCar',
                'fr-CH': 'Faire appel à CleanCar',
                'ko-KR': '',
                'ja-JP': ''
              },
              id: '00e45aec-b77c-4be3-a8dd-5c7c07733419'
            }
          ],
          id: 'd1ae614e-4ba1-451e-bf19-7c54849b1730'
        }
      ],
      id: 'bc0d9db0-89e5-4538-9b9b-1c9e67628ffe'
    },
    {
      slug: 'handiwork-and-moving',
      ordinalPosition: 1,
      name: {
        'en-GB': 'Handiwork and moving',
        'en-US': 'Handiwork and moving',
        'fr-FR': 'Bricolages & déménagement',
        'fr-CH': 'Bricolages & déménagement',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [
        {
          slug: 'furniture-construction',
          name: {
            'en-GB': 'Furniture construction',
            'en-US': 'Furniture construction',
            'fr-FR': 'Construire un meuble',
            'fr-CH': 'Construire un meuble',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '8a35fd53-b0c9-4481-a799-41a702f73a4f'
        },
        {
          slug: 'moving',
          name: {
            'en-GB': 'Moving',
            'en-US': 'Moving',
            'fr-FR': 'Déménagement',
            'fr-CH': 'Déménagement',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '3887399d-79ca-44d6-90c4-10307c468ba1'
        },
        {
          slug: 'painting',
          name: {
            'en-GB': 'Painting',
            'en-US': 'Painting',
            'fr-FR': 'Peinture',
            'fr-CH': 'Peinture',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '9adae628-0ef7-456e-970f-b3d69c8b17c3'
        }
      ],
      id: '71e6f20a-0889-48fa-b72b-e2a0923ba3cb'
    },
    {
      slug: 'modern-majordome',
      ordinalPosition: 0,
      name: {
        'en-GB': 'Modern majordome',
        'en-US': 'Modern majordome',
        'fr-FR': 'Majordome morderne',
        'fr-CH': 'Majordome morderne',
        'ko-KR': '',
        'ja-JP': ''
      },
      services: [
        {
          slug: 'amateur-cook',
          name: {
            'en-GB': 'Amateur cook',
            'en-US': 'Amateur cook',
            'fr-FR': 'Majordome morderne',
            'fr-CH': 'Majordome morderne',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '555d8eb4-d6d1-421c-a7f4-ee49b332f41e'
        },
        {
          slug: 'disabled-person-assistance',
          name: {
            'en-GB': 'Disabled person assistance',
            'en-US': 'Disabled person assistance',
            'fr-FR': 'Assistance personne à mobilité réduite',
            'fr-CH': 'Assistance personne à mobilité réduite',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'a9f885c8-c2e5-4c86-8475-2a149836c4a8'
        },
        {
          slug: 'housekeeping',
          name: {
            'en-GB': 'Housekeeping',
            'en-US': 'Housekeeping',
            'fr-FR': 'Gardiennage maison',
            'fr-CH': 'Gardiennage maison',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '071c5285-2266-45c7-bb8c-902df7631fb1'
        },
        {
          slug: 'house-tidy-up',
          name: {
            'en-GB': 'House tidy up',
            'en-US': 'House tidy up',
            'fr-FR': 'Rangement maison',
            'fr-CH': 'Rangement maison',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '86048909-155d-4f88-80c3-7345cfc188a3'
        },
        {
          slug: 'carless-driver',
          name: {
            'en-GB': 'Carless driver',
            'en-US': 'Carless driver',
            'fr-FR': 'Chauffeur sans voiture',
            'fr-CH': 'Chauffeur sans voiture',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: 'dc337ba8-8a2a-4ece-8cb7-b3ea5bde2d66'
        },
        {
          slug: 'guest-service',
          name: {
            'en-GB': 'Guest service',
            'en-US': 'Guest service',
            'fr-FR': 'Service invité',
            'fr-CH': 'Service invité',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '7d87c290-c4aa-44c4-a80d-6ca0ebd82f39'
        },
        {
          slug: 'personal-assistant',
          name: {
            'en-GB': 'Personal assistant',
            'en-US': 'Personal assistant',
            'fr-FR': 'Assistant personel',
            'fr-CH': 'Assistant personel',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '7949f6ae-9d5f-4858-9f15-be85a3942c7c'
        },
        {
          slug: 'administrative-assistant',
          name: {
            'en-GB': 'Administrative assistant',
            'en-US': 'Administrative assistant',
            'fr-FR': 'Assistant administratif',
            'fr-CH': 'Assistant administratif',
            'ko-KR': '',
            'ja-JP': ''
          },
          id: '5e533c44-5758-4e16-9c94-ed6c3d2b34b2'
        }
      ],
      id: 'e9e4d161-04ad-4f52-8039-8fb734985182'
    }
  ]
};

exports.seed = (knex) => {
  return knex.transaction((trx) => {
    const insert = (props) => {
      return knex.raw(
        `INSERT INTO service_categories
          (id, slug, parent_id, ordinal_position, created_at, updated_at)
          VALUES (:id, :slug, :parentId, :ordinalPosition, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE
          SET
            slug = EXCLUDED.slug,
            parent_id = EXCLUDED.parent_id,
            ordinal_position = EXCLUDED.ordinal_position,
            updated_at = NOW()
        `,
        props
      ).transacting(trx);
    };

    const saveService = (services, parentId = null, proms = []) => {
      services.forEach(svc => {
        proms.push(insert({
          id: svc.id,
          slug: svc.slug,
          parentId,
          ordinalPosition: svc.ordinalPosition !== undefined ? svc.ordinalPosition : null
        }));

        if (svc.services) {
          saveService(svc.services, svc.id, proms);
        }
      });
      return Promise.all(proms);
    };

    return saveService(categories.services);
  });
};
