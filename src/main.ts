import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Global validation pipe (auto-validate all DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Promoción App API')
    .setDescription('API del sistema de recaudación de fondos — Promoción Escolar')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT del login',
      },
      'jwt-auth',
    )
    .addTag('Auth', 'Autenticación y registro')
    .addTag('Aportes', 'Gestión de aportes y comprobantes')
    .addTag('Conceptos', 'Conceptos de pago')
    .addTag('Reportes', 'Reportes y exportación')
    .addTag('Documentos', 'Repositorio de documentos y acuerdos')
    .addTag('Categorías de Documento', 'Categorías para documentos')
    .addTag('Usuarios', 'Gestión de usuarios y perfil')
    .addTag('Auditoría', 'Logs de auditoría')
    .addTag('Notificaciones', 'Sistema de notificaciones in-app')
    .addTag('Upload', 'Subida de archivos a Cloudinary')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/api`,
  );
  Logger.log(
    `📖 Swagger docs: http://localhost:${port}/docs`,
  );
}

bootstrap();
