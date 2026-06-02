import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const LINE_COLORS = ['#E3000B','#8B2FC9','#4B9E45','#F5D400','#0073BC','#F07D00','#0099CC','#8FD400'];

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-line-strip">
        {LINE_COLORS.map((c, i) => <div key={i} style={{ background: c, flex: 1, height: '4px' }} />)}
      </div>
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">🚇 Metro BCN</span>
          <p>{t('footer.data_source')}</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/lines">Lines</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/attractions">Attractions</Link>
          <Link to="/planner">Planner</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Metro Barcelona App — {t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
