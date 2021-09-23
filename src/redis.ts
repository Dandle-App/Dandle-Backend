import Redis from 'ioredis';
import { logger } from './logging';

const RedisClient = (function () {
  const redisPort: string = process.env.REDIS_PORT || '6379';
  const redisHost: string = process.env.REDIS_HOST || 'redis';

  if (redisPort) {
    logger.info('Using env variables for Redis!');
  }

  const redisClient = new Redis(parseInt(redisPort, 10), redisHost);
  redisClient.on('error', (errorObj) => {
    const errorString = JSON.stringify(errorObj, null, 2);
    if (errorObj.code === 'ENOTFOUND') {
      logger.error('Could not connect to Redis, check that it is running and the URL is correct.');
    } else {
      logger.error(errorString);
    }
  });
  redisClient.on('ready', () => {
    logger.info('Connected to Redis!');
  });
  return redisClient;
}());

export default RedisClient;
