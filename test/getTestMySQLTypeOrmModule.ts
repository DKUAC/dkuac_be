import { TypeOrmModule } from '@nestjs/typeorm';

export function getTestMySQLTypeOrmModule() {
  return TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '12341234',
    database: 'test',
    entities: ['src/**/entities/*.entity.ts'],
    synchronize: true,
    logging: false,
  });
}
