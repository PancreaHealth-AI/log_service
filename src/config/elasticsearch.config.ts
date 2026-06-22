export const elasticsearchConfig = () => ({
  node: process.env.ELASTICSEARCH_NODE || 'http://klodit.app:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USER || '',
    password: process.env.ELASTICSEARCH_PASS || '',
  },
  indices: {
    audit_logs: 'audit_logs',
    security_logs: 'security_logs',
    technical_logs: 'technical_logs',
  },
});
