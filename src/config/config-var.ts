export const configVar = () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT) ?? 3000,
  NODE_NAME: process.env.NODE_NAME,
  // MySQL configuration
  MYSQL_HOST: process.env.MYSQL_HOST ?? 'localhost',
  MYSQL_PORT: Number(process.env.MYSQL_PORT) ?? 3306,
  MYSQL_USERNAME: process.env.MYSQL_USERNAME ?? 'root',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ?? '',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE ?? 'users_db',
  // RabbitMQ configuration
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE ?? 'notifications_queue',
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET ?? 'secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1h',

  // Two-Factor Authentication configuration
  TWO_FACTOR_AUTH_APP_NAME: process.env.TWO_FACTOR_AUTH_APP_NAME ?? 'RxCheck',
});
