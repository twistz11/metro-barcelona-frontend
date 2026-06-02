import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import $api from '../../http';
import { Context } from '../../store/store';
import './RoutePlanner.css';

interface Station { id: string; name: string; lines: string[]; }
interface Leg { mode: string; from: string; to: string; line: string; duration: number; }
interface Route { id: number; duration: number; transfers: number; legs: Leg[]; ticketType: { price: number; name: string }; }

const LINE_COLORS: Record<string, string> = {
  '1':'#E3000B','2':'#8B2FC9','3':'#4B9E45','4':'#F5D400','5':'#0073BC',
  '9S':'#F07D00','9N':'#F07D00','10N':'#0099CC','10S':'#0099CC','11':'#8FD400',
};

const RoutePlanner: React.FC = () => {
  const { t } = useTranslation();
  const store = useContext(Context);
  const [searchParams] = useSearchParams();
  const [stations, setStations] = useState<Station[]>([]);
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    $api.get('/metro/stations').then(r => {
      const list: Station[] = r.data;
      setStations(list);
      const resolveParam = (val: string) => {
        if (!val) return '';
        if (list.find(s => s.id === val)) return val;
        const byName = list.find(s => s.name.toLowerCase() === val.toLowerCase());
        return byName ? byName.id : '';
      };
      const fromParam = searchParams.get('from') || '';
      const toParam = searchParams.get('to') || '';
      const resolvedFrom = resolveParam(fromParam);
      const resolvedTo = resolveParam(toParam);
      if (resolvedFrom) setFrom(resolvedFrom);
      if (resolvedTo) setTo(resolvedTo);
    });
  }, [searchParams]);

  const search = async () => {
    setError('');
    if (!from) { setError('Please select a starting station'); return; }
    if (!to) { setError('Please select a destination station'); return; }
    if (from === to) { setError('Origin and destination cannot be the same station'); return; }
    setLoading(true);
    setRoutes([]);
    try {
      const { data } = await $api.get(`/metro/plan?from=${from}&to=${to}`);
      setRoutes(data);
      setSelectedRoute(0);
      if (store.isAuth) {
        const fromSt = stations.find(s => s.id === from);
        const toSt = stations.find(s => s.id === to);
        if (fromSt && toSt) {
          await $api.post('/history', {
            fromStation: { id: from, name: fromSt.name },
            toStation: { id: to, name: toSt.name },
          });
        }
      }
    } finally { setLoading(false); }
  };

  const swapStations = () => { setFrom(to); setTo(from); };

  const saveFavorite = async (route: Route) => {
    if (!store.isAuth) { setSaveMsg('Please login to save routes'); setTimeout(() => setSaveMsg(''), 3000); return; }
    setSavingId(route.id);
    const fromSt = stations.find(s => s.id === from);
    const toSt = stations.find(s => s.id === to);
    await $api.post('/favorites', {
      name: `${fromSt?.name} → ${toSt?.name}`,
      fromStation: { id: from, name: fromSt?.name || from },
      toStation: { id: to, name: toSt?.name || to },
    });
    setSavingId(null);
    setSaveMsg('✅ Route saved to favorites!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div className="planner-page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{t('planner.title')}</h1>
      </motion.div>

      <motion.div className="planner-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="station-inputs">
          <div className="input-group">
            <label>🟢 {t('planner.from')}</label>
            <select value={from} onChange={e => { setFrom(e.target.value); setError(''); }}>
              <option value="">{t('planner.from')}</option>
              {stations.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === to}>{s.name}</option>
              ))}
            </select>
          </div>

          <motion.button className="swap-btn" onClick={swapStations} whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }} disabled={!from && !to}>
            ⇅
          </motion.button>

          <div className="input-group">
            <label>🔴 {t('planner.to')}</label>
            <select value={to} onChange={e => { setTo(e.target.value); setError(''); }}>
              <option value="">{t('planner.to')}</option>
              {stations.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === from}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <motion.div
            className="planner-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <motion.button className="search-btn" onClick={search} disabled={!from || !to || from === to || loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {loading ? '🔍 Searching...' : `🗺️ ${t('planner.search')}`}
        </motion.button>
      </motion.div>

      <motion.div className="tourist-tip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <span className="tip-icon">💡</span>
        <div>
          <strong>{t('planner.tourist_tip')}</strong>
          <p>{t('planner.tourist_tip_desc')}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {saveMsg && (
          <motion.div className="save-toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {routes.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="results-title">{t('planner.results')} <span className="compare-badge">{t('planner.compare')}</span></h2>

            <div className="route-tabs">
              {routes.map((r, i) => (
                <button
                  key={r.id}
                  className={`route-tab ${selectedRoute === i ? 'active' : ''}`}
                  onClick={() => setSelectedRoute(i)}
                >
                  <span className="tab-num">#{i + 1}</span>
                  <span className="tab-duration">{r.duration} {t('planner.minutes')}</span>
                  <span className="tab-transfers">{r.transfers === 0 ? t('planner.no_transfers') : `${r.transfers} ${t('planner.transfer')}`}</span>
                </button>
              ))}
            </div>

            {routes[selectedRoute] && (
              <motion.div
                key={selectedRoute}
                className="route-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="route-summary">
                  <div className="summary-stat">
                    <span className="stat-val">{routes[selectedRoute].duration}</span>
                    <span className="stat-lbl">{t('planner.minutes')}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-val">{routes[selectedRoute].transfers}</span>
                    <span className="stat-lbl">{t('planner.transfers')}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-val">€{routes[selectedRoute].ticketType.price.toFixed(2)}</span>
                    <span className="stat-lbl">{t('planner.ticket_needed')}</span>
                  </div>
                </div>

                <div className="legs-list">
                  {routes[selectedRoute].legs.map((leg, i) => (
                    <div key={i} className="leg-item">
                      <div className="leg-mode">
                        {leg.mode === 'WALK' ? '🚶' : '🚇'}
                      </div>
                      <div className="leg-info">
                        <div className="leg-route">
                          <strong>{leg.from}</strong>
                          <span className="leg-arrow">→</span>
                          <strong>{leg.to}</strong>
                        </div>
                        <div className="leg-meta">
                          {leg.line && (
                            <span className="leg-line" style={{ background: LINE_COLORS[leg.line.replace('L','').replace('N','').replace('S','')] || '#999' }}>
                              {leg.line}
                            </span>
                          )}
                          <span className="leg-duration">{leg.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  className="save-btn"
                  onClick={() => saveFavorite(routes[selectedRoute])}
                  disabled={savingId === routes[selectedRoute].id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {savingId === routes[selectedRoute].id ? '⏳ Saving...' : `⭐ ${t('planner.save_favorite')}`}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutePlanner;
