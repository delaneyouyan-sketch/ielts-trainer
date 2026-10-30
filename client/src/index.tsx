import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { createPortal } from 'react-dom';

import RoutesComponent from './app.tsx';
import './index.css';
import { Toaster } from '@client/src/components/ui/sonner';

const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH || '/';

const fallbackRender = ({ error }: { error: Error }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      color: '#2d2a26',
    }}
  >
    <h2 style={{ marginBottom: 8 }}>页面出错了</h2>
    <p style={{ fontSize: 14, color: '#8a8378', maxWidth: 480, textAlign: 'center' }}>
      {error.message}
    </p>
  </div>
);

const MainApp = () => {
  return (
    <BrowserRouter basename={CLIENT_BASE_PATH}>
      <ErrorBoundary fallbackRender={fallbackRender}>
        <RoutesComponent />
        {createPortal(<Toaster />, document.body)}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
