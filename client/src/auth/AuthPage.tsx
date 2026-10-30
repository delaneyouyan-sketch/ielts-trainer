import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/', { replace: true });
      }
    });
  }, [navigate]);

  const submit = async (): Promise<void> => {
    setError('');
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
        });
        if (err) throw err;
        // 注册成功后自动登录（Supabase 默认未开启邮箱验证时直接创建会话）
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        if (!data.session) {
          setError('注册成功，请前往邮箱完成验证后登录');
          return;
        }
      }
      navigate('/', { replace: true });
    } catch (e) {
      const err = e as AuthError;
      setError(getAuthMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const githubLogin = async (): Promise<void> => {
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
    if (err) setError(getAuthMessage(err));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f5f1',
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      }}
    >
      <div
        style={{
          width: 380,
          maxWidth: '92vw',
          background: '#fff',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 8px 30px rgba(0,0,0,.06)',
        }}
      >
        <h1 style={{ fontSize: 22, margin: '0 0 4px', color: '#2d2a26' }}>
          雅思逆袭 · 训练站
        </h1>
        <p style={{ fontSize: 13, color: '#8a8378', margin: '0 0 24px' }}>
          {mode === 'login' ? '登录后继续你的学习进度' : '注册一个账号开始训练'}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: '1px solid #e5dfd4',
                background: mode === m ? '#2d2a26' : '#fff',
                color: mode === m ? '#fff' : '#5a5348',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {m === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码（至少 6 位）"
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
          style={{ ...inputStyle, marginTop: 12 }}
        />

        {error && (
          <div
            style={{
              marginTop: 14,
              fontSize: 13,
              color: '#b3261e',
              background: '#fdecea',
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => void submit()}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '12px 0',
            borderRadius: 8,
            border: 'none',
            background: '#c2530f',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '请稍候…' : mode === 'login' ? '登 录' : '注册并登录'}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '20px 0 14px',
            color: '#b5aea2',
            fontSize: 12,
          }}
        >
          <span style={{ flex: 1, height: 1, background: '#ece6db' }} />
          或
          <span style={{ flex: 1, height: 1, background: '#ece6db' }} />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => void githubLogin()}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 8,
            border: '1px solid #e0d9cb',
            background: '#fff',
            color: '#2d2a26',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          使用 GitHub 账号登录
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #e5dfd4',
  fontSize: 15,
  outline: 'none',
  background: '#fbfaf7',
};

function getAuthMessage(err: AuthError): string {
  const msg = err.message ?? '';
  if (msg.includes('Invalid login credentials')) return '邮箱或密码不正确';
  if (msg.includes('already registered')) return '该邮箱已注册，请直接登录';
  if (msg.includes('Email not confirmed')) return '邮箱尚未验证，请查收验证邮件';
  if (msg.includes('Password should be at least')) return '密码至少 6 位';
  return msg;
}
