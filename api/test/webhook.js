import chai     from 'chai';
import chaiHTTP from 'chai-http';

import { httpServer} from '../src/server';

chai.should();
chai.use(chaiHTTP);

describe('POST /webhook', () => {
  it('it should get a 200 OK', () => {
    return chai.request(httpServer)
      .post('/webhook')
      .field('To', '+33000000001')
      .field('From', '+33000000000')
      .field('Body', 'Message Body')
      .field('Sid', 'abcdef')
      .then((res) => {
        res.should.have.status(200);
        console.log(res.body);
      });
  });
});
