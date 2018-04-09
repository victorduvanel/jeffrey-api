import Datastore from '@google-cloud/datastore';
import config    from '../../config';

const projectId = config.google.projectId;

const datastore = new Datastore({
  projectId: projectId,
});

export default datastore;
