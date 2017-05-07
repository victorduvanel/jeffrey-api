import chai   from 'chai';
import chaiHTTP from 'chai-http';

import { httpServer} from '../src/server';

const should = chai.should();
chai.use(chaiHTTP);

describe('Invalid Route', () => {
  it('it should get a 404 Not Found', () => {
    return chai.request(httpServer)
      .get('/invalid-route')
      .then(() => {
        throw 'Must be rejected';
      })
      .catch((err) => {
        should.exist(err.response);
        err.response.should.have.status(404);
        err.response.body.should.deep.equal({
          error: {
            code  : '01000007',
            title : 'Not found'
          }
        });
      });
  });
});
