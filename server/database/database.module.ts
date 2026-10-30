import { Global, Module } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE_DATABASE = 'DRIZZLE_DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DATABASE,
      useFactory: (): PostgresJsDatabase<typeof schema> => {
        const url = process.env.DATABASE_URL;
        if (!url) {
          throw new Error('缺少 DATABASE_URL 环境变量，请配置 Supabase 数据库连接串');
        }
        const client = postgres(url, { max: 10, ssl: 'require' });
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DRIZZLE_DATABASE],
})
export class DatabaseModule {}
