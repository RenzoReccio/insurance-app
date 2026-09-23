import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './env';
import {
  Product,
  EndorsementType,
  EndorsementTemplate,
  TemplateFieldConfig,
  TemplateEventConfig,
} from '../models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [
    Product,
    EndorsementType,
    EndorsementTemplate,
    TemplateFieldConfig,
    TemplateEventConfig,
  ],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (retries = 5, delayMs = 3000): Promise<DataSource> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log(`[Database] PostgreSQL connected successfully to database "${config.database.database}"`);
      }
      return AppDataSource;
    } catch (error) {
      console.warn(`[Database] Connection attempt ${attempt}/${retries} failed: ${(error as Error).message}`);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return AppDataSource;
};
