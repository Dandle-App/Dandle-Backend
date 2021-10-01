import Redis from 'ioredis';
import { logger } from './logging';

const RedisClient = (() => {
  const redisPort: string = process.env.REDIS_PORT || '6379';
  const redisHost: string = process.env.REDIS_HOST || 'redis';

  if (process.env.REDIS_PORT) {
    logger.info(`Using env for redis port (${redisPort})`);
  } else {
    logger.info('Using default redis port (6379)');
  }
  if (process.env.REDIS_HOST) {
    logger.info(`Using env for redis host (${redisHost})`);
  } else {
    logger.info('Using default redis host (redis)');
  }

  if (!process.env.REDIS_PORT || process.env.REDIS_HOST) {
    logger.info('Add REDIS_PORT and/or REDIS_HOST to env to set custom values');
  }

  const redisClient = new Redis(parseInt(redisPort, 10), redisHost);
  redisClient.on('error', (errorObj) => {
    const errorString = JSON.stringify(errorObj, null, 2);
    if (errorObj.code === 'ENOTFOUND') {
      logger.error(
        'Could not connect to Redis, check that it is running and the URL is correct.',
      );
    } else {
      logger.error(errorString);
    }
  });
  redisClient.on('ready', () => {
    logger.info('Connected to Redis');
  });

  return redisClient;
})();

export default RedisClient;
