import chai     from 'chai';
import chaiHTTP from 'chai-http';

import { httpServer } from '../src/server';

chai.should();
chai.use(chaiHTTP);

describe('POST /webhook', () => {
  it('it should get a 200 OK', () => {
    return chai.request(httpServer)
      .post('/webhook')
      .type('form')
      .send({ To: '+33000000001'})
      .send({ From: '+33000000000' })
      .send({ Body: 'Message Body' })
      .send({ Sid: 'abcdef' })
      .then((res) => {
        res.should.have.status(200);
      });
  });
});
