import twilio from 'twilio';
import config from '../../config';

const handler = async (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const identity = 'voice_test';

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: config.twilio.twiMlAppSid,
    pushCredentialSid: config.twilio.pushCredentialSid
  });

  const token = new AccessToken(
    config.twilio.accountSid,
    config.twilio.apiKey,
    config.twilio.apiSecret
  );
  token.addGrant(voiceGrant);
  token.identity = identity;

  res.send({
    'access-token': token.toJwt()
  });
};

export const post = [ handler ];
export const get = [ handler ];
