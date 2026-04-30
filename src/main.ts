import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Audit & Log Service API')
    .setDescription('Microservice pour audit, logs, alertes de sécurité et rapports')
    .setVersion('1.0')
    .addTag('Audit', 'Gestion des logs d\'audit')
    .addTag('Emergency Access', 'Accès d\'urgence')
    .addTag('Security Alerts', 'Alertes de sécurité')
    .addTag('Reports', 'Génération de rapports')
    .addTag('Statistics', 'Statistiques')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Service started on port ${process.env.PORT || 3001}`);
  console.log(`📚 API Documentation available at http://localhost:${process.env.PORT || 3001}/api-docs`);
}
bootstrap();
