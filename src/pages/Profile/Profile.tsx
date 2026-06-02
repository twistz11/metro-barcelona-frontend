import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../store/store';
import $api from '../../http';
import './Profile.css';

interface Favorite { _id: string; name: string; fromStation: { id: string; name: string }; toStation: { id: string; name: string }; }
interface History { _id: string; fromStation: { name: string }; toStation: { name: string }; traveledAt: string; }

const TICKET_PRICES: Record<string, { price: number; name: string; pricePerTrip?: number }> = {
  single:  { price: 2.55,  name: 'Single' },
  t10:     { price: 11.35, name: 'T-Casual (10 trips)', pricePerTrip: 1.135 },
  tUsual:  { price: 80.00, name: 'T-Usual (monthly)' },
  tDia:    { price: 11.20, name: 'T-Dia (1-day)' },
};

const Profile: React.FC = observer(() => {
  const { t, i18n } = useTranslation();
  const store = useContext(Context);
  const navigate = useNavigate();
  const [tab, setTab] = useState<'favorites'|'history'|'settings'|'tickets'>('favorites');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [lang, setLang] = useState<'en'|'es'|'ca'>(store.user?.preferredLang || 'en');
  const [darkMode, setDarkMode] = useState(store.user?.darkMode || false);
  const [tripsPerDay, setTripsPerDay] = useState(4);
  const [days, setDays] = useState(3);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!store.isAuth) { navigate('/auth'); return; }
    $api.get('/favorites').then(r => setFavorites(r.data));
    $api.get('/history').then(r => setHistory(r.data));
  }, [store.isAuth, navigate]);

  const removeFavorite = async (id: string) => {
    await $api.delete(`/favorites/${id}`);
    setFavorites(prev => prev.filter(f => f._id !== id));
  };

  const clearHistory = async () => {
    await $api.delete('/history');
    setHistory([]);
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    await store.updatePreferences({ preferredLang: lang as any, darkMode });
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    document.body.classList.toggle('dark', darkMode);
    setSavingPrefs(false);
  };

  const totalTrips = tripsPerDay * days;
  const bestTicket = () => {
    if (days === 1 && totalTrips > 3) return { key: 'tDia', ...TICKET_PRICES.tDia };
    if (totalTrips <= 1) return { key: 'single', ...TICKET_PRICES.single };
    if (totalTrips <= 10) return { key: 't10', ...TICKET_PRICES.t10 };
    if (days >= 30) return { key: 'tUsual', ...TICKET_PRICES.tUsual };
    return { key: 't10', ...TICKET_PRICES.t10 };
  };
  const best = bestTicket();

  const TABS = ['favorites', 'history', 'tickets', 'settings'] as const;

  return (
    <div className="profile-page">
      <motion.div className="profile-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="profile-avatar">{store.user?.name?.[0]?.toUpperCase() || store.user?.email?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <h1>{store.user?.name || store.user?.email}</h1>
          <p>{store.user?.email}</p>
        </div>
      </motion.div>

      <div className="profile-tabs">
        {TABS.map(tabKey => (
          <button key={tabKey} className={tab === tabKey ? 'active' : ''} onClick={() => setTab(tabKey)}>
            {tabKey === 'favorites' ? '⭐' : tabKey === 'history' ? '🕒' : tabKey === 'tickets' ? '🎫' : '⚙️'}
            <span>{t(`profile.${tabKey}`)}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'favorites' && (
          <motion.div key="favs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {favorites.length === 0
              ? <div className="empty-state"><span>⭐</span><p>{t('profile.no_favorites')}</p></div>
              : favorites.map((fav, i) => (
                <motion.div key={fav._id} className="list-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="list-item-icon">🗺️</div>
                  <div className="list-item-content">
                    <strong>{fav.name}</strong>
                    <span>{fav.fromStation.name} → {fav.toStation.name}</span>
                  </div>
                  <div className="list-item-actions">
                    <button className="action-btn" onClick={() => navigate(`/planner?from=${fav.fromStation.id}&to=${fav.toStation.id}`)}>▶</button>
                    <button className="action-btn danger" onClick={() => removeFavorite(fav._id)}>✕</button>
                  </div>
                </motion.div>
              ))
            }
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div key="hist" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {history.length > 0 && (
              <button className="clear-btn" onClick={clearHistory}>🗑 {t('profile.clear_history')}</button>
            )}
            {history.length === 0
              ? <div className="empty-state"><span>🕒</span><p>{t('profile.no_history')}</p></div>
              : history.map((entry, i) => (
                <motion.div key={entry._id} className="list-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="list-item-icon">🚇</div>
                  <div className="list-item-content">
                    <strong>{entry.fromStation.name} → {entry.toStation.name}</strong>
                    <span>{new Date(entry.traveledAt).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))
            }
          </motion.div>
        )}

        {tab === 'tickets' && (
          <motion.div key="tickets" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="ticket-calculator">
              <h2>{t('tickets.calculator')}</h2>
              <div className="calc-inputs">
                <div className="calc-field">
                  <label>{t('tickets.trips_per_day')}: <strong>{tripsPerDay}</strong></label>
                  <input type="range" min={1} max={10} value={tripsPerDay} onChange={e => setTripsPerDay(+e.target.value)} />
                </div>
                <div className="calc-field">
                  <label>{t('tickets.days')}: <strong>{days}</strong></label>
                  <input type="range" min={1} max={30} value={days} onChange={e => setDays(+e.target.value)} />
                </div>
              </div>
              <div className="calc-result">
                <div className="result-total">{totalTrips} trips total</div>
                <div className="best-ticket">
                  <span className="best-label">{t('tickets.best_option')}</span>
                  <span className="best-name">{best.name}</span>
                  <span className="best-price">€{best.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="all-tickets">
                {Object.entries(TICKET_PRICES).map(([key, ticket]) => (
                  <div key={key} className={`ticket-row ${best.key === key ? 'recommended' : ''}`}>
                    <span>{ticket.name}</span>
                    <span className="ticket-price">€{ticket.price.toFixed(2)}</span>
                    {best.key === key && <span className="rec-badge">✓ Best</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="settings-card">
              <div className="setting-row">
                <label>{t('profile.language')}</label>
                <select value={lang} onChange={e => setLang(e.target.value as 'en'|'es'|'ca')}>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="ca">🏴 Català</option>
                </select>
              </div>
              <div className="setting-row">
                <label>{t('profile.dark_mode')}</label>
                <button className={`toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(d => !d)}>
                  {darkMode ? '🌙 ON' : '☀️ OFF'}
                </button>
              </div>
              <motion.button
                className="save-prefs-btn"
                onClick={savePrefs}
                disabled={savingPrefs}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {savingPrefs ? '⏳ Saving...' : `💾 ${t('profile.save_prefs')}`}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Profile;
