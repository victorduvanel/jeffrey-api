// Imports the Google Cloud client library
import Datastore from '@google-cloud/datastore';
import config    from '../../config';

// Your Google Cloud Platform project ID
const projectId = config.google.projectId;

// Creates a client
const datastore = new Datastore({
  projectId: projectId,
});

// The kind for the new entity
const kind = 'locations';
// The name/ID for the new entity
const name = 'sampletask1';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind, name]);

// Prepares the new entity
const task = {
  key: taskKey,
  data: {
    user_id: '97207D97-B3B0-4049-B44C-A20897CDFE5B',
    location: {
      latitude: 0,
      longitude: 0
    },
    user_agent: '',
    created_at: new Date(),
    ip: '8.8.8.8'
  },
};

// Saves the entity
datastore
  .save(task)
  .then(() => {
    console.log(`Saved ${task.key.name}: ${task.data.description}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });


//const query = datastore
  //.createQuery('Task')
  //.filter('priority', '=', 4)
  //.filter('done', '=', false)
  //.filter('created', '>', new Date('1990-01-01T00:00:00z'))
  //.filter('created', '<', new Date('2000-12-31T23:59:59z'));
