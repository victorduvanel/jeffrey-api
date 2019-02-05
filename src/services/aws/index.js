import aws from 'aws-sdk';
import config  from '../../config';

const spacesEndpoint = new aws.Endpoint(config.digitalOcean.endpoint);

export const S3 = new aws.S3({
  accessKeyId: config.digitalOcean.keyId,
  secretAccessKey: config.digitalOcean.secret,
  endpoint: spacesEndpoint,
  params: {
    Bucket: config.digitalOcean.spaceName
  }
});
