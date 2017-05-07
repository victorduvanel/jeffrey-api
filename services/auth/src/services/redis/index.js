import Promise from 'bluebird';
import redis   from 'redis';
import config  from '../../config';

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let _pub, _sub;

export default {
  get pub() {
    if (!_pub) {
      _pub = redis.createClient(config.redis);
    }
    return _pub;
  },

  get sub() {
    if (!_sub) {
      _sub = redis.createClient(config.redis);
    }
    return _sub;
  }
};
