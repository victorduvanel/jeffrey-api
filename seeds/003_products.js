exports.seed = (knex, Promise) => {
  const products = [{
    id: '2521047f-e18a-40d7-9a9e-2512254930f0',
    slug: 'premium-monthly'
  }];

  return Promise.map(products, (product) => {
    return knex.raw(`
      INSERT INTO products (
        id, slug, created_at, updated_at
      ) VALUES (
        :id, :slug, NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, {
      ...product
    });
  });
};
