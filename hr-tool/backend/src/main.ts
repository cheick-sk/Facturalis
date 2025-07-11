import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks to gracefully close connections (e.g., PrismaClient)
  app.enableShutdownHooks();

  // Global prefix for all routes (optional, e.g. /api)
  // app.setGlobalPrefix('api');

  // GlobalPipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip away non-DTO properties
      forbidNonWhitelisted: true, // Throw error if non-DTO properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert query/path params to expected types
      },
    }),
  );

  // Swagger (OpenAPI) setup
  const config = new DocumentBuilder()
    .setTitle('HR Tool API')
    .setDescription('API documentation for the HR Tool backend services')
    .setVersion('1.0')
    .addTag('employees', 'Employee management operations')
    // Add more tags as new modules are created
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // API docs will be available at /api-docs

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend service is running on: ${await app.getUrl()}`);
  console.log(`Swagger API documentation available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();
