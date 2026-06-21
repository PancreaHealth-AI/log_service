// // EXEMPLE d'intégration dans le service RBAC (NestJS 11) — à adapter.
// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
// import { elasticsearchConfig } from "../../config/elasticsearch.config";
// import { MessagingModule } from './messaging.module';
// // ... autres imports existants

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
//     TypeOrmModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: (c: ConfigService) => elasticsearchConfig(),
//     }),

//     // 👇 une seule ligne ; MessagingService devient injectable partout
//     MessagingModule.forService('rbac-service'),

//     // RolesModule, PermissionsModule, AssignmentsModule, ...
//   ],
// })
// export class AppModule {}
