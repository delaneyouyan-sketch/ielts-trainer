import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Flame } from 'lucide-react';
import { useTrainerState } from '../hooks/useTrainerState';

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/learn', label: '课程' },
  { to: '/quiz', label: '练习' },
  { to: '/booth', label: '口语舱' },
  { to: '/journal', label: '错题本' },
];

const TrainerLayout = () => {
  const [open, setOpen] = useState(false);
  const { state } = useTrainerState();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">I</span>
          <span className="brand-name">雅思逆袭</span>
          <span className="brand-en">IELTS Counterattack</span>
        </div>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="streak-chip">
          <Flame size={14} />
          <span>已打卡 {state.checkins.length} 天</span>
        </div>
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TrainerLayout;
