export const kafkaConfig = () => ({
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: 'audit-log-service',
  groupId: 'audit-consumer-group',
  topics: [
    'logs-auth',
    'logs-medical',
    'logs-access',
    'logs-system',
  ],
  retry: {
    initialRetryTime: 3000,
    maxRetryTime: 30000,
    retries: 8,
  },
});
