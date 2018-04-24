import Promise         from 'bluebird';
import uuid            from 'uuid';
import path            from 'path';
import fs              from 'fs';
import ServiceCategory from './models/service-category';

const setIds = (service) => {
  if (!service.id) {
    service.id = uuid.v4();
  }
  if (service.services) {
    service.services.forEach(service => setIds(service));
  }
};

const saveService = (services, parentId = null, proms = []) => {
  services.forEach(svc => {
    proms.push(ServiceCategory.create({
      id: svc.id,
      slug: svc.slug,
      parentId
    }));

    if (svc.services) {
      saveService(svc.services, svc.id, proms);
    }
  });

  return Promise.all(proms);
};

export default async () => {
  const serviceCategoriesFile = path.join(__dirname, 'service-categories.json');
  const serviceCategories = JSON.parse(fs.readFileSync(serviceCategoriesFile));

  serviceCategories.services.forEach(setIds);
  fs.writeFileSync(serviceCategoriesFile, JSON.stringify(serviceCategories, null, 4));

  saveService(serviceCategories.services)
    .then(() => {
      console.log('ok');
    });
};
