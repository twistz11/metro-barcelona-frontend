import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../store/store';
import './Auth.css';

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const store = useContext(Context);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await store.login(email, password);
      } else {
        await store.register(email, password, name);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        {['#E3000B','#8B2FC9','#4B9E45','#F5D400','#0073BC'].map((c, i) => (
          <motion.div
            key={i}
            className="auth-bg-circle"
            style={{ background: c, top: `${15 + i * 17}%`, left: `${i % 2 === 0 ? -5 : 85}%` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-logo">🚇</div>
        <h1>{isLogin ? t('auth.welcome_back') : t('auth.create_account')}</h1>
        <p className="auth-subtitle">Metro Barcelona</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => { setIsLogin(true); setError(''); }}>
            {t('auth.login')}
          </button>
          <button className={!isLogin ? 'active' : ''} onClick={() => { setIsLogin(false); setError(''); }}>
            {t('auth.register')}
          </button>
          <motion.div
            className="tab-slider"
            animate={{ x: isLogin ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        <form onSubmit={submit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!isLogin && (
                <div className="field">
                  <label>{t('auth.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="field">
                <label>{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="field">
                <label>{t('auth.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div className="auth-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="auth-submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '⏳ Loading...' : isLogin ? t('auth.submit_login') : t('auth.submit_register')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
