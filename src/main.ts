import { NestFactory } from '@nestjs/core';
import { appCreate } from './app.create';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add Middleware
  appCreate(app);
  await app.listen(3000);
}
bootstrap();
