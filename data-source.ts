import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DOCKER_MYSQL_HOST'),
  port: configService.get<number>('DOCKER_MYSQL_PORT'),
  database: configService.get('DOCKER_MYSQL_DATABASE'),
  username: configService.get('DOCKER_MYSQL_USERNAME'),
  password: configService.get('DOCKER_MYSQL_PASSWORD'),
  synchronize: false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
