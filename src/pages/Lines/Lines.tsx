import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import $api from '../../http';
import './Lines.css';

interface Line {
  id: string;
  name: string;
  color: string;
  textColor: string;
  origin: string;
  destination: string;
  stationsCount: number;
}

const FREQ_MAP: Record<string, string> = {
  '1':'3–5 min', '2':'4–7 min', '3':'3–5 min', '4':'4–8 min', '5':'4–7 min',
  '9N':'6–10 min', '9S':'7–10 min', '10N':'8–12 min', '10S':'8–12 min', '11':'10–15 min',
};

const Lines: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    $api.get('/metro/lines').then(r => { setLines(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="lines-page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{t('lines.title')}</h1>
        <p>{t('lines.subtitle')}</p>
      </motion.div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <div className="lines-grid">
          {lines.map((line, i) => (
            <motion.div
              key={line.id}
              className="line-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, boxShadow: `0 20px 40px ${line.color}33` }}
            >
              <div className="line-header" style={{ background: line.color }}>
                <span className="line-badge" style={{ color: line.textColor }}>{line.name}</span>
                <div className="line-dots">
                  <motion.div className="dot" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} style={{ background: line.textColor + '80' }} />
                </div>
              </div>
              <div className="line-body">
                <div className="line-route">
                  <span className="terminus">{line.origin}</span>
                  <div className="route-line" style={{ background: line.color }} />
                  <span className="terminus">{line.destination}</span>
                </div>
                <div className="line-meta">
                  {line.stationsCount > 0 && (
                    <span className="meta-item">🚉 {line.stationsCount} {t('lines.stations')}</span>
                  )}
                  <span className="meta-item">⏱ {FREQ_MAP[line.id] || '5–8 min'}</span>
                </div>
                <button
                  className="view-btn"
                  style={{ borderColor: line.color, color: line.color }}
                  onClick={() => navigate(`/schedule?line=${line.id}`)}
                >
                  {t('lines.view_schedule')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lines;
