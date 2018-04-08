exports.seed = function(knex, Promise) {
  const categories = [
    {
      id: 'AEB18B90-C1C3-4D8C-A40A-EF29E3060C03',
      name: 'run',
    }, {
      id: '267963DB-4EA2-4B76-A746-5E51978EB02B',
      name: 'clean',
    }, {
      id: '3FA4DEF3-0EE3-47EB-A673-2ED820E4606E',
      name: 'home',
    }, {
      id: 'B96C7126-0C92-4781-B9D2-54F0D5A1D829',
      name: 'garden',
    }, {
      id: '3A781D2F-92DE-45BA-A907-1123B74756B8',
      name: 'school',
    }, {
      id: '1A612C77-A0E8-417E-9D3D-A06BDDD10539',
      name: 'animal',
    }, {
      id: '10BF66B8-B58A-4F8F-8085-A8714E147BF8',
      name: 'personal',
    }, {
      id: '861E742F-67A1-416B-90DD-A516990BEFC0',
      name: 'tech',
    }, {
      id: '1AB04753-1A0E-4104-A019-5614132D7425',
      name: 'admin',
    }, {
      id: '6E95C52A-8244-4139-9D98-263CCB4F9761',
      name: 'handyman',
    }
  ];

  return Promise.map(categories, category => knex.raw(`
    INSERT INTO "service_categories" (
      "id", "name",
      "created_at", "updated_at"
    ) VALUES (
      :id, :name,
      NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `, category));
};
