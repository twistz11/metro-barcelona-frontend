import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import $api from '../../http';
import './Schedule.css';

interface Line { id: string; name: string; color: string; textColor: string; }
interface Station { id: string; name: string; lines: string[]; }
interface Departure { timestamp: number; minutesAway: number; }
interface ScheduleData { lineId: string; stationId: string; departures: Departure[]; frequency: string; lastUpdated: string; }

const Schedule: React.FC = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedLine, setSelectedLine] = useState(params.get('line') || '');
  const [selectedStation, setSelectedStation] = useState('');
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    $api.get('/metro/lines').then(r => setLines(r.data));
  }, []);

  useEffect(() => {
    if (!selectedLine) { setStations([]); return; }
    $api.get(`/metro/lines/${selectedLine}/stations`).then(r => setStations(r.data));
  }, [selectedLine]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const fetchSchedule = useCallback(async () => {
    if (!selectedLine || !selectedStation) return;
    setLoading(true);
    const { data } = await $api.get(`/metro/schedule/${selectedLine}/${selectedStation}`);
    setSchedule(data);
    setLoading(false);
  }, [selectedLine, selectedStation, tick]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const filteredStations = stations;

  const selectedLineData = lines.find(l => l.id === selectedLine);

  const getUrgencyClass = (min: number) => {
    if (min <= 2) return 'urgency-now';
    if (min <= 5) return 'urgency-soon';
    return 'urgency-later';
  };

  return (
    <div className="schedule-page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{t('schedule.title')}</h1>
        {selectedLineData && (
          <div className="line-indicator" style={{ background: selectedLineData.color }}>
            {selectedLineData.name}
          </div>
        )}
      </motion.div>

      <div className="schedule-controls">
        <div className="select-group">
          <label>{t('schedule.select_line')}</label>
          <select value={selectedLine} onChange={e => { setSelectedLine(e.target.value); setSelectedStation(''); setSchedule(null); }}>
            <option value="">{t('schedule.select_line')}</option>
            {lines.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="select-group">
          <label>{t('schedule.select_station')}</label>
          <select value={selectedStation} onChange={e => setSelectedStation(e.target.value)} disabled={!selectedLine}>
            <option value="">{t('schedule.select_station')}</option>
            {filteredStations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" className="loading-trains" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="train-loader">🚇</div>
            <p>Loading schedule...</p>
          </motion.div>
        )}

        {schedule && !loading && (
          <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="departures-header">
              <h2>{t('schedule.next_trains')}</h2>
              <div className="refresh-info">
                <motion.div className="pulse-dot" style={{ background: selectedLineData?.color }} animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                <span>{t('schedule.frequency')}: {schedule.frequency}</span>
              </div>
            </div>

            <div className="departures-list">
              {schedule.departures.map((dep, i) => (
                <motion.div
                  key={dep.timestamp}
                  className={`departure-card ${getUrgencyClass(dep.minutesAway)}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ borderLeftColor: selectedLineData?.color }}
                >
                  <div className="departure-time">
                    {dep.minutesAway === 0
                      ? <span className="now-badge">NOW</span>
                      : <><span className="min-value">{dep.minutesAway}</span><span className="min-label">{t('schedule.minutes')}</span></>
                    }
                  </div>
                  <div className="departure-info">
                    <span>{t('schedule.arriving')}</span>
                    <strong>{new Date(dep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                  {i === 0 && (
                    <motion.div className="next-badge" animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      NEXT
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <p className="last-updated">{t('schedule.last_updated')}: {new Date(schedule.lastUpdated).toLocaleTimeString()}</p>
          </motion.div>
        )}

        {!selectedLine && !loading && (
          <motion.div key="empty" className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="empty-icon">🚇</span>
            <p>Select a metro line to see the schedule</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
