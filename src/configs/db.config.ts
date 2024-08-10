import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('DOCKER_MYSQL_HOST'),
    port: configService.get<number>('DOCKER_MYSQL_PORT'),
    database: configService.get('DOCKER_MYSQL_DATABASE'),
    username: configService.get('DOCKER_MYSQL_USERNAME'),
    password: configService.get('DOCKER_MYSQL_PASSWORD'),
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
  }),
};
