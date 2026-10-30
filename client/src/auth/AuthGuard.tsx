import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/** 路由守卫：未登录时跳转登录页 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data.session) {
          navigate('/login', { replace: true });
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        navigate('/login', { replace: true });
        setLoading(false);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) {
        navigate('/login', { replace: true });
      }
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
          color: '#8a8378',
          fontSize: 14,
        }}
      >
        加载中…
      </div>
    );
  }

  return <>{children}</>;
}
