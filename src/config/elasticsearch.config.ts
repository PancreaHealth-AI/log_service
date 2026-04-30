export const elasticsearchConfig = () => ({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USER || '',
    password: process.env.ELASTICSEARCH_PASS || '',
  },
  indices: {
    audit_logs: 'audit_logs',
    technical_logs: 'technical_logs',
    security_alerts: 'security_alerts',
  },
});
