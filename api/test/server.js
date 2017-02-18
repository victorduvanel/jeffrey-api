import chai     from 'chai';
import chaiHTTP from 'chai-http';

import serve   from '../commands/serve';

const server = serve();

chai.should();
chai.use(chaiHTTP);

describe('GET /', () => {
  it('it should GET a 200 OK', () => {
    return chai.request(server)
      .get('/')
      .then((res) => {
        res.should.have.status(200);
        res.body.should.deep.equal({ hello: 'world' });
      });
  });
});
