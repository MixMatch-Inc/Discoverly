import { createApp } from './app';
import { env } from './shared/config/env';
import { connectDatabase } from './shared/database/connection';
import { logger } from './shared/logger/logger';

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`);
  });
}

main().catch((error) => {
  logger.error('Failed to start server', { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
