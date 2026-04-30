export const kafkaConfig = () => ({
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: 'audit-log-service',
  groupId: 'audit-consumer-group',
  topics: [
    'auth.events',
    'medical.events',
    'access.events',
    'system.events',
  ],
  retry: {
    initialRetryTime: 3000,
    maxRetryTime: 30000,
    retries: 8,
  },
});
