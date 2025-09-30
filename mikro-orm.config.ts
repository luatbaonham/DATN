import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import dotenv from 'dotenv';

dotenv.config();

const config: Options<MySqlDriver> = {
  driver: MySqlDriver,
  dbName: process.env.DB_DATABASE_NAME,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: true,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    glob: '!(*.d).{js,ts}',
  },
  seeder: {
    path: './src/seeders',
    defaultSeeder: 'Dbseeder',
  },
};

export default config;
