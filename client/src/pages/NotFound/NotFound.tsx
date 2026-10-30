import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        background: '#f7f5f1',
        color: '#2d2a26',
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 700, color: '#c9b89c' }}>404</div>
      <p style={{ fontSize: 15, margin: '8px 0 20px', color: '#5a5348' }}>
        页面不存在或已被移动
      </p>
      <Link
        to="/"
        style={{
          fontSize: 14,
          color: '#c2530f',
          textDecoration: 'none',
          border: '1px solid #e0b48f',
          padding: '8px 18px',
          borderRadius: 8,
        }}
      >
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;
