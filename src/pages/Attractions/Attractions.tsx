import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import $api from '../../http';
import './Attractions.css';

interface Station { name: string; lines: string[]; }
interface Attraction {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  address: string;
  stations: Station[];
  airportNote?: Record<string, string>;
  image: string;
}

const LINE_COLORS: Record<string, string> = {
  '1':'#E3000B','2':'#8B2FC9','3':'#4B9E45','4':'#F5D400','5':'#0073BC',
  '9S':'#F07D00','9N':'#F07D00','10N':'#0099CC','10S':'#0099CC','11':'#8FD400',
};

const ATTRACTION_EMOJIS: Record<string, string> = {
  'sagrada-familia':'⛪','park-guell':'🌳','camp-nou':'⚽',
  'barceloneta':'🏖️','la-rambla':'🛒','montjuic':'🏔️','airport':'✈️',
};

const Attractions: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language as 'en' | 'es' | 'ca') || 'en';
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selected, setSelected] = useState<Attraction | null>(null);

  useEffect(() => { $api.get('/metro/attractions').then(r => setAttractions(r.data)); }, []);

  return (
    <div className="attractions-page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{t('attractions.title')}</h1>
        <p>{t('attractions.subtitle')}</p>
      </motion.div>

      <div className="attractions-grid">
        {attractions.map((att, i) => (
          <motion.div
            key={att.id}
            className={`attraction-card ${selected?.id === att.id ? 'expanded' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelected(selected?.id === att.id ? null : att)}
          >
            <div className="attraction-emoji">{ATTRACTION_EMOJIS[att.id] || '🏛️'}</div>
            <div className="attraction-content">
              <h3>{att.name[lang] || att.name.en}</h3>
              <p className="attraction-address">📍 {att.address}</p>

              <motion.div
                className="attraction-details"
                initial={false}
                animate={{ height: selected?.id === att.id ? 'auto' : 0, opacity: selected?.id === att.id ? 1 : 0 }}
                style={{ overflow: 'hidden' }}
              >
                <p className="attraction-desc">{att.description[lang] || att.description.en}</p>

                <div className="stations-section">
                  <h4>{t('attractions.nearest_station')}</h4>
                  {att.stations.map(st => (
                    <div key={st.name} className="station-row">
                      <span className="station-name">🚉 {st.name}</span>
                      <div className="station-lines">
                        {st.lines.map(l => (
                          <span key={l} className="line-chip" style={{ background: LINE_COLORS[l] || '#999', color: l === '4' || l === '11' ? '#000' : '#fff' }}>
                            L{l}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {att.airportNote && (
                  <div className="airport-note">
                    <strong>✈️ {t('attractions.airport_note')}:</strong> {att.airportNote[lang] || att.airportNote.en}
                  </div>
                )}

                <button
                  className="directions-btn"
                  onClick={e => { e.stopPropagation(); navigate(`/planner?to=${att.stations[0]?.name}`); }}
                >
                  {t('attractions.get_directions')} →
                </button>
              </motion.div>

              <div className="expand-hint">{selected?.id === att.id ? '▲ Less' : '▼ More info'}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Attractions;
