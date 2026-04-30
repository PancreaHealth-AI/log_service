# 🔐 Audit & Log Service

Microservice NestJS complet pour **audit**, **logs**, **alertes de sécurité** et **rapports** avec intégration **Elasticsearch** et **Kafka**.

## 🚀 Démarrage rapide

### Prerequisites
- Node.js 18+
- npm / yarn
- Docker (pour Elasticsearch et Kafka)

### Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

### Configuration environnement (.env)

```env
PORT=3001
NODE_ENV=development

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASS=changeme

# Kafka
KAFKA_BROKERS=localhost:9092
```

### Démarrage

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## 📚 Documentation API (Swagger)

Après démarrage du service, la documentation est disponible à :
```
http://localhost:3001/api-docs
```

### Fonctionnalités documentées

✅ **Audit** - Créer, rechercher et récupérer les logs  
✅ **Emergency Access** - Gérer les accès d'urgence  
✅ **Security Alerts** - Surveiller et résoudre les alertes  
✅ **Reports** - Générer des rapports et exports RGPD  
✅ **Statistics** - Obtenir les statistiques d'audit

## 🏗️ Architecture

```
src/
├── main.ts                    # Point d'entrée + Swagger
├── app.module.ts              # Module principal
├── config/                    # Configurations
├── common/                    # Interceptors, filters, enums
├── infrastructure/            # Elasticsearch service
└── modules/                   # Audit, Emergency, Alerts, Reports, Stats
```

## 🔌 Modules

### Audit Module
- **POST** `/audit/logs` - Créer un log (skip audit)
- **POST** `/audit/logs/search` - Rechercher des logs
- **GET** `/audit/logs/:id` - Récupérer un log

### Emergency Access
- **GET** `/audit/emergency-access/review` - Logs en attente
- **POST** `/audit/emergency-access/:id/review` - Valider/rejeter

### Security Alerts
- **GET** `/audit/security-alerts` - Alertes actives
- **POST** `/audit/security-alerts/:id/investigate` - Enquêter
- **POST** `/audit/security-alerts/:id/resolve` - Résoudre

### Reports
- **POST** `/audit/reports/generate` - Générer rapport
- **POST** `/audit/export` - Export RGPD

### Statistics
- **GET** `/audit/statistics?userId=xxx` - Statistiques

## 🔄 Auto-Audit

Chaque requête est automatiquement auditée (sauf création de logs) via **AuditLoggingInterceptor**.

Pour exclure une route de l'audit :
```typescript
@SkipAudit()
@Get('/health')
getHealth() { ... }
```

## 📊 DTOs disponibles

### CreateAuditLogDto
```typescript
user_id: string;
action: AuditAction;
resource: string;
service_name?: string;
status?: AuditStatus;
timestamp?: string;
ip_address?: string;
user_agent?: string;
severity?: Severity;
metadata?: Record<string, any>;
```

### SearchLogsDto
```typescript
userId?: string;
action?: AuditAction;
resource?: string;
dateFrom?: string;
dateTo?: string;
severity?: Severity;
status?: AuditStatus;
page?: number;
limit?: number;
```

## 🛠️ Docker Compose (optionnel)

```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kafka:
    image: confluentinc/cp-kafka:7.0.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

## 📦 Packages installés

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@nestjs/elasticsearch": "^10.0.0",
  "@nestjs/microservices": "^10.0.0",
  "swagger-ui-express": "^5.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.0",
  "uuid": "^9.0.0",
  "kafkajs": "^2.2.0"
}
```

## 🔐 Sécurité

- Validation globale des DTOs
- Exception filter global
- Audit logging sur toutes les requêtes
- Support des headers pour identification utilisateur (`x-user-id`)

## 📝 License

MIT

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
