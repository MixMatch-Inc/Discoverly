import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../logger/logger';

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(uri);
  logger.info(`Connected to MongoDB at ${connection.connection.host}`);
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
