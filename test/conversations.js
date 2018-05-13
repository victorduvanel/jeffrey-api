import 'babel-polyfill';
import _            from 'lodash';
import chai         from 'chai';
import assert       from 'assert';
import chaiHTTP     from 'chai-http';
import User         from '../src/models/user';
import Conversation from '../src/models/conversation';

// const should = chai.should();

describe('Conversations', () => {
  it('it should retreive the conversation for the given participants', async () => {
    const userA = await User.create({
      firstName: 'userA'
    });

    const userB = await User.create({
      firstName: 'userB'
    });

    const userC = await User.create({
      firstName: 'userB'
    });

    const conversationAB = await Conversation.findOrCreate([
      userA,
      userB
    ]);

    const conversationBC = await Conversation.findOrCreate([
      userB,
      userC
    ]);

    const conversationAC = await Conversation.findOrCreate([
      userA,
      userC
    ]);

    await conversationAB.load([ 'participants' ]);

    assert(
      _.isEqual(
        conversationAB.related('participants').map(p => p.get('id')),
        [ userA.get('id'), userB.get('id') ]
      )
    );


    const conversationABsec = await Conversation.findOrCreate([
      userA,
      userB
    ]);

    assert(conversationAB.get('id') === conversationABsec.get('id'));

    // await conversationAB.destroy();
    // await conversationBC.destroy();
    // await conversationAC.destroy();
    // await userA.destroy();
  });
});
