import winston from 'winston';
// eslint-disable-next-line import/prefer-default-export
export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: 'app' }),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      format: winston.format.combine(
        winston.format.label({ label: 'app' }),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      filename: 'logs.log',
    }),
  ],
});
