import { RateLimiterRedis } from 'rate-limiter-flexible';
import redisClient from '../services/redis';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient.pub,
  points: 1000,
  duration: 30
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip, 1);
    next();
  } catch (err) {
    res.status(429).end();
  }
};

export default rateLimiterMiddleware;
