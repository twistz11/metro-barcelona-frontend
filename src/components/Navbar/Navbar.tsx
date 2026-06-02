import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { Context } from '../../store/store';
import './Navbar.css';

const NAV_LINKS = [
  { path: '/',            key: 'home' },
  { path: '/lines',       key: 'lines' },
  { path: '/schedule',    key: 'schedule' },
  { path: '/attractions', key: 'attractions' },
  { path: '/planner',     key: 'planner' },
];

const Navbar: React.FC = observer(() => {
  const { t } = useTranslation();
  const store = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await store.logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
        <span className="logo-icon">🚇</span>
        <span className="logo-text">Metro BCN</span>
      </Link>

      {/* Desktop links */}
      <div className="nav-links">
        {NAV_LINKS.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {t(`nav.${link.key}`)}
            {location.pathname === link.path && (
              <motion.div className="nav-underline" layoutId="underline" />
            )}
          </Link>
        ))}
      </div>

      {/* Auth buttons */}
      <div className="nav-auth">
        {store.isAuth ? (
          <>
            <Link to="/profile" className="nav-profile-btn">
              <span>{store.user?.name?.[0]?.toUpperCase() || '👤'}</span>
            </Link>
            <button className="nav-logout-btn" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <Link to="/auth" className="nav-login-btn">
            {t('nav.login')}
          </Link>
        )}
      </div>

      {/* Mobile burger */}
      <button className="burger" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
        <span className={menuOpen ? 'open' : ''} />
        <span className={menuOpen ? 'open' : ''} />
        <span className={menuOpen ? 'open' : ''} />
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                {t(`nav.${link.key}`)}
              </Link>
            ))}
            <div className="mobile-divider" />
            {store.isAuth ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 {t('nav.profile')}</Link>
                <button className="mobile-link danger" onClick={handleLogout}>{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/auth" className="mobile-link accent" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

export default Navbar;
