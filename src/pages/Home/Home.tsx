import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const STATS = [
  { key: 'stats_lines',    value: '10' },
  { key: 'stats_stations', value: '135' },
  { key: 'stats_daily',    value: '1.1M' },
  { key: 'stats_km',       value: '120' },
];

const FEATURES = [
  { key: 'realtime',    icon: '🚇', path: '/schedule' },
  { key: 'planner',    icon: '🗺️', path: '/planner' },
  { key: 'attractions',icon: '🏛️', path: '/attractions' },
  { key: 'tickets',    icon: '🎫', path: '/planner' },
];

const LINE_COLORS = ['#E3000B','#8B2FC9','#4B9E45','#F5D400','#0073BC','#F07D00','#0099CC','#8FD400'];

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } }),
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          {LINE_COLORS.map((c, i) => (
            <motion.div
              key={i}
              className="hero-line"
              style={{ background: c, top: `${10 + i * 11}%` }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            🚇 TMB Barcelona
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('home.hero_title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('home.hero_subtitle')}
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="btn-primary" onClick={() => navigate('/planner')}>
              {t('home.hero_cta')}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/lines')}>
              {t('home.explore')} →
            </button>
          </motion.div>
        </div>
        <motion.div
          className="hero-scroll"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ↓
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <motion.div
              key={s.key}
              className="stat-card"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{t(`home.${s.key}`)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Metro Map Preview ── */}
      <section className="map-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Barcelona Metro Network
        </motion.h2>
        <div className="lines-preview">
          {LINE_COLORS.map((c, i) => (
            <motion.div
              key={i}
              className="line-pill"
              style={{ background: c }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.1 }}
            >
              L{i < 5 ? i + 1 : i === 5 ? '9N' : i === 6 ? '9S' : i === 7 ? '10N' : '11'}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('home.features_title')}
        </motion.h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.key}
              className="feature-card"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              onClick={() => navigate(f.path)}
            >
              <span className="feature-icon">{f.icon}</span>
              <h3>{t(`home.feature_${f.key}`)}</h3>
              <p>{t(`home.feature_${f.key}_desc`)}</p>
              <span className="feature-arrow">→</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to explore Barcelona?</h2>
          <p>Create an account to save your favorite routes and track your trips.</p>
          <button className="btn-primary" onClick={() => navigate('/auth')}>
            Get Started — It's Free
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
