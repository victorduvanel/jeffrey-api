import aws from 'aws-sdk';
import config  from '../../config';

export const S3 = new aws.S3(config.s3);
