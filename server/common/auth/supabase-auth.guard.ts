import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Request } from 'express';

export interface AuthedRequest extends Request {
  userContext: { userId: string };
}

/**
 * 独立化登录守卫：校验请求头里的 Supabase 登录凭证（Bearer access_token），
 * 解析出当前用户 id 挂到 req.userContext，替代原平台 @NeedLogin()。
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('缺少 SUPABASE_URL / SUPABASE_*_KEY 环境变量');
    }
    this.supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      throw new UnauthorizedException('未登录');
    }
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('登录已失效，请重新登录');
    }
    request.userContext = { userId: data.user.id };
    return true;
  }
}
