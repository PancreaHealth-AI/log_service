export const kafkaConfig = () => ({
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: 'audit-log-service',
  groupId: 'audit-consumer-group',
  topics: [
    'audit.logs',
    'security.logs',
    'technical.logs',
  ],
  retry: {
    initialRetryTime: 3000,
    maxRetryTime: 30000,
    retries: 8,
  },
});
